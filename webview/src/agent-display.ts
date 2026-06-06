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
export function formatChatSenderName(senderName: string): string {
  const stripped = senderName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return stripped || senderName;
}
