import * as vscode from 'vscode';
import { AppSettings, ProviderType } from '../types';

const SECTION = 'agentCompany';
const PROACTIVE_IDEAS_OFF_MIGRATION = 'proactiveIdeasDefaultOffApplied';

export class SettingsService {
  constructor(private readonly context?: vscode.ExtensionContext) {}

  /** 자동 아이디어 제안 기본값을 체크 해제(false)로 고정 */
  async ensureProactiveIdeasDefaultOff(): Promise<void> {
    const config = vscode.workspace.getConfiguration(SECTION);
    const inspected = config.inspect<boolean>('proactiveIdeasEnabled');
    const explicitlySet =
      inspected?.globalValue !== undefined ||
      inspected?.workspaceValue !== undefined ||
      inspected?.workspaceFolderValue !== undefined;

    if (!explicitlySet) {
      await config.update('proactiveIdeasEnabled', false, vscode.ConfigurationTarget.Global);
      return;
    }

    if (!this.context?.globalState.get<boolean>(PROACTIVE_IDEAS_OFF_MIGRATION)) {
      if (inspected.globalValue === true) {
        await config.update('proactiveIdeasEnabled', false, vscode.ConfigurationTarget.Global);
      }
      await this.context.globalState.update(PROACTIVE_IDEAS_OFF_MIGRATION, true);
    }
  }

  getSettings(): AppSettings {
    const config = vscode.workspace.getConfiguration(SECTION);
    return {
      defaultProvider: config.get<ProviderType>('defaultProvider', 'openai'),
      defaultModel: config.get<string>('defaultModel', 'gpt-4o'),
      openaiApiKey: config.get<string>('openaiApiKey', ''),
      anthropicApiKey: config.get<string>('anthropicApiKey', ''),
      ollamaBaseUrl: config.get<string>('ollamaBaseUrl', 'http://localhost:11434'),
      telegramEnabled: config.get<boolean>('telegramEnabled', false),
      telegramBotToken: config.get<string>('telegramBotToken', ''),
      telegramChatId: config.get<string>('telegramChatId', ''),
      proactiveIdeasEnabled: config.get<boolean>('proactiveIdeasEnabled', false),
      proactiveIdeasIntervalMinutes: config.get<number>('proactiveIdeasIntervalMinutes', 30),
      telegramInboundEnabled: config.get<boolean>('telegramInboundEnabled', true),
    };
  }

  async updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
    const config = vscode.workspace.getConfiguration(SECTION);

    const entries: [keyof AppSettings, string][] = [
      ['defaultProvider', 'defaultProvider'],
      ['defaultModel', 'defaultModel'],
      ['openaiApiKey', 'openaiApiKey'],
      ['anthropicApiKey', 'anthropicApiKey'],
      ['ollamaBaseUrl', 'ollamaBaseUrl'],
      ['telegramEnabled', 'telegramEnabled'],
      ['telegramBotToken', 'telegramBotToken'],
      ['telegramChatId', 'telegramChatId'],
      ['proactiveIdeasEnabled', 'proactiveIdeasEnabled'],
      ['proactiveIdeasIntervalMinutes', 'proactiveIdeasIntervalMinutes'],
      ['telegramInboundEnabled', 'telegramInboundEnabled'],
    ];

    for (const [field, configKey] of entries) {
      if (partial[field] !== undefined) {
        await config.update(configKey, partial[field], vscode.ConfigurationTarget.Global);
      }
    }

    return this.getSettings();
  }

  getProviderStatus(): { type: ProviderType; configured: boolean }[] {
    const settings = this.getSettings();
    return [
      { type: 'openai', configured: !!settings.openaiApiKey },
      { type: 'anthropic', configured: !!settings.anthropicApiKey },
      { type: 'ollama', configured: true },
      { type: 'gemini', configured: false },
      { type: 'openrouter', configured: false },
    ];
  }

  maskSecret(value: string): string {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return `${value.slice(0, 4)}${'•'.repeat(Math.min(value.length - 8, 12))}${value.slice(-4)}`;
  }
}

export function getSettingsForWebview(settings: AppSettings): AppSettings & { masked: Record<string, string> } {
  const svc = new SettingsService();
  return {
    ...settings,
    openaiApiKey: settings.openaiApiKey ? svc.maskSecret(settings.openaiApiKey) : '',
    anthropicApiKey: settings.anthropicApiKey ? svc.maskSecret(settings.anthropicApiKey) : '',
    telegramBotToken: settings.telegramBotToken ? svc.maskSecret(settings.telegramBotToken) : '',
    masked: {
      openaiApiKey: settings.openaiApiKey ? svc.maskSecret(settings.openaiApiKey) : '',
      anthropicApiKey: settings.anthropicApiKey ? svc.maskSecret(settings.anthropicApiKey) : '',
      telegramBotToken: settings.telegramBotToken ? svc.maskSecret(settings.telegramBotToken) : '',
    },
  };
}
