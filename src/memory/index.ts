import { Database } from '../database';
import { Activity, Agent } from '../types';
import { generateId, now } from '../utils';

export class MemoryEngine {
  private memorySyncHandler?: (agentId: string, memory: string) => void | Promise<void>;

  constructor(private db: Database) {}

  setMemorySyncHandler(handler: (agentId: string, memory: string) => void | Promise<void>): void {
    this.memorySyncHandler = handler;
  }

  getAgentMemory(agentId: string): string {
    const agent = this.db.getAgent(agentId);
    return agent?.memory ?? '';
  }

  appendAgentMemory(agentId: string, content: string): void {
    const existing = this.getAgentMemory(agentId);
    const updated = existing ? `${existing}\n\n${content}` : content;
    this.db.updateAgent(agentId, { memory: updated });
    void this.memorySyncHandler?.(agentId, updated);
  }

  clearAgentMemory(agentId: string): void {
    this.db.updateAgent(agentId, { memory: '' });
  }

  logActivity(agentId: string | null, taskId: string | null, message: string): Activity {
    const activity: Activity = {
      id: generateId(),
      agentId,
      taskId,
      message,
      createdAt: now(),
    };
    this.db.insertActivity(activity);
    return activity;
  }

  getRecentActivities(limit = 50): Activity[] {
    return this.db.getRecentActivities(limit);
  }

  getActivitiesByAgent(agentId: string, limit = 40): Activity[] {
    return this.db.getActivitiesByAgent(agentId, limit);
  }

  getAgentProfile(agentId: string): Agent | null {
    return this.db.getAgent(agentId);
  }
}
