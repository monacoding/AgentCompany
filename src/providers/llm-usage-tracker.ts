import type { ChatTokenUsage } from '../chat/types';

export class LlmUsageTracker {
  private activeCounts = new Map<string, number>();
  private tokenLedger = new Map<string, { promptTokens: number; completionTokens: number }>();
  private onChange?: () => void;

  setOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  begin(agentId: string): void {
    this.activeCounts.set(agentId, (this.activeCounts.get(agentId) ?? 0) + 1);
    this.onChange?.();
  }

  end(agentId: string): void {
    const next = (this.activeCounts.get(agentId) ?? 0) - 1;
    if (next <= 0) {
      this.activeCounts.delete(agentId);
    } else {
      this.activeCounts.set(agentId, next);
    }
    this.onChange?.();
  }

  isActive(agentId: string): boolean {
    return (this.activeCounts.get(agentId) ?? 0) > 0;
  }

  recordTokens(agentId: string, usage: { promptTokens: number; completionTokens: number }): void {
    const prev = this.tokenLedger.get(agentId) ?? { promptTokens: 0, completionTokens: 0 };
    this.tokenLedger.set(agentId, {
      promptTokens: prev.promptTokens + usage.promptTokens,
      completionTokens: prev.completionTokens + usage.completionTokens,
    });
  }

  takeTokens(agentId: string): ChatTokenUsage | undefined {
    const prev = this.tokenLedger.get(agentId);
    this.tokenLedger.delete(agentId);
    if (!prev || (prev.promptTokens === 0 && prev.completionTokens === 0)) {
      return undefined;
    }
    return {
      promptTokens: prev.promptTokens,
      completionTokens: prev.completionTokens,
      totalTokens: prev.promptTokens + prev.completionTokens,
    };
  }
}
