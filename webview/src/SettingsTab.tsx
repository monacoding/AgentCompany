import { useEffect, useState } from 'react';
import { AppSettings, DashboardData, postMessage } from './vscode';
import { ClipboardInput } from './ClipboardInput';
import { VoiceSettingsSection } from './VoiceSettingsSection';

const PROVIDERS = ['openai', 'anthropic', 'ollama', 'gemini', 'openrouter', 'runpod', 'custom'];

interface SettingsForm {
  defaultProvider: string;
  defaultModel: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  ollamaBaseUrl: string;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  telegramInboundEnabled: boolean;
  proactiveIdeasEnabled: boolean;
  proactiveIdeasIntervalMinutes: number;
}

interface SettingsTabProps {
  settings: DashboardData['settings'];
  version: string;
  availableModels: string[];
}

function fromSettings(settings: AppSettings): SettingsForm {
  return {
    defaultProvider: settings.defaultProvider,
    defaultModel: settings.defaultModel,
    openaiApiKey: '',
    anthropicApiKey: '',
    ollamaBaseUrl: settings.ollamaBaseUrl,
    telegramEnabled: settings.telegramEnabled,
    telegramBotToken: '',
    telegramChatId: settings.telegramChatId,
    telegramInboundEnabled: settings.telegramInboundEnabled ?? true,
    proactiveIdeasEnabled: settings.proactiveIdeasEnabled ?? false,
    proactiveIdeasIntervalMinutes: settings.proactiveIdeasIntervalMinutes ?? 30,
  };
}

