import { AgentFolderEngine } from '../../agent-folders';
import { KnowledgeLearner } from '../../agent-folders/knowledge-learner';
import { ProviderEngine } from '../../providers';
import { WorkspaceEngine } from '../../workspace';
import { Agent } from '../../types';
import { ExtractedContent, ResearchPipelineStep, ResearchReport } from '../types';
import { BrowserEngine, Crawl4AiAdapter } from './browser-engine';
import { Extractor } from './extractor';
import {
  buildDownloadSearchQueries,
  DownloadedFile,
  FileDownloader,
  isDownloadTask,
} from './file-downloader';
import { ReportGenerator } from './report-generator';
import { SearchEngine } from './search-engine';
import { Summarizer } from './summarizer';

export class WebCrawlerAgent {
  private searchEngine = new SearchEngine();
  private crawl4ai = new Crawl4AiAdapter();
  private browserEngine = new BrowserEngine(this.crawl4ai);
  private fileDownloader: FileDownloader;
  private extractor = new Extractor();
  private summarizer: Summarizer;
  private reportGenerator: ReportGenerator;

  constructor(
    private workspace: WorkspaceEngine,
    providers: ProviderEngine,
    reportGenerator: ReportGenerator,
    private agentFolders?: AgentFolderEngine,
    private knowledgeLearner?: KnowledgeLearner
  ) {
    this.fileDownloader = new FileDownloader(workspace, agentFolders);
    this.summarizer = new Summarizer(providers);
    this.reportGenerator = reportGenerator;
  }

  async run(
    query: string,
    agent: Agent,
    onStep?: (step: ResearchPipelineStep) => void
  ): Promise<ResearchReport> {
    if (isDownloadTask(query)) {
      return this.runDownloadPipeline(query, agent, onStep);
    }
    return this.runResearchPipeline(query, agent, onStep);
  }

  private async runDownloadPipeline(
    query: string,
    agent: Agent,
    onStep?: (step: ResearchPipelineStep) => void
  ): Promise<ResearchReport> {
    const emit = (step: string, status: ResearchPipelineStep['status'], message: string) => {
      onStep?.({ step, status, message });
    };

    emit('File Downloader', 'running', 'PDF 다운로드 작업 감지 — 학습된 소스 우선 탐색...');

    const directUrls = this.searchEngine.extractUrlsFromQuery(query);
    const searchQueries = buildDownloadSearchQueries(query);
    const allSearchResults = [];

    for (const q of searchQueries) {
      const results = await this.searchEngine.search(q, 6);
      allSearchResults.push(...results);
    }

    const seen = new Set<string>();
    const uniqueResults = allSearchResults.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    emit('Search Engine', 'done', `${uniqueResults.length}개 결과 수집`);

    const knownCandidates = await this.fileDownloader.resolveKnownSourceCandidates(
      query,
      this.browserEngine
    );
    if (knownCandidates.length > 0) {
      emit(
        'Download Knowledge',
        'done',
        `학습된 소스(호랭이닷컴)에서 ${knownCandidates.length}개 PDF URL 생성`
      );
    }

    let pdfCandidates = [
      ...directUrls.filter((u) => this.fileDownloader.isPdfUrl(u)),
      ...knownCandidates,
      ...(await this.fileDownloader.collectPdfCandidates(uniqueResults, this.browserEngine, {
        prependUrls: knownCandidates,
      })),
    ];

    pdfCandidates = [...new Set(pdfCandidates)];

    emit('File Downloader', 'running', `${pdfCandidates.length}개 PDF 링크 — 다운로드 시도...`);

    const downloadedFiles: DownloadedFile[] = [];
    const failedUrls: string[] = [];
    const maxDownloads = this.fileDownloader.getMaxDownloads(query);

    for (const url of pdfCandidates.slice(0, maxDownloads + 4)) {
      if (downloadedFiles.length >= maxDownloads) break;

      emit('File Downloader', 'running', `다운로드: ${url.slice(0, 60)}...`);
      const result = await this.fileDownloader.downloadPdf(url, query, agent);
      if (result.success && result.file) {
        const alreadySaved = downloadedFiles.some((f) => f.filename === result.file!.filename);
        if (alreadySaved) continue;

        downloadedFiles.push(result.file);
        emit(
          'File Downloader',
          'done',
          `저장: ${result.file.path} (${this.formatSize(result.file.size)})`
        );
      } else {
        failedUrls.push(`${url.slice(0, 80)} — ${result.error ?? 'failed'}`);
      }
    }

    if (downloadedFiles.length === 0) {
      emit('File Downloader', 'failed', 'PDF 다운로드 실패 — 리서치 파이프라인으로 fallback');
      const fallback = await this.runResearchPipeline(query, agent, onStep);
      fallback.summary =
        `⚠️ PDF 파일을 직접 다운로드하지 못했습니다.\n\n` +
        `시도한 링크: ${pdfCandidates.length}개\n` +
        (failedUrls.length > 0 ? `실패: ${failedUrls.slice(0, 3).join('; ')}\n\n` : '') +
        fallback.summary;
      return fallback;
    }

    const file = downloadedFiles[0];
    const summary =
      downloadedFiles.length === 1
        ? `✅ PDF 다운로드 완료\n\n` +
          `- 파일: \`${file.path}\`\n` +
          `- 크기: ${this.formatSize(file.size)}\n` +
          `- URL: ${file.url}\n\n` +
          `agent/wonyoung/outputs/downloads/ 폴더에서 확인하세요.`
        : `✅ PDF ${downloadedFiles.length}개 다운로드 완료\n\n` +
          downloadedFiles
            .map(
              (f, i) =>
                `${i + 1}. \`${f.path}\` (${this.formatSize(f.size)})`
            )
            .join('\n') +
          `\n\n소스: 호랭이닷컴 직링크 (학습된 Download Knowledge)\n` +
          `agent/wonyoung/outputs/downloads/ 폴더에서 확인하세요.`;

    emit('Report Generator', 'running', '리포트 생성...');
    const report = await this.reportGenerator.saveReport(query, summary, [], agent, downloadedFiles);
    emit('Report Generator', 'done', report.reportPath ?? 'Report generated');

    return report;
  }

