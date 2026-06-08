import { AgentFolderEngine } from '../agent-folders';
import { ChatService } from '../chat';
import { formatChatReply, formatLlmError } from '../chat/reply-format';
import { Database } from '../database';
import { AgentManager } from '../agents';
import { ProviderEngine } from '../providers';
import { Agent, TeamSession } from '../types';
import { generateId, now } from '../utils';
import { formatAgentLabel } from '../utils/agent-display';
import { formatTeamMemberLabels } from './member-picker';
import { planTeamWithPm, TeamPlanResult } from './pm-planner';
import {
  buildSpeakerSystemPrompt,
  isTeamTermination,
  selectNextSpeaker,
} from './selector';
import { buildTeamThreadId } from './thread-id';
import { TeamRunResult, TeamTurnMessage } from './types';

export class TeamEngine {
  constructor(
    private db: Database,
    private agents: AgentManager,
    private chat: ChatService,
    private providers: ProviderEngine,
    private agentFolders: AgentFolderEngine
  ) {}

  async prepareTeam(
    requester: Agent,
    command: string
  ): Promise<TeamPlanResult> {
    return planTeamWithPm(this.providers, this.agents.getAll(), requester, command);
  }

  createSession(
    pm: Agent,
    command: string,
    members: Agent[],
    plan: string,
    requesterId?: string
  ): TeamSession {
    const id = generateId();
    const timestamp = now();
    const session: TeamSession = {
      id,
      title: command.slice(0, 60) || `${pm.name} 팀 협업`,
      status: 'planning',
      leadAgentId: pm.id,
      memberAgentIds: members.map((m) => m.id),
      threadId: buildTeamThreadId(id),
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
      return { success: false, summary: '팀 참가자가 부족합니다.', turns: 0 };
    }

    this.updateSession(session.id, { status: 'running' });

    const threadId = session.threadId;
    const requester = session.requesterAgentId
      ? this.agents.get(session.requesterAgentId)
      : null;

    this.pushTeamMessage(
      threadId,
      null,
      '시스템',
      'system',
      `👥 팀 협업 시작 (PM: ${formatAgentLabel(pm)})${requester ? `\n요청: ${formatAgentLabel(requester)}` : ''}\n${formatTeamMemberLabels(participants)}`
    );

    const plan = session.plan.trim() || (await this.safeGeneratePlan(pm, command, participants));
    if (!session.plan.trim()) {
      this.updateSession(session.id, { plan });
    }

    this.pushTeamMessage(threadId, pm.id, formatAgentLabel(pm), 'agent', `📋 **PM 팀 계획**\n${plan}`);

    const history: TeamTurnMessage[] = [{ agentId: pm.id, agentName: pm.name, content: plan }];
    let lastSpeakerId: string | null = pm.id;
    let turns = 0;
    let terminated = false;

    while (turns < session.maxTurns && !terminated) {
      const nextId = await selectNextSpeaker(
        this.providers,
        pm,
        participants,
        history,
        lastSpeakerId
      );
      if (!nextId) break;

      const speaker = this.agents.get(nextId);
      if (!speaker) break;

      this.setTeamWorking(threadId, speaker, '팀 논의 중…');

      const content = await this.safeGenerateTurn(speaker, command, plan, history, participants);
      this.clearTeamWorking(threadId, speaker);

      const reply = formatChatReply(content) || content.trim() || '…';
      this.pushTeamMessage(threadId, speaker.id, formatAgentLabel(speaker), 'agent', reply);
      history.push({ agentId: speaker.id, agentName: speaker.name, content: reply });
      lastSpeakerId = speaker.id;
      turns++;

      if (isTeamTermination(reply)) {
        terminated = true;
      }
    }

    const summary = await this.safeGenerateSummary(pm, command, history);
    this.pushTeamMessage(threadId, pm.id, formatAgentLabel(pm), 'agent', `✅ **PM 완료 보고**\n${summary}`);
    this.pushTeamMessage(threadId, null, '시스템', 'system', `팀 협업 종료 (${turns}턴)`);

    this.updateSession(session.id, {
      status: 'done',
      summary,
    });

    return { success: true, summary, turns };
  }

