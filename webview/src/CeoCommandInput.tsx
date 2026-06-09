import { SendIcon, useCeoCommandInput } from './chat-shared';
import { VoiceMeterOverlay } from './VoiceMeterOverlay';
import { VoiceMicButton } from './VoiceMicButton';
import { formatAgentLabel } from './agent-display';
import { AgentProfileTile } from './AgentProfileTile';
import { Agent } from './vscode';

export function CeoCommandInput({
  agents,
  agentPhotos,
}: {
  agents: Agent[];
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

  return (
    <section className="ceo-section">
      <label className="ceo-label">CEO Command</label>
      <p className="ceo-hint">
        PM과 계획 확정 후 <code>진행하세요</code> → Project 채팅방 생성 · 즉시 실행: <code>/project</code>
      </p>

      <div className="ceo-input-wrap">
        <div className="ceo-input-row">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              voice.isRecording
                ? '마이크로 말씀해 주세요…'
                : voice.isProcessing
                  ? '음성 인식 중…'
                  : '@ 에이전트 선택 또는 명령 입력...'
            }
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            readOnly={voice.isRecording || voice.isProcessing}
          />
          <VoiceMicButton voice={voice} />
          <button className="btn-send" type="button" onClick={send} disabled={!canSend} title="명령 전송 (Enter)">
            <SendIcon />
          </button>
        </div>

        <VoiceMeterOverlay voice={voice} />

        {showDropdown && (
          <ul className="ceo-mention-dropdown" role="listbox">
            {filteredAgents.length === 0 ? (
              <li className="ceo-mention-option empty">일치하는 에이전트 없음</li>
            ) : (
              filteredAgents.map((agent, index) => (
                <li
                  key={agent.id}
                  role="option"
                  className={`ceo-mention-option ${index === highlight ? 'active' : ''} ${agent.status === 'offline' ? 'offline' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAgent(agent);
                  }}
                  onMouseEnter={() => setHighlight(index)}
                >
                  <AgentProfileTile agent={agent} photoUrl={agentPhotos?.[agent.id]} size="sm" />
                  <div className="ceo-mention-option-text">
                    <span className="ceo-mention-option-name">@{agent.name}</span>
                    <span className="ceo-mention-option-role">{formatAgentLabel(agent)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {!showDropdown && agents.length > 0 && (
        <div className="ceo-mention-hints">
          <span className="ceo-mention-label">@ 로 직접 지정</span>
          <div className="ceo-agent-tiles">
            {agents.map((agent) => (
              <AgentProfileTile
                key={agent.id}
                agent={agent}
                photoUrl={agentPhotos?.[agent.id]}
                size="md"
                disabled={agent.status === 'offline'}
                onClick={() => {
                  setValue(`@${agent.name} `);
                  inputRef.current?.focus();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
