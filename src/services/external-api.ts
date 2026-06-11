import * as vscode from 'vscode';
import { CreateExternalApiInput,
  ExternalApi,
  ExternalApiPublic,
  ExternalApiTestResult,
  UpdateExternalApiInput,
} from '../types/external-api';
import { generateId, now } from '../utils';
import { applyAutoAuth } from '../external-api/auto-detect';
import { formatApiError, getTestProbePath, normalizeStoredApi } from '../external-api/url-normalize';
import { SettingsService } from './settings';

const STORAGE_KEY = 'agentCompany.externalApis';

export class ExternalApiService {
  private settings = new SettingsService();

  constructor(private context: vscode.ExtensionContext) {}

  getAll(): ExternalApi[] {
    return this.context.globalState.get<ExternalApi[]>(STORAGE_KEY, []).map((api) => {
      const normalized = normalizeStoredApi({
        ...api,
        authHeaderName: api.authHeaderName ?? 'X-API-Key',
        authQueryParam: api.authQueryParam ?? 'appid',
      });
      return normalized;
    });
  }

  /** 저장된 OpenWeather URL 등 잘못된 설정 일괄 보정 */
  async migrateStoredApis(): Promise<number> {
    const raw = this.context.globalState.get<ExternalApi[]>(STORAGE_KEY, []);
    let fixed = 0;
    const next = raw.map((api) => {
      const before = JSON.stringify({
        baseUrl: api.baseUrl,
        authType: api.authType,
        authQueryParam: api.authQueryParam,
      });
      const normalized = normalizeStoredApi({
        ...api,
        authHeaderName: api.authHeaderName ?? 'X-API-Key',
        authQueryParam: api.authQueryParam ?? 'appid',
      });
      const after = JSON.stringify({
        baseUrl: normalized.baseUrl,
        authType: normalized.authType,
        authQueryParam: normalized.authQueryParam,
      });
      if (before !== after) fixed++;
      return normalized;
    });
    if (fixed > 0) await this.context.globalState.update(STORAGE_KEY, next);
    return fixed;
  }

  get(id: string): ExternalApi | undefined {
    return this.getAll().find((a) => a.id === id);
  }

  getEnabled(): ExternalApi[] {
    return this.getAll().filter((a) => a.enabled);
  }

  toPublic(api: ExternalApi): ExternalApiPublic {
    return {
      id: api.id,
      name: api.name,
      description: api.description,
      baseUrl: api.baseUrl,
      authType: api.authType,
      authHeaderName: api.authHeaderName,
      authQueryParam: api.authQueryParam,
      maskedApiKey: api.apiKey ? this.settings.maskSecret(api.apiKey) : '',
      hasApiKey: !!api.apiKey,
      defaultHeaders: api.defaultHeaders,
      enabled: api.enabled,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
    };
  }

  getAllPublic(): ExternalApiPublic[] {
    return this.getAll().map((a) => this.toPublic(a));
  }

  async create(input: CreateExternalApiInput): Promise<ExternalApi> {
    const normalized = applyAutoAuth(input);
    const api: ExternalApi = {
      id: generateId(),
      name: normalized.name.trim(),
      description: normalized.description?.trim() ?? '',
      baseUrl: normalized.baseUrl.trim(),
      authType: normalized.authType ?? 'none',
      authHeaderName: normalized.authHeaderName?.trim() || 'X-API-Key',
      authQueryParam: normalized.authQueryParam?.trim() || 'appid',
      apiKey: normalized.apiKey?.trim() ?? '',
      defaultHeaders: input.defaultHeaders?.trim() ?? '{}',
      enabled: input.enabled ?? true,
      createdAt: now(),
      updatedAt: now(),
    };

    await this.save([...this.getAll(), api]);
    return api;
  }

