import { useCallback, useEffect, useState } from 'react';
import { ExternalApiPublic, postMessage } from './vscode';

const AUTH_TYPES = [
  { value: 'bearer', label: 'Bearer Token (Authorization 헤더)' },
  { value: 'api-key', label: 'API Key (커스텀 헤더)' },
  { value: 'query-param', label: 'Query Param (URL ?appid=…)' },
  { value: 'basic', label: 'Basic Auth (user:pass)' },
  { value: 'none', label: '인증 없음 (공개 API)' },
] as const;

interface ApiForm {
  name: string;
  description: string;
  baseUrl: string;
  authType: string;
  authHeaderName: string;
  authQueryParam: string;
  apiKey: string;
  defaultHeaders: string;
  enabled: boolean;
}

function detectAuth(name: string, description: string, baseUrl: string): {
  authType: string;
  authHeaderName: string;
  authQueryParam: string;
} {
  const hint = `${name} ${description} ${baseUrl}`.toLowerCase();
  const url = baseUrl.toLowerCase();

  if (/openweather|openweathermap|weather\.gov/.test(url) || /날씨|weather|기상/.test(hint)) {
    return { authType: 'query-param', authHeaderName: 'X-API-Key', authQueryParam: 'appid' };
  }
  if (/newsapi\.org|alphavantage|finnhub/.test(url)) {
    return { authType: 'query-param', authHeaderName: 'X-API-Key', authQueryParam: 'apiKey' };
  }
  if (/stripe\.com|api\.notion|api\.openai|api\.anthropic|github\.com\/api/.test(url)) {
    return { authType: 'bearer', authHeaderName: 'Authorization', authQueryParam: 'appid' };
  }
  return { authType: 'bearer', authHeaderName: 'Authorization', authQueryParam: 'appid' };
}

const emptyForm = (): ApiForm => ({
  name: '',
  description: '',
  baseUrl: 'https://',
  authType: 'bearer',
  authHeaderName: 'Authorization',
  authQueryParam: 'appid',
  apiKey: '',
  defaultHeaders: '{}',
  enabled: true,
});

function apiKeyLabel(authType: string): string {
  switch (authType) {
    case 'basic':
      return 'Credentials (username:password) *';
    case 'query-param':
      return 'API Key *';
    case 'bearer':
      return 'Bearer Token / API Key *';
    case 'api-key':
      return 'API Key *';
    default:
      return 'API Key (선택 — 인증 없음 API)';
  }
}

function apiKeyPlaceholder(authType: string): string {
  switch (authType) {
    case 'basic':
      return 'username:password';
    case 'query-param':
      return 'OpenWeather appid, NewsAPI key 등';
    case 'bearer':
      return 'sk-... 또는 Bearer 토큰';
    default:
      return '키가 필요 없으면 비워두세요';
  }
}

interface ApiTabProps {
  apis: ExternalApiPublic[];
}

