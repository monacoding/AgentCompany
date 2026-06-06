import { ProviderEngine } from '../../providers';
import { Agent, ProviderType } from '../../types';
import { ExtractedContent } from '../types';

export class Summarizer {
  constructor(private providers: ProviderEngine) {}

  async summarize(
    query: string,
    contents: ExtractedContent[],
    agent: Agent
  ): Promise<string> {
    const corpus = contents
      .map((c) => `### ${c.title}\n${c.url}\n${c.markdown.slice(0, 2000)}`)
      .join('\n\n');

    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You are ${agent.name}, a research analyst. Synthesize web research into clear, factual Korean summaries. Cite sources by URL. Be structured with headings and bullet points.`,
        },
        {
          role: 'user',
          content: `Research query: ${query}

Collected web content:
${corpus.slice(0, 12000)}

Provide:
1. Executive Summary (3-5 sentences)
2. Key Findings (bullet points)
3. Source Notes (brief per source)
4. Recommendations or next steps if applicable`,
        },
      ],
      { type: agent.provider as ProviderType, model: agent.model }
    );

    return response.content;
  }
}
