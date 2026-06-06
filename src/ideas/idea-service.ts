import * as vscode from 'vscode';
import { AgentManager } from '../agents';
import { ChatService, detectChatEmotion } from '../chat';
import { Database } from '../database';
import { MemoryEngine } from '../memory';
import { NotificationEngine } from '../notifications';
import { TaskEngine } from '../tasks';
import { Agent, AgentIdea } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import { generateId, now } from '../utils';
import { IdeaEngine } from './idea-engine';

const MAX_PENDING_IDEAS = 8;
const STARTUP_DELAY_MS = 90_000;
const MIN_AGENT_COOLDOWN_MS = 20 * 60_000;

export class IdeaService {
  private timer?: NodeJS.Timeout;
  private startupTimer?: NodeJS.Timeout;
  private running = false;
  private onChange?: () => void;

  constructor(
    private context: vscode.ExtensionContext,
    private db: Database,
    private agents: AgentManager,
    private tasks: TaskEngine,
    private memory: MemoryEngine,
    private notifications: NotificationEngine,
    private chat: ChatService,
    private engine: IdeaEngine
  ) {}

  setOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  start(): void {
    this.stop();
    if (!this.isEnabled()) return;

    this.startupTimer = setTimeout(() => {
      void this.runCycle(true);
      this.scheduleNext();
    }, STARTUP_DELAY_MS);

    this.context.subscriptions.push({
      dispose: () => this.stop(),
    });
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
    const config = vscode.workspace.getConfiguration('agentCompany');
    return config.get<boolean>('proactiveIdeasEnabled', false);
  }

  getIntervalMinutes(): number {
    const config = vscode.workspace.getConfiguration('agentCompany');
    return Math.max(5, config.get<number>('proactiveIdeasIntervalMinutes', 30));
  }

  getPendingIdeas(): AgentIdea[] {
    return this.db.getPendingIdeas();
  }

  async requestIdeasNow(maxAgents = 2): Promise<number> {
    return this.runCycle(false, maxAgents);
  }

  async acceptIdea(ideaId: string): Promise<{ taskId: string } | null> {
    const idea = this.db.getIdea(ideaId);
    if (!idea || idea.status !== 'pending') return null;

    const agent = this.agents.get(idea.agentId);
    if (!agent) return null;

    const task = this.tasks.create({
      title: idea.title,
      description: idea.body,
      agentId: agent.id,
    });

    this.db.updateIdea(ideaId, { status: 'accepted' });
    this.memory.logActivity(agent.id, task.id, `아이디어 수락 → 태스크 생성: "${idea.title}"`);
    this.chat.push({
      threadId: agent.id,
      senderId: null,
      senderName: '시스템',
      content: `✅ 대표님이 아이디어를 수락했습니다. 태스크 "${idea.title}" 가 생성되었어요.`,
      type: 'system',
      status: 'done',
    });
    this.notifyChange();
    return { taskId: task.id };
  }

  dismissIdea(ideaId: string): boolean {
    const idea = this.db.getIdea(ideaId);
    if (!idea || idea.status !== 'pending') return false;

    this.db.updateIdea(ideaId, { status: 'dismissed' });
    const agent = this.agents.get(idea.agentId);
    if (agent) {
      this.memory.logActivity(agent.id, null, `아이디어 보류: "${idea.title}"`);
    }
    this.notifyChange();
    return true;
  }

  private scheduleNext(): void {
    const minutes = this.getIntervalMinutes();
    this.timer = setInterval(() => {
      void this.runCycle(false);
    }, minutes * 60_000);
  }

  private async runCycle(quiet: boolean, maxAgents = 2): Promise<number> {
    if (this.running || !this.isEnabled()) return 0;
    if (this.db.countPendingIdeas() >= MAX_PENDING_IDEAS) return 0;

    this.running = true;
    let created = 0;

    try {
      const candidates = this.pickAgents(maxAgents);
      for (const agent of candidates) {
        if (this.db.countPendingIdeas() >= MAX_PENDING_IDEAS) break;

        const previousTitles = this.db
          .getRecentIdeasByAgent(agent.id, 6)
          .map((idea) => idea.title);
        const context = await this.engine.buildContext(agent, this.tasks.getAll(), previousTitles);
        const generated = await this.engine.generate(agent, context);
        if (!generated) continue;
        await this.publishIdea(agent, generated, quiet);
        created += 1;
      }
    } finally {
      this.running = false;
      if (created > 0) this.notifyChange();
    }

    return created;
  }

  private pickAgents(limit: number): Agent[] {
    const idle = this.agents
      .getAll()
      .filter((a) => a.status === 'idle')
      .sort(() => Math.random() - 0.5);

    const eligible: Agent[] = [];
    for (const agent of idle) {
      const latest = this.db.getLatestIdeaByAgent(agent.id);
      if (latest && Date.now() - new Date(latest.createdAt).getTime() < MIN_AGENT_COOLDOWN_MS) {
        continue;
      }
      eligible.push(agent);
      if (eligible.length >= limit) break;
    }
    return eligible;
  }

  private async publishIdea(
    agent: Agent,
    generated: { title: string; body: string },
    quiet: boolean
  ): Promise<void> {
    const timestamp = now();
    const idea: AgentIdea = {
      id: generateId(),
      agentId: agent.id,
      title: generated.title,
      body: generated.body,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.db.insertIdea(idea);
    this.memory.logActivity(agent.id, null, `💡 아이디어 제안: "${idea.title}"`);

    const label = formatAgentLabel(agent);
    const chatBody = `💡 **아이디어 제안**\n\n**${idea.title}**\n\n${idea.body}\n\n_대시보드에서 수락하거나 보류할 수 있어요._`;

    this.chat.push({
      threadId: agent.id,
      senderId: agent.id,
      senderName: agent.name,
      senderRole: agent.title?.trim() || agent.role,
      content: chatBody,
      type: 'agent',
      status: 'done',
      emotion: detectChatEmotion(chatBody, 'done'),
    });

    if (!quiet) {
      const action = '대시보드 열기';
      void vscode.window
        .showInformationMessage(`💡 ${label}: ${idea.title}`, action)
        .then((choice) => {
          if (choice === action) {
            void vscode.commands.executeCommand('agentCompany.openDashboard');
          }
        });
    }
  }

  private notifyChange(): void {
    this.onChange?.();
  }
}