  private async safeGeneratePlan(
    pm: Agent,
    command: string,
    participants: Agent[]
  ): Promise<string> {
    try {
      const roster = participants
        .map((a) => `- ${formatAgentLabel(a)} (${a.role}): ${a.description.slice(0, 100)}`)
        .join('\n');

      const response = await this.providers.chat(
        [
          {
            role: 'system',
            content: `You are ${pm.name}, PM. Write a concise Korean task plan. Format: N. @에이전트명: 할 일`,
          },
          {
            role: 'user',
            content: `## 사장님 지시\n${command}\n\n## 팀원\n${roster}`,
          },
        ],
        { type: pm.provider, model: pm.model }
      );

      return (response.content || '팀 계획을 수립했습니다.').trim();
    } catch (error) {
      return `팀 계획 (오프라인 초안): ${command}\n\n${formatLlmError(error)}`;
    }
  }

  private async safeGenerateTurn(
    speaker: Agent,
    command: string,
    plan: string,
    history: TeamTurnMessage[],
    participants: Agent[]
  ): Promise<string> {
    try {
      return await this.generateTeamTurn(speaker, command, plan, history, participants);
    } catch (error) {
      return `죄송해요, 응답 생성 중 문제가 생겼어요.\n\n${formatLlmError(error)}`;
    }
  }

  private async safeGenerateSummary(
    pm: Agent,
    command: string,
    history: TeamTurnMessage[]
  ): Promise<string> {
    try {
      return await this.generateTeamSummary(pm, command, history);
    } catch (error) {
      const last = history.slice(-3).map((m) => `${m.agentName}: ${m.content.slice(0, 120)}`).join('\n');
      return `팀 협업을 마쳤습니다. (요약 LLM 오류: ${formatLlmError(error)})\n\n최근 논의:\n${last}`;
    }
  }

  private async generateTeamTurn(
    speaker: Agent,
    command: string,
    plan: string,
    history: TeamTurnMessage[],
    participants: Agent[]
  ): Promise<string> {
    const folderContext = await this.agentFolders.buildConversationalPromptContext(speaker);
    const transcript = history
      .slice(-10)
      .map((m) => `${m.agentName}: ${m.content}`)
      .join('\n\n');

    const others = participants
      .filter((p) => p.id !== speaker.id)
      .map((p) => formatAgentLabel(p))
      .join(', ');

    const response = await this.providers.chat(
      [
        {
          role: 'system',
          content: `${buildSpeakerSystemPrompt(speaker, plan, command)}\n${folderContext}`,
        },
        {
          role: 'user',
          content: `## 팀 대화 기록\n${transcript}\n\n## 팀원\n${others}\n\n이제 당신(${speaker.name}) 차례입니다. 팀 맥락에 맞게 발언하세요.`,
        },
      ],
      { type: speaker.provider, model: speaker.model }
    );

    return (response.content || '').trim();
  }

  private async generateTeamSummary(
    pm: Agent,
    command: string,
    history: TeamTurnMessage[]
  ): Promise<string> {
    const transcript = history.map((m) => `${m.agentName}: ${m.content}`).join('\n\n');

    const response = await this.providers.chat(
      [
        {
          role: 'system',
          content: `You are ${pm.name}, PM. Summarize the team discussion for the CEO in Korean. Be concise (under 500 chars).`,
        },
        {
          role: 'user',
          content: `## 사장님 지시\n${command}\n\n## 팀 대화\n${transcript}\n\n사장님께 보고하세요.`,
        },
      ],
      { type: pm.provider, model: pm.model }
    );

    return (response.content || '팀 협업이 완료되었습니다.').trim();
  }

  private pushTeamMessage(
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

  private setTeamWorking(threadId: string, agent: Agent, content: string): void {
    this.chat.updateWorking({
      threadId,
      senderId: agent.id,
      senderName: formatAgentLabel(agent),
      senderRole: agent.title?.trim() || agent.role,
      content,
      streamAppend: [content],
    });
  }

  private clearTeamWorking(threadId: string, _agent: Agent): void {
    this.chat.clearWorking(threadId);
  }

  failSession(id: string, summary?: string): void {
    this.db.updateTeamSession(id, {
      status: 'failed',
      ...(summary ? { summary } : {}),
    });
  }

  private updateSession(id: string, fields: Partial<TeamSession>): void {
    this.db.updateTeamSession(id, fields);
  }
}
