import { SearchResult } from '../types';

const USER_AGENT =
  'Mozilla/5.0 (compatible; AgentCompany-Research/1.0; +https://github.com/agentcompany/agent-company)';

const OFFICIAL_DOMAIN_HINTS = [
  'go.kr',
  're.kr',
  'ac.kr',
  'or.kr',
  'gov',
  'arxiv.org',
  'github.com',
  'suneung.re.kr',
];

export class SearchEngine {
  async search(query: string, maxResults = 8): Promise<SearchResult[]> {
    const urls = this.extractUrlsFromQuery(query);
    if (urls.length > 0) {
      return urls.map((url) => ({ title: url, url, snippet: 'Direct URL from query' }));
    }

    return this.searchWithFallback(query, maxResults);
  }

  async searchMany(queries: string[], maxPerQuery = 6): Promise<SearchResult[]> {
    const seen = new Set<string>();
    const merged: SearchResult[] = [];

    for (const query of queries) {
      const direct = this.extractUrlsFromQuery(query);
      if (direct.length > 0) {
        for (const url of direct) {
          if (!seen.has(url)) {
            seen.add(url);
            merged.push({ title: url, url, snippet: 'Direct URL from plan' });
          }
        }
        continue;
      }

      const results = await this.searchWithFallback(query, maxPerQuery);
      for (const result of results) {
        if (seen.has(result.url)) continue;
        seen.add(result.url);
        merged.push(result);
      }
    }

    return this.rankResults(merged);
  }

  async searchWithFallback(query: string, maxResults: number): Promise<SearchResult[]> {
    const variants = this.buildQueryVariants(query);
    const seen = new Set<string>();
    const collected: SearchResult[] = [];

    for (const variant of variants) {
      if (collected.length >= maxResults) break;
      try {
        const batch = await this.searchDuckDuckGo(variant, maxResults);
        for (const result of batch) {
          if (seen.has(result.url)) continue;
          seen.add(result.url);
          collected.push(result);
          if (collected.length >= maxResults) break;
        }
      } catch {
        // try next variant
      }
    }

    return this.rankResults(collected).slice(0, maxResults);
  }

  extractUrlsFromQuery(query: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    return [...new Set(query.match(urlRegex) ?? [])];
  }

  officialUrlsToResults(urls: string[]): SearchResult[] {
    return urls.map((url) => ({
      title: `Official: ${this.hostname(url)}`,
      url,
      snippet: 'Research planner — official source candidate',
    }));
  }

  private buildQueryVariants(query: string): string[] {
    const trimmed = query.trim();
    const variants = [trimmed];

    const simplified = trimmed
      .replace(/다운(?:로드)?(?:받|해)?(?:줘| 주세요|해줘)?/gi, '')
      .replace(/찾아(?:줘|서|봐)?/gi, '')
      .replace(/조사(?:해)?(?:줘)?/gi, '')
      .replace(/알아봐(?:줘)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (simplified && simplified !== trimmed) {
      variants.push(simplified);
    }

    if (!/site:/i.test(trimmed) && /수능|기출|평가원|kice/i.test(trimmed)) {
      variants.push(`site:suneung.re.kr ${simplified || trimmed}`);
    }

    if (!/filetype:pdf/i.test(trimmed) && /pdf|다운|받아/i.test(trimmed)) {
      variants.push(`${simplified || trimmed} filetype:pdf`);
    }

    return [...new Set(variants)];
  }

  private rankResults(results: SearchResult[]): SearchResult[] {
    return [...results].sort((a, b) => this.scoreUrl(b.url) - this.scoreUrl(a.url));
  }

  private scoreUrl(url: string): number {
    const lower = url.toLowerCase();
    let score = 0;
    for (const hint of OFFICIAL_DOMAIN_HINTS) {
      if (lower.includes(hint)) score += 10;
    }
    if (lower.endsWith('.pdf')) score += 5;
    if (lower.includes('blog') || lower.includes('tistory') || lower.includes('cafe')) score -= 3;
    return score;
  }

  private hostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private async searchDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
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
