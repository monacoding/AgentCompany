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
