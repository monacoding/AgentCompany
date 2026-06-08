import { Agent } from '../types';
import { textMentionsAgent } from '../utils/agent-display';
import { CeoChatMessage } from './types';
import type { FolderPathScope } from './cross-agent-file';

export type FolderOpenTarget = Agent | 'owner';

/** 탐색기에서 폴더 열기 요청 */
export function detectFolderOpenRequest(command: string): boolean {
  const text = command.trim();
  if (!text) return false;
  if (/경로\s*(?:뭐|어디|알려|확인|무엇)/i.test(text)) return false;
  return (
    /^(?:폴더\s*)?(?:열어|열어\s*줘|열어줘|오픈|open|띄워|보여\s*줘)/i.test(text) ||
    /(?:탐색기|explorer).{0,12}(?:열|open)/i.test(text) ||
    /(?:폴더|디렉터리|directory).{0,10}(?:열어|열어\s*줘|open)/i.test(text) ||
    (/열어|open/i.test(text) && /폴더/i.test(text))
  );
}

/** "강하늘 폴더 경로" 등 **다른 에이전트** 폴더 질문 */
export function detectFolderPathTargetAgent(
  command: string,
  respondingAgent: Agent,
  agents: Agent[]
): Agent | null {
  const text = command.trim();
  if (!text || !/(?:폴더|경로|outputs?)/i.test(text)) return null;

  const selfRef = /(?:^|\s)(?:너(?:의)?|네|니|당신(?:의)?)\s*(?:폴더|경로)/i.test(text);
  if (selfRef) return null;

  let matched: Agent | null = null;
  for (const candidate of agents) {
    if (!textMentionsAgent(text, candidate)) continue;
    matched = candidate;
  }
  return matched;
}

/** 최근 대화에서 열 폴더 대상 추론 */
export function inferFolderOpenTarget(
  command: string,
  respondingAgent: Agent,
  agents: Agent[],
  threadMessages: CeoChatMessage[]
): FolderOpenTarget {
  const named = detectFolderPathTargetAgent(command, respondingAgent, agents);
  if (named) return named;

  if (/(?:너(?:의)?|네|니|당신(?:의)?)\s*(?:폴더|경로)/i.test(command)) {
    return respondingAgent;
  }
  if (/(?:사장님|owner)\s*폴더/i.test(command)) {
    return 'owner';
  }

  const recentAgent = [...threadMessages].reverse().find((m) => m.type === 'agent');
  if (recentAgent?.content) {
    const content = recentAgent.content;

    const ownerOnly =
      /사장님\(Owner\)\s*데이터\s*폴더/i.test(content) &&
      !/작업\s*폴더/i.test(content);
    if (ownerOnly) return 'owner';

    const headerMatch = content.match(/📁\s*([^\n]+?)\s*작업\s*폴더/);
    if (headerMatch) {
      const label = headerMatch[1].trim();
      const byName = agents.find(
        (a) => a.name === label || label.startsWith(a.name) || label.includes(a.name)
      );
      if (byName) return byName;
    }

    const slugMatch = content.match(/`agent\/([^`/]+)`/);
    if (slugMatch) {
      const slug = slugMatch[1];
      const bySlug = agents.find((a) => slug.includes(a.name) || slug.replace(/_/g, '').includes(a.name.replace(/\s/g, '')));
      if (bySlug) return bySlug;
    }
  }

  const recentCeo = [...threadMessages]
    .reverse()
    .find((m) => m.type === 'ceo' && m.content.trim());
  if (recentCeo) {
    const ctxNamed = detectFolderPathTargetAgent(recentCeo.content, respondingAgent, agents);
    if (ctxNamed) return ctxNamed;
    if (/(?:너|네|니|당신)(?:의)?\s*(?:폴더|경로)/i.test(recentCeo.content)) {
      return respondingAgent;
    }
    if (/(?:사장님|owner)\s*폴더/i.test(recentCeo.content)) {
      return 'owner';
    }
  }

  return respondingAgent;
}

export function resolveFolderPathScope(
  command: string,
  respondingAgent: Agent,
  agents: Agent[]
): FolderPathScope | null {
  const text = command.trim();
  if (!text || detectFolderOpenRequest(text)) return null;

  const FOLDER_PATH_SIGNAL =
    /(?:폴더\s*경로|경로(?:는|이)?\s*(?:확인|알려|알려줘|뭐|무엇|어디)|폴더\s*(?:위치|어디|확인)|어디에\s*(?:저장|있)|(?:너|네|니|당신)(?:의)?\s*경로|내\s*폴더|제\s*폴더|작업\s*폴더|outputs?\s*경로|folder\s*path)/i;

  if (!FOLDER_PATH_SIGNAL.test(text)) return null;

  const named = detectFolderPathTargetAgent(text, respondingAgent, agents);
  if (named) return 'named';

  if (/(?:사장님\s*폴더|owner|company\/owner)/i.test(text)) return 'owner';
  if (
    /(?:너(?:의)?|니(?:가)?|네|당신(?:의)?)\s*경로|(?:너(?:의)?|니(?:가)?|네|당신(?:의)?|에이전트)\s*폴더|작업\s*폴더|outputs?\s*폴더/i.test(
      text
    )
  ) {
    return 'agent';
  }
  if (/내\s*폴더|제\s*폴더|우리\s*폴더/i.test(text)) return 'owner';
  return 'both';
}