  async update(id: string, input: UpdateExternalApiInput): Promise<ExternalApi | null> {
    const all = this.getAll();
    const index = all.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = all[index];
    const merged = applyAutoAuth({
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      baseUrl: input.baseUrl ?? current.baseUrl,
      authType: input.authType ?? current.authType,
      authHeaderName: input.authHeaderName ?? current.authHeaderName,
      authQueryParam: input.authQueryParam ?? current.authQueryParam,
      apiKey: input.apiKey ?? current.apiKey,
    });

    const updated: ExternalApi = {
      ...current,
      name: merged.name.trim(),
      description: input.description !== undefined ? input.description.trim() : current.description,
      baseUrl: merged.baseUrl.trim(),
      authType: input.authType ?? merged.authType ?? current.authType,
      authHeaderName: merged.authHeaderName?.trim() ?? current.authHeaderName,
      authQueryParam: merged.authQueryParam?.trim() ?? current.authQueryParam,
      apiKey: input.apiKey !== undefined && input.apiKey !== '' ? input.apiKey.trim() : current.apiKey,
      defaultHeaders: input.defaultHeaders !== undefined ? input.defaultHeaders.trim() : current.defaultHeaders,
      enabled: input.enabled ?? current.enabled,
      updatedAt: now(),
    };

    all[index] = updated;
    await this.save(all);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const all = this.getAll();
    const next = all.filter((a) => a.id !== id);
    if (next.length === all.length) return false;
    await this.save(next);
    return true;
  }

  buildHeaders(api: ExternalApi): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json, */*',
      'User-Agent': 'AgentCompany/1.0',
    };

    try {
      const extra = JSON.parse(api.defaultHeaders || '{}') as Record<string, string>;
      Object.assign(headers, extra);
    } catch {
      // ignore invalid JSON
    }

    switch (api.authType) {
      case 'bearer':
        if (api.apiKey) headers.Authorization = `Bearer ${api.apiKey}`;
        break;
      case 'api-key':
        if (api.apiKey) headers[api.authHeaderName || 'X-API-Key'] = api.apiKey;
        break;
      case 'basic':
        if (api.apiKey) headers.Authorization = `Basic ${Buffer.from(api.apiKey).toString('base64')}`;
        break;
      default:
        break;
    }

    return headers;
  }

  resolveUrl(api: ExternalApi, path: string): string {
    const base = api.baseUrl.replace(/\/$/, '');
    const suffix = path.startsWith('http') ? path : path.startsWith('/') ? path : `/${path}`;
    const full = path.startsWith('http') ? path : `${base}${suffix}`;

    if (api.authType !== 'query-param' || !api.apiKey) {
      return full;
    }

    const url = new URL(full);
    url.searchParams.set(api.authQueryParam || 'appid', api.apiKey);
    return url.toString();
  }

  async testConnection(id: string): Promise<ExternalApiTestResult> {
    const api = this.get(id);
    if (!api) {
      return { success: false, message: 'API를 찾을 수 없습니다.' };
    }

    const probePath = getTestProbePath(api);
    const url = this.resolveUrl(api, probePath);
    const started = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(api),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      const latencyMs = Date.now() - started;
      const body = await response.text();

      if (response.ok) {
        return {
          success: true,
          message: probePath
            ? `API 호출 성공 — HTTP ${response.status}`
            : `연결 성공 — HTTP ${response.status}`,
          statusCode: response.status,
          latencyMs,
        };
      }

      return {
        success: false,
        message: formatApiError(response.status, body, api),
        statusCode: response.status,
        latencyMs,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        latencyMs: Date.now() - started,
      };
    }
  }

  async request(
    id: string,
    path = '',
    options?: { method?: string; body?: unknown; headers?: Record<string, string> }
  ): Promise<{ ok: boolean; status: number; data: string }> {
    const api = this.get(id);
    if (!api || !api.enabled) {
      throw new Error('External API not found or disabled');
    }

    const url = this.resolveUrl(api, path);
    const headers = { ...this.buildHeaders(api), ...(options?.headers ?? {}) };

    const response = await fetch(url, {
      method: options?.method ?? 'GET',
      headers:
        options?.body !== undefined
          ? { ...headers, 'Content-Type': 'application/json' }
          : headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(60000),
    });

    const data = await response.text();
    if (!response.ok) {
      throw new Error(formatApiError(response.status, data, api));
    }
    return { ok: response.ok, status: response.status, data };
  }

  private async save(apis: ExternalApi[]): Promise<void> {
    await this.context.globalState.update(STORAGE_KEY, apis);
  }
}

