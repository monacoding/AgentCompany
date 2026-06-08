import { ProviderEngine } from '../../providers';
import { Agent, ProviderType } from '../../types';
import { ExtractedContent } from '../types';
import { ResearchPlan } from './research-planner';

export class Summarizer {
  constructor(private providers: ProviderEngine) {}

  async summarize(
    query: string,
    contents: ExtractedContent[],
    agent: Agent,
    plan?: ResearchPlan
  ): Promise<string> {
    const corpus = contents
      .map((c) => `### ${c.title}\n${c.url}\n${c.markdown.slice(0, 2500)}`)
      .join('\n\n');

    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You are ${agent.name}, an OSINT research analyst. Synthesize web research into clear, factual Korean reports.
Rules:
- Cite every claim with source URL.
- Classify each source: A(정부·공식·학술), B(언론·기업), C(블로그·SNS).
- Cross-check facts across sources; mark conflicts as "불확실".
- Prefer official sources over mirrors when they disagree.
- Use headings and bullet points.`,
        },
        {
          role: 'user',
          content: `Research goal: ${plan?.goal ?? query}
${plan?.notes ? `Strategy: ${plan.notes}\n` : ''}
Original query: ${query}

Collected web content (${contents.length} sources):
${corpus.slice(0, 14000)}

Provide in Korean:
1. **요약** (3-5문장)
2. **핵심 발견** (불릿, 출처 URL 포함)
3. **출처 신뢰도** (A/B/C 등급별 목록)
4. **교차검증** (일치/불일치/불확실 항목)
5. **다음 단계** (추가 조사가 필요하면 구체적으로)`,
        },
      ],
      { type: agent.provider as ProviderType, model: agent.model }
    );

    return response.content;
  }
}
