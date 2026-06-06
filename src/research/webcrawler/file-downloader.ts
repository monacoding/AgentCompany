import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../../agent-folders';
import * as path from 'path';
import { Agent } from '../../types';
import { WorkspaceEngine } from '../../workspace';
import { SearchResult } from '../types';
import { BrowserEngine } from './browser-engine';
import {
  buildHoraengDirectUrls,
  buildKnownSearchQueries,
  DownloadIntent,
  getKnownListPageUrls,
  parseDownloadIntent,
} from './download-knowledge';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface DownloadedFile {
  url: string;
  path: string;
  size: number;
  filename: string;
}

export interface DownloadResult {
  success: boolean;
  file?: DownloadedFile;
  error?: string;
}

export function isDownloadTask(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    /다운|download|받아|저장해|save|내려받|pdf\s*파일|파일\s*받|파일\s*다운|\.pdf/.test(lower) ||
    /\.pdf(\?|$)/i.test(query)
  );
}

export function buildDownloadSearchQueries(query: string): string[] {
  const intent = parseDownloadIntent(query);
  const knownQueries = buildKnownSearchQueries(query, intent);

  const cleaned = query
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/다운(?:로드)?(?:받|해)?(?:줘| 주세요|해줘)?/gi, '')
    .replace(/download/gi, '')
    .replace(/파일\s*(?:받|저장|다운)/gi, '')
    .replace(/저장(?:해)?(?:줘)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const base = cleaned || query;
  const queries = [...knownQueries];
  queries.push(base.includes('PDF') || base.includes('pdf') ? base : `${base} PDF`);
  queries.push(`${base} filetype:pdf`);
  queries.push(`${base} PDF 다운로드`);
  return [...new Set(queries)];
}

export { parseDownloadIntent, type DownloadIntent } from './download-knowledge';

export class FileDownloader {
  constructor(
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  isPdfUrl(url: string): boolean {
    try {
      const pathname = new URL(url).pathname.toLowerCase();
      return pathname.endsWith('.pdf') || /\.pdf(\?|$)/i.test(url);
    } catch {
      return /\.pdf(\?|$)/i.test(url);
    }
  }

  extractPdfUrls(content: string, baseUrl: string): string[] {
    const found = new Set<string>();
    const patterns = [
      /href=["']([^"']+\.pdf[^"']*)["']/gi,
      /href=["']([^"']+\.PDF[^"']*)["']/gi,
      /(https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?)/gi,
    ];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const raw = match[1];
        if (!raw) continue;
        try {
          const resolved = new URL(raw, baseUrl).href;
          if (this.isPdfUrl(resolved)) found.add(resolved);
        } catch {
          // skip invalid
        }
      }
    }

