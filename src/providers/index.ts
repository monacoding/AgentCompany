import { BaseProvider } from './base';
import { getLlmAgentId } from './llm-context';
import { LlmUsageTracker } from './llm-usage-tracker';
import { ChatMessage, ProviderConfig, ProviderResponse, ProviderType } from '../types';
import { CredentialsResolver } from '../services/credentials';

export { runWithLlmAgent } from './llm-context';
export { LlmUsageTracker } from './llm-usage-tracker';

const BILLABLE_LLM_PROVIDERS = new Set<ProviderType>(['openai', 'anthropic', 'ollama']);

/** gpt-5 / o-series 등 — max_tokens 대신 max_completion_tokens 사용 */
function usesMaxCompletionTokens(model: string): boolean {
  return /^(gpt-5|o[0-9]|chatgpt-)/i.test(model.trim());
}

function openAiTokenLimitFields(model: string, maxTokens?: number): Record<string, number> {
  if (!maxTokens) return {};
  return usesMaxCompletionTokens(model)
    ? { max_completion_tokens: maxTokens }
    : { max_tokens: maxTokens };
}

class OpenAIProvider extends BaseProvider {
  readonly type: ProviderType = 'openai';

  constructor(private credentials: CredentialsResolver) {
    super();
  }

  async chat(messages: ChatMessage[], config: ProviderConfig): Promise<ProviderResponse> {
    const apiKey = (config.apiKey || this.credentials.getOpenAiKey()).trim();
    if (!apiKey) {
      throw new Error(
        'OpenAI API Key가 없습니다. 대시보드에서 「연결 확인」 후 .env의 CHATGPT_API_KEY를 확인해 주세요.'
      );
    }

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          ...openAiTokenLimitFields(config.model, config.maxTokens),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices: { message: { content: string } }[];
          usage?: { prompt_tokens: number; completion_tokens: number };
        };

        return {
          content: data.choices[0]?.message?.content ?? '',
          model: config.model,
          usage: data.usage
            ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
            : undefined,
        };
      }

      const error = await response.text();
      const isRateLimit = response.status === 429 || /rate_limit/i.test(error);
      if (!isRateLimit || attempt === maxAttempts - 1) {
        throw new Error(
          isRateLimit
            ? 'OpenAI API 사용량 한도에 잠시 걸렸어요. 10초 후 다시 시도해 주세요.'
            : `OpenAI API error: ${error}`
        );
      }

      const retryMatch = error.match(/try again in ([\d.]+)s/i);
      const waitMs = retryMatch ? Math.ceil(parseFloat(retryMatch[1]) * 1000) + 500 : 10_000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    throw new Error('OpenAI API 요청에 실패했어요.');
  }

  async chatStream(
    messages: ChatMessage[],
    config: ProviderConfig,
    onChunk: (text: string) => void
  ): Promise<ProviderResponse> {
    const apiKey = (config.apiKey || this.credentials.getOpenAiKey()).trim();
    if (!apiKey) {
      throw new Error(
        'OpenAI API Key가 없습니다. 대시보드에서 「연결 확인」 후 .env의 CHATGPT_API_KEY를 확인해 주세요.'
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        ...openAiTokenLimitFields(config.model, config.maxTokens),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return this.chat(messages, config);
    }

    const decoder = new TextDecoder();
    let content = '';
    let buffer = '';
    let streamUsage: { prompt_tokens: number; completion_tokens: number } | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload) as {
            choices?: { delta?: { content?: string } }[];
            usage?: { prompt_tokens: number; completion_tokens: number };
          };
          if (parsed.usage) {
            streamUsage = parsed.usage;
          }
          const delta = parsed.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            content += delta;
            onChunk(delta);
          }
        } catch {
          /* ignore partial SSE */
        }
      }
    }

    return {
      content,
      model: config.model,
      usage: streamUsage
        ? {
            promptTokens: streamUsage.prompt_tokens,
            completionTokens: streamUsage.completion_tokens,
          }
        : undefined,
    };
  }

  isConfigured(): boolean {
    return !!this.credentials.getOpenAiKey();
  }
}

class AnthropicProvider extends BaseProvider {
  readonly type: ProviderType = 'anthropic';

