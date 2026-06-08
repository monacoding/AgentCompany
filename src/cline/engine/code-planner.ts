import { ProviderEngine } from '../../providers';
import { Agent } from '../../types';
import { DevPlan, DevPlanMode } from './planner-types';

export class CodePlanner {
  constructor(private providers: ProviderEngine) {}

  async plan(task: string, mode: DevPlanMode, context: string, agent: Agent): Promise<DevPlan> {
    const modePrompts: Record<DevPlanMode, string> = {
      architect: 'Create an architecture plan only. Do NOT write code. Output structured plan with steps and file list.',
      coder: 'Create an implementation plan then generate code. List files to create/modify.',
      debugger: 'Analyze the issue, identify root cause, propose fix steps and files to change.',
    };

    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You are ${agent.name}, AgentCompany developer (${mode} mode). ${modePrompts[mode]}
Respond in JSON:
{"objective":"...","steps":["..."],"filesToModify":["path/to/file"]}`,
        },
        {
          role: 'user',
          content: `Task: ${task}\n\nProject context:\n${context.slice(0, 6000)}`,
        },
      ],
      { type: agent.provider, model: agent.model }
    );

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as {
          objective?: string;
          steps?: string[];
          filesToModify?: string[];
        };
        return {
          mode,
          objective: parsed.objective ?? task,
          steps: parsed.steps ?? ['Execute task'],
          filesToModify: parsed.filesToModify ?? [],
        };
      }
    } catch {
      // fallback
    }

    return {
      mode,
      objective: task,
      steps: [response.content.slice(0, 500)],
      filesToModify: [],
    };
  }
}
