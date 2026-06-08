import type { Task } from './vscode';

const INCOMPLETE_TASK_STATUSES = new Set(['pending', 'assigned', 'working']);

export function isInProgressTask(task: Pick<Task, 'status'>): boolean {
  return INCOMPLETE_TASK_STATUSES.has(task.status);
}

export function isReviewReadyTask(task: Pick<Task, 'status' | 'result'>): boolean {
  return task.status === 'review' && !!task.result?.trim();
}

export const STATUS_LABELS: Record<string, string> = {
  working: 'WORKING',
  progress: 'PROGRESS',
  review: 'REVIEW',
  idle: 'IDLE',
  waiting: 'WAITING',
  failed: 'FAILED',
  pending: 'PROGRESS',
  assigned: 'PROGRESS',
  completed: 'COMPLETED',
};

/** 태스크 DB 상태 → UI 표시 상태 (태스크 working ≠ LLM WORKING) */
export function resolveTaskDisplayStatus(status: string): string {
  return isInProgressTask({ status }) ? 'progress' : status;
}

export function formatAgentLabel(agent: { name: string; title?: string }): string {
  const name = agent.name.trim();
  const title = agent.title?.trim() ?? '';
  if (!title || title === name) return name;
  return `${name} (${title})`;
}

/** 말풍선 발신자 — 괄호 직책 제거 (직책은 chat-role로 한 번만 표시) */
const WORK_START_ACK =
  /(?:알겠습니다|네,?\s*사장님|말씀하신\s*내용|확인했|진행하겠|진행해볼|바로\s*진행|시작하겠|작업\s*시작|착수|해볼게)/i;
const WORK_COMPLETE_ACK =
  /(?:완료했|끝났|처리했|저장했|전달했|보고드립|결과(?:는|가)|📄|Files modified)/i;

/** 업무 착수 확인 멘트 — 실제 완료가 아님 */
export function isWorkStartAcknowledgment(content: string): boolean {
  const text = content.trim();
  if (!text || text.length > 400) return false;
  if (WORK_COMPLETE_ACK.test(text)) return false;
  return WORK_START_ACK.test(text);
}

export function formatChatSenderName(senderName: string): string {
  const stripped = senderName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return stripped || senderName;
}
