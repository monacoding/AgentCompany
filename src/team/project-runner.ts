import { AgentFolderEngine } from '../agent-folders';
import { formatChatReply, formatLlmError } from '../chat/reply-format';
import { ProviderEngine } from '../providers';
import { Agent, ProjectPhase, ProjectTask } from '../types';
import { formatAgentLabel } from '../utils/agent-display';

export interface ProjectRunCallbacks {
  onPhase: (phase: ProjectPhase, detail: string) => void;
  onTaskStart: (task: ProjectTask, index: number, total: number) => void;
  onTaskDone: (task: ProjectTask, output: string) => void;
  onMessage: (agent: Agent, content: string) => void;
}

/** CrewAI Task 파싱 — 계획 텍스트에서 @에이전트: 할 일 추출 */
export function parseProjectTasks(plan: string, members: Agent[]): ProjectTask[] {
  const tasks: ProjectTask[] = [];
  const lines = plan.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(
      /^(?:\d+[\.\)]\s*)?@?([가-힣A-Za-z][가-힣A-Za-z0-9]*)\s*[:：\-]\s*(.+)$/
    );
    if (!match) continue;

    const name = match[1].trim();
    const description = match[2].trim();
    if (description.length < 2) continue;

    const agent =
      members.find((a) => a.name === name) ??
      members.find((a) => a.name.startsWith(name)) ??
      members.find((a) => name.startsWith(a.name));

    if (!agent) continue;

    tasks.push({
      agentId: agent.id,
      agentName: agent.name,
      description,
      status: 'pending',
    });
  }

  if (tasks.length === 0) {
    for (const agent of members.filter((m) => m.role !== 'pm')) {
      tasks.push({
        agentId: agent.id,
        agentName: agent.name,
        description: `${agent.title || agent.role} 역할로 사장님 지시 지원`,
        status: 'pending',
      });
    }
  }

  const seen = new Set<string>();
  return tasks.filter((t) => {
    if (seen.has(t.agentId)) return false;
    seen.add(t.agentId);
    return true;
  });
}

export async function runProjectSequential(
  pm: Agent,
  command: string,
  plan: string,
  members: Agent[],
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  callbacks: ProjectRunCallbacks
): Promise<{ tasks: ProjectTask[]; summary: string }> {
  const tasks = parseProjectTasks(plan, members);
  callbacks.onPhase('planning', 'PM 계획 확정');

  if (tasks.length === 0) {
    return {
      tasks: [],
      summary: '실행할 Project 태스크를 파싱하지 못했습니다. `/project` 명령에 구체적 업무를 적어 주세요.',
    };
  }

  callbacks.onPhase('executing', `0/${tasks.length} 완료`);

  const completedOutputs: Array<{ agent: string; description: string; output: string }> = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const agent = members.find((a) => a.id === task.agentId);
    if (!agent) {
      task.status = 'failed';
      continue;
    }

    task.status = 'running';
    callbacks.onTaskStart(task, i, tasks.length);
    callbacks.onPhase('executing', `${i}/${tasks.length} — ${agent.name} 작업 중`);

    try {
      const folderContext = await agentFolders.buildConversationalPromptContext(agent);
      const response = await providers.chat(
        [
          {
            role: 'system',
            content: `You are ${formatAgentLabel(agent)} executing ONE project task.
${folderContext}

Rules:
- Korean, concise, deliverable-focused
- Complete the assigned task only
- No meta commentary`,
          },
          {
            role: 'user',
            content: `## 사장님 지시\n${command}\n\n## PM 계획\n${plan}\n\n## 당신의 태스크\n${task.description}\n\n결과물을 작성하세요.`,
          },
        ],
        { type: agent.provider, model: agent.model }
      );

      const output = formatChatReply(response.content || '') || response.content.trim() || '완료';
      task.status = 'done';
      task.output = output.slice(0, 2000);
      completedOutputs.push({
        agent: agent.name,
        description: task.description,
        output: task.output,
      });
      callbacks.onTaskDone(task, task.output);
      callbacks.onMessage(agent, `✅ **태스크 완료**\n${task.description}\n\n${task.output}`);
    } catch (error) {
      task.status = 'failed';
      const message = formatLlmError(error);
      task.output = message;
      callbacks.onMessage(agent, `❌ **태스크 실패**\n${task.description}\n\n${message}`);
    }
  }

  callbacks.onPhase('reviewing', 'PM 검토 중');

  let summary: string;
  try {
    const deliverables = completedOutputs
      .map((d) => `### ${d.agent}\n${d.description}\n${d.output}`)
      .join('\n\n');

    const review = await providers.chat(
      [
        {
          role: 'system',
          content: `You are ${pm.name}, PM. Review project deliverables and report to CEO in Korean (under 600 chars).`,
        },
        {
          role: 'user',
          content: `## 사장님 지시\n${command}\n\n## 산출물\n${deliverables}\n\n완료 보고를 작성하세요.`,
        },
      ],
      { type: pm.provider, model: pm.model }
    );
    summary = (review.content || '').trim() || 'Project가 완료되었습니다.';
  } catch (error) {
    summary = `Project 완료 (PM 검토 LLM 오류: ${formatLlmError(error)})`;
  }

  callbacks.onPhase('done', `${tasks.filter((t) => t.status === 'done').length}/${tasks.length} 완료`);

  return { tasks, summary };
}
