import * as vscode from 'vscode';
import { AgentManager } from '../agents';
import { AgentFolderEngine } from '../agent-folders';
import { getOwnerDisplayName } from '../agent-folders/owner-persona';
import { Database } from '../database';
import { MemoryEngine } from '../memory';
import { Agent } from '../types';
import {
  AgentGramAccount,
  AgentGramFollowRequest,
  AgentGramPostView,
  AgentGramSnapshot,
} from '../types/agentgram';
import { generateId, now } from '../utils';
import { AgentGramEngine } from './agentgram-engine';
import {
  avatarHueFromId,
  buildAgentGramHandle,
  formatTimeAgo,
  pickEmoji,
  todayDateKey,
} from './utils';

const OWNER_ID = 'owner';
const STARTUP_DELAY_MS = 120_000;
const CYCLE_INTERVAL_MS = 30 * 60_000;

export class AgentGramService {
  private timer?: NodeJS.Timeout;
  private startupTimer?: NodeJS.Timeout;
  private running = false;
  private onChange?: () => void;

  constructor(
    private context: vscode.ExtensionContext,
    private db: Database,
    private agents: AgentManager,
    private agentFolders: AgentFolderEngine,
    private memory: MemoryEngine,
    private engine: AgentGramEngine
  ) {}

  setOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  start(): void {
    this.stop();
    if (!this.isEnabled()) return;

    this.startupTimer = setTimeout(() => {
      void this.runCycle();
      this.scheduleNext();
    }, STARTUP_DELAY_MS);

    this.context.subscriptions.push({ dispose: () => this.stop() });
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.startupTimer) clearTimeout(this.startupTimer);
    this.timer = undefined;
    this.startupTimer = undefined;
  }

  restart(): void {
    this.stop();
    this.start();
  }

  isEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('agentGramEnabled', true);
  }

  async runCycle(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const activeAgents = this.agents.getAll().filter((a) => a.status !== 'offline');
      const today = todayDateKey();

      await this.ensureDefaultFollows(activeAgents);

      for (const agent of activeAgents) {
        if (this.db.hasAgentGramPostToday(agent.id, today)) continue;
        try {
          await this.publishAgentPost(agent, activeAgents);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.memory.logActivity(agent.id, null, `AgentGram 게시 실패: ${msg.slice(0, 120)}`);
        }
      }

      await this.processFollowRequests(activeAgents);
      await this.sendFollowRequests(activeAgents);
      await this.runSocialInteractions(activeAgents);
    } finally {
      this.running = false;
      this.onChange?.();
    }
  }

  async getSnapshot(): Promise<AgentGramSnapshot> {
    const ownerName = await getOwnerDisplayName();
    const agents = this.agents.getAll();
    const agentAccounts = agents.map((a) => this.mapAgentAccount(a));
    const owner: AgentGramAccount = {
      id: OWNER_ID,
      handle: ownerName,
      name: ownerName,
      title: '사장',
      bio: 'AgentCompany 대표',
      avatarHue: avatarHueFromId(OWNER_ID),
      posts: this.db.countAgentGramPostsByAuthor(OWNER_ID),
      followers: this.db.countAgentGramFollowers(OWNER_ID),
      following: this.db.countAgentGramFollowing(OWNER_ID),
    };

    const handleMap = new Map<string, string>([[OWNER_ID, owner.handle]]);
    for (const a of agentAccounts) {
      handleMap.set(a.id, a.handle);
    }

    const posts = this.db.getAgentGramPosts(80).map((p) => this.mapPostView(p, handleMap));
    const pending = this.db.getPendingAgentGramFollowRequestsFor(OWNER_ID).map((r) => ({
      id: r.id,
      fromId: r.fromId,
      fromHandle: handleMap.get(r.fromId) ?? r.fromId,
      fromName: agents.find((a) => a.id === r.fromId)?.name ?? r.fromId,
      createdAt: r.createdAt,
      timeAgo: formatTimeAgo(r.createdAt),
    }));

    return {
      owner,
      accounts: agentAccounts,
      posts,
      pendingFollowRequests: pending,
      ownerPostCount: owner.posts,
    };
  }

  createOwnerPost(caption: string, emoji: string): void {
    const trimmed = caption.trim();
    if (!trimmed) return;
    const postId = generateId();
    const createdAt = now();
    this.db.insertAgentGramPost({
      id: postId,
      authorId: OWNER_ID,
      caption: trimmed,
      imageEmoji: emoji || pickEmoji(trimmed),
      location: '',
      createdAt,
    });
    this.db.recordAgentGramDailyPost(OWNER_ID, todayDateKey(), postId);
    this.onChange?.();
  }

  respondFollowRequest(requestId: string, accept: boolean): void {
    const req = this.db.getAgentGramFollowRequest(requestId);
    if (!req || req.status !== 'pending' || req.toId !== OWNER_ID) return;

    const resolvedAt = now();
    this.db.resolveAgentGramFollowRequest(requestId, accept ? 'accepted' : 'rejected', resolvedAt);
    if (accept) {
      this.db.insertAgentGramFollow(req.fromId, req.toId, resolvedAt);
    }
    this.onChange?.();
  }

  toggleOwnerLike(postId: string): void {
    this.db.toggleAgentGramLike(postId, OWNER_ID);
    this.onChange?.();
  }

  private scheduleNext(): void {
    this.timer = setInterval(() => void this.runCycle(), CYCLE_INTERVAL_MS);
  }

  private mapAgentAccount(agent: Agent): AgentGramAccount {
    const posts = this.db.countAgentGramPostsByAuthor(agent.id);
    return {
      id: agent.id,
      handle: buildAgentGramHandle(agent),
      name: agent.name,
      title: agent.title?.trim() || agent.role,
      bio: agent.description.slice(0, 200),
      avatarHue: avatarHueFromId(agent.id),
      posts,
      followers: this.db.countAgentGramFollowers(agent.id),
      following: this.db.countAgentGramFollowing(agent.id),
      hasStory: posts > 0,
    };
  }

  private mapPostView(
    post: { id: string; authorId: string; caption: string; imageEmoji: string; location: string; createdAt: string },
    handleMap: Map<string, string>
  ): AgentGramPostView {
    const likes = this.db.getAgentGramLikesForPost(post.id);
    const comments = this.db.getAgentGramCommentsForPost(post.id).map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorHandle: handleMap.get(c.authorId) ?? c.authorId,
      text: c.text,
      timeAgo: formatTimeAgo(c.createdAt),
    }));

    return {
      id: post.id,
      authorId: post.authorId,
      authorHandle: handleMap.get(post.authorId) ?? post.authorId,
      timeAgo: formatTimeAgo(post.createdAt),
      location: post.location || undefined,
      imageHue: avatarHueFromId(post.authorId),
      imageEmoji: post.imageEmoji,
      imageLabel: post.caption.slice(0, 40),
      caption: post.caption,
      likes: likes.length,
      likedBy: likes.map((id) => handleMap.get(id) ?? id).slice(0, 5),
      likedByOwner: likes.includes(OWNER_ID),
      comments,
    };
  }

  private async publishAgentPost(agent: Agent, peers: Agent[]): Promise<void> {
    const recent = this.db.getAgentGramPosts(12);
    const peerHandles = peers
      .filter((p) => p.id !== agent.id)
      .map((p) => buildAgentGramHandle(p));

    const generated = await this.engine.generatePost(agent, recent, peerHandles);
    if (!generated.caption) return;

    const postId = generateId();
    const createdAt = now();
    this.db.insertAgentGramPost({
      id: postId,
      authorId: agent.id,
      caption: generated.caption,
      imageEmoji: generated.emoji || pickEmoji(generated.caption),
      location: generated.location,
      createdAt,
    });
    this.db.recordAgentGramDailyPost(agent.id, todayDateKey(), postId);
    this.memory.logActivity(agent.id, null, `AgentGram 게시: ${generated.caption.slice(0, 80)}`);
  }

  private async ensureDefaultFollows(agents: Agent[]): Promise<void> {
    const ts = now();
    for (const agent of agents) {
      if (!this.db.isAgentGramFollowing(OWNER_ID, agent.id)) {
        this.db.insertAgentGramFollow(OWNER_ID, agent.id, ts);
      }
      if (
        !this.db.isAgentGramFollowing(agent.id, OWNER_ID) &&
        !this.db.hasPendingAgentGramFollowRequest(agent.id, OWNER_ID)
      ) {
        this.db.insertAgentGramFollowRequest({
          id: generateId(),
          fromId: agent.id,
          toId: OWNER_ID,
          status: 'pending',
          createdAt: ts,
        });
      }
    }
  }

  private async processFollowRequests(agents: Agent[]): Promise<void> {
    const pending = this.db.getAllPendingAgentGramFollowRequests();
    for (const req of pending) {
      if (req.toId === OWNER_ID) continue;

      const receiver = agents.find((a) => a.id === req.toId);
      const requester = agents.find((a) => a.id === req.fromId);
      if (!receiver || !requester) continue;

      try {
        const decision = await this.engine.decideFollowRequest(receiver, requester);
        const resolvedAt = now();
        this.db.resolveAgentGramFollowRequest(
          req.id,
          decision.accept ? 'accepted' : 'rejected',
          resolvedAt
        );
        if (decision.accept) {
          this.db.insertAgentGramFollow(req.fromId, req.toId, resolvedAt);
        }
      } catch {
        // skip failed decision
      }
    }
  }

  private async sendFollowRequests(agents: Agent[]): Promise<void> {
    for (const agent of agents) {
      const peerCandidates = agents.filter(
        (other) =>
          other.id !== agent.id &&
          !this.db.isAgentGramFollowing(agent.id, other.id) &&
          !this.db.hasPendingAgentGramFollowRequest(agent.id, other.id)
      );
      const candidates = peerCandidates;
      if (candidates.length === 0) continue;

      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const req: AgentGramFollowRequest = {
        id: generateId(),
        fromId: agent.id,
        toId: target.id,
        status: 'pending',
        createdAt: now(),
      };
      this.db.insertAgentGramFollowRequest(req);
    }
  }

  private async runSocialInteractions(agents: Agent[]): Promise<void> {
    const posts = this.db.getAgentGramPosts(20);
    if (posts.length === 0) return;

    for (const agent of agents) {
      const candidates = posts.filter((p) => p.authorId !== agent.id);
      if (candidates.length === 0) continue;

      const post = candidates[Math.floor(Math.random() * candidates.length)];
      const author = agents.find((a) => a.id === post.authorId);
      if (!author) continue;

      const existingComments = this.db.getAgentGramCommentsForPost(post.id);
      const alreadyCommented = existingComments.some((c) => c.authorId === agent.id);
      if (!alreadyCommented && Math.random() < 0.55) {
        try {
          const comment = await this.engine.generateComment(agent, author, post.caption);
          if (comment.text) {
            this.db.insertAgentGramComment({
              id: generateId(),
              postId: post.id,
              authorId: agent.id,
              text: comment.text,
              createdAt: now(),
            });
          }
        } catch {
          // skip
        }
      }

      const likes = this.db.getAgentGramLikesForPost(post.id);
      if (!likes.includes(agent.id) && Math.random() < 0.65) {
        this.db.toggleAgentGramLike(post.id, agent.id);
      }
    }
  }
}
