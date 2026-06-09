import { AgentFolderEngine } from '../agent-folders';
import { formatChatReply, formatLlmError } from '../chat/reply-format';
import { ProviderEngine } from '../providers';
import { Agent, ProjectPhase, ProjectTask } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import {
  buildFullReportBody,
  saveProjectSummaryArtifact,
  saveProjectTaskArtifact,
} from './project-artifacts';
import { buildPriorDeliverablesContext, PriorDeliverable } from './project-context';
import {
  PROJECT_REVIEW_MAX_ITERATIONS,
  formatLoopExhaustedNote,
  isDeliverableApproved,
  resolveProjectReviewer,
} from './project-loop';
import { buildReviewPhasePrompt } from './phase-prompts';
import { ProjectWorkerDeps, executeProjectWorkerTask } from './project-worker-engine';
import { buildWorkerToolingHint } from './project-tooling';

export interface ProjectRunCallbacks {
  onPhase: (phase: ProjectPhase, detail: string) => void;
  /** 작업 중 실시간 한 줄 상태 (채팅 working 스트림) */
  onProgress?: (agent: Agent, message: string) => void;
  onTaskStart: (task: ProjectTask, index: number, total: number) => void;
  onTaskDone: (task: ProjectTask, output: string) => void;
  onMessage: (agent: Agent, content: string) => void;
  onReviewStart?: (task: ProjectTask, reviewer: Agent, iteration: number, max: number) => void;
  onReviewDone?: (task: ProjectTask, reviewer: Agent, approved: boolean, iteration: number) => void;
  onArtifactSaved?: (relativePath: string) => void;
}

