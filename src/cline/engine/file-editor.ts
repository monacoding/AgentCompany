import { ProviderEngine } from '../../providers';
import { Agent } from '../../types';
import { buildWorkspacePrompt, parseAgentOutput } from '../../workspace/action-parser';
import { WorkspaceActionExecutor } from '../../workspace/action-executor';
import { DevPlan, DevPlanMode } from './planner-types';

export class FileEditor {
  constructor(
    private providers: ProviderEngine,
    private workspaceExecutor: WorkspaceActionExecutor
  ) {}

  async generateAndApply(
    task: string,
    plan: DevPlan,
    context: string,
    agent: Agent,
    agentId: string,
    taskId: string
  ): Promise<{ summary: string; filesModified: string[] }> {
    const modeInstructions: Record<DevPlanMode, string> = {
      architect: 'Output architecture document only as markdown file. No code implementation.',
      coder: 'Implement the plan. Generate production-ready code files.',
      debugger: 'Fix the bug. Show before/after reasoning and modified files.',
    };

    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You are ${agent.name}, AgentCompany developer (Cline ${plan.mode} mode).
${modeInstructions[plan.mode]}
${buildWorkspacePrompt(agent.role)}

Plan:
${plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
        },
        {
          role: 'user',
          content: `Task: ${task}
Objective: ${plan.objective}
Files to modify: ${plan.filesToModify.join(', ') || 'determine from context'}

Context:
${context.slice(0, 8000)}

Execute and output files.`,
        },
      ],
      { type: agent.provider, model: agent.model }
    );

    const parsed = parseAgentOutput(response.content);
    const filesModified: string[] = [];

    if (parsed.files.length > 0) {
      const results = await this.workspaceExecutor.applyActions(parsed.files, agentId, taskId);
      for (const r of results) {
        if (r.success) filesModified.push(r.path);
      }
    }

    return {
      summary: parsed.summary || response.content.slice(0, 2000),
      filesModified,
    };
  }
}
