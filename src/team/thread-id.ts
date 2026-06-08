export function buildTeamThreadId(sessionId: string): string {
  return `team:${sessionId}`;
}

export function isTeamThreadId(threadId: string): boolean {
  return threadId.startsWith('team:');
}