export function SettingsTab({ settings, version, availableModels }: SettingsTabProps) {
  const [form, setForm] = useState<SettingsForm>(() => fromSettings(settings));
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [telegramTest, setTelegramTest] = useState<string | null>(null);

  useEffect(() => {
    setForm(fromSettings(settings));
  }, [settings]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'telegramTestResult') {
        const { success, message } = event.data.payload as { success: boolean; message: string };
        setTelegramTest(success ? '✅ Connected' : `❌ ${message}`);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSave = () => {
    const payload: Partial<SettingsForm> = {
      defaultProvider: form.defaultProvider,
      defaultModel: form.defaultModel,
      ollamaBaseUrl: form.ollamaBaseUrl,
      telegramEnabled: form.telegramEnabled,
      telegramChatId: form.telegramChatId,
      telegramInboundEnabled: form.telegramInboundEnabled,
      proactiveIdeasEnabled: form.proactiveIdeasEnabled,
      proactiveIdeasIntervalMinutes: form.proactiveIdeasIntervalMinutes,
    };
    if (form.openaiApiKey) payload.openaiApiKey = form.openaiApiKey;
    if (form.anthropicApiKey) payload.anthropicApiKey = form.anthropicApiKey;
    if (form.telegramBotToken) payload.telegramBotToken = form.telegramBotToken;

    postMessage('updateSettings', payload);
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleTestTelegram = () => {
    setTelegramTest('Testing...');
    const payload: Partial<SettingsForm> = {
      telegramEnabled: form.telegramEnabled,
      telegramChatId: form.telegramChatId,
    };
    if (form.telegramBotToken.trim()) {
      payload.telegramBotToken = form.telegramBotToken.trim();
    }
    postMessage('testTelegram', payload);
  };

  const telegramStatus = settings.telegramStatus;

  const modelOptions =
    availableModels.length > 0
      ? availableModels.includes(form.defaultModel)
        ? availableModels
        : [form.defaultModel, ...availableModels]
      : form.defaultModel
        ? [form.defaultModel]
        : ['gpt-4o'];

  return (
    <div className="settings">
      <div className="section-header">
        <h2>Settings</h2>
        <span className="version-badge">v{version}</span>
      </div>

      <section className="settings-section">
        <h3>LLM Provider</h3>
        <div className="form-panel">
          <label className="field-label">Default Provider</label>
          <select
            value={form.defaultProvider}
            onChange={(e) => setForm({ ...form, defaultProvider: e.target.value })}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <label className="field-label">
            Default Model
            {availableModels.length > 0 && (
              <span className="field-hint"> — API에서 {availableModels.length}개 인식</span>
            )}
          </label>
          <div className="settings-model-row">
            <select
              value={form.defaultModel}
              onChange={(e) => setForm({ ...form, defaultModel: e.target.value })}
            >
              {modelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button type="button" className="btn-sm" onClick={() => postMessage('fetchModels')}>
              모델 새로고침
            </button>
          </div>

          <label className="field-label">
            OpenAI API Key {settings.openaiApiKey ? `(${settings.openaiApiKey})` : ''}
          </label>
          <ClipboardInput
            type="password"
            value={form.openaiApiKey}
            onValueChange={(openaiApiKey) => setForm({ ...form, openaiApiKey })}
            placeholder="Leave empty to keep current"
            pasteLabel="API Key 붙여넣기"
          />

          <label className="field-label">
            Anthropic API Key {settings.anthropicApiKey ? `(${settings.anthropicApiKey})` : ''}
          </label>
          <ClipboardInput
            type="password"
            value={form.anthropicApiKey}
            onValueChange={(anthropicApiKey) => setForm({ ...form, anthropicApiKey })}
            placeholder="Leave empty to keep current"
            pasteLabel="API Key 붙여넣기"
          />

          <label className="field-label">Ollama Base URL</label>
          <input
            value={form.ollamaBaseUrl}
            onChange={(e) => setForm({ ...form, ollamaBaseUrl: e.target.value })}
            placeholder="http://localhost:11434"
          />
        </div>
      </section>

      <VoiceSettingsSection />

      <section className="settings-section">
        <h3>에이전트 아이디어 제안</h3>
        <div className="form-panel">
          <div className="toggle-row">
            <label className="field-label">자동 아이디어 제안</label>
            <input
              type="checkbox"
              checked={form.proactiveIdeasEnabled}
              onChange={(e) => setForm({ ...form, proactiveIdeasEnabled: e.target.checked })}
            />
          </div>
          <label className="field-label">제안 주기 (분)</label>
          <input
            type="number"
            min={5}
            value={form.proactiveIdeasIntervalMinutes}
            onChange={(e) =>
              setForm({
                ...form,
                proactiveIdeasIntervalMinutes: Math.max(5, Number(e.target.value) || 30),
              })
            }
          />
          <p className="panel-hint">
            idle 에이전트가 CEO 대화·작업 이력을 복기해 공백을 찾고, 웹 실제 사례(URL)를 근거로 아이디어를 제안합니다.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <h3>Telegram Notifications</h3>
        <div className="form-panel">
          <div className="toggle-row">
            <label className="field-label">Enable Telegram</label>
            <input
              type="checkbox"
              checked={form.telegramEnabled}
              onChange={(e) => setForm({ ...form, telegramEnabled: e.target.checked })}
            />
          </div>

          <div className="toggle-row">
            <label className="field-label">텔레그램 → CEO 명령 수신</label>
            <input
              type="checkbox"
              checked={form.telegramInboundEnabled}
              onChange={(e) => setForm({ ...form, telegramInboundEnabled: e.target.checked })}
            />
          </div>

          <div className="telegram-status">
            Status:{' '}
            {telegramStatus?.ready
              ? '🟢 Ready'
              : telegramStatus?.enabled
                ? '🟡 Enabled but not configured'
                : '⚪ Disabled'}
          </div>

          <label className="field-label">Bot Token</label>
          <ClipboardInput
            type="password"
            value={form.telegramBotToken}
            onValueChange={(telegramBotToken) => setForm({ ...form, telegramBotToken })}
            placeholder="123456:ABC-DEF..."
            pasteLabel="Bot Token 붙여넣기"
          />

          <label className="field-label">Chat ID</label>
          <ClipboardInput
            value={form.telegramChatId}
            onValueChange={(telegramChatId) => setForm({ ...form, telegramChatId })}
            placeholder="본인 계정 ID (예: 123456789)"
            pasteLabel="Chat ID 붙여넣기"
          />
          <p className="panel-hint">
            1) 텔레그램에서 만든 봇에게 <strong>/start</strong> 전송 → 2) 브라우저에서{' '}
            <code>https://api.telegram.org/bot{'{TOKEN}'}/getUpdates</code> 열기 → 3){' '}
            <code>message.chat.id</code> 값 입력 (봇 ID가 아님). 수신 켜면 봇에게 보낸 메시지가 Cursor CEO 명령으로
            처리됩니다.
          </p>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleTestTelegram}>
              Test Connection
            </button>
            {telegramTest && <span className="test-result">{telegramTest}</span>}
          </div>
        </div>
      </section>

      <div className="settings-footer">
        <button className="btn-primary" onClick={handleSave}>
          Save Settings
        </button>
        {saveStatus && <span className="save-status">{saveStatus}</span>}
      </div>
    </div>
  );
}
