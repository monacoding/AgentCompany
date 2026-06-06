import { LlmConnectionStatus, postMessage } from './vscode';

interface LlmStatusBarProps {
  status: LlmConnectionStatus;
  checking: boolean;
  onCheckConnection: () => void;
}

export function LlmStatusBar({ status, checking, onCheckConnection }: LlmStatusBarProps) {
  const dotClass = checking
    ? 'checking'
    : status.connected
      ? 'connected'
      : status.configured
        ? 'configured'
        : 'disconnected';

  const statusLabel = checking
    ? '확인 중...'
    : status.connected
      ? '연결됨'
      : status.configured
        ? '설정됨 (미연결)'
        : '미설정';

  const models = status.availableModels?.length
    ? status.availableModels
    : ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  const handleModelChange = (model: string) => {
    postMessage('selectModel', { model });
  };

  const handleRefreshModels = () => {
    postMessage('fetchModels');
  };

  return (
    <section className="llm-status-bar">
      <div className="llm-status-main">
        <div className="llm-status-indicator">
          <span className={`llm-dot ${dotClass}`} />
          <div className="llm-status-text">
            <span className="llm-provider">{status.provider.toUpperCase()}</span>
            <span className="llm-connection">{statusLabel}</span>
          </div>
        </div>
        <div className="llm-status-actions">
          <select
            className="llm-model-select"
            value={status.model}
            onChange={(e) => handleModelChange(e.target.value)}
            title={
              status.connected
                ? `API에서 인식한 ChatGPT/LLM 모델 ${models.length}개`
                : 'ChatGPT 모델 선택'
            }
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button type="button" className="btn-sm" onClick={handleRefreshModels} title="API에서 모델 목록 다시 불러오기">
            모델
          </button>
          <button className="btn-sm" onClick={onCheckConnection} disabled={checking}>
            연결 확인
          </button>
          {!status.envFileExists && (
            <button className="btn-sm" onClick={() => postMessage('createEnvFile')}>
              .env 생성
            </button>
          )}
          {status.envFileExists && (
            <button className="btn-sm" onClick={() => postMessage('openEnvFile')}>
              .env 열기
            </button>
          )}
        </div>
      </div>
      <div className="llm-status-detail">
        {status.maskedKey && <span className="llm-key">Key: {status.maskedKey}</span>}
        <span className="llm-message">{status.message}</span>
        {status.connected && models.length > 0 && (
          <span className="llm-source">· 선택 가능 {models.length}개</span>
        )}
        {status.keySource === 'env' && <span className="llm-source">(.env)</span>}
      </div>
      {status.provider === 'openai' && status.openAiBilling && (
        <div className="llm-billing-row">
          <span className="llm-billing-label">OpenAI Billing</span>
          {status.openAiBilling.monthUsageAvailable &&
            status.openAiBilling.monthUsageUsd !== undefined && (
              <span className="llm-billing-usage">
                이번 달 사용 ${status.openAiBilling.monthUsageUsd.toFixed(2)}
              </span>
            )}
          <span className="llm-billing-hint">{status.openAiBilling.hint}</span>
          <button
            type="button"
            className="btn-sm llm-billing-link"
            onClick={() =>
              postMessage('openOpenAiBilling', { url: status.openAiBilling!.dashboardUrl })
            }
            title="OpenAI 대시보드에서 잔액·크레딧 확인"
          >
            대시보드
          </button>
        </div>
      )}
    </section>
  );
}
