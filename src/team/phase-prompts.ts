import { Agent } from '../types';
import { formatAgentLabel } from '../utils/agent-display';

/** ChatDev literal 노드 — Worker 태스크 Phase */
export function buildWorkerPhasePrompt(
  agent: Agent,
  command: string,
  plan: string,
  taskDescription: string,
  priorContext: string,
  toolingHint: string,
  revision?: { previousOutput: string; feedback: string }
): string {
  const revisionBlock = revision
    ? `\n\n## 이전 산출물\n${revision.previousOutput}\n\n## 검토 피드백 (반영 필수)\n${revision.feedback}\n\n피드백을 반영해 수정하세요. 완료 시 마지막 줄에 FINISHED 를 포함하세요.`
    : '\n\n결과물을 작성하세요. 완료 시 마지막 줄에 FINISHED 를 포함할 수 있습니다.';

  return `Modality: Deliverable.
Assignee: ${formatAgentLabel(agent)}.
Task: ${taskDescription}
${toolingHint}

## 사장님 지시
${command}

## PM 계획
${plan}
${priorContext ? `\n## 이전 태스크 산출물 (carry_data)\n${priorContext}` : ''}
${revisionBlock}`;
}

/** ChatDev Code Reviewer literal */
export function buildReviewPhasePrompt(
  reviewer: Agent,
  worker: Agent,
  command: string,
  taskDescription: string,
  output: string
): string {
  return `Modality: Review.
Reviewer: ${formatAgentLabel(reviewer)}.
Worker: @${worker.name}.
Task: ${taskDescription}

## 사장님 지시
${command}

## 산출물
${output}

검토 기준:
- 태스크 요구사항 충족 여부
- 이전 단계 산출물과의 정합성
- 승인 시 마지막 줄에 FINISHED 포함
- 수정 필요 시 구체적 피드백만 (FINISHED 금지)`;
}

