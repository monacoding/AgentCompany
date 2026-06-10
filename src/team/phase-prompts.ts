import { Agent } from '../types';
import { formatAgentLabel } from '../utils/agent-display';

const PM_FINAL_REPORT_GUIDE = `
## PM 최종 보고서 지침 (필수)
- carry_data의 **@한서준 리서치 산출물이 보고서 본문의 핵심**이다.
- 리서치의 문장·항목·출처 URL·표·수치·한계점을 **삭제·요약·축약·대체하지 말 것**.
- PM 역할은 **보고서 형식 완성**에 집중: 표지, Executive Summary, 목차, 섹션 번호, 표/목록 정돈, 결론, 참고자료.
- 새로 조사하거나 리서치 내용을 짧게 다시 쓰지 말 것. **원문을 최대한 유지**하면서 구조·가독성만 정리.
- 다른 에이전트 carry_data는 보조로 통합하되, **한서준 자료가 더 상세하면 한서준 본문을 우선**한다.`;

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
  const isPmFinalReport = agent.role === 'pm';
  const revisionBlock = revision
    ? `\n\n## 이전 산출물\n${revision.previousOutput}\n\n## 검토 피드백 (반영 필수)\n${revision.feedback}\n\n피드백을 반영해 수정하세요. 완료 시 마지막 줄에 FINISHED 를 포함하세요.`
    : isPmFinalReport
      ? '\n\n@한서준 등 carry_data를 **전량 보존**한 채 보고서 형식으로 완성하세요. 완료 시 마지막 줄에 FINISHED.'
      : '\n\n결과물을 작성하세요. 완료 시 마지막 줄에 FINISHED 를 포함할 수 있습니다.';

  return `Modality: Deliverable.
Assignee: ${formatAgentLabel(agent)}.
Task: ${taskDescription}
${toolingHint}
${isPmFinalReport ? PM_FINAL_REPORT_GUIDE : ''}

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
  const pmPreserveCheck =
    worker.role === 'pm'
      ? `
- **PM 최종 보고서:** @한서준 리서치 carry_data의 핵심 내용·출처·표가 **누락·과도 요약**되지 않았는지 (형식 정리만 허용)
- 리서치보다 짧거나 빈약하면 반려`
      : '';

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
- 이전 단계 산출물과의 정합성${pmPreserveCheck}
- 승인 시 마지막 줄에 FINISHED 포함
- 수정 필요 시 구체적 피드백만 (FINISHED 금지)`;
}

