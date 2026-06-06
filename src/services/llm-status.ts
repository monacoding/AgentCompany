import { LlmConnectionStatus, OpenAiBillingInfo, ProviderType } from '../types';
import { CredentialsService } from './credentials';
import { EnvService } from './env';

export const FALLBACK_OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'o3-mini',
  'o1',
  'o1-mini',
];

const MODEL_PRIORITY = [
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'o4-mini',
  'o3',
  'o3-mini',
  'o1',
  'o1-mini',
  'o1-preview',
  'chatgpt-4o-latest',
];

const CHAT_MODEL_EXCLUDED =
  /instruct|realtime|audio|transcribe|tts|whisper|dall-e|embedding|moderation|davinci|babbage|curie|ada|text-embedding|text-search|^ft:|^sora|search-api|computer-use|image|codex/i;

export class LlmStatusService {
  private lastStatus: LlmConnectionStatus | null = null;
  private cachedModels: string[] = FALLBACK_OPENAI_MODELS;
  private providerConnections = new Map<ProviderType, boolean>();

  constructor(
    private credentials: CredentialsService,
    private env: EnvService
  ) {}

  getCachedModels(): string[] {
    return this.cachedModels;
  }

  isProviderConnected(provider: ProviderType): boolean {
    const cached = this.providerConnections.get(provider);
    if (cached === true) return true;
    if (this.lastStatus?.provider === provider && this.lastStatus.connected) return true;
    return false;
  }

  getProviderConnectionsRecord(): Partial<Record<ProviderType, boolean>> {
    return Object.fromEntries(this.providerConnections) as Partial<Record<ProviderType, boolean>>;
  }

  async refreshProviderConnections(providers: Iterable<ProviderType>): Promise<void> {
    const unique = [...new Set(providers)];
    await Promise.all(
      unique.map(async (provider) => {
        const check = await this.checkConnection(provider);
        this.providerConnections.set(provider, check.connected);
      })
    );
  }

  async getStatus(cachedOnly = false): Promise<LlmConnectionStatus> {
    const provider = this.credentials.getDefaultProvider();
    const model = this.credentials.getDefaultModel();
    const configured = this.isConfigured(provider);
    const envFileExists = await this.env.envFileExists();
    const keySource = this.credentials.getKeySource();

    const base: LlmConnectionStatus = {
      provider,
      model,
      configured,
      connected: false,
      envFileExists,
      keySource,
      envFilePath: this.env.getDisplayPath(),
      maskedKey: configured ? this.env.maskKey(this.credentials.getOpenAiKey()) : '',
      message: this.buildMessage(configured, envFileExists, keySource, provider),
      lastChecked: new Date().toISOString(),
      availableModels: this.cachedModels,
    };

    if (cachedOnly && this.lastStatus) {
      return {
        ...base,
        connected: this.lastStatus.connected,
        message: this.lastStatus.message,
        availableModels: this.ensureCurrentModel(this.cachedModels, model),
        openAiBilling: this.lastStatus.openAiBilling,
      };
    }

    if (!configured) {
      this.lastStatus = base;
      return base;
    }

    const check = await this.checkConnection(provider);
    this.providerConnections.set(provider, check.connected);
    if (check.connected) {
      this.cachedModels = await this.fetchModelsForProvider(provider);
    }

    const openAiBilling =
      provider === 'openai' && configured ? await this.fetchOpenAiBilling() : undefined;

    const status: LlmConnectionStatus = {
      ...base,
      connected: check.connected,
      message: check.connected
        ? `${check.message} · 사용 가능 모델 ${this.cachedModels.length}개`
        : check.message,
      lastChecked: new Date().toISOString(),
      availableModels: this.ensureCurrentModel(this.cachedModels, model),
      providerConnections: this.getProviderConnectionsRecord(),
      openAiBilling,
    };
    this.lastStatus = status;
    return status;
  }

  async fetchModels(): Promise<string[]> {
    const provider = this.credentials.getDefaultProvider();
    if (this.isConfigured(provider)) {
      this.cachedModels = await this.fetchModelsForProvider(provider);
    }
    return this.ensureCurrentModel(this.cachedModels, this.credentials.getDefaultModel());
  }

  private async fetchModelsForProvider(provider: ProviderType): Promise<string[]> {
    switch (provider) {
      case 'openai':
        return this.fetchOpenAiModels();
      case 'anthropic':
        return this.fetchAnthropicModels();
      case 'ollama':
        return this.fetchOllamaModels();
      default:
        return this.cachedModels.length > 0 ? this.cachedModels : FALLBACK_OPENAI_MODELS;
    }
  }