    return [...found];
  }

  async collectPdfCandidates(
    searchResults: SearchResult[],
    browserEngine: BrowserEngine,
    options?: { query?: string; prependUrls?: string[] }
  ): Promise<string[]> {
    const candidates: string[] = [...(options?.prependUrls ?? [])];

    if (options?.query && candidates.length === 0) {
      candidates.push(...(await this.resolveKnownSourceCandidates(options.query, browserEngine)));
    }

    const seen = new Set(candidates);

    for (const result of searchResults) {
      if (this.isPdfUrl(result.url) && !seen.has(result.url)) {
        seen.add(result.url);
        candidates.push(result.url);
      }
    }

    for (const result of searchResults.slice(0, 6)) {
      if (this.isPdfUrl(result.url)) continue;
      try {
        const crawl = await browserEngine.fetchPage(result.url);
        const html = crawl.rawHtml ?? crawl.markdown;
        for (const link of this.extractPdfUrls(html, result.url)) {
          if (!seen.has(link)) {
            seen.add(link);
            candidates.push(link);
          }
        }
      } catch {
        // skip failed pages
      }
    }

    return candidates.slice(0, 24);
  }

  /** 학습된 소스(호랭이닷컴 등)에서 PDF URL 우선 수집 */
  async resolveKnownSourceCandidates(
    query: string,
    browserEngine: BrowserEngine
  ): Promise<string[]> {
    const intent = parseDownloadIntent(query);
    const candidates: string[] = [];

    candidates.push(...buildHoraengDirectUrls(intent));

    for (const listUrl of getKnownListPageUrls(intent)) {
      try {
        const crawl = await browserEngine.fetchPage(listUrl);
        const html = crawl.rawHtml ?? crawl.markdown;
        for (const link of this.extractPdfUrls(html, listUrl)) {
          if (this.matchesIntent(link, intent)) {
            candidates.push(link);
          }
        }
      } catch {
        // list page crawl failed — direct URLs still available
      }
    }

    return [...new Set(candidates)];
  }

  private matchesIntent(url: string, intent: DownloadIntent): boolean {
    if (intent.kind !== 'suneung' || !intent.academicYear) return true;

    const decoded = decodeURIComponent(url);
    const yearTag = `${intent.academicYear}학년도`;
    if (!decoded.includes(yearTag)) return false;

    if (intent.subjects.length === 0) return true;
    return intent.subjects.some((s) => decoded.includes(s));
  }

  getMaxDownloads(query: string): number {
    const intent = parseDownloadIntent(query);
    if (intent.kind === 'suneung' && intent.downloadAll) {
      const types = (intent.includeQuestions ? 1 : 0) + (intent.includeAnswers ? 1 : 0);
      return Math.max(intent.subjects.length * Math.max(types, 1), 4);
    }
    if (intent.subjects.length > 1) {
      return intent.subjects.length * 2;
    }
    return 1;
  }

  async downloadPdf(url: string, query: string, agent: Agent): Promise<DownloadResult> {
    const filename = this.buildFilename(url, query);
    const agentRelative = path.posix.join(AGENT_FOLDER_LAYOUT.outputDownloads, filename);
    const legacyPath = `research/downloads/${filename}`;
    const agentSlug = this.agentFolders?.resolveSlug(agent) ?? 'agent';

    if (this.agentFolders) {
      const viaFetch = await this.downloadViaFetchToAgent(url, agentRelative, agentSlug);
      if (viaFetch.success) return viaFetch;
      const viaCurl = await this.downloadViaCurlToAgent(url, agentRelative, agentSlug);
      if (viaCurl.success) return viaCurl;
      return { success: false, error: viaFetch.error ?? viaCurl.error ?? 'Download failed' };
    }

    const viaFetch = await this.downloadViaFetch(url, legacyPath);
    if (viaFetch.success) return viaFetch;

    const viaCurl = await this.downloadViaCurl(url, legacyPath);
    if (viaCurl.success) return viaCurl;

    return { success: false, error: viaFetch.error ?? viaCurl.error ?? 'Download failed' };
  }

  private async downloadViaFetchToAgent(
    url: string,
    agentRelative: string,
    agentSlug: string
  ): Promise<DownloadResult> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/pdf,application/octet-stream,*/*',
          Referer: new URL(url).origin,
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (!this.isPdfBuffer(buffer)) {
        return { success: false, error: 'Response is not a PDF file' };
      }

      const savedPath = await this.agentFolders!.writeBinary(agentSlug, agentRelative, buffer);
      if (!savedPath) return { success: false, error: 'Failed to save file' };

      return {
        success: true,
        file: {
          url,
          path: savedPath,
          size: buffer.length,
          filename: agentRelative.split('/').pop() ?? 'download.pdf',
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async downloadViaCurlToAgent(
    url: string,
    agentRelative: string,
    agentSlug: string
  ): Promise<DownloadResult> {
    const root = this.agentFolders!.getDisplayPath(agentSlug);
    const fullPath = `${root}/${agentRelative}`.replace(/\\/g, '/');
    const escapedUrl = url.replace(/"/g, '\\"');
    const result = await this.workspace.executeTerminal(
      `mkdir -p "$(dirname "${fullPath}")" && curl -fsSL -L -o "${fullPath}" "${escapedUrl}"`,
      120000
    );

    if (result.exitCode !== 0) {
      return { success: false, error: result.stderr || `curl exit ${result.exitCode}` };
    }

    try {
      const fs = await import('fs/promises');
      const header = Buffer.from(await fs.readFile(fullPath)).slice(0, 8);
      if (!this.isPdfBuffer(header)) {
        await fs.unlink(fullPath);
        return { success: false, error: 'Downloaded file is not a valid PDF' };
      }
      const stat = await fs.stat(fullPath);
      const savedPath = this.agentFolders!.getRelativePath(agentSlug, agentRelative);
      return {
        success: true,
        file: {
          url,
          path: savedPath,
          size: stat.size,
          filename: agentRelative.split('/').pop() ?? filenameFromUrl(url),
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async downloadViaFetch(url: string, relativePath: string): Promise<DownloadResult> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/pdf,application/octet-stream,*/*',
          Referer: new URL(url).origin,
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (!this.isPdfBuffer(buffer)) {
        return { success: false, error: 'Response is not a PDF file' };
      }

      const saved = await this.workspace.writeBinaryFile(relativePath, buffer);
      if (!saved) {
        return { success: false, error: 'Failed to save file to workspace' };
      }

      return {
        success: true,
        file: {
          url,
          path: relativePath,
          size: buffer.length,
          filename: relativePath.split('/').pop() ?? filenameFromUrl(url),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async downloadViaCurl(url: string, relativePath: string): Promise<DownloadResult> {
    const root = this.workspace.getWorkspaceRoot();
    if (!root) {
      return { success: false, error: 'No workspace open' };
    }

    await this.workspace.ensureDirectory('research/downloads');
    const escapedUrl = url.replace(/"/g, '\\"');
    const result = await this.workspace.executeTerminal(
      `curl -fsSL -L -o "${relativePath}" "${escapedUrl}"`,
      120000
    );

    if (result.exitCode !== 0) {
      return { success: false, error: result.stderr || `curl exit ${result.exitCode}` };
    }

    const header = await this.workspace.readBinaryHead(relativePath, 8);
    if (!header || !this.isPdfBuffer(header)) {
      await this.workspace.deleteFile(relativePath);
      return { success: false, error: 'Downloaded file is not a valid PDF' };
    }

    const size = await this.workspace.getFileSize(relativePath);
    return {
      success: true,
      file: {
        url,
        path: relativePath,
        size: size ?? 0,
        filename: relativePath.split('/').pop() ?? filenameFromUrl(url),
      },
    };
  }

  private isPdfBuffer(buffer: Buffer | Uint8Array): boolean {
    if (buffer.length < 4) return false;
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  private buildFilename(url: string, query: string): string {
    const fromUrl = filenameFromUrl(url);
    if (fromUrl && fromUrl !== 'download.pdf') return fromUrl;

    const slug = query
      .slice(0, 50)
      .replace(/[^\w가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    return `${date}-${slug || 'document'}.pdf`;
  }
}

function filenameFromUrl(url: string): string {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
    if (name && /\.pdf$/i.test(name)) return name.replace(/[^\w가-힣.\-()]/g, '_');
  } catch {
    // fallback
  }
  return 'download.pdf';
}
