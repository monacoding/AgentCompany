import { ChatMessage, ProviderConfig, ProviderResponse, ProviderType } from '../types';

export interface IProvider {
  readonly type: ProviderType;
  chat(messages: ChatMessage[], config: ProviderConfig): Promise<ProviderResponse>;
  isConfigured(): boolean;
}

export abstract class BaseProvider implements IProvider {
  abstract readonly type: ProviderType;

  abstract chat(messages: ChatMessage[], config: ProviderConfig): Promise<ProviderResponse>;

  isConfigured(): boolean {
    return true;
  }

  protected buildSystemPrompt(role: string, description: string): string {
    return `You are an AI agent working as a ${role} in AgentCompany.
${description}

Respond concisely and action-oriented. When given a task, explain your approach and deliver results.`;
  }
}