  async checkConnection(provider?: ProviderType): Promise<{ connected: boolean; message: string }> {
    const p = provider ?? this.credentials.getDefaultProvider();

    switch (p) {
      case 'openai':
        return this.checkOpenAi();
      case 'anthropic':
        return this.checkAnthropic();
      case 'ollama':
        return this.checkOllama();
      default:
        return {
          connected: this.isConfigured(p),
          message: this.isConfigured(p) ? 'Provider configured (mock/test mode)' : 'API Key not configured',
        };
    }
  }

  private async fetchOpenAiModels(): Promise<string[]> {
    const apiKey = this.credentials.getOpenAiKey();
    if (!apiKey) return FALLBACK_OPENAI_MODELS;

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) return FALLBACK_OPENAI_MODELS;

      const data = (await response.json()) as { data: { id: string }[] };
      const ids = data.data.map((m) => m.id);
      return this.filterOpenAiChatModels(ids);
    } catch {
      return FALLBACK_OPENAI_MODELS;
    }
  }

  private filterOpenAiChatModels(ids: string[]): string[] {
    const filtered = ids.filter((id) => this.isOpenAiChatModel(id));
    return this.sortModels(filtered.length > 0 ? filtered : FALLBACK_OPENAI_MODELS);
  }

  private isOpenAiChatModel(id: string): boolean {
    if (CHAT_MODEL_EXCLUDED.test(id)) return false;
    return (
      id.startsWith('gpt-') ||
      id.startsWith('chatgpt-') ||
      /^o\d/i.test(id) ||
      id.startsWith('o1') ||
      id.startsWith('o3') ||
      id.startsWith('o4')
    );
  }

  private async fetchAnthropicModels(): Promise<string[]> {
    const apiKey = this.credentials.getAnthropicKey();
    if (!apiKey) return ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'];

    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        return ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'];
      }

      const data = (await response.json()) as { data?: { id: string }[] };
      const ids = (data.data ?? []).map((m) => m.id).filter(Boolean);
      return this.sortModels(
        ids.length > 0 ? ids : ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest']
      );
    } catch {
      return ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'];
    }
  }

  private async fetchOllamaModels(): Promise<string[]> {
    const baseUrl = this.credentials.getOllamaBaseUrl().replace(/\/$/, '');
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = (await response.json()) as { models?: { name: string }[] };
      const names = (data.models ?? []).map((m) => m.name).filter(Boolean);
      return this.sortModels(names);
    } catch {
      return [];
    }
  }

  private sortModels(models: string[]): string[] {
    return [...new Set(models)].sort((a, b) => {
      const ai = MODEL_PRIORITY.findIndex((p) => a === p || a.startsWith(`${p}-`));
      const bi = MODEL_PRIORITY.findIndex((p) => b === p || b.startsWith(`${p}-`));
      const aRank = ai === -1 ? 999 : ai;
      const bRank = bi === -1 ? 999 : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.localeCompare(b);
    });
  }

  private ensureCurrentModel(models: string[], current: string): string[] {
    if (!current || models.includes(current)) return models;
    return [current, ...models];
  }

  private isConfigured(provider: ProviderType): boolean {
    switch (provider) {
      case 'openai':
        return this.credentials.isOpenAiConfigured();
      case 'anthropic':
        return !!this.credentials.getAnthropicKey();
      case 'ollama':
        return true;
      default:
        return false;
    }
  }

  private buildMessage(
    configured: boolean,
    envFileExists: boolean,
    keySource: string,
    provider: ProviderType
  ): string {
    if (!configured) {
      if (provider === 'ollama') return 'Ollama URL을 Settings에서 설정해 주세요.';
      const envPath = this.env.getDisplayPath();
      return envFileExists
        ? `.env(${envPath})는 있지만 API Key를 읽지 못했습니다. Reload Window 후 「연결 확인」을 눌러 주세요.`
        : '.env 파일을 생성하고 API Key를 설정해 주세요.';
    }
    if (keySource === 'env') {
      const path = this.env.getDisplayPath();
      return path !== '.env'
        ? `${path} 에서 API Key를 불러왔습니다.`
        : '.env에서 API Key를 불러왔습니다.';
    }
    if (keySource === 'settings') return 'Settings에서 API Key를 불러왔습니다.';
    return 'API Key configured';
  }

  private async checkOpenAi(): Promise<{ connected: boolean; message: string }> {
    const apiKey = this.credentials.getOpenAiKey();
    if (!apiKey) {
      return { connected: false, message: 'OpenAI API Key가 없습니다.' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (response.ok) {
        return { connected: true, message: 'ChatGPT(OpenAI) API 연결 성공' };
      }

      const error = await response.text();
      if (response.status === 401) {
        return { connected: false, message: 'API Key가 유효하지 않습니다.' };
      }
      return { connected: false, message: `연결 실패: ${error.slice(0, 80)}` };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : '네트워크 오류',
      };
    }
  }

  private async checkAnthropic(): Promise<{ connected: boolean; message: string }> {
    const apiKey = this.credentials.getAnthropicKey();
    if (!apiKey) {
      return { connected: false, message: 'Anthropic API Key가 없습니다.' };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      if (response.ok) {
        return { connected: true, message: 'Anthropic API 연결 성공' };
      }
      if (response.status === 401) {
        return { connected: false, message: 'Anthropic API Key가 유효하지 않습니다.' };
      }
      return { connected: true, message: 'Anthropic API Key configured' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : '네트워크 오류',
      };
    }
  }

  private async checkOllama(): Promise<{ connected: boolean; message: string }> {
    const baseUrl = this.credentials.getOllamaBaseUrl();
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tags`);
      if (response.ok) {
        return { connected: true, message: 'Ollama 연결 성공' };
      }
      return { connected: false, message: 'Ollama 서버 응답 오류' };
    } catch {
      return { connected: false, message: `Ollama 서버에 연결할 수 없습니다 (${baseUrl})` };
    }
  }

  /**
   * OpenAI 잔액/크레딧: 일반 CHATGPT_API_KEY(sk-...)로는 조회 불가.
   * OPENAI_ADMIN_KEY(조직 Admin API Key)가 있으면 이번 달 사용액만 조회 가능.
   */
  async fetchOpenAiBilling(): Promise<OpenAiBillingInfo> {
    const dashboardUrl = 'https://platform.openai.com/usage';
    const adminKey = this.env.get('OPENAI_ADMIN_KEY');

    const info: OpenAiBillingInfo = {
      balanceAvailable: false,
      monthUsageAvailable: false,
      adminKeyConfigured: !!adminKey,
      dashboardUrl,
      hint: adminKey
        ? '잔액은 API로 제공되지 않습니다. Admin Key로 이번 달 사용액 조회 중…'
        : '잔액/크레딧은 CHATGPT_API_KEY로 조회할 수 없습니다. platform.openai.com에서 확인하세요.',
    };

    if (!adminKey) return info;

    try {
      const now = Math.floor(Date.now() / 1000);
      const start = new Date();
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      const startTime = Math.floor(start.getTime() / 1000);

      const url = new URL('https://api.openai.com/v1/organization/costs');
      url.searchParams.set('start_time', String(startTime));
      url.searchParams.set('end_time', String(now));

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${adminKey}` },
      });

      if (!response.ok) {
        const body = await response.text();
        info.hint = `Admin Key 사용액 조회 실패 (${response.status}). 잔액은 대시보드에서 확인하세요.`;
        if (response.status === 401 || response.status === 403) {
          info.hint =
            'OPENAI_ADMIN_KEY 권한 없음. platform.openai.com → Admin keys에서 발급하세요. 잔액은 대시보드에서만 확인 가능합니다.';
        } else if (body) {
          info.hint = `${info.hint} ${body.slice(0, 60)}`;
        }
        return info;
      }

      const data = (await response.json()) as {
        data?: Array<{ results?: Array<{ amount?: { value?: string | number } }> }>;
      };

      let total = 0;
      for (const bucket of data.data ?? []) {
        for (const row of bucket.results ?? []) {
          const raw = row.amount?.value;
          const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '0'));
          if (!Number.isNaN(n)) total += n;
        }
      }

      info.monthUsageAvailable = true;
      info.monthUsageUsd = total;
      info.hint = `이번 달 API 사용액 $${total.toFixed(2)} (Admin API) · 남은 잔액/크레딧은 대시보드에서 확인`;
    } catch (error) {
      info.hint =
        error instanceof Error
          ? `Admin API 사용액 조회 오류: ${error.message}`
          : 'Admin API 사용액 조회 오류';
    }

    return info;
  }
}
