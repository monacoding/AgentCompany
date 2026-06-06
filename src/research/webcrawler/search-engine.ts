import { SearchResult } from '../types';

const USER_AGENT =
  'Mozilla/5.0 (compatible; AgentCompany-Research/1.0; +https://github.com/agentcompany/agent-company)';

export class SearchEngine {
  async search(query: string, maxResults = 5): Promise<SearchResult[]> {
    const urls = this.extractUrlsFromQuery(query);
    if (urls.length > 0) {
      return urls.map((url) => ({ title: url, url, snippet: 'Direct URL from query' }));
    }

    try {
      return await this.searchDuckDuckGo(query, maxResults);
    } catch {
      return [];
    }
  }

  extractUrlsFromQuery(query: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    return [...new Set(query.match(urlRegex) ?? [])];
  }

  private async searchDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const html = await response.text();
    const results: SearchResult[] = [];
    const resultBlockRegex =
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

    let match: RegExpExecArray | null;
    while ((match = resultBlockRegex.exec(html)) !== null && results.length < maxResults) {
      const url = this.decodeDuckDuckGoUrl(match[1]);
      if (!url) continue;
      results.push({
        title: this.stripHtml(match[2]).trim(),
        url,
        snippet: this.stripHtml(match[3]).trim(),
      });
    }

    return results;
  }

  private decodeDuckDuckGoUrl(href: string): string | null {
    if (href.startsWith('http')) return href;
    const uddgMatch = href.match(/uddg=([^&]+)/);
    if (uddgMatch) {
      try {
        return decodeURIComponent(uddgMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
}