  constructor(private credentials: CredentialsResolver) {
    super();
  }

  async chat(messages: ChatMessage[], config: ProviderConfig): Promise<ProviderResponse> {
    const apiKey = config.apiKey ?? this.credentials.getAnthropicKey();
    if (!apiKey) {
      return { content: '[Anthropic] API key not configured.', model: config.model };
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens ?? 4096,
        system: systemMessage?.content,
        messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${await response.text()}`);
    }

    const data = (await response.json()) as { content: { text: string }[] };
    return { content: data.content[0]?.text ?? '', model: config.model };
  }

  isConfigured(): boolean {
    return !!this.credentials.getAnthropicKey();
  }
}

class OllamaProvider extends BaseProvider {
  readonly type: ProviderType = 'ollama';

  constructor(private credentials: CredentialsResolver) {
    super();
  }

  async chat(messages: ChatMessage[], config: ProviderConfig): Promise<ProviderResponse> {
    const baseUrl = config.baseUrl ?? this.credentials.getOllamaBaseUrl();

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${await response.text()}`);
    }

    const data = (await response.json()) as { message: { content: string } };
    return { content: data.message?.content ?? '', model: config.model };
  }
}

class MockProvider extends BaseProvider {
  readonly type: ProviderType = 'custom';

  async chat(messages: ChatMessage[], config: ProviderConfig): Promise<ProviderResponse> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return {
      content: `[Mock Response] Received task: "${lastUser?.content?.slice(0, 100) ?? 'empty'}". .env에 CHATGPT_API_KEY를 설정해 주세요.`,
      model: config.model,
    };
  }
}

export class ProviderEngine {
  private providers: Map<ProviderType, BaseProvider>;

  constructor(
    credentials: CredentialsResolver,
    private llmUsage?: LlmUsageTracker
  ) {
    this.providers = new Map([
      ['openai', new OpenAIProvider(credentials)],
      ['anthropic', new AnthropicProvider(credentials)],
      ['ollama', new OllamaProvider(credentials)],
      ['gemini', new MockProvider()],
      ['openrouter', new MockProvider()],
      ['runpod', new MockProvider()],
      ['custom', new MockProvider()],
    ]);
  }

  getProvider(type: ProviderType): BaseProvider {
    return this.providers.get(type) ?? new MockProvider();
  }

  async chat(
    type: ProviderType,
    messages: ChatMessage[],
    config: ProviderConfig
  ): Promise<ProviderResponse> {
    const provider = this.getProvider(type);
    const agentId = getLlmAgentId();
    const track = !!agentId && !!this.llmUsage && BILLABLE_LLM_PROVIDERS.has(type);

    if (track && agentId) {
      this.llmUsage!.begin(agentId);
    }
    try {
      const result = await provider.chat(messages, config);
      if (track && agentId && result.usage) {
        this.llmUsage!.recordTokens(agentId, result.usage);
      }
      return result;
    } finally {
      if (track && agentId) {
        this.llmUsage!.end(agentId);
      }
    }
  }

  async chatStream(
    type: ProviderType,
    messages: ChatMessage[],
    config: ProviderConfig,
    onChunk: (text: string) => void
  ): Promise<ProviderResponse> {
    const agentId = getLlmAgentId();
    const track = !!agentId && !!this.llmUsage && BILLABLE_LLM_PROVIDERS.has(type);

    if (track && agentId) {
      this.llmUsage!.begin(agentId);
    }
    try {
      let result: ProviderResponse;
      if (type === 'openai') {
        const openai = this.getProvider('openai') as OpenAIProvider;
        result = await openai.chatStream(messages, config, onChunk);
      } else {
        const provider = this.getProvider(type);
        result = await provider.chat(messages, config);
        if (result.content) onChunk(result.content);
      }
      if (track && agentId && result.usage) {
        this.llmUsage!.recordTokens(agentId, result.usage);
      }
      return result;
    } finally {
      if (track && agentId) {
        this.llmUsage!.end(agentId);
      }
    }
  }

  takeTokenUsage(agentId: string) {
    return this.llmUsage?.takeTokens(agentId);
  }

  listProviders(): { type: ProviderType; configured: boolean }[] {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      configured: provider.isConfigured(),
    }));
  }
}
