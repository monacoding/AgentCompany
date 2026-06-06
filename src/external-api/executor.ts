import { ExternalApiService } from '../services/external-api';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { AgentFolderEngine } from '../agent-folders';
import { isSecretaryAgent, SECRETARY_SYSTEM_PERSONA } from '../secretary';
import { Agent, Task } from '../types';
import { ExternalApi } from '../types/external-api';
import { shouldTryExternalApi } from './auto-detect';

const CITY_MAP: Record<string, string> = {
  서울: 'Seoul,KR',
  부산: 'Busan,KR',
  인천: 'Incheon,KR',
  대구: 'Daegu,KR',
  대전: 'Daejeon,KR',
  광주: 'Gwangju,KR',
  울산: 'Ulsan,KR',
  제주: 'Jeju,KR',
  수원: 'Suwon,KR',
  파리: 'Paris,FR',
  도쿄: 'Tokyo,JP',
  오사카: 'Osaka,JP',
  베이징: 'Beijing,CN',
  상하이: 'Shanghai,CN',
  홍콩: 'Hong Kong,HK',
  싱가포르: 'Singapore,SG',
  방콕: 'Bangkok,TH',
  뉴욕: 'New York,US',
  로스앤젤레스: 'Los Angeles,US',
  LA: 'Los Angeles,US',
  런던: 'London,GB',
  로마: 'Rome,IT',
  베를린: 'Berlin,DE',
  시드니: 'Sydney,AU',
  두바이: 'Dubai,AE',
};

const EN_CITY_MAP: Record<string, string> = {
  paris: 'Paris,FR',
  tokyo: 'Tokyo,JP',
  osaka: 'Osaka,JP',
  beijing: 'Beijing,CN',
  shanghai: 'Shanghai,CN',
  singapore: 'Singapore,SG',
  bangkok: 'Bangkok,TH',
  'new york': 'New York,US',
  london: 'London,GB',
  rome: 'Rome,IT',
  berlin: 'Berlin,DE',
  sydney: 'Sydney,AU',
  dubai: 'Dubai,AE',
  seoul: 'Seoul,KR',
  busan: 'Busan,KR',
};

