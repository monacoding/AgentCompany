import { CeoChatMessage } from './types';

export type ChatEmotion = '기쁨' | '슬픔' | '화남' | '놀람' | '걱정' | '기본';

export interface EmotionContext {
  ceoMessage?: string;
  recentCeoMessages?: string[];
}

export const CHAT_EMOTIONS = ["\uAE30\uC068", "\uC2AC\uD514", "\uD654\uB0A8", "\uB180\uB78C", "\uAC71\uC815", "\uAE30\uBCF8"];
var CEO_ANGER = /닥쳐|닥치|조용|시끄|짜증|화나|엉망|꺼져|그만해?|하지마|못하|바보|최악|열받|빡치|미쳤|뭐하|해라$|하라$|하세요$|안돼|안 돼/i;
var CEO_FRUSTRATED = /아직.*모르|모르겠|실망|왜 그래|또 그래|제발|답답|짜증나|잘못한|잘못 했|화가|불만|안 하|안하/i;
var CEO_WORRIED = /걱정|불안|급해|빨리|언제|아직도|늦었|마감|위험/i;
var CEO_HAPPY = /감사|고마|고맙|잘했|잘 했|좋아|수고|최고|축하|반가|안녕|좋은 아침|좋은 저녁|ㅎㅎ|👍/i;
var AGENT_APOLOGY = /죄송|미안|실수|불편을 드려|잘못했|잘못 했|사과/i;
var AGENT_CAUTIOUS = /알겠습니다|알겠어|조용히|준비|듣겠|말씀해 주시|말씀해주시|개선하|노력하/i;
var AGENT_CONTENT_PATTERNS = [
  { emotion: "\uC2AC\uD514", pattern: /죄송|미안|실패|오류|불가|😢|😭|ㅠ|슬프/i },
  { emotion: "\uAC71\uC815", pattern: /걱정|우려|주의|확인|점검|검토|진행 중|작업 중|수정|기다/i },
  { emotion: "\uD654\uB0A8", pattern: /거부|안 됩|못 합|불만|😠|😡/i },
  { emotion: "\uB180\uB78C", pattern: /놀랍|헉|대박|😲|😮/ },
  { emotion: "\uAE30\uC068", pattern: /완료|성공|축하|수락|제안|💡|👍|🎉|✅/i }
];
export function detectChatEmotion(content: string, status?: string, context?: EmotionContext): ChatEmotion {
  const ceoTone = detectCeoTone(context);
  const stripped = stripEmojis(content);
  if (status === "failed")
    return preferCeoTone(ceoTone, "\uC2AC\uD514");
  if (status === "working")
    return "\uAE30\uBCF8";
  if (ceoTone === "\uD654\uB0A8") {
    if (AGENT_APOLOGY.test(stripped) || AGENT_CAUTIOUS.test(stripped))
      return "\uC2AC\uD514";
    return "\uAC71\uC815";
  }
  if (ceoTone === "\uAC71\uC815") {
    if (AGENT_APOLOGY.test(stripped))
      return "\uC2AC\uD514";
    return "\uAC71\uC815";
  }
  if (ceoTone === "\uC2AC\uD514" && AGENT_APOLOGY.test(stripped))
    return "\uC2AC\uD514";
  if (AGENT_APOLOGY.test(stripped))
    return "\uC2AC\uD514";
  if (ceoTone === "\uAE30\uC068") {
    for (const { emotion, pattern } of AGENT_CONTENT_PATTERNS) {
      if (pattern.test(stripped))
        return emotion;
    }
    return "\uAE30\uC068";
  }
  for (const { emotion, pattern } of AGENT_CONTENT_PATTERNS) {
    if (pattern.test(stripped))
      return emotion;
  }
  if (ceoTone)
    return ceoTone;
  return "\uAE30\uBCF8";
}
function detectCeoTone(context) {
  const parts = [
    context?.ceoMessage,
    ...context?.recentCeoMessages ?? []
  ].filter((t) => !!t?.trim());
  if (parts.length === 0)
    return null;
  const combined = parts.join("\n");
  if (CEO_ANGER.test(combined))
    return "\uD654\uB0A8";
  if (CEO_FRUSTRATED.test(combined))
    return "\uC2AC\uD514";
  if (CEO_WORRIED.test(combined))
    return "\uAC71\uC815";
  if (CEO_HAPPY.test(combined))
    return "\uAE30\uC068";
  return null;
}
function preferCeoTone(ceoTone, fallback) {
  if (ceoTone === "\uD654\uB0A8" || ceoTone === "\uC2AC\uD514")
    return "\uC2AC\uD514";
  if (ceoTone === "\uAC71\uC815")
    return "\uAC71\uC815";
  return fallback;
}
function stripEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
}
export function detectSpeakerEmotion(content: string): ChatEmotion {
  const tone = detectCeoTone({ ceoMessage: content });
  return tone ?? "\uAE30\uBCF8";
}
