import * as vscode from 'vscode';

export interface TelegramResult {
  success: boolean;
  message: string;
}

export class TelegramNotifier {
  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('agentCompany');
    return config.get<boolean>('telegramEnabled', false);
  }

  isConfigured(): boolean {
    const config = vscode.workspace.getConfiguration('agentCompany');
    const token = config.get<string>('telegramBotToken', '');
    const chatId = config.get<string>('telegramChatId', '');
    return !!token && !!chatId;
  }

  async testConnection(override?: { token?: string; chatId?: string }): Promise<TelegramResult> {
    const config = vscode.workspace.getConfiguration('agentCompany');
    const token = override?.token?.trim() || config.get<string>('telegramBotToken', '');
    const chatId = override?.chatId?.trim() || config.get<string>('telegramChatId', '');

    if (!token || !chatId) {
      return { success: false, message: 'Bot Token과 Chat ID를 입력해 주세요.' };
    }

    return this.sendRaw(token, chatId, '✅ AgentCompany Telegram connection test successful!');
  }

  private async sendRaw(token: string, chatId: string, message: string): Promise<TelegramResult> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🏢 AgentCompany\n${message}`,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, message: parseTelegramError(error) };
      }

      return { success: true, message: 'Message sent' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async send(message: string): Promise<TelegramResult> {
    if (!this.isEnabled()) {
      return { success: false, message: 'Telegram notifications disabled' };
    }

    const config = vscode.workspace.getConfiguration('agentCompany');
    const token = config.get<string>('telegramBotToken', '');
    const chatId = config.get<string>('telegramChatId', '');

    if (!token || !chatId) {
      return { success: false, message: 'Telegram bot token or chat ID not configured' };
    }

    return this.sendRaw(token, chatId, message);
  }

  getStatus(): { enabled: boolean; configured: boolean; ready: boolean } {
    const enabled = this.isEnabled();
    const configured = this.isConfigured();
    return { enabled, configured, ready: enabled && configured };
  }
}

function parseTelegramError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { description?: string; error_code?: number };
    const desc = parsed.description ?? raw;

    if (/bot can't send messages to the bot/i.test(desc)) {
      return 'Chat ID가 봇 자신의 ID입니다. 본인 텔레그램 계정의 Chat ID를 넣어 주세요. (봇에게 /start 먼저 보내기)';
    }
    if (/chat not found/i.test(desc)) {
      return 'Chat ID를 찾을 수 없습니다. 봇에게 /start 메시지를 보낸 뒤 getUpdates로 ID를 확인해 주세요.';
    }
    if (/bot was blocked/i.test(desc)) {
      return '봇이 차단되어 있습니다. 텔레그램에서 봇을 차단 해제한 뒤 /start 를 보내 주세요.';
    }
    if (/unauthorized/i.test(desc)) {
      return 'Bot Token이 올바르지 않습니다. @BotFather에서 발급한 토큰을 다시 확인해 주세요.';
    }
    if (/group chat was upgraded to a supergroup/i.test(desc)) {
      return '그룹이 슈퍼그룹으로 변경되었습니다. 새 Chat ID로 다시 설정해 주세요.';
    }

    return `Telegram 오류 (${parsed.error_code ?? '?'}): ${desc}`;
  } catch {
    return `Telegram API error: ${raw}`;
  }
}
