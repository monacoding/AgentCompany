import { Agent, Task } from '../types';

const INCOMPLETE_TASK_STATUSES = new Set(['pending', 'assigned', 'working']);

export function isInProgressTask(task: Task): boolean {
  return INCOMPLETE_TASK_STATUSES.has(task.status);
}

export function isReviewReadyTask(task: Task): boolean {
  return task.status === 'review' && !!task.result?.trim();
}

export function resolveAgentDisplayStatus(
  agent: Agent,
  llmBillingActive: boolean,
  agentTasks: Task[] = []
): AgentStatusDisplay {
  const incomplete = agentTasks.filter(isInProgressTask);
  const reviewReady = agentTasks.filter(isReviewReadyTask);
  if (llmBillingActive) return 'working';
  if (incomplete.length > 0 || agent.status === 'working') return 'progress';
  if (reviewReady.length > 0) return 'review';
  if (agent.status === 'failed') return 'failed';
  if (agent.status === 'waiting') return 'waiting';
  return 'idle';
}

export type AgentStatusDisplay = 'idle' | 'working' | 'progress' | 'review' | 'waiting' | 'failed';

export function canAgentEnterWorking(agent: Agent): boolean {
  return agent.status !== 'offline';
}
