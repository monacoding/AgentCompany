import { AgentFolderEngine } from '../agent-folders';
import { ChatService } from '../chat';
import { Database } from '../database';
import { AgentManager } from '../agents';
import { ProviderEngine } from '../providers';
import { Agent, ProjectPhase, TeamSession } from '../types';
import { generateId, now } from '../utils';
import { formatAgentLabel } from '../utils/agent-display';
import { formatTeamMemberLabels } from './member-picker';
import { planTeamWithPm, TeamPlanResult } from './pm-planner';
import { ProjectWorkerDeps } from './project-worker-engine';
import { parseProjectTasks, runProjectSequential } from './project-runner';
import { buildProjectWarehouseFolder, deriveProjectTitle } from './project-title';
import { buildTeamThreadId } from './thread-id';
import { TeamRunResult } from './types';

const PHASE_LABEL: Record<ProjectPhase, string> = {
  planning: '📋 Planning',
  executing: '⚙️ Executing',
  reviewing: '🔍 Reviewing',
  done: '✅ Done',
  failed: '❌ Failed',
};

export interface TeamRunContext {
  workerDeps: ProjectWorkerDeps;
  templateScriptPath?: string;
}

export class TeamEngine {
  private runningSessionId: string | null = null;
  private runContext: TeamRunContext | null = null;

  constructor(
    private db: Database,
    private agents: AgentManager,
    private chat: ChatService,
    private providers: ProviderEngine,
    private agentFolders: AgentFolderEngine
  ) {}

  isRunning(): boolean {
    return this.runningSessionId !== null;
  }

  setRunContext(ctx: TeamRunContext): void {
    this.runContext = ctx;
  }

  async prepareTeam(
    requester: Agent,
    command: string,
    forcedPm?: Agent
  ): Promise<TeamPlanResult> {
    return planTeamWithPm(this.providers, this.agents.getAll(), requester, command, forcedPm);
  }

  createSession(
    pm: Agent,
    command: string,
    members: Agent[],
    plan: string,
    requesterId?: string
  ): TeamSession {
    if (this.runningSessionId) {
      this.db.updateTeamSession(this.runningSessionId, {
        status: 'done',
        phase: 'done',
        summary: '새 Project 시작으로 이전 세션이 종료되었습니다.',
      });
      this.runningSessionId = null;
    }

    const id = generateId();
    const timestamp = now();
    const projectTasks = parseProjectTasks(plan, members);
    const displayTitle = deriveProjectTitle(plan, command, pm);
    const companyDir = this.agentFolders.getCompanyDir();
    const warehouseFolder = buildProjectWarehouseFolder(displayTitle, companyDir, new Date(timestamp));

    const session: TeamSession = {
      id,
      title: displayTitle,
      status: 'planning',
      phase: 'planning',
      projectTasks,
      leadAgentId: pm.id,
      memberAgentIds: members.map((m) => m.id),
      threadId: buildTeamThreadId(id),
      warehouseFolder,
      ceoCommand: command,
      parentTaskId: null,
      plan,
      summary: '',
      maxTurns: 12,
      createdAt: timestamp,
      updatedAt: timestamp,
      requesterAgentId: requesterId ?? null,
    };
    this.db.insertTeamSession(session);
    return session;
  }

  getSession(id: string): TeamSession | null {
    return this.db.getTeamSession(id);
  }

  getAllSessions(): TeamSession[] {
    return this.db.getAllTeamSessions();
  }

  getSessionByThreadId(threadId: string): TeamSession | null {
    return this.db.getTeamSessionByThreadId(threadId);
  }

