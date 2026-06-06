/** LLM knowledge 학습·watcher 대상에서 제외할 agent 하위 경로 접두사 */
export const NON_LEARNABLE_AGENT_PATH_PREFIXES = [
  'outputs/',
  'outputs/reports/',
  'outputs/downloads/',
  'outputs/plans/',
  'outputs/exports/',
  'photo/',
  'references/',
] as const;

/** agent/{slug}/ 기준 상대 경로가 학습 대상이 아닌지 (산출물·사진·참고자료 등) */
export function isNonLearnableAgentRelativePath(relativePath: string): boolean {
  const norm = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (norm.startsWith('outputs/') || norm === 'outputs') return true;
  return NON_LEARNABLE_AGENT_PATH_PREFIXES.some(
    (prefix) => norm === prefix.replace(/\/$/, '') || norm.startsWith(prefix)
  );
}

/** 절대/표시 경로에 outputs 등 비학습 세그먼트가 포함되는지 */
export function isNonLearnableAgentAbsolutePath(filePath: string): boolean {
  const norm = filePath.replace(/\\/g, '/');
  return /\/agent\/[^/]+\/(?:outputs(?:\/|$)|photo(?:\/|$)|references(?:\/|$))/.test(norm);
}
