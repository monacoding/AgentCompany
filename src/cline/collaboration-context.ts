/** Project·다른 에이전트 산출물을 하정우 Cline 프롬프트에 주입 */
export function buildCollaborationPromptBlock(
  priorContext?: string,
  taskDescription?: string
): string {
  const parts: string[] = [];

  if (priorContext?.trim()) {
    parts.push(
      '## 협업 맥락 — 이전 에이전트 산출물',
      '아래 URL·fileSeq·경로·조사 결과를 그대로 활용해 코드·스크립트를 구현하세요.',
      '',
      priorContext.trim().slice(0, 5000)
    );
  }

  if (taskDescription?.trim()) {
    parts.push('', '## 현재 태스크', taskDescription.trim().slice(0, 1500));
  }

  if (parts.length === 0) return '';
  return parts.join('\n');
}

/** @한서준 리서치 → @하정우 스크립트 등 협업 업무 감지 */
export function isCollaborativeDevTask(command: string): boolean {
  const text = command.trim();
  if (!text) return false;
  return (
    /한서준|리서치|research|출처|fileSeq|fileDown|평가원|suneung/i.test(text) &&
    /코드|스크립트|구현|다운|python|자동/i.test(text)
  );
}