  async runSession(session: TeamSession, command: string): Promise<TeamRunResult> {
    const pm = this.agents.get(session.leadAgentId);
    if (!pm) {
      return { success: false, summary: 'PM 에이전트를 찾을 수 없습니다.', turns: 0 };
    }

    const participants = session.memberAgentIds
      .map((id) => this.agents.get(id))
      .filter((a): a is Agent => a !== null);

    if (participants.length < 2) {
      return { success: false, summary: 'Project 참가자가 부족합니다.', turns: 0 };
    }

    this.runningSessionId = session.id;
    this.updateSession(session.id, { status: 'running', phase: 'planning' });

    const threadId = session.threadId;
    const requester = session.requesterAgentId
      ? this.agents.get(session.requesterAgentId)
      : null;

    try {
      this.pushMessage(
        threadId,
        null,
        '시스템',
        'system',
        `🚀 **Project 시작** (PM: ${formatAgentLabel(pm)})${requester ? `\n요청: ${formatAgentLabel(requester)}` : ''}\n${formatTeamMemberLabels(participants)}`
      );

      const plan = session.plan.trim();
      this.pushMessage(threadId, pm.id, formatAgentLabel(pm), 'agent', `📋 **PM 계획**\n${plan}`);

      const taskPreview = (session.projectTasks.length ? session.projectTasks : parseProjectTasks(plan, participants))
        .map((t, i) => `${i + 1}. @${t.agentName}: ${t.description}`)
        .join('\n');

      if (taskPreview) {
        this.pushMessage(
          threadId,
          null,
          '시스템',
          'system',
          `📌 **Tasks (Sequential + Review Loop)**\n${taskPreview}\n\n각 태스크: 작업 → 검토 → 미승인 시 수정 (최대 5회, ChatDev SDLC)`
        );
      }

      let liveTasks = session.projectTasks.length
        ? session.projectTasks.map((t) => ({ ...t }))
        : parseProjectTasks(plan, participants);

      const companyDir = this.agentFolders.getCompanyDir();
      const { tasks, summary } = await runProjectSequential(
        pm,
        command,
        plan,
        participants,
        this.providers,
        this.agentFolders,
        {
          onPhase: (phase, detail) => {
            this.updateSession(session.id, { phase });
            this.pushMessage(
              threadId,
              null,
              '시스템',
              'system',
              `${PHASE_LABEL[phase]} — ${detail}`
            );
          },
          onTaskStart: (task, index, total) => {
            const agent = this.agents.get(task.agentId);
            if (agent) {
              this.setWorking(threadId, agent, `태스크 ${index + 1}/${total}: ${task.description}`);
            }
          },
          onTaskDone: (task) => {
            const agent = this.agents.get(task.agentId);
            if (agent) this.clearWorking(threadId);
            liveTasks = liveTasks.map((t) => (t.agentId === task.agentId ? { ...task } : t));
            this.updateSession(session.id, { projectTasks: liveTasks });
          },
          onReviewStart: (task, reviewer, iteration, max) => {
            this.setWorking(
              threadId,
              reviewer,
              `검토 ${iteration}/${max}: @${task.agentName}`
            );
          },
          onReviewDone: (_task, reviewer) => {
            this.clearWorking(threadId);
            void reviewer;
          },
          onMessage: (agent, content) => {
            this.pushMessage(threadId, agent.id, formatAgentLabel(agent), 'agent', content);
          },
          onArtifactSaved: (relativePath) => {
            this.pushMessage(
              threadId,
              null,
              '시스템',
              'system',
              `📁 **산출물 저장** \`company/${relativePath}\``
            );
          },
        },
        {
          sessionId: session.id,
          warehouseFolder: session.warehouseFolder,
          companyDir,
          workerDeps: this.runContext?.workerDeps,
          templateScriptPath: this.runContext?.templateScriptPath,
        }
      );

      const doneCount = tasks.filter((t) => t.status === 'done').length;

      this.pushMessage(threadId, pm.id, formatAgentLabel(pm), 'agent', `✅ **Project 완료 보고**\n${summary}`);
      this.pushMessage(
        threadId,
        null,
        '시스템',
        'system',
        `Project 종료 — ${doneCount}/${tasks.length} 태스크 완료`
      );

      this.updateSession(session.id, {
        status: 'done',
        phase: 'done',
        summary,
        projectTasks: tasks,
      });

      return { success: true, summary, turns: doneCount };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.updateSession(session.id, { status: 'failed', phase: 'failed', summary: message });
      this.pushMessage(threadId, null, '시스템', 'system', `❌ Project 오류: ${message}`);
      return { success: false, summary: message, turns: 0 };
    } finally {
      if (this.runningSessionId === session.id) {
        this.runningSessionId = null;
      }
    }
  }

  failSession(id: string, summary?: string): void {
    this.db.updateTeamSession(id, {
      status: 'failed',
      phase: 'failed',
      ...(summary ? { summary } : {}),
    });
    if (this.runningSessionId === id) {
      this.runningSessionId = null;
    }
  }

  private pushMessage(
    threadId: string,
    senderId: string | null,
    senderName: string,
    type: 'agent' | 'system',
    content: string
  ): void {
    this.chat.push({
      threadId,
      senderId,
      senderName,
      content,
      type,
      status: 'done',
    });
  }

  private setWorking(threadId: string, agent: Agent, content: string): void {
    this.chat.updateWorking({
      threadId,
      senderId: agent.id,
      senderName: formatAgentLabel(agent),
      senderRole: agent.title?.trim() || agent.role,
      content,
      streamAppend: [content],
    });
  }

  private clearWorking(threadId: string): void {
    this.chat.clearWorking(threadId);
  }

  private updateSession(id: string, fields: Partial<TeamSession>): void {
    this.db.updateTeamSession(id, fields);
  }
}
