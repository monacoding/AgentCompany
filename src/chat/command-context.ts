import { detectFolderOpenRequest } from './folder-path';
import { CeoChatMessage } from './types';

export interface ResolvedCommand {
  raw: string;
  effective: string;
  usedContext: boolean;
  contextSummary?: string;
}

var FOLLOW_UP_PREFIX = /^(?:그거|그것|그\s*파일|이거|저거|이\s*파일|위에|아까|방금|그럼|그래서|그리고|근데|자|응|네|좋아|오케이|ok)/i;
var FOLLOW_UP_ACTION = /(?:전달|줄래|줘|줄게|보내|가져|받아|드려|드릴|해줘|해주|해\s*줄래|해\s*주|부탁|진행|시작|계속|그렇게)/i;
var TOPIC_SIGNAL = /(?:파일|pdf|수능|폴더|전달|가져|복사|다운|자료|문서|기출|국어|수학|영어|문제|산출물|리포트|outputs?)/i;
var STANDALONE_TASK = /(?:파일|pdf|구현|조사|만들|작성|분석|제작|배포|리서치|크롤|다운로드|저장|복사|전달해\s*줘?.{0,20}(?:파일|pdf|수능|폴더))/i;
var STANDALONE_GREETING =
  /^(?:안녕|하이|헬로|hello|hi|반가|좋은\s*(?:아침|오후|저녁)|ㅎㅇ|ㅎㅎ|고마워|감사|수고|잘\s*자|굿모닝|굿밤)(?:요|하세요|합니다|해|요\?|\?|!|~|\.|ㅋㅋ)*$/i;

export function isContextDependentCommand(command: string): boolean {
  const text = command.trim();
  if (!text || text.length > 100)
    return false;
  if (/^(?:예|아니오|아니요|취소|중지|멈춰|그만)\b/i.test(text))
    return false;
  if (STANDALONE_GREETING.test(text))
    return false;
  if (text.length > 50 && STANDALONE_TASK.test(text))
    return false;
  if (FOLLOW_UP_PREFIX.test(text))
    return true;
  if (text.length <= 60 && FOLLOW_UP_ACTION.test(text)) {
    return true;
  }
  return false;
}
function pickContextSnippet(messages: CeoChatMessage[], exclude: string): string | null {
  const ceoLines = messages.filter((m) => m.type === "ceo" && m.content.trim() && m.content.trim() !== exclude).slice(-6).map((m) => m.content.trim());
  for (let i = ceoLines.length - 1; i >= 0; i--) {
    if (TOPIC_SIGNAL.test(ceoLines[i]))
      return ceoLines[i];
  }
  const agentLines = messages.filter((m) => m.type === "agent" && m.content.trim()).slice(-6).map(
    (m) => m.content.replace(/\n\n📁[\s\S]*$/s, "").replace(/\n\n✅[\s\S]*$/s, "").trim()
  );
  for (let i = agentLines.length - 1; i >= 0; i--) {
    if (TOPIC_SIGNAL.test(agentLines[i])) {
      return agentLines[i].slice(0, 300);
    }
  }
  const lastAgent = agentLines[agentLines.length - 1];
  if (lastAgent) return lastAgent.slice(0, 300);
  const lastCeo = ceoLines[ceoLines.length - 1];
  return lastCeo ?? null;
}
export function resolveCommandWithContext(command: string, threadMessages: CeoChatMessage[]): ResolvedCommand {
  const raw = command.trim();
  if (!raw || detectFolderOpenRequest(raw) || !isContextDependentCommand(raw)) {
    return { raw, effective: raw, usedContext: false };
  }
  const contextSnippet = pickContextSnippet(threadMessages, raw);
  if (!contextSnippet) {
    return { raw, effective: raw, usedContext: false };
  }
  const effective = `${contextSnippet} \u2014 ${raw}`;
  return {
    raw,
    effective,
    usedContext: true,
    contextSummary: contextSnippet
  };
}

