import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database as SqlJsDatabase, SqlValue } from 'sql.js';
import {
  Agent,
  Activity,
  Task,
  AgentIdea,
  AgentIdeaStatus,
  AgentOrganization,
  TeamSession,
  ProjectTask,
} from '../types';
import { parseJson } from '../utils';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  role TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'idle',
  model TEXT DEFAULT 'gpt-4o',
  provider TEXT DEFAULT 'openai',
  capabilities TEXT DEFAULT '[]',
  memory TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  agent_id TEXT,
  parent_task_id TEXT,
  result TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  agent_id TEXT,
  task_id TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_activities_agent ON activities(agent_id);

CREATE TABLE IF NOT EXISTS agent_ideas (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_ideas_status ON agent_ideas(status);
CREATE INDEX IF NOT EXISTS idx_agent_ideas_agent ON agent_ideas(agent_id);

CREATE TABLE IF NOT EXISTS org_chart (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dismissed_agents (
  name_key TEXT PRIMARY KEY,
  dismissed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  lead_agent_id TEXT NOT NULL,
  member_agent_ids TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  ceo_command TEXT DEFAULT '',
  parent_task_id TEXT,
  plan TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  max_turns INTEGER DEFAULT 12,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_sessions_thread ON team_sessions(thread_id);
`;

export class Database {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;

  constructor(storagePath: string) {
    this.dbPath = path.join(storagePath, 'agentcompany.db');
  }

  async initialize(): Promise<void> {
    const wasmPath = path.join(
      path.dirname(require.resolve('sql.js')),
      'sql-wasm.wasm'
    );
    const SQL = await initSqlJs({ locateFile: () => wasmPath });
    const dir = path.dirname(this.dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.db.run(SCHEMA);
    this.migrate();
    this.persist();
  }

  private migrate(): void {
    try {
      this.db!.run('ALTER TABLE tasks ADD COLUMN result TEXT DEFAULT ""');
    } catch {
      // column already exists
    }
    try {
      this.db!.run('ALTER TABLE agents ADD COLUMN title TEXT DEFAULT ""');
    } catch {
      // column already exists
    }
    try {
      this.db!.run('ALTER TABLE team_sessions ADD COLUMN requester_agent_id TEXT');
    } catch {
      // column already exists
    }
    try {
      this.db!.run("ALTER TABLE team_sessions ADD COLUMN phase TEXT DEFAULT 'planning'");
    } catch {
      // column already exists
    }
    try {
      this.db!.run("ALTER TABLE team_sessions ADD COLUMN project_tasks TEXT DEFAULT '[]'");
    } catch {
      // column already exists
    }
  }

  private persist(): void {
    if (!this.db) return;
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  private queryOne<T>(sql: string, params: SqlValue[], mapper: (row: Record<string, unknown>) => T): T | null {
    const stmt = this.db!.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, unknown>;
      stmt.free();
      return mapper(row);
    }
    stmt.free();
    return null;
  }

  private queryAll<T>(sql: string, params: SqlValue[], mapper: (row: Record<string, unknown>) => T): T[] {
    const stmt = this.db!.prepare(sql);
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(mapper(stmt.getAsObject() as Record<string, unknown>));
    }
    stmt.free();
    return results;
  }

  // --- Agents ---

  insertAgent(agent: Agent): void {
    this.db!.run(
      `INSERT INTO agents (id, name, title, role, description, status, model, provider, capabilities, memory, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agent.id,
        agent.name,
        agent.title,
        agent.role,
        agent.description,
        agent.status,
        agent.model,
        agent.provider,
        JSON.stringify(agent.capabilities),
        agent.memory,
        agent.createdAt,
        agent.updatedAt,
      ]
    );
    this.persist();
  }

  updateAgent(id: string, fields: Partial<Agent>): void {
    const existing = this.getAgent(id);
    if (!existing) return;

    const updated = { ...existing, ...fields, updatedAt: new Date().toISOString() };
    this.db!.run(
      `UPDATE agents SET name=?, title=?, role=?, description=?, status=?, model=?, provider=?, capabilities=?, memory=?, updated_at=? WHERE id=?`,
      [
        updated.name,
        updated.title,
        updated.role,
        updated.description,
        updated.status,
        updated.model,
        updated.provider,
        JSON.stringify(updated.capabilities),
        updated.memory,
        updated.updatedAt,
        id,
      ]
    );
    this.persist();
  }

  deleteAgent(id: string): void {
    this.db!.run('DELETE FROM agents WHERE id = ?', [id]);
    this.persist();
  }

  getAgent(id: string): Agent | null {
    return this.queryOne('SELECT * FROM agents WHERE id = ?', [id], this.mapAgent);
  }

  getAllAgents(): Agent[] {
    return this.queryAll('SELECT * FROM agents ORDER BY created_at DESC', [], this.mapAgent);
  }

  private mapAgent = (obj: Record<string, unknown>): Agent => ({
    id: obj.id as string,
    name: obj.name as string,
    title: (obj.title as string) ?? '',
    role: obj.role as Agent['role'],
    description: obj.description as string,
    status: obj.status as Agent['status'],
    model: obj.model as string,
    provider: obj.provider as Agent['provider'],
    capabilities: parseJson(obj.capabilities as string, []),
    memory: obj.memory as string,
    createdAt: obj.created_at as string,
    updatedAt: obj.updated_at as string,
  });

  // --- Tasks ---

  insertTask(task: Task): void {
    this.db!.run(
      `INSERT INTO tasks (id, title, description, status, agent_id, parent_task_id, result, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.description,
        task.status,
        task.agentId,
        task.parentTaskId,
        task.result,
        task.createdAt,
        task.updatedAt,
      ]
    );
    this.persist();
  }

  updateTask(id: string, fields: Partial<Task>): void {
    const existing = this.getTask(id);
    if (!existing) return;

    const updated = { ...existing, ...fields, updatedAt: new Date().toISOString() };
    this.db!.run(
      `UPDATE tasks SET title=?, description=?, status=?, agent_id=?, parent_task_id=?, result=?, updated_at=? WHERE id=?`,
      [
        updated.title,
        updated.description,
        updated.status,
        updated.agentId,
        updated.parentTaskId,
        updated.result,
        updated.updatedAt,
        id,
      ]
    );
    this.persist();
  }

  deleteTask(id: string): void {
    this.db!.run('DELETE FROM tasks WHERE id = ?', [id]);
    this.persist();
  }

  getTask(id: string): Task | null {
    return this.queryOne('SELECT * FROM tasks WHERE id = ?', [id], this.mapTask);
  }

  getAllTasks(): Task[] {
    return this.queryAll('SELECT * FROM tasks ORDER BY created_at DESC', [], this.mapTask);
  }

  getTasksByAgent(agentId: string): Task[] {
    return this.queryAll('SELECT * FROM tasks WHERE agent_id = ? ORDER BY created_at DESC', [agentId], this.mapTask);
  }

  getSubTasks(parentTaskId: string): Task[] {
    return this.queryAll(
      'SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY created_at ASC',
      [parentTaskId],
      this.mapTask
    );
  }

  private mapTask = (obj: Record<string, unknown>): Task => ({
    id: obj.id as string,
    title: obj.title as string,
    description: obj.description as string,
    status: obj.status as Task['status'],
    agentId: obj.agent_id as string | null,
    parentTaskId: obj.parent_task_id as string | null,
    result: (obj.result as string) ?? '',
    createdAt: obj.created_at as string,
    updatedAt: obj.updated_at as string,
  });

  // --- Activities ---

  insertActivity(activity: Activity): void {
    this.db!.run(
      `INSERT INTO activities (id, agent_id, task_id, message, created_at) VALUES (?, ?, ?, ?, ?)`,
      [activity.id, activity.agentId, activity.taskId, activity.message, activity.createdAt]
    );
    this.persist();
  }

  getRecentActivities(limit = 50): Activity[] {
    return this.queryAll(
      `SELECT * FROM activities ORDER BY created_at DESC LIMIT ?`,
      [limit],
      this.mapActivity
    );
  }

  getActivitiesByAgent(agentId: string, limit = 40): Activity[] {
    return this.queryAll(
      `SELECT * FROM activities WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
      [agentId, limit],
      this.mapActivity
    );
  }

  private mapActivity = (obj: Record<string, unknown>): Activity => ({
    id: obj.id as string,
    agentId: obj.agent_id as string | null,
    taskId: obj.task_id as string | null,
    message: obj.message as string,
    createdAt: obj.created_at as string,
  });

  // --- Agent Ideas ---

  insertIdea(idea: AgentIdea): void {
    this.db!.run(
      `INSERT INTO agent_ideas (id, agent_id, title, body, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idea.id, idea.agentId, idea.title, idea.body, idea.status, idea.createdAt, idea.updatedAt]
    );
    this.persist();
  }

  updateIdea(id: string, fields: Partial<AgentIdea>): void {
    const existing = this.getIdea(id);
    if (!existing) return;

    const updated = { ...existing, ...fields, updatedAt: new Date().toISOString() };
    this.db!.run(
      `UPDATE agent_ideas SET agent_id=?, title=?, body=?, status=?, updated_at=? WHERE id=?`,
      [updated.agentId, updated.title, updated.body, updated.status, updated.updatedAt, id]
    );
    this.persist();
  }

  getIdea(id: string): AgentIdea | null {
    return this.queryOne('SELECT * FROM agent_ideas WHERE id = ?', [id], this.mapIdea);
  }

  getPendingIdeas(limit = 20): AgentIdea[] {
    return this.queryAll(
      `SELECT * FROM agent_ideas WHERE status = 'pending' ORDER BY created_at DESC LIMIT ?`,
      [limit],
      this.mapIdea
    );
  }

  countPendingIdeas(): number {
    const row = this.queryOne(
      `SELECT COUNT(*) AS count FROM agent_ideas WHERE status = 'pending'`,
      [],
      (obj) => Number(obj.count ?? 0)
    );
    return row ?? 0;
  }

  getLatestIdeaByAgent(agentId: string): AgentIdea | null {
    return this.queryOne(
      `SELECT * FROM agent_ideas WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1`,
      [agentId],
      this.mapIdea
    );
  }

  getRecentIdeasByAgent(agentId: string, limit = 6): AgentIdea[] {
    return this.queryAll(
      `SELECT * FROM agent_ideas WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
      [agentId, limit],
      this.mapIdea
    );
  }

  private mapIdea = (obj: Record<string, unknown>): AgentIdea => ({
    id: obj.id as string,
    agentId: obj.agent_id as string,
    title: obj.title as string,
    body: obj.body as string,
    status: obj.status as AgentIdeaStatus,
    createdAt: obj.created_at as string,
    updatedAt: obj.updated_at as string,
  });

  // --- Org Chart ---

  getOrgChart(): AgentOrganization | null {
    const row = this.queryOne(
      'SELECT data FROM org_chart WHERE id = ?',
      ['default'],
      (obj) => parseJson<AgentOrganization>(obj.data as string, null as unknown as AgentOrganization)
    );
    return row;
  }

  saveOrgChart(org: AgentOrganization): void {
    this.db!.run(
      `INSERT INTO org_chart (id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`,
      ['default', JSON.stringify(org), org.updatedAt]
    );
    this.persist();
  }

  // --- Dismissed agents (deleted by user; do not auto-recreate) ---

  dismissAgent(name: string): void {
    const key = name.trim().toLowerCase();
    if (!key) return;
    this.db!.run(
      `INSERT INTO dismissed_agents (name_key, dismissed_at) VALUES (?, ?)
       ON CONFLICT(name_key) DO NOTHING`,
      [key, new Date().toISOString()]
    );
    this.persist();
  }

  isAgentDismissed(name: string): boolean {
    const key = name.trim().toLowerCase();
    if (!key) return false;
    const row = this.queryOne(
      'SELECT name_key FROM dismissed_agents WHERE name_key = ?',
      [key],
      (obj) => obj.name_key as string
    );
    return row !== null;
  }

  getDismissedAgents(): string[] {
    return this.queryAll(
      'SELECT name_key FROM dismissed_agents ORDER BY dismissed_at',
      [],
      (obj) => obj.name_key as string
    );
  }

  // --- Team sessions ---

  insertTeamSession(session: TeamSession): void {
    this.db!.run(
      `INSERT INTO team_sessions (
        id, title, status, phase, project_tasks, lead_agent_id, member_agent_ids, thread_id,
        ceo_command, parent_task_id, plan, summary, max_turns, requester_agent_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.title,
        session.status,
        session.phase,
        JSON.stringify(session.projectTasks),
        session.leadAgentId,
        JSON.stringify(session.memberAgentIds),
        session.threadId,
        session.ceoCommand,
        session.parentTaskId,
        session.plan,
        session.summary,
        session.maxTurns,
        session.requesterAgentId,
        session.createdAt,
        session.updatedAt,
      ]
    );
    this.persist();
  }

  updateTeamSession(id: string, fields: Partial<TeamSession>): void {
    const existing = this.getTeamSession(id);
    if (!existing) return;

    const updated: TeamSession = {
      ...existing,
      ...fields,
      updatedAt: new Date().toISOString(),
    };

    this.db!.run(
      `UPDATE team_sessions SET
        title=?, status=?, phase=?, project_tasks=?, lead_agent_id=?, member_agent_ids=?, thread_id=?,
        ceo_command=?, parent_task_id=?, plan=?, summary=?, max_turns=?,
        requester_agent_id=?, updated_at=?
       WHERE id=?`,
      [
        updated.title,
        updated.status,
        updated.phase,
        JSON.stringify(updated.projectTasks),
        updated.leadAgentId,
        JSON.stringify(updated.memberAgentIds),
        updated.threadId,
        updated.ceoCommand,
        updated.parentTaskId,
        updated.plan,
        updated.summary,
        updated.maxTurns,
        updated.requesterAgentId,
        updated.updatedAt,
        id,
      ]
    );
    this.persist();
  }

  getTeamSession(id: string): TeamSession | null {
    return this.queryOne('SELECT * FROM team_sessions WHERE id = ?', [id], this.mapTeamSession);
  }

  getTeamSessionByThreadId(threadId: string): TeamSession | null {
    return this.queryOne(
      'SELECT * FROM team_sessions WHERE thread_id = ?',
      [threadId],
      this.mapTeamSession
    );
  }

  getAllTeamSessions(): TeamSession[] {
    return this.queryAll(
      'SELECT * FROM team_sessions ORDER BY created_at DESC',
      [],
      this.mapTeamSession
    );
  }

  private mapTeamSession = (obj: Record<string, unknown>): TeamSession => ({
    id: obj.id as string,
    title: obj.title as string,
    status: obj.status as TeamSession['status'],
    phase: (obj.phase as TeamSession['phase']) ?? 'planning',
    projectTasks: parseJson<ProjectTask[]>(obj.project_tasks as string, []),
    leadAgentId: obj.lead_agent_id as string,
    memberAgentIds: parseJson<string[]>(obj.member_agent_ids as string, []),
    threadId: obj.thread_id as string,
    ceoCommand: (obj.ceo_command as string) ?? '',
    parentTaskId: (obj.parent_task_id as string | null) ?? null,
    plan: (obj.plan as string) ?? '',
    summary: (obj.summary as string) ?? '',
    maxTurns: Number(obj.max_turns ?? 12),
    requesterAgentId: (obj.requester_agent_id as string | null) ?? null,
    createdAt: obj.created_at as string,
    updatedAt: obj.updated_at as string,
  });

  close(): void {
    this.db?.close();
    this.db = null;
  }
}