export function ApiTab({ apis }: ApiTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ApiForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'externalApiTestResult') {
        const { id, success, message, latencyMs } = event.data.payload as {
          id: string;
          success: boolean;
          message: string;
          latencyMs?: number;
        };
        const label = success
          ? `✅ ${message}${latencyMs ? ` (${latencyMs}ms)` : ''}`
          : `❌ ${message}`;
        setTestResults((prev) => ({ ...prev, [id]: label }));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const applyUrlAutoDetect = useCallback((next: ApiForm): ApiForm => {
    if (!next.baseUrl.trim() || next.baseUrl === 'https://') return next;
    const detected = detectAuth(next.name, next.description, next.baseUrl);
    return {
      ...next,
      authType: detected.authType,
      authHeaderName: detected.authHeaderName,
      authQueryParam: detected.authQueryParam,
    };
  }, []);

  const startCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setShowAdvanced(false);
    setShowForm(true);
  }, []);

  const startEdit = useCallback((api: ExternalApiPublic) => {
    setEditingId(api.id);
    setForm({
      name: api.name,
      description: api.description,
      baseUrl: api.baseUrl,
      authType: api.authType,
      authHeaderName: api.authHeaderName,
      authQueryParam: api.authQueryParam ?? 'appid',
      apiKey: '',
      defaultHeaders: api.defaultHeaders || '{}',
      enabled: api.enabled,
    });
    setFormError(null);
    setShowAdvanced(false);
    setShowForm(true);
  }, []);

  const cancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
  }, []);

  const handleSave = useCallback(() => {
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('API 이름을 입력해 주세요.');
      return;
    }
    if (!form.baseUrl.trim() || form.baseUrl === 'https://') {
      setFormError('Base URL을 입력해 주세요.');
      return;
    }
    if (form.authType !== 'none' && !form.apiKey.trim() && !editingId) {
      setFormError('API Key / Token을 입력해 주세요.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      baseUrl: form.baseUrl.trim(),
      authType: form.authType,
      authHeaderName: form.authHeaderName.trim() || 'X-API-Key',
      authQueryParam: form.authQueryParam.trim() || 'appid',
      defaultHeaders: form.defaultHeaders.trim() || '{}',
      enabled: form.enabled,
      ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
    };

    if (editingId) {
      postMessage('updateExternalApi', { id: editingId, ...payload });
    } else {
      postMessage('createExternalApi', payload);
    }
    cancelForm();
  }, [form, editingId, cancelForm]);

  const handleDelete = useCallback((id: string, name: string) => {
    if (window.confirm(`"${name}" API를 삭제할까요?`)) {
      postMessage('deleteExternalApi', { id });
    }
  }, []);

  const handleTest = useCallback((id: string) => {
    setTestResults((prev) => ({ ...prev, [id]: 'Testing...' }));
    postMessage('testExternalApi', { id });
  }, []);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    postMessage('toggleExternalApi', { id, enabled });
  }, []);

  const needsKey = form.authType !== 'none';

  return (
    <div className="api-tab">
      <div className="section-header">
        <h2>External API</h2>
        <button className="btn-primary btn-sm" type="button" onClick={startCreate}>
          + API 추가
        </button>
      </div>

      <p className="api-tab-desc">
        REST API를 등록하면 에이전트가 자동으로 호출합니다. <strong>Base URL</strong>과{' '}
        <strong>API Key</strong>를 입력한 뒤 연결 테스트로 확인하세요.
      </p>

      {showForm && (
        <section className="settings-section api-form-section">
          <h3>{editingId ? 'API 수정' : 'API 연결 설정'}</h3>
          <div className="form-panel">
            <label className="field-label">API 이름 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: OpenWeather, NewsAPI, Notion"
            />

            <label className="field-label">Base URL *</label>
            <input
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              onBlur={() => setForm((prev) => applyUrlAutoDetect(prev))}
              placeholder="https://api.openweathermap.org/data/2.5"
            />
            <p className="api-field-hint">
              URL 입력 후 포커스를 벗어나면 인증 방식을 자동 추천합니다. OpenWeather는{' '}
              <code>home.</code> URL도 자동 보정됩니다.
            </p>

            <label className="field-label">{apiKeyLabel(form.authType)}</label>
            <input
              type="password"
              autoComplete="off"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder={apiKeyPlaceholder(form.authType)}
            />
            {editingId && needsKey && (
              <p className="api-field-hint">비워두면 저장된 기존 키를 유지합니다.</p>
            )}

            <label className="field-label">인증 방식</label>
            <select
              value={form.authType}
              onChange={(e) => setForm({ ...form, authType: e.target.value })}
            >
              {AUTH_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {form.authType === 'api-key' && (
              <>
                <label className="field-label">Header 이름</label>
                <input
                  value={form.authHeaderName}
                  onChange={(e) => setForm({ ...form, authHeaderName: e.target.value })}
                  placeholder="X-API-Key"
                />
              </>
            )}

            {form.authType === 'query-param' && (
              <>
                <label className="field-label">Query Param 이름</label>
                <input
                  value={form.authQueryParam}
                  onChange={(e) => setForm({ ...form, authQueryParam: e.target.value })}
                  placeholder="appid"
                />
                <p className="api-field-hint">
                  OpenWeatherMap: <code>appid</code> · NewsAPI: <code>apiKey</code>
                </p>
              </>
            )}

            <label className="field-label">설명 (선택)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="에이전트가 참고할 용도 설명"
            />

            <button
              type="button"
              className="btn-link api-advanced-toggle"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? '▾ 고급 설정 숨기기' : '▸ 고급 설정 (추가 Headers)'}
            </button>

            {showAdvanced && (
              <>
                <label className="field-label">추가 Headers (JSON)</label>
                <input
                  value={form.defaultHeaders}
                  onChange={(e) => setForm({ ...form, defaultHeaders: e.target.value })}
                  placeholder='{"Accept-Language": "ko"}'
                />
              </>
            )}

            <div className="toggle-row">
              <label className="field-label">활성화</label>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              />
            </div>

            {formError && <p className="api-form-error">{formError}</p>}

            <div className="form-actions">
              <button className="btn-primary" type="button" onClick={handleSave}>
                {editingId ? '저장' : '연결 추가'}
              </button>
              <button className="btn-secondary" type="button" onClick={cancelForm}>
                취소
              </button>
            </div>
          </div>
        </section>
      )}

      {apis.length === 0 && !showForm ? (
        <div className="api-empty">
          <p>등록된 API가 없습니다.</p>
          <button className="btn-secondary" type="button" onClick={startCreate}>
            첫 API 추가하기
          </button>
        </div>
      ) : (
        <ul className="api-list">
          {apis.map((api) => (
            <li key={api.id} className={`api-card ${api.enabled ? '' : 'disabled'}`}>
              <div className="api-card-header">
                <div className="api-card-title">
                  <span className={`api-status-dot ${api.enabled ? 'on' : 'off'}`} />
                  <strong>{api.name}</strong>
                  <span className="api-auth-badge">{api.authType}</span>
                </div>
                <label className="api-toggle" title={api.enabled ? '비활성화' : '활성화'}>
                  <input
                    type="checkbox"
                    checked={api.enabled}
                    onChange={(e) => handleToggle(api.id, e.target.checked)}
                  />
                </label>
              </div>

              {api.description && <p className="api-card-desc">{api.description}</p>}

              <code className="api-card-url">{api.baseUrl}</code>

              {api.authType !== 'none' && (
                <div className="api-card-key">
                  Key: {api.hasApiKey ? api.maskedApiKey : '⚠️ 미설정'}
                </div>
              )}

              {testResults[api.id] && (
                <div className="api-test-result">{testResults[api.id]}</div>
              )}

              <div className="api-card-actions">
                <button className="btn-sm" type="button" onClick={() => handleTest(api.id)}>
                  연결 테스트
                </button>
                <button className="btn-sm" type="button" onClick={() => startEdit(api)}>
                  수정
                </button>
                <button
                  className="btn-sm danger"
                  type="button"
                  onClick={() => handleDelete(api.id, api.name)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
