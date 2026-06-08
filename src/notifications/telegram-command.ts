import { parseCeoMention } from '../orchestrator/mention-parser';
import { Agent } from '../types';
import { collectAgentMentionNames, formatAgentLabel } from '../utils/agent-display';

export interface TelegramCommandPrepareResult {
  command: string;
  targetAgentId: string | null;
  routedVia: 'mention' | 'natural' | 'session' | 'secretary' | 'unchanged';
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 텔레그램 봇 @username 접두어 제거 */
export function stripBotMention(text: string, botUsername?: string): string {
  const trimmed = text.trim();
  if (!botUsername) return trimmed;
  const pattern = new RegExp(`^@${escapeRegex(botUsername)}\\b\\s*`, 'i');
  return trimmed.replace(pattern, '').trim();
}

/** @이름 / @직책 — 등록된 에이전트만 (부분 토큰 제외) */
export function parseStrictAgentMention(
  command: string,
  agents: Agent[],
  findByMention: (mention: string) => Agent | null
): { agent: Agent; remainder: string } | null {
  const trimmed = command.trim();
  if (!trimmed.startsWith('@')) return null;

  const rest = trimmed.slice(1);
  const aliases: Array<{ label: string; agent: Agent }> = [];
  for (const agent of agents) {
    aliases.push({ label: agent.name.trim(), agent });
    const title = agent.title?.trim();
    if (title && title !== agent.name.trim()) {
      aliases.push({ label: title, agent });
    }
  }
  aliases.sort((a, b) => b.label.length - a.label.length);

  for (const { label, agent } of aliases) {
    const lowerRest = rest.toLowerCase();
    const lowerLabel = label.toLowerCase();

    if (lowerRest === lowerLabel) {
      return { agent, remainder: '' };
    }
    if (lowerRest.startsWith(`${lowerLabel} `) || lowerRest.startsWith(`${lowerLabel}\t`)) {
      return { agent, remainder: rest.slice(label.length).trim() };
    }
  }

  const loose = parseCeoMention(trimmed, collectAgentMentionNames(agents));
  if (!loose) return null;

  const agent =
    agents.find((a) => a.name === loose.agentName) ?? findByMention(loose.agentName);
  if (!agent) return null;

  return { agent, remainder: loose.command };
}

/** @ 없이 "강하늘아", "강하늘 안녕" 등 자연어 호칭 */
export function detectNaturalAgentAddress(
  text: string,
  agents: Agent[]
): { agent: Agent; remainder: string } | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith('@')) return null;

  const sorted = [...agents].sort((a, b) => b.name.length - a.name.length);
  for (const agent of sorted) {
    const name = agent.name.trim();
    if (!name) continue;

    const patterns = [
      new RegExp(`^${escapeRegex(name)}(?:이|가|은|는|씨|님|아|야)[,!]?\\s*(.*)$`, 's'),
      new RegExp(`^${escapeRegex(name)}[,!]?\\s+(.*)$`, 's'),
      new RegExp(`^${escapeRegex(name)}$`, 's'),
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return { agent, remainder: (match[1] ?? '').trim() };
      }
    }

    const title = agent.title?.trim();
    if (title && title !== name) {
      const titlePatterns = [
        new RegExp(`^${escapeRegex(title)}(?:님|씨)?[,!]?\\s*(.*)$`, 's'),
        new RegExp(`^${escapeRegex(title)}$`, 's'),
      ];
      for (const pattern of titlePatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          return { agent, remainder: (match[1] ?? '').trim() };
        }
      }
    }
  }

  return null;
}

function buildDirectCommand(agent: Agent, remainder: string): string {
  const body = remainder.trim() || '안녕';
  return `@${agent.name} ${body}`.trim();
}

export function prepareTelegramCommand(
  rawText: string,
  agents: Agent[],
  secretary: Agent | null,
  lastAgentId: string | null,
  findByMention: (mention: string) => Agent | null,
  botUsername?: string
): TelegramCommandPrepareResult {
  const text = stripBotMention(rawText, botUsername);
  if (!text) {
    return { command: rawText.trim(), targetAgentId: lastAgentId, routedVia: 'unchanged' };
  }

  const strictMention = parseStrictAgentMention(
    text.startsWith('@') ? text : `@${text}`,
    agents,
    findByMention
  );
  if (strictMention) {
    return {
      command: buildDirectCommand(strictMention.agent, strictMention.remainder),
      targetAgentId: strictMention.agent.id,
      routedVia: 'mention',
    };
  }

  if (text.startsWith('@')) {
    return { command: text, targetAgentId: lastAgentId, routedVia: 'unchanged' };
  }

  const natural = detectNaturalAgentAddress(text, agents);
  if (natural) {
    return {
      command: buildDirectCommand(natural.agent, natural.remainder),
      targetAgentId: natural.agent.id,
      routedVia: 'natural',
    };
  }

  if (lastAgentId && agents.some((a) => a.id === lastAgentId)) {
    const agent = agents.find((a) => a.id === lastAgentId)!;
    return {
      command: buildDirectCommand(agent, text),
      targetAgentId: agent.id,
      routedVia: 'session',
    };
  }

  if (secretary) {
    return {
      command: buildDirectCommand(secretary, text),
      targetAgentId: secretary.id,
      routedVia: 'secretary',
    };
  }

  return { command: text, targetAgentId: null, routedVia: 'unchanged' };
}

export function formatTelegramAgentRoster(agents: Agent[]): string {
  const lines = agents
    .filter((a) => a.status !== 'offline')
    .map((a) => `• @${a.name} (${a.title?.trim() || a.role})`);
  return lines.join('\n');
}

export function formatTelegramWelcome(agents: Agent[]): string {
  const roster = formatTelegramAgentRoster(agents);
  return [
    'AgentCompany 봇 연결됨 ✅',
    '이 채팅방에 모든 에이전트가 함께 있습니다.',
    '',
    '👥 에이전트 목록:',
    roster || '(등록된 에이전트 없음)',
    '',
    '💡 사용법:',
    '@에이전트명 메시지',
    '예: @강하늘 오늘 할 일 정리해줘',
    '',
    '@ 없이내면 마지막 대화한 에이전트에게 전달됩니다.',
    '에이전트를 바꿀 때는 @이름 으로 지정해 주세요.',
  ].join('\n');
}

export function formatTelegramRouteHint(
  routedVia: TelegramCommandPrepareResult['routedVia'],
  agentLabel: string
): string {
  switch (routedVia) {
    case 'natural':
      return `🎯 ${agentLabel}에게 연결 (호칭 인식)`;
    case 'session':
      return `🔄 ${agentLabel}에게 연결 (이전 대화 이어가기)`;
    case 'secretary':
      return `📨 ${agentLabel}에게 연결`;
    default:
      return `📨 ${agentLabel}`;
  }
}

export function formatTelegramAgentReply(senderName: string, content: string): string {
  return `💬 ${senderName}\n${content}`;
}

export function formatTelegramCeoEcho(targetLabel: string, content: string): string {
  return `👤 사장님 → ${targetLabel}\n${content}`;
}

export function resolveAgentLabelFromCommand(
  command: string,
  agents: Agent[],
  findByMention: (mention: string) => Agent | null
): string {
  const strict = parseStrictAgentMention(command, agents, findByMention);
  if (strict) return formatAgentLabel(strict.agent);
  const mention = parseCeoMention(command, collectAgentMentionNames(agents));
  if (mention) {
    const agent =
      agents.find((a) => a.name === mention.agentName) ?? findByMention(mention.agentName);
    if (agent) return formatAgentLabel(agent);
  }
  return '에이전트';
}
