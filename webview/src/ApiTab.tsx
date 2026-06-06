import { useCallback, useEffect, useState } from 'react';
import { ExternalApiPublic, postMessage } from './vscode';

const AUTH_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'query-param', label: 'Query Param (OpenWeather appid 등)' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'api-key', label: 'API Key (Header)' },
  { value: 'basic', label: 'Basic Auth' },
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

const emptyForm = (): ApiForm => ({
  name: '',
  description: '',
  baseUrl: 'https://',
  authType: 'none',
  authHeaderName: 'X-API-Key',
  authQueryParam: 'appid',
  apiKey: '',
  defaultHeaders: '{}',
  enabled: true,
});

interface ApiTabProps {
  apis: ExternalApiPublic[];
}

export function ApiTab({ apis }: ApiTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ApiForm>(emptyForm);
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

  const startCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
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
    setShowForm(true);
  }, []);

  const cancelForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim() || !form.baseUrl.trim()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      baseUrl: form.baseUrl.trim(),
      authType: form.authType,
      authHeaderName: form.authHeaderName.trim() || 'X-API-Key',
      authQueryParam: form.authQueryParam.trim() || 'appid',
      defaultHeaders: form.defaultHeaders.trim() || '{}',
      enabled: form.enabled,
      ...(form.apiKey ? { apiKey: form.apiKey } : {}),
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

  return (
    <div className="api-tab">
      <div className="section-header">
        <h2>External API</h2>
        <button className="btn-primary btn-sm" type="button" onClick={startCreate}>
          + API 추가
        </button>
      </div>

      <p className="api-tab-desc">
        REST API를 등록하면 에이전트가 <strong>자동으로 연동</strong>합니다.
        OpenWeather는 <code>home.</code> URL 입력 시{' '}
        <code>api.openweathermap.org/data/2.5</code>로 자동 보정됩니다.
        연결 테스트는 실제 API 경로(<code>/weather</code>)로 검증합니다.
      </p>

      {showForm && (
        <section className="settings-section api-form-section">
          <h3>{editingId ? 'API 수정' : '새 API 추가'}</h3>
          <div className="form-panel">
            <label className="field-label">이름 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: Notion API, Slack Webhook"
            />

            <label className="field-label">설명</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="용도 설명 (선택)"
            />

            <label className="field-label">Base URL *</label>
            <input
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="https://api.openweathermap.org/data/2.5"
            />

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
                <p className="api-field-hint">OpenWeatherMap: appid · 기타 API 문서 참고</p>
              </>
            )}

            {form.authType !== 'none' && (
              <>
                <label className="field-label">
                  {form.authType === 'basic' ? 'Credentials (user:pass)' : 'API Key / Token'}
                  {editingId && ' — 비워두면 기존 키 유지'}
                </label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder={form.authType === 'basic' ? 'username:password' : 'sk-...'}
                />
              </>
            )}

            <label className="field-label">추가 Headers (JSON)</label>
            <input
              value={form.defaultHeaders}
              onChange={(e) => setForm({ ...form, defaultHeaders: e.target.value })}
              placeholder='{"Accept-Language": "ko"}'
            />

            <div className="toggle-row">
              <label className="field-label">활성화</label>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              />
            </div>

            <div className="form-actions">
              <button className="btn-primary" type="button" onClick={handleSave}>
                {editingId ? '저장' : '추가'}
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

              {api.hasApiKey && (
                <div className="api-card-key">Key: {api.maskedApiKey}</div>
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
