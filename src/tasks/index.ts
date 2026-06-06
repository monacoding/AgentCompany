import { isReviewReadyTask } from '../agents/display-status';
import { Database } from '../database';
import { MemoryEngine } from '../memory';
import { CreateTaskInput, Task, TaskStatus } from '../types';
import { generateId, now } from '../utils';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ['assigned', 'working', 'failed'],
  assigned: ['working', 'pending', 'failed'],
  working: ['review', 'completed', 'failed'],
  review: ['completed', 'working', 'failed'],
  completed: [],
  failed: ['pending', 'assigned', 'working'],
};

export class TaskEngine {
  constructor(
    private db: Database,
    private memory: MemoryEngine
  ) {}

  create(input: CreateTaskInput): Task {
    const timestamp = now();
    const task: Task = {
      id: generateId(),
      title: input.title,
      description: input.description ?? '',
      status: input.agentId ? 'assigned' : 'pending',
      agentId: input.agentId ?? null,
      parentTaskId: input.parentTaskId ?? null,
      result: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.db.insertTask(task);
    this.memory.logActivity(input.agentId ?? null, task.id, `Task created: "${task.title}"`);
    return task;
  }

  update(id: string, fields: Partial<Task>): Task | null {
    const existing = this.db.getTask(id);
    if (!existing) return null;

    this.db.updateTask(id, fields);
    return this.db.getTask(id);
  }

  delete(id: string): boolean {
    const task = this.db.getTask(id);
    if (!task) return false;

    this.db.deleteTask(id);
    this.memory.logActivity(task.agentId, task.id, `Task deleted: "${task.title}"`);
    return true;
  }

  assign(taskId: string, agentId: string): Task | null {
    const task = this.get(taskId);
    if (!task || task.status === 'completed') return null;

    const updated = this.update(taskId, { agentId, status: 'assigned' });
    if (updated) {
      this.memory.logActivity(agentId, taskId, `Task assigned: "${updated.title}"`);
    }
    return updated;
  }

  transition(taskId: string, newStatus: TaskStatus): Task | null {
    const task = this.get(taskId);
    if (!task) return null;

    if (newStatus === 'review' && !task.result?.trim()) {
      this.memory.logActivity(
        task.agentId,
        taskId,
        `Review blocked — no result yet: "${task.title}"`
      );
      return null;
    }

    const allowed = VALID_TRANSITIONS[task.status];
    if (!allowed.includes(newStatus)) {
      this.memory.logActivity(
        task.agentId,
        taskId,
        `Invalid transition: ${task.status} → ${newStatus} for "${task.title}"`
      );
      return null;
    }

    const updated = this.update(taskId, { status: newStatus });
    if (updated) {
      this.memory.logActivity(task.agentId, taskId, `Task status → ${newStatus}: "${task.title}"`);
      this.checkParentReview(updated);
    }
    return updated;
  }

  setStatus(taskId: string, status: TaskStatus): Task | null {
    return this.transition(taskId, status);
  }

  setResult(taskId: string, result: string): Task | null {
    return this.update(taskId, { result });
  }

  approve(taskId: string): Task | null {
    const task = this.get(taskId);
    if (!task || task.status !== 'review') return null;

    const updated = this.transition(taskId, 'completed');
    if (updated) {
      this.memory.logActivity(task.agentId, taskId, `CEO approved: "${task.title}"`);
    }
    return updated;
  }

  reject(taskId: string, reason?: string): Task | null {
    const task = this.get(taskId);
    if (!task || task.status !== 'review') return null;

    if (reason) {
      this.update(taskId, { description: `${task.description}\n\n[Rejected] ${reason}` });
    }

    const updated = this.transition(taskId, 'working');
    if (updated) {
      this.memory.logActivity(task.agentId, taskId, `CEO rejected: "${task.title}"${reason ? ` — ${reason}` : ''}`);
    }
    return updated;
  }

  checkParentReview(task: Task): void {
    if (!task.parentTaskId) return;

    const parent = this.get(task.parentTaskId);
    if (!parent) return;

    const siblings = this.getSubTasks(task.parentTaskId);
    if (siblings.length === 0) return;

    const allDone = siblings.every((t) => t.status === 'completed' || t.status === 'failed');
    const anyFailed = siblings.some((t) => t.status === 'failed');

    if (allDone && !anyFailed && parent.status !== 'review' && parent.status !== 'completed') {
      this.transition(parent.id, 'review');
      this.memory.logActivity(null, parent.id, `All sub-tasks done — "${parent.title}" ready for review`);
    } else if (allDone && anyFailed && parent.status === 'working') {
      this.transition(parent.id, 'review');
      this.memory.logActivity(null, parent.id, `Sub-tasks finished with failures — "${parent.title}" needs review`);
    }
  }

  get(id: string): Task | null {
    return this.db.getTask(id);
  }

  getAll(): Task[] {
    return this.db.getAllTasks();
  }

  getByAgent(agentId: string): Task[] {
    return this.db.getTasksByAgent(agentId);
  }

  getSubTasks(parentTaskId: string): Task[] {
    return this.db.getSubTasks(parentTaskId);
  }

  getByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter((t) => t.status === status);
  }

  getPending(): Task[] {
    return this.getByStatus('pending');
  }

  getInReview(): Task[] {
    return this.getAll().filter(isReviewReadyTask);
  }
}
