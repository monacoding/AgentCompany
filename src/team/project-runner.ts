import { AgentFolderEngine } from '../agent-folders';
import { formatChatReply, formatLlmError } from '../chat/reply-format';
import { ProviderEngine } from '../providers';
import { Agent, ProjectPhase, ProjectTask } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import {
  PROJECT_REVIEW_MAX_ITERATIONS,
  formatLoopExhaustedNote,
  isDeliverableApproved,
  resolveProjectReviewer,
} from './project-loop';

export interface ProjectRunCallbacks {
  onPhase: (phase: ProjectPhase, detail: string) => void;
  onTaskStart: (task: ProjectTask, index: number, total: number) => void;
  onTaskDone: (task: ProjectTask, output: string) => void;
  onMessage: (agent: Agent, content: string) => void;
  onReviewStart?: (task: ProjectTask, reviewer: Agent, iteration: number, max: number) => void;
  onReviewDone?: (task: ProjectTask, reviewer: Agent, approved: boolean, iteration: number) => void;
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

async function executeWorkerTask(
  agent: Agent,
  command: string,
  plan: string,
  task: ProjectTask,
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  revision?: { previousOutput: string; feedback: string }
): Promise<string> {
  const folderContext = await agentFolders.buildConversationalPromptContext(agent);

  const revisionBlock = revision
    ? `\n\n## 이전 산출물\n${revision.previousOutput}\n\n## 검토 피드백 (반영 필수)\n${revision.feedback}\n\n피드백을 반영해 수정하세요. 더 수정할 내용이 없으면 마지막 줄에 FINISHED 를 포함하세요.`
    : '\n\n결과물을 작성하세요. 작업이 완료되면 마지막 줄에 FINISHED 를 포함할 수 있습니다.';

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
        content: `## 사장님 지시\n${command}\n\n## PM 계획\n${plan}\n\n## 당신의 태스크\n${task.description}${revisionBlock}`,
      },
    ],
    { type: agent.provider, model: agent.model }
  );

  return formatChatReply(response.content || '') || response.content.trim() || '완료';
}

async function reviewWorkerOutput(
  reviewer: Agent,
  worker: Agent,
  command: string,
  task: ProjectTask,
  output: string,
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine
): Promise<string> {
  const folderContext = await agentFolders.buildConversationalPromptContext(reviewer);

  const response = await providers.chat(
    [
      {
        role: 'system',
        content: `You are ${formatAgentLabel(reviewer)}, project reviewer (ChatDev Code Reviewer role).
${folderContext}

Review the worker deliverable against the task and CEO command.
Rules:
- Korean, concise
- If acceptable: brief approval AND include FINISHED on its own line
- If revision needed: list specific issues only (do NOT include FINISHED)`,
      },
      {
        role: 'user',
        content: `## 사장님 지시\n${command}\n\n## 태스크\n${task.description}\n\n## 담당\n@${worker.name}\n\n## 산출물\n${output}\n\n검토하세요.`,
      },
    ],
    { type: reviewer.provider, model: reviewer.model }
  );

  return formatChatReply(response.content || '') || response.content.trim() || '';
}

/** ChatDev SDLC: 작업 → 검토 → (미승인 시) 수정 루프 */
async function executeTaskWithReviewLoop(
  pm: Agent,
  worker: Agent,
  command: string,
  plan: string,
  task: ProjectTask,
  members: Agent[],
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  callbacks: ProjectRunCallbacks
): Promise<{ output: string; approved: boolean; iterations: number }> {
  const reviewer = resolveProjectReviewer(pm, members, worker);
  const max = PROJECT_REVIEW_MAX_ITERATIONS;
  let output = '';
  let feedback: string | undefined;
  let approved = false;
  let usedIterations = 0;

  for (let iteration = 1; iteration <= max; iteration++) {
    usedIterations = iteration;
    callbacks.onPhase(
      'executing',
      iteration === 1
        ? `${worker.name} 작업 중`
        : `${worker.name} 수정 중 (${iteration}/${max})`
    );

    const previousOutput = iteration > 1 ? output : undefined;
    output = await executeWorkerTask(
      worker,
      command,
      plan,
      task,
      providers,
      agentFolders,
      previousOutput && feedback ? { previousOutput, feedback } : undefined
    );

    if (isDeliverableApproved(output)) {
      approved = true;
      break;
    }

    callbacks.onReviewStart?.(task, reviewer, iteration, max);
    callbacks.onPhase('reviewing', `${reviewer.name} 검토 중 (${iteration}/${max})`);

    const reviewText = await reviewWorkerOutput(
      reviewer,
      worker,
      command,
      task,
      output,
      providers,
      agentFolders
    );

    callbacks.onMessage(
      reviewer,
      `🔍 **검토 ${iteration}/${max}** (@${worker.name})\n${reviewText}`
    );

    if (isDeliverableApproved(reviewText)) {
      approved = true;
      callbacks.onReviewDone?.(task, reviewer, true, iteration);
      break;
    }

    feedback = reviewText;
    callbacks.onReviewDone?.(task, reviewer, false, iteration);

    if (iteration === max) {
      output = `${output}\n\n${formatLoopExhaustedNote(iteration, max)}`;
      approved = false;
    }
  }

  return { output: output.slice(0, 2000), approved, iterations: usedIterations };
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

  callbacks.onPhase('executing', `0/${tasks.length} 완료 (검토 루프 최대 ${PROJECT_REVIEW_MAX_ITERATIONS}회)`);

  const completedOutputs: Array<{ agent: string; description: string; output: string; approved: boolean }> =
    [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const agent = members.find((a) => a.id === task.agentId);
    if (!agent) {
      task.status = 'failed';
      continue;
    }

    task.status = 'running';
    callbacks.onTaskStart(task, i, tasks.length);
    callbacks.onPhase('executing', `태스크 ${i + 1}/${tasks.length} — @${agent.name}`);

    try {
      const { output, approved } = await executeTaskWithReviewLoop(
        pm,
        agent,
        command,
        plan,
        task,
        members,
        providers,
        agentFolders,
        callbacks
      );

      task.status = 'done';
      task.output = output;
      completedOutputs.push({
        agent: agent.name,
        description: task.description,
        output: task.output,
        approved,
      });
      callbacks.onTaskDone(task, task.output);

      const statusIcon = approved ? '✅' : '⚠️';
      const statusNote = approved ? '검토 통과' : '검토 루프 한도 도달';
      callbacks.onMessage(
        agent,
        `${statusIcon} **태스크 완료** (${statusNote})\n${task.description}\n\n${task.output}`
      );
    } catch (error) {
      task.status = 'failed';
      const message = formatLlmError(error);
      task.output = message;
      callbacks.onMessage(agent, `❌ **태스크 실패**\n${task.description}\n\n${message}`);
    }
  }

  callbacks.onPhase('reviewing', 'PM 최종 보고 작성 중');

  let summary: string;
  try {
    const deliverables = completedOutputs
      .map(
        (d) =>
          `### ${d.agent} (${d.approved ? '검토통과' : '루프한도'})\n${d.description}\n${d.output}`
      )
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

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  callbacks.onPhase('done', `${doneCount}/${tasks.length} 완료`);

  return { tasks, summary };
}
