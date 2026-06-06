export class LlmUsageTracker {
  private activeCounts = new Map<string, number>();
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
}