export interface ProjectRunOptions {
  sessionId: string;
  warehouseFolder: string;
  projectTitle?: string;
  companyDir: string;
  workerDeps?: ProjectWorkerDeps;
  templateScriptPath?: string;
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
      members.find((a) => a.name.startsWith(name));

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

async function reviewWorkerOutput(
  reviewer: Agent,
  worker: Agent,
  command: string,
  task: ProjectTask,
  output: string,
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine
): Promise<string> {
  const folderContext = await agentFolders.buildPromptContext(reviewer);
  const userContent = buildReviewPhasePrompt(reviewer, worker, command, task.description, output);

  const response = await providers.chat(
    reviewer.provider,
    [
      {
        role: 'system',
        content: `You are ${formatAgentLabel(reviewer)}, project reviewer.
${folderContext}`,
      },
      { role: 'user', content: userContent },
    ],
    { type: reviewer.provider, model: reviewer.model }
  );

  return formatChatReply(response.content || '') || response.content.trim() || '';
}

async function executeTaskWithReviewLoop(
  pm: Agent,
  worker: Agent,
  command: string,
  plan: string,
  task: ProjectTask,
  priorContext: string,
  members: Agent[],
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  callbacks: ProjectRunCallbacks,
  runOptions: ProjectRunOptions
): Promise<{ output: string; approved: boolean; iterations: number; extractedFiles: string[] }> {
  const reviewer = resolveProjectReviewer(pm, members, worker);
  const max = PROJECT_REVIEW_MAX_ITERATIONS;
  let output = '';
  let feedback: string | undefined;
  let approved = false;
  let usedIterations = 0;
  const allExtracted: string[] = [];

  for (let iteration = 1; iteration <= max; iteration++) {
    usedIterations = iteration;
    callbacks.onPhase(
      'executing',
      iteration === 1
        ? `${worker.name} 작업 중`
        : `${worker.name} 수정 중 (${iteration}/${max})`
    );

    callbacks.onProgress?.(
      worker,
      iteration === 1 ? '작업 시작…' : `피드백 반영 수정 중 (${iteration}/${max})…`
    );

    const previousOutput = iteration > 1 ? output : undefined;
    const workerResult = await executeProjectWorkerTask(
      worker,
      command,
      plan,
      task,
      priorContext,
      providers,
      agentFolders,
      runOptions.workerDeps!,
      {
        companyDir: runOptions.companyDir,
        sessionId: runOptions.sessionId,
        warehouseFolder: runOptions.warehouseFolder,
        templateScriptPath: runOptions.templateScriptPath,
        onProgress: (message) => callbacks.onProgress?.(worker, message),
      },
      previousOutput && feedback ? { previousOutput, feedback } : undefined
    );
    output = workerResult.output;
    for (const f of workerResult.extractedFiles) {
      if (!allExtracted.includes(f)) allExtracted.push(f);
      callbacks.onArtifactSaved?.(f);
    }
    for (const f of workerResult.executedArtifacts) {
      callbacks.onArtifactSaved?.(f);
    }

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

  return {
    output,
    approved,
    iterations: usedIterations,
    extractedFiles: allExtracted,
  };
}

export async function runProjectSequential(
  pm: Agent,
  command: string,
  plan: string,
  members: Agent[],
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  callbacks: ProjectRunCallbacks,
  options: ProjectRunOptions
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

  const priorDeliverables: PriorDeliverable[] = [];
  const { warehouseFolder, companyDir } = options;

  if (!options.workerDeps) {
    return {
      tasks,
      summary:
        'Project 실행 엔진이 초기화되지 않았습니다. Reload Window 후 다시 시도해 주세요.',
    };
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const agent = members.find((a) => a.id === task.agentId);
    if (!agent) {
      task.status = 'failed';
      continue;
    }

    const priorContext = buildPriorDeliverablesContext(priorDeliverables);

    task.status = 'running';
    callbacks.onTaskStart(task, i, tasks.length);
    callbacks.onPhase('executing', `태스크 ${i + 1}/${tasks.length} — @${agent.name}`);

    try {
      const { output, approved, extractedFiles } = await executeTaskWithReviewLoop(
        pm,
        agent,
        command,
        plan,
        task,
        priorContext,
        members,
        providers,
        agentFolders,
        callbacks,
        options
      );
      const artifactPath = saveProjectTaskArtifact(
        companyDir,
        warehouseFolder,
        i,
        agent.name,
        task.description,
        output,
        approved
      );

      task.status = 'done';
      task.output = output;
      task.artifactPath = artifactPath;
      task.extractedFiles = extractedFiles;
      callbacks.onArtifactSaved?.(artifactPath);
      for (const f of extractedFiles) {
        callbacks.onArtifactSaved?.(f);
      }

      priorDeliverables.push({
        agent: agent.name,
        description: task.description,
        output: task.output,
        approved,
      });

      callbacks.onTaskDone(task, task.output);

      const fileNote =
        extractedFiles.length > 0 ? `\n\n📁 파일 ${extractedFiles.length}개 저장` : '';
      const artifactNote = `\n\n📄 산출물: company/${artifactPath}`;
      const statusIcon = approved ? '✅' : '⚠️';
      const statusNote = approved ? '검토 통과' : '검토 루프 한도 도달';
      callbacks.onMessage(
        agent,
        `${statusIcon} **태스크 완료** (${statusNote})\n${task.description}\n\n${task.output}${fileNote}${artifactNote}`
      );
    } catch (error) {
      task.status = 'failed';
      const message = formatLlmError(error);
      task.output = message;
      callbacks.onMessage(agent, `❌ **태스크 실패**\n${task.description}\n\n${message}`);
    }
  }

  callbacks.onPhase('reviewing', '최종 보고서 저장 중');

  const reportContent = buildFullReportBody(tasks, pm.id);
  const summaryPath = saveProjectSummaryArtifact(companyDir, warehouseFolder, reportContent, {
    projectTitle: options.projectTitle ?? warehouseFolder,
    authorName: pm.name,
  });
  callbacks.onArtifactSaved?.(summaryPath);

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  callbacks.onPhase('done', `${doneCount}/${tasks.length} 완료`);

  const summary = `Project 완료.\n📄 최종 보고서: company/${summaryPath}`;
  return { tasks, summary };
}
