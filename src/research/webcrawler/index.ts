import { AgentFolderEngine } from '../../agent-folders';
import { KnowledgeLearner } from '../../agent-folders/knowledge-learner';
import { ProviderEngine } from '../../providers';
import { WorkspaceEngine } from '../../workspace';
import { Agent } from '../../types';
import { ExtractedContent, ResearchPipelineStep, ResearchReport, SearchResult } from '../types';
import { BrowserEngine, Crawl4AiAdapter } from './browser-engine';
import { Extractor } from './extractor';
import {
  buildDownloadSearchQueries,
  DownloadedFile,
  FileDownloader,
  isDownloadTask,
} from './file-downloader';
import { flattenKnownSourceUrls, resolveKnownSources } from './known-sources';
import { ReportGenerator } from './report-generator';
import { ResearchPlanner } from './research-planner';
import { SearchEngine } from './search-engine';
import { Summarizer } from './summarizer';

const MAX_CRAWL_PAGES = 8;
const MAX_SEARCH_PER_QUERY = 6;

export class WebCrawlerAgent {
  private searchEngine = new SearchEngine();
  private crawl4ai = new Crawl4AiAdapter();
  private browserEngine = new BrowserEngine(this.crawl4ai);
  private fileDownloader: FileDownloader;
  private extractor = new Extractor();
  private summarizer: Summarizer;
  private reportGenerator: ReportGenerator;
  private planner: ResearchPlanner;

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
    this.planner = new ResearchPlanner(providers, agentFolders);
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

    emit('Research Planner', 'running', '다운로드 전략 수립 중...');
    const plan = await this.planner.plan(query, agent);
    emit('Research Planner', 'done', `목표: ${plan.goal.slice(0, 80)}`);

    emit('File Downloader', 'running', 'PDF 다운로드 — Known Source 우선 탐색...');

    const directUrls = this.searchEngine.extractUrlsFromQuery(query);
    const searchQueries = [
      ...plan.searchQueries,
      ...buildDownloadSearchQueries(query),
    ];
    const uniqueResults = await this.searchEngine.searchMany(
      [...new Set(searchQueries)],
      MAX_SEARCH_PER_QUERY
    );

    const officialResults = this.searchEngine.officialUrlsToResults(plan.officialUrls);
    const allSearchResults = this.mergeSearchResults(uniqueResults, officialResults);

    emit('Search Engine', 'done', `${allSearchResults.length}개 검색 결과 수집`);

    const knownMatches = await resolveKnownSources(query, this.browserEngine, this.fileDownloader);
    const knownCandidates = flattenKnownSourceUrls(knownMatches);

    if (knownCandidates.length > 0) {
      const labels = knownMatches.map((m) => `${m.name}(${m.urls.length})`).join(', ');
      emit('Known Sources', 'done', labels);
    }

    let pdfCandidates = [
      ...directUrls.filter((u) => this.fileDownloader.isPdfUrl(u)),
      ...knownCandidates,
      ...(await this.fileDownloader.collectPdfCandidates(allSearchResults, this.browserEngine, {
        prependUrls: knownCandidates,
      })),
    ];

    pdfCandidates = [...new Set(pdfCandidates)];

    emit('File Downloader', 'running', `${pdfCandidates.length}개 PDF 링크 — 다운로드 시도...`);

    const downloadedFiles: DownloadedFile[] = [];
    const failedUrls: string[] = [];
    const maxDownloads = this.fileDownloader.getMaxDownloads(query);

    for (const url of pdfCandidates.slice(0, maxDownloads + 6)) {
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
      emit('File Downloader', 'failed', 'PDF 직접 다운로드 실패 — 리서치 파이프라인으로 fallback');
      const fallback = await this.runResearchPipeline(query, agent, onStep, plan);
      fallback.summary =
        `⚠️ PDF 파일을 직접 다운로드하지 못했습니다.\n\n` +
        `시도한 링크: ${pdfCandidates.length}개\n` +
        (failedUrls.length > 0 ? `실패: ${failedUrls.slice(0, 3).join('; ')}\n\n` : '') +
        fallback.summary;
      return fallback;
    }

    const sourceLabel =
      knownMatches.find((m) => m.priority === 'official')?.name ??
      knownMatches[0]?.name ??
      '검색·크롤링';

    const file = downloadedFiles[0];
    const summary =
      downloadedFiles.length === 1
        ? `✅ PDF 다운로드 완료\n\n` +
          `- 파일: \`${file.path}\`\n` +
          `- 크기: ${this.formatSize(file.size)}\n` +
          `- URL: ${file.url}\n` +
          `- 소스: ${sourceLabel}\n\n` +
          `outputs/downloads/ 폴더에서 확인하세요.`
        : `✅ PDF ${downloadedFiles.length}개 다운로드 완료\n\n` +
          downloadedFiles
            .map((f, i) => `${i + 1}. \`${f.path}\` (${this.formatSize(f.size)})`)
            .join('\n') +
          `\n\n소스: ${sourceLabel}\n` +
          `outputs/downloads/ 폴더에서 확인하세요.`;