  private async runResearchPipeline(
    query: string,
    agent: Agent,
    onStep?: (step: ResearchPipelineStep) => void
  ): Promise<ResearchReport> {
    const steps: ResearchPipelineStep[] = [
      { step: 'Search Engine', status: 'pending', message: '' },
      { step: 'Browser Engine', status: 'pending', message: '' },
      { step: 'Extractor', status: 'pending', message: '' },
      { step: 'Summarizer', status: 'pending', message: '' },
      { step: 'Report Generator', status: 'pending', message: '' },
    ];

    const emit = (index: number, status: ResearchPipelineStep['status'], message: string) => {
      steps[index] = { ...steps[index], status, message };
      onStep?.(steps[index]);
    };

    emit(0, 'running', 'Searching...');
    const searchResults = await this.searchEngine.search(query, 5);
    emit(0, 'done', `${searchResults.length} results found`);

    if (searchResults.length === 0) {
      throw new Error('검색 결과가 없습니다. URL을 직접 입력하거나 다른 키워드를 시도해 주세요.');
    }

    emit(1, 'running', 'Crawling pages...');
    const crawl4aiAvailable = await this.crawl4ai.isAvailable();
    const engineLabel = crawl4aiAvailable ? 'Crawl4AI Docker' : 'Jina/Fetch fallback';

    const extracted: ExtractedContent[] = [];
    for (const result of searchResults.slice(0, 3)) {
      try {
        if (this.fileDownloader.isPdfUrl(result.url)) continue;
        const crawl = await this.browserEngine.fetchPage(result.url);
        extracted.push(this.extractor.extract(crawl));
      } catch {
        // skip failed URLs
      }
    }
    emit(1, 'done', `${extracted.length} pages via ${engineLabel}`);

    if (extracted.length === 0) {
      throw new Error('페이지 크롤링에 실패했습니다. Crawl4AI Docker 실행 여부를 확인해 주세요.');
    }

    emit(2, 'running', 'Extracting content...');
    const merged = this.extractor.merge(extracted);
    emit(2, 'done', `${merged.length} chars extracted`);

    emit(3, 'running', 'Summarizing with LLM...');
    const summary = await this.summarizer.summarize(query, extracted, agent);
    emit(3, 'done', 'Summary complete');

    emit(4, 'running', 'Generating report...');
    const report = await this.reportGenerator.saveReport(query, summary, extracted, agent);
    emit(4, 'done', report.reportPath ? `Saved: ${report.reportPath}` : 'Report generated');

    await this.captureExtractedPages(agent, query, extracted, summary);

    return report;
  }

  private async captureExtractedPages(
    agent: Agent,
    query: string,
    extracted: ExtractedContent[],
    summary: string
  ): Promise<void> {
    if (!this.knowledgeLearner) return;

    for (const page of extracted.slice(0, 3)) {
      await this.knowledgeLearner.captureFromWeb(agent, {
        query,
        title: page.title || page.url,
        url: page.url,
        body: page.text.slice(0, 4000),
      });
    }

    if (summary.trim()) {
      await this.knowledgeLearner.captureFromWeb(agent, {
        query,
        title: `Research digest: ${query.slice(0, 50)}`,
        url: extracted[0]?.url ?? 'research-pipeline',
        body: summary,
      });
    }
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
