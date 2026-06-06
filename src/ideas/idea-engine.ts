import { ChatService } from '../chat';
import { AgentFolderEngine } from '../agent-folders';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { SearchEngine } from '../research/webcrawler/search-engine';
import { SearchResult } from '../research/types';
import { CredentialsService } from '../services/credentials';
import { Agent, Task } from '../types';
import { WorkspaceEngine } from '../workspace';

export interface IdeaContext {
  recentTasks: Task[];
  workspaceSummary: string;
  personaSnippet: string;
  companySnippet: string;
  ceoChatHistory: string;
  workHistory: string;
  previousIdeas: string;
}

export interface GeneratedIdea {
  title: string;
  body: string;
}

interface GapAnalysis {
  skip: boolean;
  gap?: string;
  searchQuery?: string;
  angle?: string;
}

interface IdeaDraft {
  title: string;
  body: string;
  references: { title: string; url: string; relevance: string }[];
}

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\])]+/gi;
const GENERIC_ONLY_PATTERNS = [
  /^현재 프로젝트 맥락을 바탕으로/,
  /^대기 중인 업무를 정리/,
  /^이번 주 우선순위/,
  /^진행 중인 태스크 상태를 점검/,
];

export class IdeaEngine {
  private readonly search = new SearchEngine();

  constructor(
    private providers: ProviderEngine,
    private credentials: CredentialsService,
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine,
    private chat?: ChatService,
    private memory?: MemoryEngine
  ) {}

  async buildContext(
    agent: Agent,
    tasks: Task[],
    previousIdeaTitles: string[] = []
  ): Promise<IdeaContext> {
    const recentTasks = tasks
      .filter((t) => t.agentId === agent.id || !t.agentId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 10);

    let personaSnippet = '';
    let companySnippet = '';
    if (this.agentFolders) {
      const slug = this.agentFolders.resolveSlug(agent);
      personaSnippet = (await this.agentFolders.loadPersona(slug)).slice(0, 800);
      companySnippet = (await this.agentFolders.buildCompanyPromptBlock()).slice(0, 800);
    }

    return {
      recentTasks,
      workspaceSummary: await this.summarizeWorkspace(),
      personaSnippet,
      companySnippet,
      ceoChatHistory: this.buildCeoChatHistory(agent.id),
      workHistory: this.buildWorkHistory(agent, tasks),
      previousIdeas:
        previousIdeaTitles.length > 0
          ? previousIdeaTitles.map((t) => `- ${t}`).join('\n')
          : '(이전 제안 없음)',
    };
  }

  async generate(agent: Agent, context: IdeaContext): Promise<GeneratedIdea | null> {
    if (!this.credentials.isOpenAiConfigured()) return null;

    try {
      const analysis = await this.analyzeGaps(agent, context);
      if (!analysis || analysis.skip || !analysis.searchQuery?.trim()) return null;

      const searchResults = await this.search.search(analysis.searchQuery.trim(), 6);
      if (searchResults.length === 0) return null;

      const draft = await this.generateWithReferences(agent, context, analysis, searchResults);
      if (!draft || !this.validateIdea(draft)) return null;

      return { title: draft.title, body: draft.body };
    } catch {
      return null;
    }
  }

  private async analyzeGaps(agent: Agent, context: IdeaContext): Promise<GapAnalysis | null> {
    const response = await this.providers.chat(
      'openai',
      [
        {
          role: 'system',
          content: `You are ${agent.name}, a ${agent.title || agent.role} at AgentCompany.
대표님(CEO)에게 먼저 제안할 아이디어의 "공백"을 분석합니다.

반드시 다음을 검토하세요:
1) CEO와의 대화 기록 — 아직 다루지 않은 요청·우려·기대
2) 지금까지의 태스크·작업 결과 — 빠진 후속 조치, 미완료 맥락
3) 이전에 제안했던 아이디어 — 중복 금지

단순·상투적 제안(예: "태스크 점검해 보세요", "README 업데이트")은 거부하세요.
CEO가 생각하지 못했을 법한 구체적 공백이 없으면 skip=true 로 응답하세요.

JSON만 출력:
{"skip":true}
또는
{"skip":false,"gap":"발견한 공백(한국어)","searchQuery":"실제 사례 검색용 영문/한글 쿼리","angle":"이 프로젝트에 적용할 관점(한국어)"}`,
        },
        {
          role: 'user',
          content: this.buildAnalysisPrompt(agent, context),
        },
      ],
      { type: 'openai', model: this.credentials.getDefaultModel() }
    );

    return parseJson<GapAnalysis>(response.content);
  }

