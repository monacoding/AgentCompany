/** 즉시 Project 실행 — 명시적 슬래시/멘션 명령만 */
export function shouldStartProjectImmediately(command: string): boolean {
  const text = command.trim();
  if (!text) return false;

  if (/(?:^|\s)\/(?:project|팀|proj)(?:\s|$)/i.test(text)) return true;
  if (/^@(?:project|팀)\b|^#(?:project|팀)\b/i.test(text)) return true;
  if (/\bproject\b/i.test(text) && /시작|실행|개설|모드/i.test(text)) return true;

  return false;
}

/** PM과 계획 확정 후 사장님 최종 승인 — 이때만 Project 채팅방 생성 */
export function isProjectGoAhead(command: string): boolean {
  const text = command.trim();
  if (!text || text.length > 120) return false;

  return (
    /^(?:그럼\s*)?(?:이제\s*)?(?:최종적으로\s*)?(?:진행(?:하세요|해(?:\s*주세요)?|해줘|합니다)?|시작(?:하세요|해(?:\s*주세요)?|해줘)?|실행(?:하세요|해(?:\s*주세요)?|해줘)?|개시(?:하세요|해(?:줘)?)?)(?:\s*[!\.。]*)?$/i.test(
      text
    ) ||
    /프로젝트\s*(?:진행|시작|실행|개설)/i.test(text) ||
    /project\s*(?:go|start|run|proceed)/i.test(text) ||
    /(?:좋아|오케이|ok|확인)[,.]?\s*(?:진행|시작|실행)/i.test(text)
  );
}

/** PM 계획 확정 전 수정·재계획 요청 */
export function isProjectPlanRevision(command: string): boolean {
  const text = command.trim();
  if (!text || text.length > 400) return false;
  if (isProjectGoAhead(text)) return false;
  if (/^(?:예|네|응|좋아|오케이|ok)\b/i.test(text) && text.length < 20) return false;

  return (
    /^(?:아니|아냐|아니요|말고|대신|그건|그거|잠깐|잠시)\b/i.test(text) ||
    /(?:수정|바꿔|변경|고쳐|다시\s*짜|재\s*계획|재계획|빼고|추가해|넣어|제외|줄여|늘려)/i.test(text)
  );
}

/** @deprecated — 협업 단어만으로는 Project를 시작하지 않음 */
export function shouldStartProject(command: string): boolean {
  return shouldStartProjectImmediately(command);
}

/** @deprecated use shouldStartProjectImmediately */
export function shouldUseTeamCollaboration(command: string): boolean {
  return shouldStartProjectImmediately(command);
}

export function stripProjectCommandPrefix(command: string): string {
  return command
    .replace(/(?:^|\s)\/(?:project|팀|proj)\s*/gi, ' ')
    .replace(/^@(?:project|팀)\s*/i, '')
    .replace(/^#(?:project|팀)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeProjectCommand(command: string): string {
  return stripProjectCommandPrefix(command) || command.trim();
}

/** @deprecated */
export const normalizeTeamCommand = normalizeProjectCommand;

/** @deprecated */
export const stripTeamCommandPrefix = stripProjectCommandPrefix;
