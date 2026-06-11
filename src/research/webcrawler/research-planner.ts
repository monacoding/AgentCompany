import { AgentFolderEngine } from '../../agent-folders';
import { ProviderEngine } from '../../providers';
import { Agent, ProviderType } from '../../types';
import { isDownloadTask } from './file-downloader';

export interface ResearchPlan {
  goal: string;
  taskType: 'download' | 'research' | 'mixed';
  searchQueries: string[];
  officialUrls: string[];
  notes: string;
}

const MAX_QUERIES = 8;

export class ResearchPlanner {
  constructor(
    private providers: ProviderEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  async plan(query: string, agent: Agent): Promise<ResearchPlan> {
    const knowledge = await this.loadAgentKnowledge(agent, query);
    try {
      const llmPlan = await this.planWithLlm(query, agent, knowledge);
      if (llmPlan.searchQueries.length > 0) {
        return llmPlan;
      }
    } catch {
      // fallback below
    }
    return this.planHeuristic(query, knowledge);
  }

  private async loadAgentKnowledge(agent: Agent, query: string): Promise<string> {
    if (!this.agentFolders) return '';
    const slug = this.agentFolders.resolveSlug(agent);
    const raw = await this.agentFolders.loadKnowledgeSelective(slug, query, agent.role);
    return raw;
  }

  private async planWithLlm(
    query: string,
    agent: Agent,
    knowledge: string
  ): Promise<ResearchPlan> {
    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You are ${agent.name}, an OSINT research planner. Output ONLY valid JSON (no markdown fences).
Schema:
{
  "goal": "one sentence research goal in Korean",
  "taskType": "download" | "research" | "mixed",
  "searchQueries": ["5-8 diverse search strings — Korean and English, include site: for official sources when known"],
  "officialUrls": ["direct URLs to official list pages or documents if known"],
  "notes": "brief strategy note in Korean"
}
Rules:
- Prefer official government/academic sources (go.kr, re.kr, ac.kr, arxiv.org, github.com).
- For 수능/기출: include site:suneung.re.kr and legacy subject names (언어, 수리).
- For 주가/증시/티커: use finance.naver.com, kr.investing.com, finance.yahoo.com, marketwatch.com — NOT sec.gov alone for live prices.
- For PDF tasks: include filetype:pdf variants.
- Never repeat the same query twice.`,
        },
        {
          role: 'user',
          content: `Research request: ${query}

Agent knowledge (use patterns and URLs from here):
${knowledge || '(none)'}`,
        },
      ],
      { type: agent.provider as ProviderType, model: agent.model }
    );

    const parsed = this.parsePlanJson(response.content);
    return this.normalizePlan(parsed, query);
  }

  private parsePlanJson(text: string): Partial<ResearchPlan> {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]) as Partial<ResearchPlan>;
    } catch {
      return {};
    }
  }

  private normalizePlan(parsed: Partial<ResearchPlan>, query: string): ResearchPlan {
    const searchQueries = [...new Set((parsed.searchQueries ?? []).map((q) => q.trim()).filter(Boolean))];
    const officialUrls = [...new Set((parsed.officialUrls ?? []).map((u) => u.trim()).filter(Boolean))];

    if (searchQueries.length === 0) {
      return this.planHeuristic(query, '');
    }

    const plan: ResearchPlan = {
      goal: parsed.goal?.trim() || query,
      taskType: parsed.taskType ?? (isDownloadTask(query) ? 'download' : 'research'),
      searchQueries: searchQueries.slice(0, MAX_QUERIES),
      officialUrls: officialUrls.slice(0, 6),
      notes: parsed.notes?.trim() || '',
    };

    return this.mergeTrustedOfficialUrls(plan, query);
  }

  /** LLM이 잘못된 URL을 넣어도 검증된 공식 출처는 항상 포함 */
  private mergeTrustedOfficialUrls(plan: ResearchPlan, query: string): ResearchPlan {
    const trusted: string[] = [];
    if (/수능|suneung|기출|csat/i.test(query)) {
      trusted.push(
        'https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung'
      );
    }

    if (/주식|주가|코스피|코스닥|나스닥|증시|시세|티커|stock|nasdaq|지수|시장/i.test(query)) {
      const term = extractStockSearchTerm(query);
      if (term) {
        trusted.push(
          `https://finance.naver.com/search/search.naver?query=${encodeURIComponent(term)}`,
          `https://kr.investing.com/search/?q=${encodeURIComponent(term)}`
        );
      }
      if (/미국|나스닥|nasdaq|s&p|dow|장\s*마감/i.test(query)) {
        trusted.push('https://finance.yahoo.com/markets/');
        trusted.push('https://www.marketwatch.com/');
      }
      if (/코스피|코스닥|국내|한국/i.test(query)) {
        trusted.push('https://finance.naver.com/sise/');
      }
    }

    const filtered = plan.officialUrls.filter((url) => !/boardID=147|menuID=247/i.test(url));
    const merged = [...new Set([...trusted, ...filtered])];
    return { ...plan, officialUrls: merged.slice(0, 8) };
  }

  planHeuristic(query: string, knowledge: string): ResearchPlan {
    const queries = new Set<string>();
    const officialUrls: string[] = [];
    const lower = query.toLowerCase();
    const isSuneung = /수능|suneung|기출|csat/.test(lower);
    const isDownload = isDownloadTask(query);

    queries.add(query.trim());

    if (isSuneung) {
      queries.add(`site:suneung.re.kr ${query.replace(/https?:\/\/[^\s]+/gi, '').trim()}`);
      queries.add(`site:suneung.re.kr 기출문제 PDF`);
      officialUrls.push(
        'https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung'
      );
      if (/언어|국어/.test(query)) queries.add('site:suneung.re.kr 언어 기출 PDF');
      if (/수리|수학/.test(query)) queries.add('site:suneung.re.kr 수리 기출 PDF');
    }

    if (isDownload) {
      const cleaned = query
        .replace(/https?:\/\/[^\s]+/gi, '')
        .replace(/다운(?:로드)?(?:받|해)?(?:줘| 주세요|해줘)?/gi, '')
        .trim();
      queries.add(`${cleaned} filetype:pdf`);
      queries.add(`${cleaned} PDF 공식`);
    }

    if (/논문|paper|arxiv/i.test(query)) {
      queries.add(`site:arxiv.org ${query}`);
      queries.add(`${query} academic paper`);
    }

    if (/github|오픈소스|opensource/i.test(query)) {
      queries.add(`site:github.com ${query}`);
    }

    if (/주식|주가|코스피|코스닥|나스닥|증시|시세|티커|stock|nasdaq|지수|시장/i.test(query)) {
      const term = extractStockSearchTerm(query) || query.replace(/[@#].*$/, '').trim();
      queries.add(`${term} 주가 site:finance.naver.com`);
      queries.add(`${term} stock price site:finance.yahoo.com`);
      queries.add(`${term} site:kr.investing.com`);
      if (/미국|나스닥|nasdaq|s&p|dow|장\s*마감/i.test(query)) {
        queries.add('US stock market today site:marketwatch.com');
        queries.add('nasdaq s&p dow jones today');
      }
      if (/코스피|코스닥|국내|한국/i.test(query)) {
        queries.add('코스피 코스닥 지수 site:finance.naver.com');
      }
      officialUrls.push(`https://finance.naver.com/search/search.naver?query=${encodeURIComponent(term)}`);
    }

    if (/통계|kosis|e나라/i.test(query)) {
      queries.add(`site:kosis.kr ${query}`);
      queries.add(`site:index.go.kr ${query}`);
    }

    if (knowledge.includes('suneung.re.kr') && !officialUrls.length) {
      officialUrls.push(
        'https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung'
      );
    }

    const plan: ResearchPlan = {
      goal: query,
      taskType: isDownload ? (isSuneung ? 'mixed' : 'download') : 'research',
      searchQueries: [...queries].slice(0, MAX_QUERIES),
      officialUrls,
      notes: '휴리스틱 플랜 (LLM 미사용 또는 실패 시)',
    };
    return this.mergeTrustedOfficialUrls(plan, query);
  }
}

function extractStockSearchTerm(query: string): string {
  const cleaned = query
    .replace(/@[\uAC00-\uD7A3\w]+/g, '')
    .replace(
      /(?:주식|주가|코스피|코스닥|나스닥|증시|시세|티커|stock|nasdaq|지수|시장|상황|조사|알려(?:줘|주(?:세요)?)|말해(?:줘|주(?:세요)?)|확인(?:해(?:줘|주(?:세요)?)?)?)/gi,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 40);
}
