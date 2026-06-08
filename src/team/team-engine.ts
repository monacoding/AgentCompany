import { AgentFolderEngine } from '../agent-folders';
import { ChatService } from '../chat';
import { formatChatReply } from '../chat/reply-format';
import { Database } from '../database';
import { AgentManager } from '../agents';
import { ProviderEngine } from '../providers';
import { Agent, TeamSession } from '../types';
import { generateId, now } from '../utils';
import { formatAgentLabel } from '../utils/agent-display';
import { formatTeamMemberLabels } from './member-picker';
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

  createSession(lead: Agent, command: string, members: Agent[]): TeamSession {
    const id = generateId();
    const timestamp = now();
    const session: TeamSession = {
      id,
      title: command.slice(0, 60) || `${lead.name} 팀 협업`,
      status: 'planning',
      leadAgentId: lead.id,
      memberAgentIds: members.map((m) => m.id),
      threadId: buildTeamThreadId(id),
      ceoCommand: command,
      parentTaskId: null,
      plan: '',
      summary: '',
      maxTurns: 12,
      createdAt: timestamp,
      updatedAt: timestamp,
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
    const lead = this.agents.get(session.leadAgentId);
    if (!lead) {
      return { success: false, summary: '리드 에이전트를 찾을 수 없습니다.', turns: 0 };
    }

    const participants = session.memberAgentIds
      .map((id) => this.agents.get(id))
      .filter((a): a is Agent => a !== null);

    if (participants.length < 2) {
      return { success: false, summary: '팀 참가자가 부족합니다.', turns: 0 };
    }

    this.updateSession(session.id, { status: 'running' });

    const threadId = session.threadId;
    this.pushTeamMessage(threadId, null, '시스템', 'system', `👥 팀 협업 시작\n${formatTeamMemberLabels(participants)}`);

    const plan = await this.generateTeamPlan(lead, command, participants);
    this.updateSession(session.id, { plan });
    this.pushTeamMessage(threadId, lead.id, formatAgentLabel(lead), 'agent', `📋 **팀 계획**\n${plan}`);

    const history: TeamTurnMessage[] = [{ agentId: lead.id, agentName: lead.name, content: plan }];
    let lastSpeakerId: string | null = lead.id;
    let turns = 0;
    let terminated = false;

    while (turns < session.maxTurns && !terminated) {
      const nextId = await selectNextSpeaker(
        this.providers,
        lead,
        participants,
        history,
        lastSpeakerId
      );
      if (!nextId) break;

      const speaker = this.agents.get(nextId);
      if (!speaker) break;

      this.setTeamWorking(threadId, speaker, '팀 논의 중…');

      let content: string;
      try {
        content = await this.generateTeamTurn(speaker, command, plan, history, participants);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        content = `죄송해요, 응답 생성 중 문제가 생겼어요: ${message}`;
      } finally {
        this.clearTeamWorking(threadId, speaker);
      }

      const reply = formatChatReply(content) || content.trim() || '…';
      this.pushTeamMessage(threadId, speaker.id, formatAgentLabel(speaker), 'agent', reply);
      history.push({ agentId: speaker.id, agentName: speaker.name, content: reply });
      lastSpeakerId = speaker.id;
      turns++;

      if (isTeamTermination(reply)) {
        terminated = true;
      }
    }

    const summary = await this.generateTeamSummary(lead, command, history);
    this.pushTeamMessage(threadId, lead.id, formatAgentLabel(lead), 'agent', `✅ **팀 완료 보고**\n${summary}`);
    this.pushTeamMessage(threadId, null, '시스템', 'system', `팀 협업 종료 (${turns}턴)`);

    this.updateSession(session.id, {
      status: 'done',
      summary,
    });

    return { success: true, summary, turns };
  }

  private async generateTeamPlan(
    lead: Agent,
    command: string,
    participants: Agent[]
  ): Promise<string> {
    const roster = participants
      .map((a) => `- ${formatAgentLabel(a)} (${a.role}): ${a.description.slice(0, 100)}`)
      .join('\n');

    const response = await this.providers.chat(
      [
        {
          role: 'system',
          content: `You are ${lead.name}, team lead. Create a concise Korean task plan.
Format:
1. @에이전트명: 할 일
2. @에이전트명: 할 일
Keep it under 8 lines. No meta commentary.`,
        },
        {
          role: 'user',
          content: `## 사장님 지시\n${command}\n\n## 팀원\n${roster}\n\n계획을 세워주세요.`,
        },
      ],
      { type: lead.provider, model: lead.model }
    );

    return (response.content || '팀 계획을 수립했습니다.').trim();
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

    return response.content.trim();
  }

  private async generateTeamSummary(
    lead: Agent,
    command: string,
    history: TeamTurnMessage[]
  ): Promise<string> {
    const transcript = history.map((m) => `${m.agentName}: ${m.content}`).join('\n\n');

    const response = await this.providers.chat(
      [
        {
          role: 'system',
          content: `You are ${lead.name}, team lead. Summarize the team discussion for the CEO in Korean.
Be concise (under 500 chars). Include key decisions and next steps.`,
        },
        {
          role: 'user',
          content: `## 사장님 지시\n${command}\n\n## 팀 대화\n${transcript}\n\n사장님께 보고하세요.`,
        },
      ],
      { type: lead.provider, model: lead.model }
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

  private clearTeamWorking(threadId: string, agent: Agent): void {
    this.chat.clearWorking(threadId);
    void agent;
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
