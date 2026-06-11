import { CreateExternalApiInput, ExternalApi } from '../types/external-api';

export const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
export const OPENDART_API_BASE = 'https://opendart.fss.or.kr/api';

export function isOpenDartApi(
  api: Pick<ExternalApi, 'name' | 'baseUrl'> & { description?: string }
): boolean {
  const hint = `${api.name} ${api.description ?? ''} ${api.baseUrl}`.toLowerCase();
  return /opendart|dart\.fss|전자공시|elestock|다트/.test(hint);
}

export function isOpenWeatherApi(
  api: Pick<ExternalApi, 'name' | 'baseUrl'> & { description?: string }
): boolean {
  const hint = `${api.name} ${api.description ?? ''} ${api.baseUrl}`.toLowerCase();
  return /openweather|openweathermap|날씨|weather|기상/.test(hint);
}

/** home.openweathermap.org 등 잘못된 URL → API 엔드포인트로 보정 */
export function normalizeBaseUrl(
  baseUrl: string,
  hint = ''
): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  const lower = `${trimmed} ${hint}`.toLowerCase();

  if (!/openweather|openweathermap|날씨|weather|기상/.test(lower)) {
    return trimmed;
  }

  if (/home\.openweathermap\.org/i.test(trimmed)) {
    return OPENWEATHER_API_BASE;
  }

  if (/^https?:\/\/openweathermap\.org\/?$/i.test(trimmed)) {
    return OPENWEATHER_API_BASE;
  }

  if (/^https?:\/\/api\.openweathermap\.org\/?$/i.test(trimmed)) {
    return OPENWEATHER_API_BASE;
  }

  if (/openweather/i.test(lower) && !trimmed.includes('/data/')) {
    if (/^https?:\/\/api\.openweathermap\.org/i.test(trimmed)) {
      return OPENWEATHER_API_BASE;
    }
  }

  return trimmed;
}

export function normalizeApiInput(input: CreateExternalApiInput): CreateExternalApiInput {
  const hint = `${input.name} ${input.description ?? ''}`;
  return {
    ...input,
    baseUrl: normalizeBaseUrl(input.baseUrl, hint),
  };
}

export function normalizeStoredApi(api: ExternalApi): ExternalApi {
  const hint = `${api.name} ${api.description}`;
  let next = normalizeOpenDartApi(api);
  const baseUrl = normalizeBaseUrl(next.baseUrl, hint);
  if (baseUrl !== next.baseUrl) {
    next = { ...next, baseUrl, updatedAt: new Date().toISOString() };
  }
  return next;
}

/** Open DART — bearer가 아닌 crtfc_key 쿼리 인증 */
export function normalizeOpenDartApi(api: ExternalApi): ExternalApi {
  if (!isOpenDartApi(api)) return api;
  const baseUrl = api.baseUrl.replace(/\/$/, '') || OPENDART_API_BASE;
  if (
    api.authType === 'query-param' &&
    api.authQueryParam === 'crtfc_key' &&
    api.baseUrl === baseUrl
  ) {
    return api;
  }
  return {
    ...api,
    baseUrl,
    authType: 'query-param',
    authQueryParam: 'crtfc_key',
    authHeaderName: api.authHeaderName || 'X-API-Key',
    updatedAt: new Date().toISOString(),
  };
}

/** 연결 테스트용 실제 API 경로 */
export function getTestProbePath(api: ExternalApi): string {
  if (isOpenWeatherApi(api)) {
    return '/weather?q=London,uk&units=metric';
  }
  if (isOpenDartApi(api)) {
    return '/list.json?page_no=1&page_count=1&corp_code=00126380';
  }
  return '';
}

export function formatApiError(
  status: number,
  data: string,
  api?: Pick<ExternalApi, 'name' | 'baseUrl'> & { description?: string }
): string {
  const snippet = data.slice(0, 180).replace(/\s+/g, ' ');

  if (status === 401) {
    if (isOpenDartApi(api ?? { name: '', description: '', baseUrl: '' })) {
      return (
        'Open DART API Key가 유효하지 않습니다 (HTTP 401).\n' +
        '• API 탭 인증: query-param, 파라미터명 crtfc_key\n' +
        '• 발급: https://opendart.fss.or.kr/'
      );
    }
    if (isOpenWeatherApi(api ?? { name: '', description: '', baseUrl: '' })) {
      return (
        'API Key가 유효하지 않습니다.\n' +
        '• OpenWeather API keys 페이지에서 키 확인: https://home.openweathermap.org/api_keys\n' +
        '• 새로 발급한 키는 최대 2시간 후 활성화됩니다\n' +
        '• API 탭에서 Key를 다시 붙여넣어 저장하세요'
      );
    }
    return `API Key가 유효하지 않습니다 (HTTP 401). ${snippet}`;
  }

  if (status === 404) {
    const isHtml = /<!DOCTYPE|<html/i.test(data);
    if (isHtml || (api && isOpenWeatherApi(api))) {
      return (
        `Base URL이 API 엔드포인트가 아닙니다 (HTTP 404).\n` +
        `• OpenWeather: ${OPENWEATHER_API_BASE}\n` +
        (api?.baseUrl ? `• 현재 설정: ${api.baseUrl}` : '')
      );
    }
    return `API 경로를 찾을 수 없습니다 (HTTP 404). ${snippet}`;
  }

  if (status === 429) {
    return 'API 호출 한도를 초과했습니다 (HTTP 429). 잠시 후 다시 시도하세요.';
  }

  return `API 오류 HTTP ${status}: ${snippet}`;
}
