import { useCallback, useState } from 'react';
import { SendIcon, useCeoCommandInput } from '../chat-shared';
import { VoiceMeterOverlay } from '../VoiceMeterOverlay';
import { VoiceMicButton } from '../VoiceMicButton';
import { formatAgentLabel } from '../agent-display';
import { Agent, LlmConnectionStatus } from '../vscode';
import { LlmStatusBar } from '../LlmStatusBar';

const COMMAND_PRESETS = [
  { label: '새 프로젝트 시작', command: '@박준호 새 프로젝트를 기획해 주세요. 목표와 단계별 계획을 제안해 주세요.' },
  { label: '팀 리뷰 요청', command: '@박준호 진행 중인 업무를 검토하고 CEO 보고 초안을 작성해 주세요.' },
  { label: '보고서 생성', command: '@박준호 최근 프로젝트 결과를 종합해 CEO 최종 보고서를 작성해 주세요.' },
  { label: '리스크 분석', command: '@한서준 현재 진행 중인 업무의 리스크와 대응 방안을 조사해 주세요.' },
  { label: '로드맵 수립', command: '@박준호 분기별 AI 회사 운영 로드맵 초안을 작성해 주세요.' },
] as const;

function agentStatusClass(status: string): string {
  if (status === 'working' || status === 'progress') return 'thinking';
  if (status === 'idle') return 'idle';
  return 'online';
}

export function CeoCommandZone({
  agents,
  llmStatus,
  llmChecking,
  onCheckLlm,
  agentPhotos,
}: {
  agents: Agent[];
  llmStatus: LlmConnectionStatus;
  llmChecking: boolean;
  onCheckLlm: () => void;
  agentPhotos?: Record<string, string>;
}) {
  const {
    value,
    setValue,
    handleChange,
    send,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    inputRef,
    filteredAgents,
    showDropdown,
    highlight,
    setHighlight,
    selectAgent,
    voice,
    canSend,
  } = useCeoCommandInput(agents);

  const [dragOver, setDragOver] = useState(false);

  const insertAgentMention = useCallback(
    (agent: Agent) => {
      const prefix = value.trim() ? `${value.trimEnd()} ` : '';
      setValue(`${prefix}@${agent.name} `);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [value, setValue, inputRef]
  );

  const onDragStart = (e: React.DragEvent, agent: Agent) => {
    e.dataTransfer.setData('text/agent-mention', agent.name);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const name = e.dataTransfer.getData('text/agent-mention');
    const agent = agents.find((a) => a.name === name);
    if (agent) insertAgentMention(agent);
  };

  return (
    <section className="ceo-command-zone glass-panel" aria-label="CEO Command Zone">
      <div className="ceo-zone-header">
        <div>
          <h2 className="ceo-zone-title">CEO Command</h2>
          <p className="ceo-zone-sub">
            AI 회사 운영의 핵심 — @에이전트 멘션 후 지시 · <kbd>Enter</kbd> 전송 · <kbd>⌘K</kbd> 팔레트
          </p>
        </div>
        <div className="ceo-zone-presets">
          {COMMAND_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="ceo-preset-btn"
              onClick={() => {
                setValue(preset.command);
                inputRef.current?.focus();
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ceo-zone-body">
        <div
          className={`ceo-zone-input-col ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <textarea
            ref={inputRef}
            className="ceo-zone-textarea"
            rows={3}
            placeholder={
              voice.isRecording
                ? '마이크로 말씀해 주세요…'
                : voice.isProcessing
                  ? '음성 인식 중…'
                  : '@에이전트를 드래그하거나 입력하여 CEO 지시를 내리세요…'
            }
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            readOnly={voice.isRecording || voice.isProcessing}
          />

          <VoiceMeterOverlay voice={voice} />

          {showDropdown && (
            <ul className="ceo-mention-dropdown ceo-zone-dropdown" role="listbox">
              {filteredAgents.length === 0 ? (
                <li className="ceo-mention-option empty">일치하는 에이전트 없음</li>
              ) : (
                filteredAgents.map((agent, index) => (
                  <li
                    key={agent.id}
                    role="option"
                    className={`ceo-mention-option ${index === highlight ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectAgent(agent);
                    }}
                    onMouseEnter={() => setHighlight(index)}
                  >
                    <span className="ceo-mention-option-name">@{agent.name}</span>
                    <span className="ceo-mention-option-role">{formatAgentLabel(agent)}</span>
                  </li>
                ))
              )}
            </ul>
          )}

          <div className="ceo-zone-input-actions">
            <VoiceMicButton voice={voice} />
            <button className="btn-send ceo-zone-send" type="button" onClick={send} disabled={!canSend}>
              <SendIcon />
              <span>전송</span>
            </button>
          </div>

          <div className="ceo-agent-pills">
            <span className="ceo-mention-label">에이전트</span>
            {agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                className={`ceo-agent-pill ${agentStatusClass(agent.status)}`}
                draggable
                onDragStart={(e) => onDragStart(e, agent)}
                onClick={() => insertAgentMention(agent)}
                title="클릭 또는 드래그하여 멘션"
              >
                {agentPhotos?.[agent.id] ? (
                  <img src={agentPhotos[agent.id]} alt="" className="ceo-pill-avatar" />
                ) : (
                  <span className="ceo-pill-initial">{agent.name.charAt(0)}</span>
                )}
                <span className="ceo-pill-name">@{agent.name}</span>
                <span className={`ceo-pill-dot ${agentStatusClass(agent.status)}`} />
              </button>
            ))}
          </div>
        </div>

        <aside className="ceo-zone-preview-col">
          <div className="ceo-preview-card">
            <h3>Preview</h3>
            <p className="ceo-preview-text">
              {value.trim() || '명령을 입력하면 전송 내용이 여기에 표시됩니다.'}
            </p>
            <div className="ceo-preview-meta">
              <span>{value.length}자</span>
              {value.includes('@') && <span className="ceo-preview-mention">멘션 포함</span>}
            </div>
          </div>
          <div className="ceo-llm-compact">
            <LlmStatusBar status={llmStatus} checking={llmChecking} onCheckConnection={onCheckLlm} />
          </div>
        </aside>
      </div>
    </section>
  );
}
