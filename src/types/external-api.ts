export type ExternalApiAuthType = 'none' | 'bearer' | 'api-key' | 'basic' | 'query-param';

export interface ExternalApi {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  authType: ExternalApiAuthType;
  /** api-key 타입일 때 사용할 헤더명 (기본 X-API-Key) */
  authHeaderName: string;
  /** query-param 타입일 때 쿼리 파라미터명 (기본 appid — OpenWeather 등) */
  authQueryParam: string;
  apiKey: string;
  /** JSON 문자열 — 추가 헤더 */
  defaultHeaders: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExternalApiInput {
  name: string;
  description?: string;
  baseUrl: string;
  authType?: ExternalApiAuthType;
  authHeaderName?: string;
  authQueryParam?: string;
  apiKey?: string;
  defaultHeaders?: string;
  enabled?: boolean;
}

export interface UpdateExternalApiInput {
  name?: string;
  description?: string;
  baseUrl?: string;
  authType?: ExternalApiAuthType;
  authHeaderName?: string;
  authQueryParam?: string;
  apiKey?: string;
  defaultHeaders?: string;
  enabled?: boolean;
}

/** Webview에 노출 (키 마스킹) */
export interface ExternalApiPublic {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  authType: ExternalApiAuthType;
  authHeaderName: string;
  authQueryParam: string;
  maskedApiKey: string;
  hasApiKey: boolean;
  defaultHeaders: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalApiTestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  latencyMs?: number;
}
