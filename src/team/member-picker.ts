import { Agent } from '../types';
import { formatAgentLabel } from '../utils/agent-display';

const MAX_TEAM_SIZE = 4;

/** 리드 에이전트 + 업무에 맞는 전문가 자동 선정 */
export function proposeTeamMembers(lead: Agent, command: string, agents: Agent[]): Agent[] {
  const members = new Map<string, Agent>();
  members.set(lead.id, lead);

  const lower = command.toLowerCase();
  const candidates = agents.filter((a) => a.status !== 'offline' && a.id !== lead.id);

  const pick = (predicate: (a: Agent) => boolean) => {
    const found = candidates.find(predicate);
    if (found) members.set(found.id, found);
  };

  if (/조사|리서치|검색|수집|크롤|기출|pdf|다운|download/i.test(lower)) {
    pick((a) => a.role === 'researcher');
    pick((a) => a.name.includes('한서준'));
  }
  if (/코드|구현|개발|버그|api|refactor|배포|스크립트|자동화/i.test(lower)) {
    pick((a) => a.role === 'backend' || a.role === 'frontend' || a.role === 'devops');
    pick((a) => a.name.includes('하정우'));
  }
  if (/수능|기출|csat/i.test(lower) && /pdf|다운|수집|받/i.test(lower)) {
    pick((a) => a.role === 'researcher' || a.name.includes('한서준'));
    pick((a) => a.role === 'backend' || a.name.includes('하정우'));
    pick((a) => a.title?.includes('국어') || a.name.includes('김윤하'));
    if (/수학/i.test(lower)) {
      pick((a) => a.title?.includes('수리') || a.name.includes('최현석'));
    }
  }
  if (/유튜브|youtube|영상|업로드|tts|ffmpeg|편집|제작/i.test(lower)) {
    pick((a) => a.role === 'writer' || /영상|제작|콘텐츠/i.test(a.title ?? ''));
    pick((a) => a.role === 'backend' || a.role === 'devops');
    pick((a) => a.role === 'researcher');
  }
  if (/문서|대본|작성|기획|쇼츠|숏폼|콘텐츠/i.test(lower)) {
    pick((a) => a.role === 'writer' || a.role === 'pm');
  }
  if (/영업|세일즈|고객|제안/i.test(lower)) {
    pick((a) => a.title?.includes('영업') || a.role === 'pm');
  }
  if (/국어|수능|교육|문제/i.test(lower)) {
    pick((a) => a.title?.includes('국어') || a.capabilities?.some((c) => /korean|education/i.test(c)));
  }

  for (const agent of candidates) {
    if (members.size >= MAX_TEAM_SIZE) break;
    const rolesUsed = new Set([...members.values()].map((m) => m.role));
    if (!rolesUsed.has(agent.role)) {
      members.set(agent.id, agent);
    }
  }

  if (members.size < 2) {
    for (const agent of candidates) {
      if (members.size >= MAX_TEAM_SIZE) break;
      members.set(agent.id, agent);
    }
  }

  return [...members.values()].slice(0, MAX_TEAM_SIZE);
}

export function formatTeamMemberLabels(members: Agent[]): string {
  return members.map((a) => formatAgentLabel(a)).join(' · ');
}
