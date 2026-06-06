import { ProviderType } from '../types';
import { EnvService } from './env';
import { SettingsService } from './settings';

export interface CredentialsResolver {
  getOpenAiKey(): string;
  getAnthropicKey(): string;
  getOllamaBaseUrl(): string;
  getDefaultProvider(): ProviderType;
  getDefaultModel(): string;
}

export class CredentialsService implements CredentialsResolver {
  constructor(
    private settings: SettingsService,
    private env: EnvService
  ) {}

  getOpenAiKey(): string {
    return this.env.getOpenAiKey() || this.settings.getSettings().openaiApiKey;
  }

  getAnthropicKey(): string {
    return this.env.getAnthropicKey() || this.settings.getSettings().anthropicApiKey;
  }

  getOllamaBaseUrl(): string {
    return this.settings.getSettings().ollamaBaseUrl;
  }

  getDefaultProvider(): ProviderType {
    const fromEnv = this.env.get('DEFAULT_PROVIDER') as ProviderType | '';
    if (fromEnv) return fromEnv;
    return this.settings.getSettings().defaultProvider;
  }

  getDefaultModel(): string {
    return this.env.getDefaultModel() || this.settings.getSettings().defaultModel;
  }

  isOpenAiConfigured(): boolean {
    return !!this.getOpenAiKey();
  }

  getKeySource(): 'env' | 'settings' | 'none' {
    if (this.env.getOpenAiKey()) return 'env';
    if (this.settings.getSettings().openaiApiKey) return 'settings';
    return 'none';
  }
}
