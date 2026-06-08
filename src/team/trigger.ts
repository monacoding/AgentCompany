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
    /^(?:그럼\s*)?(?:이제\s*)?(?:최종적으로\s*)?(?:진행(?:하세요|해(?:\s*주세요)?|합니다)?|시작(?:하세요|해(?:\s*주세요)?)|실행(?:하세요|해(?:\s*주세요)?)|개시(?:하세요|해)?)(?:\s*[!\.。]*)?$/i.test(
      text
    ) ||
    /프로젝트\s*(?:진행|시작|실행|개설)/i.test(text) ||
    /project\s*(?:go|start|run|proceed)/i.test(text) ||
    /(?:좋아|오케이|ok|확인)[,.]?\s*(?:진행|시작|실행)/i.test(text)
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