/** 날씨 API q 파라미터 추출 — 못 찾으면 null (서울 기본값 사용 금지) */
export function extractWeatherQuery(command: string): string | null {
  for (const [ko, en] of Object.entries(CITY_MAP)) {
    if (command.includes(ko)) return en;
  }

  const lower = command.toLowerCase();
  for (const [name, q] of Object.entries(EN_CITY_MAP)) {
    if (lower.includes(name)) return q;
  }

  const beforeWeather = command.match(
    /(?:^|[@#\s,])([가-힣a-zA-Z][가-힣a-zA-Z\s]{0,20}?)\s*(?:의?\s*)?(?:날씨|weather|기온|온도)/i
  );
  if (beforeWeather) {
    const raw = beforeWeather[1]
      .replace(/^(오늘|내일|지금|현재|today|the)\s+/i, '')
      .trim();
    if (raw.length >= 2 && !/^(비서|ceo|agent)$/i.test(raw)) {
      return raw;
    }
  }

  return null;
}

function buildWeatherPath(command: string): string | null {
  const q = extractWeatherQuery(command);
  if (!q) return null;
  const params = new URLSearchParams({ q, units: 'metric', lang: 'kr' });
  return `/weather?${params.toString()}`;
}

export interface ApiCallPlan {
  useApi: boolean;
  apiId?: string;
  method?: string;
  path?: string;
  reason?: string;
}

export function isExternalApiTask(command: string, apis: ExternalApi[] = []): boolean {
  return shouldTryExternalApi(command, apis);
}

export function matchExternalApi(command: string, apis: ExternalApi[]): ExternalApi | undefined {
  const enabled = apis.filter((a) => a.enabled);
  if (enabled.length === 0) return undefined;

  const lower = command.toLowerCase();

  for (const api of enabled) {
    if (lower.includes(api.name.toLowerCase())) return api;
  }

  if (/날씨|weather|기온/.test(lower)) {
    const weatherApi = enabled.find((a) =>
      /weather|openweather|날씨|기상/i.test(`${a.name} ${a.baseUrl} ${a.description}`)
    );
    if (weatherApi) return weatherApi;
  }

  if (enabled.length === 1) return enabled[0];

  return enabled.find((a) => /weather|openweather/i.test(a.baseUrl)) ?? enabled[0];
}

function isWeatherApi(api: ExternalApi): boolean {
  return /weather|openweather|날씨|기상/i.test(`${api.name} ${api.baseUrl} ${api.description}`);
}

function isWeatherCommand(command: string): boolean {
  return /날씨|weather|기온|온도/.test(command.toLowerCase());
}

export class ExternalApiExecutor {
  constructor(
    private externalApis: ExternalApiService,
    private providers: ProviderEngine,
    private memory: MemoryEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  getRegistryPrompt(): string {
    const apis = this.externalApis.getEnabled();
    if (apis.length === 0) return '';
    return (
      `\n\n## 등록된 External API (자동 연동)\n` +
      apis
        .map((a) => `- ${a.name}: ${a.baseUrl} — ${a.description || '설명 없음'}`)
        .join('\n') +
      `\n데이터 조회·확인 요청은 External API 자동 호출 파이프라인이 처리합니다.`
    );
  }

  async tryAutoExecute(
    agent: Agent,
    task: Task,
    command: string,
    chatContext?: string
  ): Promise<string | null> {
    const apis = this.externalApis.getEnabled();
    if (!shouldTryExternalApi(command, apis)) return null;

    const plan = await this.planApiCall(agent, command, apis, chatContext);
    if (!plan.useApi || !plan.apiId || !plan.path) {
      return null;
    }

    const api = apis.find((a) => a.id === plan.apiId);
    if (!api) return null;

    this.memory.logActivity(
      agent.id,
      task.id,
      `External API 자동 연동: ${api.name} ${plan.method ?? 'GET'} ${plan.path}`
    );

    const result = await this.externalApis.request(api.id, plan.path, {
      method: plan.method ?? 'GET',
    });

    return this.summarizeResponse(agent, command, api, result.data, chatContext);
  }

  async execute(agent: Agent, task: Task, command: string): Promise<string> {
    const result = await this.tryAutoExecute(agent, task, command);
    if (result) return result;
    throw new Error('등록된 External API로 이 요청을 처리할 수 없습니다.');
  }

  private async planApiCall(
    agent: Agent,
    command: string,
    apis: ExternalApi[],
    chatContext?: string
  ): Promise<ApiCallPlan> {
    const heuristic = this.planWithHeuristics(command, apis);
    if (heuristic) return heuristic;

    if (apis.length === 1) {
      const api = apis[0];
      let path: string | null = null;
      if (isWeatherApi(api) && isWeatherCommand(command)) {
        path = buildWeatherPath(command);
      }
      if (!path) {
        path = await this.inferPathWithLlm(agent, command, api, chatContext);
      }
      return { useApi: true, apiId: api.id, method: 'GET', path, reason: 'single API' };
    }

    return this.planWithLlm(agent, command, apis, chatContext);
  }

  private planWithHeuristics(command: string, apis: ExternalApi[]): ApiCallPlan | null {
    const matched = matchExternalApi(command, apis);
    if (!matched) return null;

    if (isWeatherApi(matched) && isWeatherCommand(command)) {
      const path = buildWeatherPath(command);
      if (!path) return null;
      return {
        useApi: true,
        apiId: matched.id,
        method: 'GET',
        path,
        reason: 'weather heuristic',
      };
    }

    return null;
  }

  private async planWithLlm(
    agent: Agent,
    command: string,
    apis: ExternalApi[],
    chatContext?: string
  ): Promise<ApiCallPlan> {
    const catalog = apis
      .map(
        (a) =>
          `- id: ${a.id}, name: ${a.name}, baseUrl: ${a.baseUrl}, auth: ${a.authType}, desc: ${a.description || 'none'}`
      )
      .join('\n');

    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content: `You decide if a CEO command should use a registered External API.
Output ONLY valid JSON:
{"useApi":true,"apiId":"...","method":"GET","path":"/relative/path?query=..."}
or {"useApi":false,"reason":"..."}

Rules:
- useApi:true for data lookup (weather, news, stocks, translation, status checks)
- useApi:false for coding, file editing, research crawl, pdf download
- path is relative to baseUrl (auth key injected automatically — omit appid/apiKey)
- OpenWeather: /weather?q=Seoul,KR&units=metric&lang=kr
- Extract city from the CURRENT command only (ignore previous cities in chat unless the current message is ambiguous)`,
        },
        {
          role: 'user',
          content: `CEO command: ${command}${chatContext ? `\n\nRecent chat:\n${chatContext}` : ''}\n\nRegistered APIs:\n${catalog}`,
        },
      ],
      { type: agent.provider, model: agent.model }
    );

    try {
      const plan = JSON.parse(extractJson(response.content)) as ApiCallPlan;
      if (plan.useApi && plan.apiId && plan.path) {
        plan.path = plan.path.trim();
        if (!plan.path.startsWith('/') && !plan.path.startsWith('?')) {
          plan.path = `/${plan.path}`;
        }
        return plan;
      }
      return { useApi: false, reason: plan.reason ?? 'LLM declined' };
    } catch {
      return { useApi: false, reason: 'plan parse failed' };
    }
  }

  private async inferPathWithLlm(
    agent: Agent,
    command: string,
    api: ExternalApi,
    chatContext?: string
  ): Promise<string> {
    const weatherHint =
      isWeatherApi(api) && isWeatherCommand(command)
        ? '\nFor OpenWeather use /weather?q=City,CountryCode&units=metric&lang=kr — match the city in the CEO request.'
        : '';

    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: 'system',
          content:
            `Output ONLY a relative URL path with query string for HTTP GET. Do NOT include appid/apiKey — auth is automatic.${weatherHint}`,
        },
        {
          role: 'user',
          content: `API: ${api.name} (${api.baseUrl})\nDescription: ${api.description}\nRequest: ${command}${chatContext ? `\nRecent chat:\n${chatContext}` : ''}`,
        },
      ],
      { type: agent.provider, model: agent.model }
    );

    const path = response.content.trim().replace(/^["'`]|["'`]$/g, '');
    return path.startsWith('/') || path.startsWith('?') ? path : `/${path}`;
  }

  private async summarizeResponse(
    agent: Agent,
    command: string,
    api: ExternalApi,
    rawData: string,
    chatContext?: string
  ): Promise<string> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      parsed = rawData.slice(0, 4000);
    }

    const persona = isSecretaryAgent(agent)
      ? SECRETARY_SYSTEM_PERSONA
      : `You are ${agent.name}, a ${agent.role} agent.`;

    const companyBlock = this.agentFolders
      ? await this.agentFolders.buildCompanyPromptBlock()
      : '';
    const systemContent = companyBlock ? `${companyBlock}\n\n${persona}` : persona;

    const response = await this.providers.chat(
      agent.provider,
      [
        { role: 'system', content: systemContent },
        {
          role: 'user',
          content: `CEO 요청: ${command}
${chatContext ? `\n최근 대화:\n${chatContext}\n` : ''}
사용한 API: ${api.name} (${api.baseUrl}) — 자동 연동
API 응답:
${JSON.stringify(parsed, null, 2).slice(0, 6000)}

CEO에게 **지금 받은 API 데이터**로 바로 답변하세요.
- "다시 확인할게요", "잠시만 기다려주세요" 등 재조회 약속 금지
- 요청한 도시/주제와 응답이 맞는지 확인 후 보고
- 비서라면 애교 있고 상냥한 말투 (~요, 대표님)`,
        },
      ],
      { type: agent.provider, model: agent.model }
    );

    return response.content;
  }
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const brace = text.match(/\{[\s\S]*\}/);
  return brace ? brace[0] : text.trim();
}
