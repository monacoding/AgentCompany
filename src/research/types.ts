export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface CrawlResult {
  url: string;
  title: string;
  markdown: string;
  rawHtml?: string;
  source: 'crawl4ai' | 'fetch' | 'jina';
}

export interface ExtractedContent {
  url: string;
  title: string;
  text: string;
  markdown: string;
}

export interface ResearchReport {
  query: string;
  summary: string;
  sources: { title: string; url: string; excerpt: string }[];
  markdown: string;
  reportPath?: string;
  downloadedFiles?: { url: string; path: string; size: number; filename: string }[];
}

export interface ResearchPipelineStep {
  step: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  message: string;
}

export const WONYOUNG_AGENT = {
  name: '원영',
  title: '리서처',
  role: 'researcher' as const,
  description: `Research Agent — OSINT 파이프라인
아키텍처: Planner(LLM+Knowledge) → Multi-Search → Known Sources → Crawl4AI → Cross-Verify → Report
수능 PDF: 평가원 공식(suneung.re.kr) 1순위, outputs/downloads/ 저장`,
  capabilities: ['web-crawl', 'search', 'summarize', 'report', 'download'],
};

export function isWonyoungAgent(agent: { name: string }): boolean {
  return agent.name.includes('원영') || agent.name.toLowerCase() === 'wonyoung';
}

export function isResearchAgent(agent: {
  name: string;
  title?: string;
  role?: string;
  capabilities?: string[];
}): boolean {
  return (
    isWonyoungAgent(agent) ||
    agent.capabilities?.includes('web-crawl') === true ||
    agent.role === 'researcher' ||
    (agent.title?.includes('리서처') ?? false)
  );
}

/** 검색·조사·다운로드 등 실제 리서치 파이프라인이 필요한 명령 */
export function isResearchTaskQuery(query: string): boolean {
  const text = query.trim();
  if (!text) return false;
  return (
    /다운|download|받아|저장해|save|내려받|\.pdf|pdf|파일\s*(?:받|저장|다운)/i.test(text) ||
    /찾|검색|조사|수집|알아봐|확인해|리서치|크롤|탐색|추적|출처|url|https?:\/\//i.test(text) ||
    /수능|기출|논문|github|site:/i.test(text)
  );
}
