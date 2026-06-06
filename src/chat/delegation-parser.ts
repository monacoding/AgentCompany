import { Agent } from '../types';

export interface DelegationSuggestion {
  target: Agent;
  command: string;
}

export function detectDelegationSuggestion(
  content: string,
  findAgent: (mention: string) => Agent | null | undefined,
  sourceAgentId: string,
  recentCeoCommand?: string
): DelegationSuggestion | null {
  const text = content.trim();
  if (!text)
    return null;
  const mustSuggest = /요청하세요|요청해\s*주세요|지시하세요|부탁하세요|맡기세요|위임|에게\s*(?:요청|지시|부탁)|다음\s*단계:.*@|도와줄래요|부탁해도\s*될까요/i.test(
    text
  );
  if (!mustSuggest)
    return null;
  let targetMention = null;
  const atMatch = text.match(/@([^\s@,.\]]+)(?:\s*(?:에게|한테|에))?/);
  if (atMatch) {
    targetMention = atMatch[1].trim();
  }
  if (!targetMention) {
    const nameMatch = text.match(
      /([가-힣A-Za-z][가-힣A-Za-z0-9]{1,10})\s*(?:에게|한테)\s*(?:자동화|구현|요청|지시|부탁)/i
    );
    if (nameMatch)
      targetMention = nameMatch[1].trim();
  }
  if (!targetMention)
    return null;
  const target = findAgent(targetMention);
  if (!target || target.id === sourceAgentId)
    return null;
  const command = extractDelegatedCommand(text, recentCeoCommand);
  if (!command)
    return null;
  return { target, command };
}
function extractDelegatedCommand(content: string, recentCeoCommand?: string): string | null {
  const taskPatterns = [
    /@([^\s@]+)\s*(?:에게|한테|에)?\s*(.+?)(?:을|를)\s*(?:요청|지시|부탁)/i,
    /(?:또는|→)\s*@([^\s@]+)\s*(?:에게|한테|에)?\s*(.+?)(?:요청|지시|부탁|하세요)/i,
    /@([^\s@]+)\s*(?:에게|한테|에)?\s*(.+?)(?:요청|지시|부탁)/i,
    /([가-힣A-Za-z][가-힣A-Za-z0-9]{1,10})\s*(?:에게|한테)\s*(.+?)(?:에\s*대해\s*)?도와줄래요/i
  ];
  for (const pattern of taskPatterns) {
    const match = content.match(pattern);
    const task = (match?.[2] ?? match?.[1])?.replace(/하세요\.?$/i, "").replace(/해\s*주세요\.?$/i, "").trim();
    if (task && task.length >= 4)
      return task;
  }
  if (recentCeoCommand?.trim()) {
    return `\uC774\uC804 \uC0AC\uC7A5 \uC9C0\uC2DC \uD6C4\uC18D \uC791\uC5C5: ${recentCeoCommand.trim()}`;
  }
  return "\uC774\uC804 \uC791\uC5C5 \uC0B0\uCD9C\uBB3C\uC744 \uBC14\uD0D5\uC73C\uB85C \uD6C4\uC18D \uAD6C\uD604\xB7\uC790\uB3D9\uD654\uB97C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694.";
}
export function buildCollabThreadId(agentIdA: string, agentIdB: string): string {
  const [a, b] = [agentIdA, agentIdB].sort();
  return `collab:${a}:${b}`;
}

