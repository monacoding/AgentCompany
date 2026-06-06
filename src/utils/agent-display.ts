import { Agent } from '../types';

/** UI 표기: `강하늘 (비서)` */
export function formatAgentLabel(agent: Pick<Agent, 'name' | 'title'>): string {
  const name = agent.name.trim();
  const title = agent.title?.trim() ?? '';
  if (!title || title === name) return name;
  return `${name} (${title})`;
}

/** @멘션·라우팅용 별칭 (이름 + 직책) */
export function getAgentMentionAliases(agent: Agent): string[] {
  const aliases = [agent.name.trim()];
  const title = agent.title?.trim();
  if (title && title !== agent.name.trim()) {
    aliases.push(title);
  }
  return aliases;
}

export function collectAgentMentionNames(agents: Agent[]): string[] {
  const seen = new Set<string>();
  for (const agent of agents) {
    for (const alias of getAgentMatchTokens(agent)) {
      seen.add(alias);
    }
  }
  return [...seen];
}

/** 채팅·명령에서 에이전트를 가리키는 토큰 (이름, 직책, 이름 일부 — 예: 한서준 → 서준) */
export function getAgentMatchTokens(agent: Agent): string[] {
  const tokens = new Set(getAgentMentionAliases(agent));
  const fullName = agent.name.trim();

  if (fullName.length >= 2) {
    tokens.add(fullName);
    if (fullName.length >= 3) {
      tokens.add(fullName.slice(-2));
      tokens.add(fullName.slice(1));
    }
    const parts = fullName.split(/\s+/).filter(Boolean);
    for (const part of parts) {
      if (part.length >= 2) tokens.add(part);
      if (part.length >= 3) {
        tokens.add(part.slice(-2));
        tokens.add(part.slice(1));
      }
    }
  }

  return [...tokens].filter((t) => t.length >= 2);
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 명령·답변 텍스트에 에이전트가 언급됐는지 (서준이, 서준 → 한서준) */
export function textMentionsAgent(text: string, agent: Agent): boolean {
  for (const token of getAgentMatchTokens(agent)) {
    if (text.includes(token)) return true;
    const pattern = new RegExp(`${escapeRegex(token)}(?:이|가|은|는|씨|님|에게|한테|의)`, 'i');
    if (pattern.test(text)) return true;
  }
  return false;
}
