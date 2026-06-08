import { CeoChatMessage, ChatWorkingState, PendingDelegate } from './types';
import { generateId, now } from '../utils';

type ChatListener = (msg: CeoChatMessage) => void;
type WorkingListener = (state: ChatWorkingState | null, threadId: string) => void;
type PanelOpenRequest = (threadId: string, agentName: string) => void;
type CollabPanelOpenRequest = (collabThreadId: string, sourceAgentId: string, targetAgentId: string) => void;
type TeamPanelOpenRequest = (threadId: string, participantIds: string[], title: string) => void;

export class ChatService {
  private messages: CeoChatMessage[] = [];
  private workingByThread = new Map<string, ChatWorkingState>();
  private pending: PendingDelegate | null = null;
  private listeners = new Set<ChatListener>();
  private workingListeners = new Set<WorkingListener>();
  private panelOpenRequest?: PanelOpenRequest;
  private collabPanelOpenRequest?: CollabPanelOpenRequest;
  private teamPanelOpenRequest?: TeamPanelOpenRequest;

  addListener(fn: ChatListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  addWorkingListener(fn: WorkingListener): () => void {
    this.workingListeners.add(fn);
    return () => this.workingListeners.delete(fn);
  }

  setEmitter(fn: ChatListener): void {
    this.listeners.clear();
    this.listeners.add(fn);
  }

  setPanelOpenRequest(fn: PanelOpenRequest): void {
    this.panelOpenRequest = fn;
  }

  requestOpenPanel(threadId: string, agentName: string): void {
    this.panelOpenRequest?.(threadId, agentName);
  }

  setCollabPanelOpenRequest(fn: CollabPanelOpenRequest): void {
    this.collabPanelOpenRequest = fn;
  }

  requestOpenCollabPanel(collabThreadId: string, sourceAgentId: string, targetAgentId: string): void {
    this.collabPanelOpenRequest?.(collabThreadId, sourceAgentId, targetAgentId);
  }

  setTeamPanelOpenRequest(fn: TeamPanelOpenRequest): void {
    this.teamPanelOpenRequest = fn;
  }

  requestOpenTeamPanel(threadId: string, participantIds: string[], title: string): void {
    this.teamPanelOpenRequest?.(threadId, participantIds, title);
  }

  push(msg: Omit<CeoChatMessage, 'id' | 'timestamp'>): CeoChatMessage {
    const full: CeoChatMessage = { ...msg, id: generateId(), timestamp: now() };
    this.messages.push(full);
    this.listeners.forEach((fn) => fn(full));
    return full;
  }

  updateMessage(id: string, patch: Partial<CeoChatMessage>): void {
    const idx = this.messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    this.messages[idx] = { ...this.messages[idx], ...patch };
    this.listeners.forEach((fn) => fn(this.messages[idx]));
  }

  setWorking(state: ChatWorkingState): void {
    this.workingByThread.set(state.threadId, state);
    this.workingListeners.forEach((fn) => fn(state, state.threadId));
  }

  updateWorking(state: ChatWorkingState & { streamAppend?: string[] }): void {
    const prev = this.workingByThread.get(state.threadId);
    let streamLog = [...(prev?.streamLog ?? [])];

    if (prev && prev.senderId !== state.senderId) {
      streamLog = [];
    }

    const seen = new Set(streamLog.map((line) => line.text));
    const toAppend =
      state.streamAppend ??
      (state.content && !seen.has(state.content) ? [state.content] : []);

    for (const text of toAppend) {
      const trimmed = text.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      streamLog.push({ id: generateId(), text: trimmed, timestamp: now() });
      seen.add(trimmed);
    }

    const { streamAppend: _drop, ...rest } = state;
    this.setWorking({ ...rest, streamLog });
  }

  clearWorking(threadId: string): void {
    if (!this.workingByThread.has(threadId)) return;
    this.workingByThread.delete(threadId);
    this.workingListeners.forEach((fn) => fn(null, threadId));
  }

  getWorking(threadId: string): ChatWorkingState | null {
    return this.workingByThread.get(threadId) ?? null;
  }

  getMessages(threadId?: string): CeoChatMessage[] {
    if (!threadId) return [...this.messages];
    return this.messages.filter((m) => m.threadId === threadId);
  }

  setPending(pending: PendingDelegate): void {
    this.pending = pending;
  }

  getPending(): PendingDelegate | null {
    return this.pending;
  }

  clearPending(): void {
    this.pending = null;
  }

  /** 확인 버튼 말풍선을 완료 처리 (pendingId 기준) */
  resolveConfirmationByPendingId(
    pendingId: string,
    outcome: 'confirmed' | 'rejected'
  ): void {
    for (const msg of this.messages) {
      if (
        msg.type !== 'confirmation' ||
        msg.confirmation?.pendingId !== pendingId ||
        msg.status !== 'pending'
      ) {
        continue;
      }
      const suffix =
        outcome === 'confirmed' ? '\n\n✅ 사장님 확인 완료' : '\n\n↩️ 다른 파일로 다시 찾기';
      this.updateMessage(msg.id, {
        status: 'done',
        confirmation: undefined,
        content: `${msg.content}${suffix}`,
      });
    }
  }

  clear(): void {
    this.messages = [];
  }
}
