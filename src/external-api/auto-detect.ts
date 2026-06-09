import { CreateExternalApiInput, ExternalApi, ExternalApiAuthType } from '../types/external-api';
import { normalizeApiInput, normalizeBaseUrl } from './url-normalize';

/** URL·이름 기반 인증 방식 자동 감지 */
export function autoDetectAuth(input: CreateExternalApiInput): {
  authType: ExternalApiAuthType;
  authHeaderName: string;
  authQueryParam: string;
} {
  const hint = `${input.name} ${input.description ?? ''} ${input.baseUrl}`.toLowerCase();
  const url = input.baseUrl.toLowerCase();

  if (/openweather|openweathermap|weather\.gov/.test(url) || /날씨|weather|기상/.test(hint)) {
    return { authType: 'query-param', authHeaderName: 'X-API-Key', authQueryParam: 'appid' };
  }

  if (/newsapi\.org|alphavantage|finnhub/.test(url)) {
    return { authType: 'query-param', authHeaderName: 'X-API-Key', authQueryParam: 'apiKey' };
  }

  if (/stripe\.com|api\.notion|api\.openai|api\.anthropic|github\.com\/api/.test(url)) {
    return { authType: 'bearer', authHeaderName: 'Authorization', authQueryParam: 'appid' };
  }

  if (/slack\.com\/api|discord\.com\/api/.test(url)) {
    return { authType: 'bearer', authHeaderName: 'Authorization', authQueryParam: 'appid' };
  }

  if (input.apiKey && input.authType === 'none') {
    return { authType: 'api-key', authHeaderName: 'X-API-Key', authQueryParam: 'appid' };
  }

  return {
    authType: input.authType ?? 'none',
    authHeaderName: input.authHeaderName?.trim() || 'X-API-Key',
    authQueryParam: input.authQueryParam?.trim() || 'appid',
  };
}

export function applyAutoAuth(input: CreateExternalApiInput): CreateExternalApiInput {
  const withUrl = normalizeApiInput(input);
  const detected = autoDetectAuth(withUrl);
  const userSetAuth = withUrl.authType && withUrl.authType !== 'none';

  return {
    ...withUrl,
    baseUrl: normalizeBaseUrl(withUrl.baseUrl, `${withUrl.name} ${withUrl.description ?? ''}`),
    authType: userSetAuth ? withUrl.authType : detected.authType,
    authHeaderName: withUrl.authHeaderName?.trim() || detected.authHeaderName,
    authQueryParam: withUrl.authQueryParam?.trim() || detected.authQueryParam,
  };
}

export function buildRegistrySummary(apis: ExternalApi[]): string {
  const enabled = apis.filter((a) => a.enabled);
  if (enabled.length === 0) {
    return '[ExternalApiRegistry] 등록된 External API 없음';
  }

  const lines = enabled.map(
    (a, i) =>
      `${i + 1}. **${a.name}** (id: ${a.id})
   - URL: ${a.baseUrl}
   - 설명: ${a.description || '(없음)'}
   - 인증: ${a.authType}${a.authType === 'query-param' ? ` (${a.authQueryParam})` : ''}`
  );

  return `[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

${lines.join('\n\n')}`;
}

export const EXTERNAL_API_REGISTRY_MARKER = '[ExternalApiRegistry';

/** 워크스페이스 파일·폴더 작업 — Kilo/일반 에이전트 처리 */
export function isWorkspaceTask(command: string): boolean {
  return /폴더|디렉|directory|folder|파일|생성|만들|만들어|저장|삭제|이름\s*변경|write|create|mkdir|remove|delete/i.test(
    command
  );
}

/** 코딩·개발 업무 — External API 자동 호출 제외 */
export function isCodeDevTask(command: string): boolean {
  return (
    isWorkspaceTask(command) ||
    /코드|구현|개발|버그|fix|debug|refactor|리팩|컴포넌트|함수|클래스|api\s*추가|api\s*만들|endpoint\s*만들/i.test(
      command
    )
  );
}

/** 리서치·다운로드 — 전용 파이프라인 우선 */
export function isResearchPipelineTask(command: string): boolean {
  return /다운|download|\.pdf|크롤|crawl|리서치|기출|수능\s*pdf/i.test(command);
}

/** 날씨·환율 등 정보 조회 — 파일 전달·PM 계획과 분리 */
export function isInquiryOrApiCommand(command: string): boolean {
  const text = command.trim();
  if (!text) return false;

  if (/날씨|weather|기온|온도|미세먼지|강수|습도|체감/i.test(text)) return true;
  if (/환율|주가|코스피|나스닥|금값|유가|bitcoin|btc/i.test(text)) return true;
  if (/번역|translate/i.test(text)) return true;
  if (/몇\s*시|지금\s*시간|현재\s*시간|타임존/i.test(text)) return true;

  if (
    /(?:알려(?:줘|주(?:세요)?)|말해(?:줘|주(?:세요)?)|알아봐(?:줘|주(?:세요)?)|설명해(?:줘|주(?:세요)?)|요약해(?:줘|주(?:세요)?))/i.test(
      text
    )
  ) {
    return !/(?:파일|pdf|폴더|전달|보내|가져|자료|수능|기출|리포트|outputs?|다운(?:로드|받))/i.test(text);
  }

  return false;
}

export function shouldTryExternalApi(command: string, apis: ExternalApi[]): boolean {
  if (apis.length === 0) return false;
  if (isCodeDevTask(command) || isResearchPipelineTask(command)) return false;

  const lower = command.toLowerCase();

  if (apis.some((a) => lower.includes(a.name.toLowerCase()))) return true;

  if (
    /확인|조회|알려|검색|가져|보여|체크|알아봐|알려줘|날씨|weather|환율|주가|뉴스|번역|조회해|불러/.test(
      command
    )
  ) {
    return true;
  }

  return false;
}
