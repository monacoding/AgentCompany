import { CeoChatMessage } from '../chat/types';
import { isProjectGoAhead } from './trigger';

/** PM 1:1 대화에서 Project 브리핑 맥락이 있는지 */
export function hasProjectPlanningContext(messages: CeoChatMessage[]): boolean {
  const recent = messages.slice(-24);

  const ceoBriefs = recent.filter(
    (m) => m.type === 'ceo' && m.content.trim().length >= 8 && !isProjectGoAhead(m.content)
  );
  if (ceoBriefs.length === 0) return false;

  const hasPmPlan = recent.some(
    (m) =>
      m.type === 'agent' &&
      (/@\w+/.test(m.content) ||
        /분업|계획|담당|역할|태스크|에이전트|팀원|배정|순서/i.test(m.content))
  );

  const hasSubstantiveCeo = ceoBriefs.some(
    (m) =>
      m.content.length >= 20 ||
      /협업|프로젝트|분석|제작|구현|조사|기획|만들|작성/i.test(m.content)
  );

  return hasPmPlan || hasSubstantiveCeo;
}

/** 최종 승인 시 채팅 기록에서 Project 지시문 추출 */
export function extractProjectBriefFromChat(
  messages: CeoChatMessage[],
  goAheadCommand: string
): string {
  const recent = messages.slice(-30);

  const ceoLines = recent
    .filter((m) => m.type === 'ceo' && m.content.trim() && !isProjectGoAhead(m.content))
    .map((m) => m.content.trim());

  const pmPlan = recent
    .filter((m) => m.type === 'agent' && m.content.trim().length >= 40)
    .slice(-2)
    .map((m) => m.content.trim());

  const parts: string[] = [];
  if (ceoLines.length > 0) {
    parts.push('## 사장님 지시', ceoLines.slice(-3).join('\n'));
  }
  if (pmPlan.length > 0) {
    parts.push('## PM 계획 요약', pmPlan.join('\n\n'));
  }

  const merged = parts.join('\n\n').trim();
  return merged || goAheadCommand.trim();
}
