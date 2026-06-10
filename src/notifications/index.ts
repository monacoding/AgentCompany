import * as vscode from 'vscode';
import { TelegramNotifier } from './telegram';

export class NotificationEngine {
  private telegram: TelegramNotifier;

  constructor() {
    this.telegram = new TelegramNotifier();
  }

  showInfo(message: string): void {
    vscode.window.showInformationMessage(`AgentCompany: ${message}`);
    void this.telegram.send(`ℹ️ ${message}`);
  }

  showWarning(message: string): void {
    vscode.window.showWarningMessage(`AgentCompany: ${message}`);
    void this.telegram.send(`⚠️ ${message}`);
  }

  showError(message: string): void {
    vscode.window.showErrorMessage(`AgentCompany: ${message}`);
    void this.telegram.send(`❌ ${message}`);
  }

  async showAgentStatus(agentName: string, status: string): Promise<void> {
    this.showInfo(`${agentName} is now ${status}`);
  }

  async showTaskComplete(taskTitle: string): Promise<void> {
    this.showInfo(`Task completed: ${taskTitle}`);
  }

  /** 완성된 Markdown 파일을 Telegram으로 전송 (설정 켜져 있을 때만) */
  async deliverMarkdownFile(absolutePath: string, caption?: string): Promise<void> {
    if (!this.telegram.isMarkdownDeliveryEnabled()) return;

    const result = await this.telegram.sendMarkdownFile(absolutePath, caption);
    if (!result.success) {
      vscode.window.showWarningMessage(`AgentCompany: Telegram MD 전송 실패 — ${result.message}`);
    }
  }

  getTelegram(): TelegramNotifier {
    return this.telegram;
  }
}

export { TelegramInboundPoller } from './telegram-inbound';
export {
  prepareTelegramCommand,
  formatTelegramWelcome,
  formatTelegramAgentRoster,
} from './telegram-command';
