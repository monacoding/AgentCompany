import { Agent } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import { ProviderEngine } from '../providers';
import { TeamTurnMessage } from './types';

const TERMINATE_PATTERN = /\b(?:TERMINATE|TEAM_DONE|팀_완료)\b/i;

export function isTeamTermination(content: string): boolean {
  return TERMINATE_PATTERN.test(content.trim());
}

export async function selectNextSpeaker(
  providers: ProviderEngine,
  lead: Agent,
  participants: Agent[],
  history: TeamTurnMessage[],
  lastSpeakerId: string | null
): Promise<string | null> {
  const available = lastSpeakerId
    ? participants.filter((a) => a.id !== lastSpeakerId)
    : participants;
  if (available.length === 0) return participants[0]?.id ?? null;
  if (available.length === 1) return available[0].id;

  const roster = participants
    .map((a) => `- ${a.name}: ${a.title?.trim() || a.role} — ${a.description.slice(0, 120)}`)
    .join('\n');

  const transcript = history
    .slice(-12)
    .map((m) => `${m.agentName}: ${m.content.slice(0, 400)}`)
    .join('\n\n');

  const prompt = `당신은 멀티에이전트 팀의 진행자입니다.
다음 대화에서 가장 적절한 다음 발화자 에이전트 **이름 하나만** 출력하세요.

## 참가자
${roster}

## 최근 대화
${transcript || '(아직 없음)'}

## 규칙
- 계획·조율은 리드(${lead.name})가, 전문 업무는 해당 역할 에이전트가 말합니다.
- 방금 말한 사람(${lastSpeakerId ? participants.find((p) => p.id === lastSpeakerId)?.name : '없음'})은 다시 선택하지 마세요.
- 이름만 출력 (예: 김윤하)`;

  try {
    const response = await providers.chat(
      lead.provider,
      [
        { role: 'system', content: '다음 발화자 이름만 한 줄로 답하세요.' },
        { role: 'user', content: prompt },
      ],
      { type: lead.provider, model: lead.model }
    );

    const pick = response.content.trim().split(/\s+/)[0]?.replace(/[^가-힣A-Za-z]/g, '');
    if (!pick) return available[0].id;

    const matched =
      available.find((a) => a.name === pick) ??
      available.find((a) => a.name.startsWith(pick)) ??
      available.find((a) => pick.includes(a.name) || a.name.includes(pick));

    return matched?.id ?? available[0].id;
  } catch {
    const idx = history.length % available.length;
    return available[idx]?.id ?? available[0].id;
  }
}

export function buildSpeakerSystemPrompt(agent: Agent, plan: string, command: string): string {
  return `You are ${formatAgentLabel(agent)}, a ${agent.role} agent in an AgentCompany team session.
${agent.description || ''}

## 사장님 지시
${command}

## 팀 계획
${plan}

## 규칙
- 한국어로 간결하게 말하세요. 사장님을 부를 때는 "사장님"이라고 하세요.
- 자신의 전문 영역에 맞는 의견·진행·결과를 공유하세요.
- 다른 에이전트에게 넘길 때는 "@이름에게 ..." 형식으로 명시하세요.
- 팀 작업이 완료되면 마지막 줄에 TERMINATE 를 포함하세요.
- 불필요한 메타 정보·보고서 형식은 쓰지 마세요.`;
}
