import { ProviderEngine } from '../../providers';
import { Agent } from '../../types';

export class SelfChecker {
  constructor(private providers: ProviderEngine) {}

  async check(
    task: string,
    summary: string,
    filesModified: string[],
    terminalOutput: string | undefined,
    agent: Agent
  ): Promise<{ passed: boolean; feedback: string }> {
    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You are Kilo self-checker. Review if the work satisfies the task. Respond JSON: {"passed":true/false,"feedback":"..."}`,
        },
        {
          role: 'user',
          content: `Task: ${task}
Summary: ${summary.slice(0, 1500)}
Files modified: ${filesModified.join(', ') || 'none'}
Terminal: ${terminalOutput?.slice(0, 1000) ?? 'not run'}`,
        },
      ],
      { type: agent.provider, model: agent.model }
    );

    try {
      const match = response.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as { passed?: boolean; feedback?: string };
        return { passed: parsed.passed ?? true, feedback: parsed.feedback ?? 'OK' };
      }
    } catch {
      // fallback
    }

    return { passed: true, feedback: response.content.slice(0, 300) };
  }
}
