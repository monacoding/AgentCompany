export interface CeoMentionParse {
  agentName: string;
  command: string;
  raw: string;
}

/**
 * CEO Command에서 `@에이전트명 명령` 형식 파싱.
 * 에이전트명은 등록된 이름 중 가장 긴 prefix 매칭 (예: "Alex PM").
 */
export function parseCeoMention(command: string, agentNames: string[]): CeoMentionParse | null {
  const trimmed = command.trim();
  if (!trimmed.startsWith('@')) return null;

  const rest = trimmed.slice(1);
  const sorted = [...agentNames].sort((a, b) => b.length - a.length);

  for (const name of sorted) {
    const lowerRest = rest.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerRest === lowerName) {
      return { agentName: name, command: '', raw: trimmed };
    }
    if (lowerRest.startsWith(`${lowerName} `) || lowerRest.startsWith(`${lowerName}\t`)) {
      return {
        agentName: name,
        command: rest.slice(name.length).trim(),
        raw: trimmed,
      };
    }
  }

  const match = rest.match(/^(\S+)(?:\s+(.*))?$/s);
  if (!match) return null;

  return {
    agentName: match[1],
    command: (match[2] ?? '').trim(),
    raw: trimmed,
  };
}
