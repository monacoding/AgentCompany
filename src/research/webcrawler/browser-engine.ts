import * as vscode from 'vscode';
import { CrawlResult } from '../types';

const USER_AGENT =
  'Mozilla/5.0 (compatible; AgentCompany-Research/1.0; +https://github.com/agentcompany/agent-company)';

export class Crawl4AiAdapter {
  getBaseUrl(): string {
    return (
      vscode.workspace.getConfiguration('agentCompany').get<string>('crawl4aiBaseUrl') ||
      process.env.CRAWL4AI_BASE_URL ||
      'http://localhost:11235'
    );
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      try {
        const response = await fetch(this.getBaseUrl(), { signal: AbortSignal.timeout(3000) });
        return response.ok;
      } catch {
        return false;
      }
    }
  }

  async crawl(url: string): Promise<CrawlResult | null> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [url], priority: 10 }),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as {
        results?: {
          url: string;
          markdown?: string;
          fit_markdown?: string;
          html?: string;
          metadata?: { title?: string };
        }[];
      };

      const result = data.results?.[0];
      if (!result) return null;

      const markdown = this.resolveMarkdown(result);
      if (!markdown && !result.html) return null;

      return {
        url,
        title: result.metadata?.title ?? url,
        markdown: markdown || this.htmlToText(result.html ?? ''),
        rawHtml: result.html,
        source: 'crawl4ai',
      };
    } catch {
      return null;
    }
  }

  private resolveMarkdown(result: {
    fit_markdown?: string | { raw_markdown?: string; markdown_with_citations?: string };
    markdown?: string | { raw_markdown?: string; markdown_with_citations?: string };
  }): string {
    const pick = (value: typeof result.markdown): string => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      return value.markdown_with_citations || value.raw_markdown || '';
    };
    return pick(result.fit_markdown) || pick(result.markdown);
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export class BrowserEngine {
  constructor(private crawl4ai: Crawl4AiAdapter) {}

  async fetchPage(url: string): Promise<CrawlResult> {
    const fromCrawl4ai = await this.crawl4ai.crawl(url);
    if (fromCrawl4ai) return fromCrawl4ai;

    const fromJina = await this.fetchViaJina(url);
    if (fromJina) return fromJina;

    return this.fetchDirect(url);
  }

  private async fetchViaJina(url: string): Promise<CrawlResult | null> {
    try {
      const response = await fetch(`https://r.jina.ai/${url}`, {
        headers: { Accept: 'text/plain' },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) return null;

      const text = await response.text();
      if (text.length < 50) return null;

      return {
        url,
        title: this.extractTitle(text) ?? url,
        markdown: text.slice(0, 12000),
        source: 'jina',
      };
    } catch {
      return null;
    }
  }

  private async fetchDirect(url: string): Promise<CrawlResult> {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const title = this.extractTitleFromHtml(html) ?? url;

    return {
      url,
      title,
      markdown: this.htmlToMarkdown(html),
      rawHtml: html,
      source: 'fetch',
    };
  }

  private extractTitle(text: string): string | null {
    const match = text.match(/^Title:\s*(.+)$/m);
    return match?.[1]?.trim() ?? null;
  }

  private extractTitleFromHtml(html: string): string | null {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? match[1].replace(/\s+/g, ' ').trim() : null;
  }

  private htmlToMarkdown(html: string): string {
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return text.slice(0, 12000);
  }
}
