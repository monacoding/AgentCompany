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
const KNOWLEDGE_SLICE = 6000;

export class ResearchPlanner {
  constructor(
    private providers: ProviderEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  async plan(query: string, agent: Agent): Promise<ResearchPlan> {
    const knowledge = await this.loadAgentKnowledge(agent);
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

  private async loadAgentKnowledge(agent: Agent): Promise<string> {
    if (!this.agentFolders) return '';
    const slug = this.agentFolders.resolveSlug(agent);
    const raw = await this.agentFolders.loadKnowledge(slug);
    return raw.slice(0, KNOWLEDGE_SLICE);
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

    return {
      goal: parsed.goal?.trim() || query,
      taskType: parsed.taskType ?? (isDownloadTask(query) ? 'download' : 'research'),
      searchQueries: searchQueries.slice(0, MAX_QUERIES),
      officialUrls: officialUrls.slice(0, 6),
      notes: parsed.notes?.trim() || '',
    };
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

    if (/통계|kosis|e나라/i.test(query)) {
      queries.add(`site:kosis.kr ${query}`);
      queries.add(`site:index.go.kr ${query}`);
    }

    if (knowledge.includes('suneung.re.kr') && !officialUrls.length) {
      officialUrls.push(
        'https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung'
      );
    }

    return {
      goal: query,
      taskType: isDownload ? (isSuneung ? 'mixed' : 'download') : 'research',
      searchQueries: [...queries].slice(0, MAX_QUERIES),
      officialUrls,
      notes: '휴리스틱 플랜 (LLM 미사용 또는 실패 시)',
    };
  }
}