    emit('Report Generator', 'running', '리포트 생성...');
    const report = await this.reportGenerator.saveReport(query, summary, [], agent, downloadedFiles);
    emit('Report Generator', 'done', report.reportPath ?? 'Report generated');

    return report;
  }

  private async runResearchPipeline(
    query: string,
    agent: Agent,
    onStep?: (step: ResearchPipelineStep) => void,
    existingPlan?: Awaited<ReturnType<ResearchPlanner['plan']>>
  ): Promise<ResearchReport> {
    const emit = (step: string, status: ResearchPipelineStep['status'], message: string) => {
      onStep?.({ step, status, message });
    };

    emit('Research Planner', 'running', '조사 전략 수립 중...');
    const plan = existingPlan ?? (await this.planner.plan(query, agent));
    emit('Research Planner', 'done', `${plan.searchQueries.length}개 검색어 · ${plan.officialUrls.length}개 공식 URL`);

    emit('Search Engine', 'running', '다중 검색 실행...');
    let searchResults = await this.collectSearchResults(plan, query);
    emit('Search Engine', 'done', `${searchResults.length}개 결과 (공식 출처 우선 정렬)`);

    if (searchResults.length === 0) {
      emit('Search Engine', 'running', '검색 0건 — 쿼리 변형 재시도...');
      const retryPlan = this.planner.planHeuristic(query, '');
      searchResults = await this.collectSearchResults(retryPlan, query);
      emit('Search Engine', 'done', `재시도: ${searchResults.length}개 결과`);
    }

    if (searchResults.length === 0) {
      throw new Error('검색 결과가 없습니다. URL을 직접 입력하거나 다른 키워드를 시도해 주세요.');
    }

    emit('Browser Engine', 'running', '페이지 크롤링...');
    const crawl4aiAvailable = await this.crawl4ai.isAvailable();
    const engineLabel = crawl4aiAvailable ? 'Crawl4AI Docker' : 'Jina/Fetch fallback';

    let extracted = await this.crawlPages(searchResults, MAX_CRAWL_PAGES);

    if (extracted.length === 0) {
      emit('Browser Engine', 'running', '크롤 실패 — 추가 검색 결과 시도...');
      const extra = await this.crawlPages(searchResults.slice(3, 12), 5);
      extracted = extra;
    }

    emit('Browser Engine', 'done', `${extracted.length}페이지 via ${engineLabel}`);

    if (extracted.length === 0) {
      throw new Error(
        '페이지 크롤링에 실패했습니다. Crawl4AI Docker(localhost:11235) 실행 여부를 확인해 주세요.'
      );
    }

    emit('Extractor', 'done', `${this.extractor.merge(extracted).length} chars extracted`);

    emit('Summarizer', 'running', '교차검증 요약 생성...');
    const summary = await this.summarizer.summarize(query, extracted, agent, plan);
    emit('Summarizer', 'done', 'Summary complete');

    emit('Report Generator', 'running', '리포트 생성...');
    const report = await this.reportGenerator.saveReport(query, summary, extracted, agent);
    emit('Report Generator', 'done', report.reportPath ? `Saved: ${report.reportPath}` : 'Report generated');

    await this.captureExtractedPages(agent, query, extracted, summary);

    return report;
  }

  private async collectSearchResults(
    plan: Awaited<ReturnType<ResearchPlanner['plan']>>,
    query: string
  ): Promise<SearchResult[]> {
    const queries = [...new Set([...plan.searchQueries, query])];
    const fromSearch = await this.searchEngine.searchMany(queries, MAX_SEARCH_PER_QUERY);
    const fromOfficial = this.searchEngine.officialUrlsToResults(plan.officialUrls);
    return this.mergeSearchResults(fromSearch, fromOfficial);
  }

  private mergeSearchResults(a: SearchResult[], b: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const merged: SearchResult[] = [];
    for (const result of [...b, ...a]) {
      if (seen.has(result.url)) continue;
      seen.add(result.url);
      merged.push(result);
    }
    return merged;
  }

  private async crawlPages(results: SearchResult[], limit: number): Promise<ExtractedContent[]> {
    const extracted: ExtractedContent[] = [];

    for (const result of results.slice(0, limit)) {
      try {
        if (this.fileDownloader.isPdfUrl(result.url)) continue;
        const crawl = await this.browserEngine.fetchPage(result.url);
        extracted.push(this.extractor.extract(crawl));
      } catch {
        // skip failed URLs
      }
    }

    return extracted;
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
