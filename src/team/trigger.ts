/** Project 모드 — 명시적 키워드 또는 복합 멀티스텝 업무만 (1:1 채팅은 유지) */
export function shouldStartProject(command: string): boolean {
  const text = command.trim();
  if (!text) return false;

  if (/(?:^|\s)\/(?:project|팀|proj)(?:\s|$)/i.test(text)) return true;
  if (/^@(?:project|팀)\b|^#(?:project|팀)\b/i.test(text)) return true;
  if (/\bproject\b/i.test(text) && /시작|실행|진행|모드/i.test(text)) return true;
  if (/협업|함께|연계|공동으로|멀티\s*에이전트|에이전트\s*팀|분업|역할\s*분담/i.test(text)) return true;
  if (/같이\s*(?:작업|진행|만들|해|하자|해줘)/i.test(text)) return true;

  // 복합 파이프라인 (A 하고 B) — CrewAI sequential crew 패턴
  if (text.length >= 35 && /(.+)(?:하고|한\s*뒤|후에|다음|이후|해서).+(?:만들|작성|분석|조사|구현|기획)/i.test(text)) {
    return true;
  }

  return false;
}

/** @deprecated use shouldStartProject */
export function shouldUseTeamCollaboration(command: string): boolean {
  return shouldStartProject(command);
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
