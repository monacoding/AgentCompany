import { Agent } from '../types';

/** ChatDev carry_data — 이전 태스크 산출물을 다음 태스크에 전달 */
export interface PriorDeliverable {
  agent: string;
  description: string;
  output: string;
  approved: boolean;
}

/** 일반 워커 carry_data 상한 */
export const PRIOR_CONTEXT_MAX_DEFAULT = 6_000;

/** PM 최종 통합 — @한서준 리서치 본문 전량 전달 */
export const PRIOR_CONTEXT_MAX_PM = 96_000;

function isResearcherDeliverable(d: PriorDeliverable): boolean {
  return d.agent.includes('한서준') || /리서치|조사|research/i.test(d.description);
}

export function buildPriorDeliverablesContext(
  prior: PriorDeliverable[],
  maxChars = PRIOR_CONTEXT_MAX_DEFAULT
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

/** PM은 리서치 산출물을 우선·전량 보존, 기타 산출물은 요약 가능 */
export function buildPriorDeliverablesContextForWorker(
  agent: Agent,
  prior: PriorDeliverable[]
): string {
  if (prior.length === 0) return '';
  if (agent.role !== 'pm') {
    return buildPriorDeliverablesContext(prior, PRIOR_CONTEXT_MAX_DEFAULT);
  }

  const research = prior.filter(isResearcherDeliverable);
  const others = prior.filter((d) => !isResearcherDeliverable(d));

  const researchBlocks = research.map(
    (d) =>
      `### @${d.agent} — ${d.description} (${d.approved ? '검토통과' : '루프한도'})\n${d.output}`
  );
  const otherBlocks = others.map(
    (d) =>
      `### @${d.agent} — ${d.description} (${d.approved ? '검토통과' : '루프한도'})\n${d.output}`
  );

  let combined = [...researchBlocks, ...otherBlocks].join('\n\n');
  const researchLen = researchBlocks.join('\n\n').length;
  const budget = PRIOR_CONTEXT_MAX_PM;

  if (combined.length > budget && others.length > 0) {
    const otherText = otherBlocks.join('\n\n');
    const researchText = researchBlocks.join('\n\n');
    const otherBudget = Math.max(2_000, budget - researchText.length - 80);
    const trimmedOther =
      otherText.length > otherBudget
        ? `${otherText.slice(0, otherBudget)}\n…(기타 산출물 일부 생략)`
        : otherText;
    combined = researchText ? `${researchText}\n\n${trimmedOther}` : trimmedOther;
  } else if (combined.length > budget) {
    combined = `${combined.slice(0, budget)}\n…(이전 산출물 일부 생략 — 리서치 우선)`;
  }

  if (research.length > 0 && researchLen > 0) {
    combined = `## @한서준 리서치 원문 (PM은 아래 내용을 삭제·요약하지 말고 보고서 형식으로 통합)\n\n${combined}`;
  }

  return combined;
}
