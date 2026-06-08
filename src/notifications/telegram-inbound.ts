import * as vscode from 'vscode';
import { CeoChatMessage } from '../chat/types';
import { Agent } from '../types';
import {
  formatTelegramAgentReply,
  formatTelegramAgentRoster,
  formatTelegramRouteHint,
  formatTelegramWelcome,
  prepareTelegramCommand,
} from './telegram-command';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; is_bot?: boolean };
  };
}

export interface TelegramInboundDeps {
  getAgents: () => Agent[];
  getSecretary: () => Agent | null;
  findByMention: (mention: string) => Agent | null;
  getLastAgentId: () => string | null;
  setLastAgentId: (agentId: string) => Promise<void>;
  getBotUsername: () => string | undefined;
}

export class TelegramInboundPoller {
  private timer?: NodeJS.Timeout;
  private polling = false;
  private lastCommandAt = 0;
  private replySessionActive = false;
  private readonly replyWindowMs = 30 * 60_000;

  constructor(
    private context: vscode.ExtensionContext,
    private deps: TelegramInboundDeps,
    private onCommand: (text: string) => Promise<void>,
    private sendToTelegram: (text: string) => Promise<{ success: boolean }>
  ) {}

  start(): void {
    this.stop();
    if (!this.isReady()) return;

    void this.ensurePollingMode();
    void this.cacheBotUsername();
    this.timer = setInterval(() => void this.poll(), 4000);
    this.context.subscriptions.push({ dispose: () => this.stop() });
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  restart(): void {
    this.stop();
    this.start();
  }

  isReady(): boolean {
    const config = vscode.workspace.getConfiguration('agentCompany');
    const enabled = config.get<boolean>('telegramEnabled', false);
    const inbound = config.get<boolean>('telegramInboundEnabled', true);
    const token = config.get<string>('telegramBotToken', '');
    const chatId = config.get<string>('telegramChatId', '');
    return enabled && inbound && !!token && !!chatId;
  }

  beginReplySession(): void {
    this.replySessionActive = true;
    this.lastCommandAt = Date.now();
  }

  endReplySession(): void {
    this.replySessionActive = false;
  }

  forwardAgentMessage(msg: CeoChatMessage): void {
    if (!this.isReady()) return;
    if (!this.replySessionActive && Date.now() - this.lastCommandAt > this.replyWindowMs) return;

    if (msg.type === 'confirmation' && msg.status === 'pending') {
      const body = `📋 확인이 필요해요 (Cursor에서 승인해 주세요)\n\n${msg.content}`.slice(0, 3900);
      void this.sendAgentReply(body);
      return;
    }

    if (msg.type !== 'agent' && msg.type !== 'system') return;
    if (msg.senderName === 'CEO' || msg.senderName === '사장님') return;
    if (msg.status === 'working' || msg.status === 'pending') return;
    if (!msg.content.trim()) return;

    const body = formatTelegramAgentReply(msg.senderName, msg.content).slice(0, 3900);
    void this.sendAgentReply(body);
  }

  private async sendAgentReply(body: string): Promise<void> {
    await this.sendToTelegram(body);
  }

  private getCredentials(): { token: string; chatId: string } | null {
    const config = vscode.workspace.getConfiguration('agentCompany');
    const token = config.get<string>('telegramBotToken', '');
    const chatId = config.get<string>('telegramChatId', '').trim();
    if (!token || !chatId) return null;
    return { token, chatId };
  }

  private async cacheBotUsername(): Promise<void> {
    const creds = this.getCredentials();
    if (!creds) return;
    try {
      const response = await fetch(`https://api.telegram.org/bot${creds.token}/getMe`);
      if (!response.ok) return;
      const data = (await response.json()) as {
        ok: boolean;
        result?: { username?: string };
      };
      if (data.ok && data.result?.username) {
        await this.context.globalState.update('telegramBotUsername', data.result.username);
      }
    } catch {
      // 다음 폴링에서 재시도
    }
  }

  private async ensurePollingMode(): Promise<void> {
    const creds = this.getCredentials();
    if (!creds) return;
    try {
      await fetch(`https://api.telegram.org/bot${creds.token}/deleteWebhook`);
    } catch {
      // webhook 없으면 무시
    }
  }

  private async poll(): Promise<void> {
    if (this.polling || !this.isReady()) return;
    const creds = this.getCredentials();
    if (!creds) return;

    this.polling = true;
    try {
      const offset = this.context.globalState.get<number>('telegramLastUpdateId', 0) + 1;
      const url = `https://api.telegram.org/bot${creds.token}/getUpdates?timeout=0&offset=${offset}`;
      const response = await fetch(url);
      if (!response.ok) return;

      const data = (await response.json()) as { ok: boolean; result: TelegramUpdate[] };
      if (!data.ok || !Array.isArray(data.result)) return;

      for (const update of data.result) {
        await this.context.globalState.update('telegramLastUpdateId', update.update_id);
        await this.handleUpdate(update, creds.chatId);
      }
    } catch {
      // 다음 폴링에서 재시도
    } finally {
      this.polling = false;
    }
  }

  private async handleUpdate(update: TelegramUpdate, allowedChatId: string): Promise<void> {
    const message = update.message;
    if (!message?.text) return;
    if (message.from?.is_bot) return;
    if (String(message.chat.id) !== allowedChatId) return;

    const text = message.text.trim();
    if (!text) return;

    const agents = this.deps.getAgents();
    const secretary = this.deps.getSecretary();

    if (text === '/start') {
      await this.sendToTelegram(formatTelegramWelcome(agents));
      return;
    }

    if (text === '/agents' || text === '/목록') {
      const roster = formatTelegramAgentRoster(agents);
      await this.sendToTelegram(
        roster ? `👥 에이전트 목록\n\n${roster}` : '등록된 에이전트가 없습니다.'
      );
      return;
    }

    const prepared = prepareTelegramCommand(
      text,
      agents,
      secretary,
      this.deps.getLastAgentId(),
      (mention) => this.deps.findByMention(mention),
      this.deps.getBotUsername()
    );

    if (prepared.targetAgentId) {
      await this.deps.setLastAgentId(prepared.targetAgentId);
    }

    const targetAgent =
      prepared.targetAgentId != null
        ? agents.find((a) => a.id === prepared.targetAgentId) ?? null
        : null;
    const targetLabel = targetAgent
      ? `${targetAgent.name}${targetAgent.title?.trim() ? ` (${targetAgent.title.trim()})` : ''}`
      : '에이전트';

    const routeHint =
      prepared.routedVia === 'mention'
        ? `📩 ${targetLabel}`
        : formatTelegramRouteHint(prepared.routedVia, targetLabel);

    this.lastCommandAt = Date.now();
    await this.sendToTelegram(`${routeHint}\n${text.slice(0, 200)}`);
    await this.onCommand(prepared.command);
  }
}
