/** 팀 협업 모드 트리거 — 명시적 키워드 또는 복합 업무 */
export function shouldUseTeamCollaboration(command: string): boolean {
  const text = command.trim();
  if (!text) return false;

  if (/(?:^|\s)\/팀(?:\s|$)/i.test(text)) return true;
  if (/^@팀\b|^#팀\b/i.test(text)) return true;
  if (/협업|함께|팀으로|연계|공동으로|멀티\s*에이전트|에이전트\s*팀|팀\s*구성|팀\s*회의/i.test(text)) return true;
  if (/같이\s*(?:작업|진행|만들|해|하자|해줘)/i.test(text)) return true;
  if (/협의|분업|역할\s*분담/i.test(text)) return true;

  if (text.length >= 30 && /(.+)(?:하고|한\s*뒤|후에|다음|이후|해서).+/i.test(text)) return true;
  if (/분석.*(?:만들|작성|기획)|조사.*(?:대본|보고|정리)|수집.*(?:정리|분석)|기획.*(?:구현|개발)/i.test(text)) {
    return true;
  }

  return false;
}

export function stripTeamCommandPrefix(command: string): string {
  return command
    .replace(/(?:^|\s)\/팀\s*/gi, ' ')
    .replace(/^@팀\s*/i, '')
    .replace(/^#팀\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeTeamCommand(command: string): string {
  return stripTeamCommandPrefix(command) || command.trim();
}