  private async generateWithReferences(
    agent: Agent,
    context: IdeaContext,
    analysis: GapAnalysis,
    searchResults: SearchResult[]
  ): Promise<IdeaDraft | null> {
    const sourcesBlock = searchResults
      .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   요약: ${r.snippet.slice(0, 220)}`)
      .join('\n');

    const response = await this.providers.chat(
      'openai',
      [
        {
          role: 'system',
          content: `You are ${agent.name}, a ${agent.title || agent.role} at AgentCompany.
대표님에게 **근거 있는** 아이디어를 제안합니다.

규칙:
- 아래 웹 검색 결과에서 최소 2개의 **실제 URL**을 인용하세요 (반드시 제공된 URL만 사용)
- 단순 아이디어·막연한 제안 금지 — 공백·근거·실행 방안·사례가 모두 있어야 함
- 한국어, 대표님께 보고하는 톤

JSON만 출력:
{
  "title": "짧은 제목",
  "body": "마크다운 본문 (## 부족했던 점, ## 제안, ## 실제 사례 섹션 포함. 사례에 URL 링크 포함)",
  "references": [{"title":"사례 제목","url":"https://...","relevance":"우리 프로젝트에 주는 시사점"}]
}`,
        },
        {
          role: 'user',
          content: `${this.buildAnalysisPrompt(agent, context)}

## 이번에 발견한 공백
${analysis.gap ?? ''}

## 제안 관점
${analysis.angle ?? ''}

## 웹 검색 결과 (실제 사례 — 이 URL만 인용 가능)
${sourcesBlock}`,
        },
      ],
      { type: 'openai', model: this.credentials.getDefaultModel() }
    );

    const draft = parseJson<IdeaDraft>(response.content);
    if (!draft?.title?.trim() || !draft.body?.trim()) return null;

    draft.title = draft.title.trim();
    draft.body = this.enrichBodyWithReferences(draft.body.trim(), draft.references, searchResults);
    draft.references = normalizeReferences(draft.references, searchResults);

    return draft;
  }

  private buildAnalysisPrompt(agent: Agent, context: IdeaContext): string {
    const taskLines =
      context.recentTasks.length > 0
        ? context.recentTasks.map((t) => `- [${t.status}] ${t.title}`).join('\n')
        : '- (등록된 태스크 없음)';

    return `Role: ${agent.title || agent.role}
Description: ${agent.description.slice(0, 500)}

Company (CEO persona):
${context.companySnippet || '(없음)'}

Persona:
${context.personaSnippet || '(없음)'}

## CEO와의 대화 (최근)
${context.ceoChatHistory}

## 지금까지의 작업·활동
${context.workHistory}

## 최근 태스크 목록
${taskLines}

## 이전에 제안한 아이디어 (중복 금지)
${context.previousIdeas}

## 프로젝트
${context.workspaceSummary}`;
  }

  private buildCeoChatHistory(agentId: string): string {
    if (!this.chat) return '(대화 기록 없음)';

    const threadMsgs = this.chat.getMessages(agentId);
    const allMsgs = this.chat.getMessages();
    const seen = new Set<string>();
    const merged = [...threadMsgs, ...allMsgs.filter((m) => m.type === 'ceo')]
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return m.type === 'ceo' || m.type === 'agent';
      })
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .slice(-24);

    if (merged.length === 0) return '(대화 기록 없음)';

    return merged
      .map((m) => {
        const role = m.type === 'ceo' ? 'CEO' : m.senderName;
        return `[${role}] ${m.content.replace(/\s+/g, ' ').slice(0, 350)}`;
      })
      .join('\n');
  }

  private buildWorkHistory(agent: Agent, tasks: Task[]): string {
    const agentTasks = tasks
      .filter((t) => t.agentId === agent.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 12);

    const taskLines =
      agentTasks.length > 0
        ? agentTasks
            .map((t) => {
              const result = t.result?.trim();
              const resultLine = result ? `\n  결과: ${result.slice(0, 280)}` : '';
              return `- [${t.status}] ${t.title}${resultLine}`;
            })
            .join('\n')
        : '- (이 에이전트에게 할당된 태스크 없음)';

    const activities = this.memory?.getActivitiesByAgent(agent.id, 18) ?? [];
    const activityLines =
      activities.length > 0
        ? activities.map((a) => `- ${a.message.replace(/\s+/g, ' ').slice(0, 220)}`).join('\n')
        : '- (활동 로그 없음)';

    const memorySnippet = this.memory?.getAgentMemory(agent.id).trim().slice(-600);

    return `### 완료·진행 태스크\n${taskLines}\n\n### 활동 로그\n${activityLines}${
      memorySnippet ? `\n\n### 에이전트 메모리 요약\n${memorySnippet}` : ''
    }`;
  }

  private enrichBodyWithReferences(
    body: string,
    references: IdeaDraft['references'] | undefined,
    searchResults: SearchResult[]
  ): string {
    const refs = normalizeReferences(references, searchResults);
    if (refs.length === 0) return body;

    const hasUrl = URL_REGEX.test(body);
    URL_REGEX.lastIndex = 0;
    if (hasUrl) return body;

    const appendix = refs
      .map((r) => `- [${r.title}](${r.url}) — ${r.relevance}`)
      .join('\n');

    if (body.includes('## 실제 사례')) {
      return `${body}\n${appendix}`;
    }
    return `${body}\n\n## 실제 사례\n${appendix}`;
  }

  private validateIdea(draft: IdeaDraft): boolean {
    const body = draft.body.trim();
    if (body.length < 120) return false;

    const urls = [...new Set(body.match(URL_REGEX) ?? [])];
    if (urls.length < 1) return false;

    const refs = normalizeReferences(draft.references, []);
    if (refs.length < 1 && urls.length < 2) return false;

    if (GENERIC_ONLY_PATTERNS.some((p) => p.test(body.slice(0, 80)))) return false;

    const hasSubstance =
      body.includes('##') ||
      (body.includes('부족') && body.includes('제안')) ||
      body.split('\n').filter((l) => l.trim().length > 20).length >= 3;
    return hasSubstance;
  }

  private async summarizeWorkspace(): Promise<string> {
    const root = this.workspace.getWorkspaceRoot();
    if (!root) return '워크스페이스 없음';

    const lines: string[] = [`Root: ${root}`];
    const pkg = await this.workspace.readFile('package.json');
    if (pkg) {
      try {
        const parsed = JSON.parse(pkg) as { name?: string; description?: string };
        if (parsed.name) lines.push(`package: ${parsed.name}`);
        if (parsed.description) lines.push(`desc: ${parsed.description.slice(0, 120)}`);
      } catch {
        lines.push('package.json 존재');
      }
    }

    const hits = await this.workspace.searchProject('TODO', 3);
    if (hits.length > 0) {
      lines.push(`TODO hints: ${hits.map((h) => h.file).join(', ')}`);
    }

    return lines.join('\n');
  }
}

function parseJson<T>(content: string): T | null {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

function normalizeReferences(
  references: IdeaDraft['references'] | undefined,
  searchResults: SearchResult[]
): IdeaDraft['references'] {
  const allowed = new Set(searchResults.map((r) => r.url));
  const normalized: IdeaDraft['references'] = [];

  for (const ref of references ?? []) {
    const url = ref.url?.trim();
    if (!url?.startsWith('http')) continue;
    if (searchResults.length > 0 && !allowed.has(url)) continue;
    normalized.push({
      title: ref.title?.trim() || url,
      url,
      relevance: ref.relevance?.trim() || '참고 사례',
    });
  }

  if (normalized.length === 0 && searchResults.length > 0) {
    return searchResults.slice(0, 3).map((r) => ({
      title: r.title,
      url: r.url,
      relevance: r.snippet.slice(0, 160) || '실제 적용 사례',
    }));
  }

  return normalized;
}
