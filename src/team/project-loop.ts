import { Agent } from '../types';

/** ChatDev Code Review Phase loop_counter 기본값 참고 */
export const PROJECT_REVIEW_MAX_ITERATIONS = 5;

/** ChatDev Test Phase loop_counter 기본값 참고 */
export const PROJECT_TEST_MAX_ITERATIONS = 3;

/** 검토 통과 키워드 — ChatDev keyword condition (FINISHED) */
const APPROVAL_PATTERNS = [
  /\bFINISHED\b/i,
  /\bTERMINATE\b/i,
  /\bTEAM_DONE\b/i,
  /검토\s*통과/,
  /승인\s*완료/,
  /^완료$/m,
];

export interface ReviewLoopResult {
  output: string;
  approved: boolean;
  iterations: number;
  lastFeedback?: string;
}

export function isDeliverableApproved(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return APPROVAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** 태스크 검토자 — QA 우선, 없으면 PM(본인 작업 제외) */
export function resolveProjectReviewer(pm: Agent, members: Agent[], worker: Agent): Agent {
  const candidates = members.filter((a) => a.id !== worker.id && a.status !== 'offline');
  const qa = candidates.find((a) => a.role === 'qa');
  if (qa) return qa;

  if (pm.id !== worker.id) return pm;

  const alternate = candidates.find((a) => a.role === 'pm') ?? candidates[0];
  return alternate ?? pm;
}

export function formatLoopExhaustedNote(iterations: number, max: number): string {
  return `(검토 루프 ${iterations}/${max}회 도달 — 최종 산출물로 진행)`;
}
