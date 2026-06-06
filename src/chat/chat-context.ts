import { ChatMessage } from '../types';
import { CeoChatMessage } from './types';

const DEFAULT_LIMIT = 12;

export function buildChatMessagesForLlm(
  messages: CeoChatMessage[],
  opts?: { limit?: number; excludeLastCeo?: boolean }
): ChatMessage[] {
  let recent = messages.slice(-(opts?.limit ?? DEFAULT_LIMIT));
  if (opts?.excludeLastCeo && recent.length > 0 && recent[recent.length - 1].type === 'ceo') {
    recent = recent.slice(0, -1);
  }

  const result: ChatMessage[] = [];
  for (const m of recent) {
    if (m.type === 'ceo') {
      const text = m.content.trim();
      if (text) result.push({ role: 'user', content: text });
    } else if (m.type === 'agent') {
      const text = m.content
        .replace(/\n\n📁[\s\S]*$/s, '')
        .replace(/\n\n✅[\s\S]*$/s, '')
        .trim();
      if (text) result.push({ role: 'assistant', content: text });
    }
  }
  return result;
}

/** API·레거시 경로용 평문 맥락 */
export function formatChatContextString(messages: CeoChatMessage[], limit = 8): string {
  return messages
    .slice(-limit)
    .map((m) => `${m.senderName}: ${m.content}`)
    .join('\n');
}
