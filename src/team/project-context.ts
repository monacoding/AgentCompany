/** ChatDev carry_data — 이전 태스크 산출물을 다음 태스크에 전달 */
export interface PriorDeliverable {
  agent: string;
  description: string;
  output: string;
  approved: boolean;
}

export function buildPriorDeliverablesContext(
  prior: PriorDeliverable[],
  maxChars = 2400
): string {
  if (prior.length === 0) return '';

  const blocks = prior.map(
    (d) =>
      `### @${d.agent} — ${d.description} (${d.approved ? '검토통과' : '루프한도'})\n${d.output}`
  );

  let combined = blocks.join('\n\n');
  if (combined.length > maxChars) {
    combined = `${combined.slice(0, maxChars)}\n…(이전 산출물 일부 생략)`;
  }
  return combined;
}
