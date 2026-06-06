import { Database } from '../database';
import { GeneratedAgentProfile } from '../agent-folders/profile-generator';
import { MemoryEngine } from '../memory';
import { AgentFolderEngine } from '../agent-folders';
import { Agent, AgentStatus, AgentRole, CreateAgentInput } from '../types';
import { generateId, now } from '../utils';
import { AgentDuplicateNameError } from './errors';

export {
  resolveAgentDisplayStatus,
  canAgentEnterWorking,
  isInProgressTask,
  isReviewReadyTask,
} from './display-status';

export class AgentManager {
  constructor(
    private db: Database,
    private memory: MemoryEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  isNameTaken(name: string, excludeId?: string): boolean {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return false;
    return this.getAll().some(
      (a) => a.id !== excludeId && a.name.trim().toLowerCase() === normalized
    );
  }

  async create(
    input: CreateAgentInput,
    options?: { profile?: GeneratedAgentProfile; skipFolder?: boolean }
  ): Promise<Agent> {
    const trimmedName = input.name.trim();
    if (this.isNameTaken(trimmedName)) {
      throw new AgentDuplicateNameError(trimmedName);
    }

    const profile = options?.profile;
    const timestamp = now();
    const title = input.title?.trim() ?? '';
    const agent: Agent = {
      id: generateId(),
      name: trimmedName,
      title,
      role: profile?.role ?? input.role ?? 'pm',
      description: profile?.description ?? input.description ?? '',
      status: 'idle',
      model: input.model ?? 'gpt-4o',
      provider: input.provider ?? 'openai',
      capabilities: profile?.capabilities ?? input.capabilities ?? [],
      memory: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.db.insertAgent(agent);
    this.memory.logActivity(agent.id, null, `Agent "${agent.name}" (${agent.role}) created`);

    if (this.agentFolders && !options?.skipFolder) {
      await this.agentFolders.provisionAgent(agent, profile);
    }

    return agent;
  }

  update(id: string, fields: Partial<Agent>): Agent | null {
    const existing = this.db.getAgent(id);
    if (!existing) return null;

    if (fields.name !== undefined && this.isNameTaken(fields.name, id)) {
      throw new AgentDuplicateNameError(fields.name.trim());
    }

    this.db.updateAgent(id, fields);
    this.memory.logActivity(id, null, `Agent "${existing.name}" updated`);
    return this.db.getAgent(id);
  }

  delete(id: string): boolean {
    const agent = this.db.getAgent(id);
    if (!agent) return false;

    this.db.deleteAgent(id);
    this.memory.logActivity(null, null, `Agent "${agent.name}" deleted`);
    return true;
  }

  setStatus(id: string, status: AgentStatus): Agent | null {
    return this.update(id, { status });
  }

  activate(id: string): Agent | null {
    return this.setStatus(id, 'idle');
  }

  deactivate(id: string): Agent | null {
    return this.setStatus(id, 'offline');
  }

  get(id: string): Agent | null {
    return this.db.getAgent(id);
  }

  getAll(): Agent[] {
    return this.db.getAllAgents();
  }

  getByRole(role: Agent['role']): Agent[] {
    return this.getAll().filter((a) => a.role === role && a.status !== 'offline');
  }

  findByMention(mention: string): Agent | null {
    const normalized = mention.trim().toLowerCase();
    if (!normalized) return null;

    const agents = this.getAll();
    const exact = agents.find(
      (a) =>
        a.name.toLowerCase() === normalized ||
        (a.title?.trim().toLowerCase() === normalized && !!a.title?.trim())
    );
    if (exact) return exact;

    const startsWith = agents.filter(
      (a) =>
        a.name.toLowerCase().startsWith(normalized) ||
        (a.title?.trim().toLowerCase().startsWith(normalized) && !!a.title?.trim())
    );
    if (startsWith.length === 1) return startsWith[0];

    const includes = agents.filter((a) => {
      const name = a.name.toLowerCase();
      const title = a.title?.trim().toLowerCase() ?? '';
      return (
        name.includes(normalized) ||
        normalized.includes(name) ||
        (title && (title.includes(normalized) || normalized.includes(title)))
      );
    });
    if (includes.length === 1) return includes[0];

    return null;
  }

  getAvailable(): Agent[] {
    return this.getAll().filter((a) => a.status === 'idle');
  }
}
