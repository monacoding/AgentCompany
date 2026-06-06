import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage<{ agentId: string }>();

export function runWithLlmAgent<T>(agentId: string, fn: () => T): T {
  return storage.run({ agentId }, fn);
}

export function getLlmAgentId(): string | undefined {
  return storage.getStore()?.agentId;
}
