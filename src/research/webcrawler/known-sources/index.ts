import { BrowserEngine } from '../browser-engine';
import { buildHoraengDirectUrls, getKnownListPageUrls, parseDownloadIntent } from '../download-knowledge';
import { FileDownloader } from '../file-downloader';
import {
  filterEntriesByYears,
  formatSuneungEntriesBrief,
  parseRequestedSubjects,
  parseSuneungBoardHtml,
  parseSuneungMarkdownTable,
  parseYearRangeFromQuery,
  SuneungBoardEntry,
  SUNEUNG_MAX_LIST_PAGES,
  SUNEUNG_OFFICIAL_LIST_BASE,
} from '../suneung-official';

export interface KnownSourceMatch {
  connectorId: string;
  name: string;
  priority: 'official' | 'mirror' | 'list';
  urls: string[];
}

export interface KnownSourceConnector {
  id: string;
  name: string;
  priority: 'official' | 'mirror' | 'list';
  matches(query: string): boolean;
  resolve(query: string, browserEngine: BrowserEngine, fileDownloader: FileDownloader): Promise<string[]>;
}

class SuneungOfficialConnector implements KnownSourceConnector {
  id = 'suneung-official';
  name = '평가원 공식 기출';
  priority = 'official' as const;

  matches(query: string): boolean {
    return /수능|suneung|기출|csat/i.test(query);
  }

  async resolve(
    query: string,
    browserEngine: BrowserEngine,
    _fileDownloader: FileDownloader
  ): Promise<string[]> {
    const requestedSubjects = parseRequestedSubjects(query);
    const years = parseYearRangeFromQuery(query);
    const urls: string[] = [];
    const seen = new Set<string>();

    for (let page = 1; page <= SUNEUNG_MAX_LIST_PAGES; page++) {
      const listUrl = `${SUNEUNG_OFFICIAL_LIST_BASE}&page=${page}`;
      try {
        const crawl = await browserEngine.fetchPage(listUrl);
        const html = crawl.rawHtml ?? crawl.markdown;
        let parsed = parseSuneungBoardHtml(html, requestedSubjects);
        if (parsed.length === 0) {
          parsed = parseSuneungMarkdownTable(crawl.markdown, requestedSubjects);
        }
        const entries = filterEntriesByYears(parsed, years);
        if (entries.length === 0 && page > 1) break;
        for (const entry of entries) {
          if (seen.has(entry.fileSeq)) continue;
          seen.add(entry.fileSeq);
          urls.push(entry.downloadUrl);
        }
      } catch {
        if (page > 1) break;
      }
    }

    return urls;
  }
}

class HoraengMirrorConnector implements KnownSourceConnector {
  id = 'horaeng';
  name = '호랭이닷컴 미러';
  priority = 'mirror' as const;

  matches(query: string): boolean {
    return /수능|suneung|기출|csat/i.test(query);
  }

  async resolve(query: string, browserEngine: BrowserEngine, fileDownloader: FileDownloader): Promise<string[]> {
    const intent = parseDownloadIntent(query);
    const urls = [...buildHoraengDirectUrls(intent)];

    for (const listUrl of getKnownListPageUrls(intent)) {
      try {
        const crawl = await browserEngine.fetchPage(listUrl);
        const html = crawl.rawHtml ?? crawl.markdown;
        for (const link of fileDownloader.extractPdfUrls(html, listUrl)) {
          urls.push(link);
        }
      } catch {
        // skip
      }
    }

    return [...new Set(urls)];
  }
}

const CONNECTORS: KnownSourceConnector[] = [
  new SuneungOfficialConnector(),
  new HoraengMirrorConnector(),
];

export async function resolveKnownSources(
  query: string,
  browserEngine: BrowserEngine,
  fileDownloader: FileDownloader
): Promise<KnownSourceMatch[]> {
  const matches: KnownSourceMatch[] = [];

  for (const connector of CONNECTORS) {
    if (!connector.matches(query)) continue;
    const urls = await connector.resolve(query, browserEngine, fileDownloader);
    if (urls.length > 0) {
      matches.push({
        connectorId: connector.id,
        name: connector.name,
        priority: connector.priority,
        urls,
      });
    }
  }

  return matches.sort((a, b) => {
    const rank = { official: 0, list: 1, mirror: 2 };
    return rank[a.priority] - rank[b.priority];
  });
}

/** 수능 공식 기출 항목을 구조화해 리서치 보고에 포함 */
export async function resolveSuneungOfficialEntries(
  query: string,
  browserEngine: BrowserEngine
): Promise<SuneungBoardEntry[]> {
  if (!/수능|suneung|기출|csat/i.test(query)) return [];

  const requestedSubjects = parseRequestedSubjects(query);
  const years = parseYearRangeFromQuery(query);
  const entries: SuneungBoardEntry[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= SUNEUNG_MAX_LIST_PAGES; page++) {
    const listUrl = `${SUNEUNG_OFFICIAL_LIST_BASE}&page=${page}`;
    try {
      const crawl = await browserEngine.fetchPage(listUrl);
      const html = crawl.rawHtml ?? crawl.markdown;
      let parsed = parseSuneungBoardHtml(html, requestedSubjects);
      if (parsed.length === 0) {
        parsed = parseSuneungMarkdownTable(crawl.markdown, requestedSubjects);
      }
      const batch = filterEntriesByYears(parsed, years);
      if (batch.length === 0 && page > 1) break;
      for (const entry of batch) {
        if (seen.has(entry.fileSeq)) continue;
        seen.add(entry.fileSeq);
        entries.push(entry);
      }
    } catch {
      if (page > 1) break;
    }
  }

  return entries;
}

export function formatKnownSourceBrief(
  matches: KnownSourceMatch[],
  suneungEntries: SuneungBoardEntry[] = []
): string {
  const parts: string[] = [];
  if (suneungEntries.length > 0) {
    parts.push(formatSuneungEntriesBrief(suneungEntries));
  }
  for (const match of matches) {
    if (match.urls.length > 0) {
      parts.push(`${match.name}: ${match.urls.length}개 URL`);
    }
  }
  return parts.join('\n');
}

export function flattenKnownSourceUrls(matches: KnownSourceMatch[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const match of matches) {
    for (const url of match.urls) {
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    }
  }
  return urls;
}
