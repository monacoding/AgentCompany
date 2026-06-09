import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SendIcon, useCeoCommandInput } from './chat-shared';
import { VoiceMeterOverlay } from './VoiceMeterOverlay';
import { VoiceMicButton } from './VoiceMicButton';
import {
  formatAgentLabel,
  formatChatSenderName,
  isWorkStartAcknowledgment,
} from './agent-display';
import {
  Agent,
  AgentChatThreadConfig,
  ChatWorkingState,
  ChatTokenUsage,
  CeoChatMessage,
  CollabParticipant,
  postMessage,
} from './vscode';

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatTokenUsageLabel(usage: ChatTokenUsage): string {
  return `${formatTokenCount(usage.totalTokens)} 토큰`;
}

function formatTokenUsageTitle(usage: ChatTokenUsage): string {
  return `입력 ${formatTokenCount(usage.promptTokens)} · 출력 ${formatTokenCount(usage.completionTokens)}`;
}

type CollabAlign = 'left' | 'right';

function resolveCollabAlign(
  senderId: string | null | undefined,
  options?: {
    participants?: CollabParticipant[];
    targetAgentId?: string;
    collabPeerId?: string;
  }
): CollabAlign {
  if (!senderId) return 'left';
  if (options?.targetAgentId && senderId === options.targetAgentId) return 'right';
  if (options?.collabPeerId && senderId === options.collabPeerId) return 'left';
  if (options?.participants?.length) {
    const idx = options.participants.findIndex((p) => p.agentId === senderId);
    if (idx >= 0) return idx % 2 === 0 ? 'left' : 'right';
  }
  return 'left';
}

function collabAlignOptions(config: AgentChatThreadConfig) {
  return {
    participants: config.collabParticipants,
    targetAgentId: config.targetAgentId,
    collabPeerId: config.collabPeerId,
  };
}

function collabTitle(config: AgentChatThreadConfig): string {
  if (config.projectMode) {
    return config.projectTitle ?? config.panelTitle ?? 'Project';
  }
  if (config.collabParticipants?.length) {
    return config.collabParticipants.map((p) => p.displayName).join(' ↔ ');
  }
  const peer = config.collabPeerName ?? '에이전트 A';
  const target = config.agentDisplayName ?? config.agentName ?? '에이전트 B';
  return `${peer} ↔ ${target}`;
}

function collabSubtitle(config: AgentChatThreadConfig, ownerDisplay: string, displayName: string): string {
  if (config.projectMode) {
    return 'Project 협업 · 순차 실행 + 검토 루프';
  }
  if (config.collabMode) {
    return '에이전트 협업 대화 · 관전 모드';
  }
  return `${ownerDisplay} ↔ ${displayName}`;
}

function ProjectParticipantStrip({
  participants,
  leadAgentId,
}: {
  participants: CollabParticipant[];
  leadAgentId?: string;
}) {
  if (participants.length === 0) return null;

  return (
    <div className="project-participant-strip">
      {participants.map((p) => {
        const isLead = p.agentId === leadAgentId;
        return (
          <div
            key={p.agentId}
            className={`project-participant-chip${isLead ? ' is-lead' : ''}`}
            title={p.displayName}
          >
            <AgentAvatar name={p.displayName} photoUrl={p.profilePhotoUrl} size="header" />
            <span className="project-participant-name">{p.displayName}</span>
            {isLead && <span className="project-participant-role">PM</span>}
          </div>
        );
      })}
    </div>
  );
}

function ProjectChatHeader({
  config,
  statusInfo,
  working,
  ownerDisplay,
  displayName,
}: {
  config: AgentChatThreadConfig;
  statusInfo: { kind: string; label: string };
  working: ChatWorkingState | null;
  ownerDisplay: string;
  displayName: string;
}) {
  const storageKey = `project-header-expanded:${config.threadId}`;
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== '0';
    } catch {
      return true;
    }
  });

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div
      className={`project-chat-header-stack${expanded ? ' is-expanded' : ' is-collapsed'}`}
    >
      <div className="project-chat-title-block">
        <div className="ceo-chat-window-title-row">
          <h1 className="project-chat-title">{collabTitle(config)}</h1>
          <span className={`ceo-chat-status-badge ${statusInfo.kind}`}>{statusInfo.label}</span>
        </div>
        <button
          type="button"
          className="project-header-toggle"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? '프로젝트 정보 접기' : '프로젝트 정보 펼치기'}
          title={expanded ? '접기' : '펼치기'}
        >
          <span className="project-header-toggle-icon" aria-hidden>
            {expanded ? '▲' : '▼'}
          </span>
        </button>
      </div>
      {expanded && (
        <>
          {config.collabParticipants && config.collabParticipants.length > 0 && (
            <ProjectParticipantStrip
              participants={config.collabParticipants}
              leadAgentId={config.projectLeadAgentId}
            />
          )}
          <p className="project-chat-subline">{collabSubtitle(config, ownerDisplay, displayName)}</p>
          {working && <p className="ceo-chat-working-detail">{working.content}</p>}
        </>
      )}
    </div>
  );
}

function AgentAvatar({
  name,
  photoUrl,
  size = 'header',
}: {
  name: string;
  photoUrl?: string;
  size?: 'header' | 'bubble';
}) {
  if (photoUrl) {
    return (
      <img
        className={size === 'bubble' ? 'chat-bubble-avatar' : 'ceo-chat-window-avatar'}
        src={photoUrl}
        alt={`${name} 프로필`}
      />
    );
  }
  return (
    <span className={size === 'bubble' ? 'chat-bubble-avatar-fallback' : 'ceo-chat-window-logo'}>
      💬
    </span>
  );
}

function resolveBubblePhoto(
  message: CeoChatMessage,
  emotionPhotos?: Record<string, string>,
  profilePhotoUrl?: string
): string | undefined {
  const emotion =
    message.status === 'working' ? '기본' : (message.emotion ?? '기본');
  return emotionPhotos?.[emotion] ?? emotionPhotos?.['기본'] ?? profilePhotoUrl;
}

function resolveAgentStatusLabel(
  agent: Agent | undefined,
  working: ChatWorkingState | null,
  configStatus: string | undefined,
  messages: CeoChatMessage[],
  config?: AgentChatThreadConfig
): {
  label: string;
  kind: 'working' | 'progress' | 'completed' | 'idle' | 'failed' | 'waiting';
} {
  const status = agent?.status ?? configStatus ?? 'idle';
  const agentName = working?.senderName?.split(' (')[0] ?? agent?.name;

  if (status === 'working') {
    return {
      label: config?.collabMode && agentName ? `${agentName} 작업 중..` : '일하고 있는 중..',
      kind: 'working',
    };
  }
  if (working || status === 'progress') {
    return {
      label: config?.collabMode && agentName ? `${agentName} 업무 중..` : '업무 중..',
      kind: 'progress',
    };
  }
  if (status === 'failed') {
    return { label: '오류 발생', kind: 'failed' };
  }
  if (status === 'waiting') {
    return { label: '확인 대기중', kind: 'waiting' };
  }

  const agentMessageFilter = (m: CeoChatMessage) => {
    if (m.type !== 'agent') return false;
    if (config?.collabMode && config.targetAgentId && m.senderId !== config.targetAgentId) {
      return false;
    }
    return true;
  };

  const lastAgentMessage = [...messages].reverse().find(agentMessageFilter);
  if (lastAgentMessage?.status === 'pending') {
    return {
      label: config?.collabMode && agentName ? `${agentName} 업무 중..` : '업무 중..',
      kind: 'progress',
    };
  }

  const completionFilter = (m: CeoChatMessage) => {
    if (!agentMessageFilter(m) || m.status !== 'done') return false;
    if (m.content.startsWith('[위임]') || m.content.endsWith('도와줄래요?')) return false;
    if (isWorkStartAcknowledgment(m.content)) return false;
    return true;
  };

  const lastAgent = [...messages].reverse().find(completionFilter);
  if (lastAgent) {
    const age = Date.now() - new Date(lastAgent.timestamp).getTime();
    if (age < 120_000) {
      return { label: '업무 완료!', kind: 'completed' };
    }
  }

  if (status === 'review') {
    return { label: '업무 완료!', kind: 'completed' };
  }

  return { label: '대기중', kind: 'idle' };
}

function CollabAvatarGroup({ participants }: { participants: CollabParticipant[] }) {
  const count = participants.length;
  if (count === 0) return null;

  if (count === 2) {
    return (
      <div className="collab-avatar-group collab-avatar-duo">
        <div className="collab-avatar-item">
          <AgentAvatar name={participants[0].displayName} photoUrl={participants[0].profilePhotoUrl} />
          <span className="collab-avatar-label">{participants[0].displayName}</span>
        </div>
        <span className="collab-avatar-sep">↔</span>
        <div className="collab-avatar-item">
          <AgentAvatar name={participants[1].displayName} photoUrl={participants[1].profilePhotoUrl} />
          <span className="collab-avatar-label">{participants[1].displayName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`collab-avatar-group collab-avatar-multi count-${count}`}>
      {participants.map((p) => (
        <div key={p.agentId} className="collab-avatar-item">
          <AgentAvatar name={p.displayName} photoUrl={p.profilePhotoUrl} size="header" />
          <span className="collab-avatar-label">{p.displayName}</span>
        </div>
      ))}
    </div>
  );
}

function buildParticipantPhotoMap(
  participants?: CollabParticipant[]
): Record<string, string> | undefined {
  if (!participants?.length) return undefined;
  const map: Record<string, string> = {};
  for (const p of participants) {
    if (p.profilePhotoUrl) map[p.agentId] = p.profilePhotoUrl;
  }
  return Object.keys(map).length > 0 ? map : undefined;
}

function WorkingStreamPanel({ lines }: { lines: { id: string; text: string }[] }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  if (lines.length === 0) return null;

  return (
    <div className="work-stream-panel" ref={panelRef}>
      {lines.map((line, index) => (
        <div
          key={line.id}
          className={`work-stream-line${index === lines.length - 1 ? ' latest' : ''}`}
        >
          {line.text}
        </div>
      ))}
      <span className="work-stream-cursor" aria-hidden />
    </div>
  );
}

function WorkingIndicator({
  working,
  emotionPhotos,
  profilePhotoUrl,
  participantPhotos,
  collabMode,
  collabOptions,
}: {
  working: ChatWorkingState;
  emotionPhotos?: Record<string, string>;
  profilePhotoUrl?: string;
  participantPhotos?: Record<string, string>;
  collabMode?: boolean;
  collabOptions?: ReturnType<typeof collabAlignOptions>;
}) {
  const photoUrl =
    (working.senderId && participantPhotos?.[working.senderId]) ??
    emotionPhotos?.['기본'] ??
    profilePhotoUrl;
  const align =
    collabMode && working.senderId
      ? resolveCollabAlign(working.senderId, collabOptions)
      : 'left';
  const isRight = align === 'right';
  const rowClass = isRight ? 'chat-bubble-row collab-right' : 'chat-bubble-row collab-left';
  const streamLines =
    working.streamLog && working.streamLog.length > 0
      ? working.streamLog
      : working.content
        ? [{ id: 'fallback', text: working.content }]
        : [];

  const bubble = (
    <div className="chat-bubble agent working chat-working-indicator">
      <div className="chat-bubble-header">
        <span className="chat-sender">{formatChatSenderName(working.senderName)}</span>
        {working.senderRole && <span className="chat-role">{working.senderRole}</span>}
        <span className="chat-status-dot" />
      </div>
      <WorkingStreamPanel lines={streamLines} />
    </div>
  );

  const avatar = <AgentAvatar name={working.senderName} photoUrl={photoUrl} size="bubble" />;

  return (
    <div className={collabMode ? rowClass : 'chat-bubble-row agent'}>
      {collabMode && isRight ? (
        <>
          {bubble}
          {avatar}
        </>
      ) : (
        <>
          {avatar}
          {bubble}
        </>
      )}
    </div>
  );
}

function ChatBubble({
  message,
  emotionPhotos,
  profilePhotoUrl,
  ownerEmotionPhotos,
  ownerProfilePhotoUrl,
  participantPhotos,
  collabMode,
  collabOptions,
  onConfirm,
  onReject,
}: {
  message: CeoChatMessage;
  emotionPhotos?: Record<string, string>;
  profilePhotoUrl?: string;
  ownerEmotionPhotos?: Record<string, string>;
  ownerProfilePhotoUrl?: string;
  participantPhotos?: Record<string, string>;
  collabMode?: boolean;
  collabOptions?: ReturnType<typeof collabAlignOptions>;
  onConfirm: (pendingId: string) => void;
  onReject: (pendingId: string) => void;
}) {
  const isCeo = message.type === 'ceo';
  const isAgent = !isCeo;
  const isWorking = message.status === 'working';
  const participantPhoto =
    message.senderId && participantPhotos?.[message.senderId]
      ? participantPhotos[message.senderId]
      : undefined;
  const bubblePhotoUrl = isAgent
    ? participantPhoto ?? resolveBubblePhoto(message, emotionPhotos, profilePhotoUrl)
    : undefined;
  const ownerPhotoUrl = isCeo
    ? resolveBubblePhoto(message, ownerEmotionPhotos, ownerProfilePhotoUrl)
    : undefined;
  const displayOwnerName = '사장님';
  const collabAlign =
    collabMode && isAgent ? resolveCollabAlign(message.senderId, collabOptions) : null;
  const isCollabRight = collabAlign === 'right';

  const rowClass = isCeo
    ? 'chat-bubble-row ceo'
    : collabMode
      ? isCollabRight
        ? 'chat-bubble-row collab-right'
        : 'chat-bubble-row collab-left'
      : 'chat-bubble-row agent';

  const bubble = (
    <div className={`chat-bubble ${message.type} ${message.status ?? ''}`}>
      <div className="chat-bubble-header">
        <span className="chat-sender">
          {isCeo ? displayOwnerName : formatChatSenderName(message.senderName)}
        </span>
        {message.senderRole && !isCeo && <span className="chat-role">{message.senderRole}</span>}
        {isWorking && <span className="chat-status-dot" />}
      </div>
      <div className="chat-bubble-body">{message.content}</div>
      {isAgent && message.tokenUsage && message.tokenUsage.totalTokens > 0 && (
        <div
          className="chat-bubble-token-usage"
          title={formatTokenUsageTitle(message.tokenUsage)}
        >
          {formatTokenUsageLabel(message.tokenUsage)}
        </div>
      )}
      {message.type === 'confirmation' && message.confirmation && message.status === 'pending' && (
        <div className="chat-confirm-actions">
          <button type="button" className="btn-sm success" onClick={() => onConfirm(message.confirmation!.pendingId)}>
            {message.confirmation.kind === 'file-match'
              ? '예, 이 파일 전달'
              : message.confirmation.kind === 'agent-collab'
                ? `예, ${message.confirmation.agentName}에게 요청`
                : message.confirmation.kind === 'pm-project'
                  ? '진행하세요'
                  : message.confirmation.kind === 'pm-final-task'
                    ? '승인 (비용 확정)'
                    : '예, 진행'}
          </button>
          <button type="button" className="btn-sm" onClick={() => onReject(message.confirmation!.pendingId)}>
            {message.confirmation.kind === 'file-match'
              ? '아니오, 다시 찾기'
              : message.confirmation.kind === 'pm-project'
                ? '수정 요청'
                : message.confirmation.kind === 'pm-final-task'
                  ? '거절 (작업 건너뛰기)'
                  : '아니오'}
          </button>
        </div>
      )}
    </div>
  );

  const agentAvatar = isAgent ? (
    <AgentAvatar name={message.senderName} photoUrl={bubblePhotoUrl} size="bubble" />
  ) : null;

  return (
    <div className={rowClass}>
      {isCeo ? (
        <>
          {bubble}
          <AgentAvatar name={displayOwnerName} photoUrl={ownerPhotoUrl} size="bubble" />
        </>
      ) : collabMode && isCollabRight ? (
        <>
          {bubble}
          {agentAvatar}
        </>
      ) : (
        <>
          {agentAvatar}
          {bubble}
        </>
      )}
    </div>
  );
}

export function CeoChatWindow({ threadConfig }: { threadConfig: AgentChatThreadConfig }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<CeoChatMessage[]>([]);
  const [working, setWorking] = useState<ChatWorkingState | null>(null);
  const [config, setConfig] = useState(threadConfig);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    value,
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
  } = useCeoCommandInput(agents, config.threadId);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'chatMessage') {
        const msg = event.data.payload as CeoChatMessage;
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === msg.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = msg;
            return next;
          }
          return [...prev, msg];
        });
      }
      if (event.data.type === 'chatHistory') {
        setMessages(event.data.payload as CeoChatMessage[]);
      }
      if (event.data.type === 'chatWorking') {
        setWorking((event.data.payload as ChatWorkingState | null) ?? null);
      }
      if (event.data.type === 'threadConfig') {
        setConfig(event.data.payload as AgentChatThreadConfig);
      }
      if (event.data.type === 'dashboardData') {
        const payload = event.data.payload as { agents: Agent[] };
        setAgents(payload.agents ?? []);
      }
    };
    window.addEventListener('message', handler);
    postMessage('ready');
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, working, working?.streamLog?.length]);

  useEffect(() => {
    const id = window.setInterval(() => setConfig((c) => ({ ...c })), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const displayName = config.agentDisplayName ?? formatAgentLabel({ name: config.agentName, title: config.agentTitle });
  const ownerDisplay = '사장님';
  const statusAgentId = config.collabMode ? config.targetAgentId : config.threadId;
  const threadAgent = agents.find((a) => a.id === statusAgentId);
  const statusInfo = resolveAgentStatusLabel(
    threadAgent,
    working,
    config.agentStatus,
    messages,
    config
  );
  const isCollab = !!config.collabMode;
  const collabOptions = collabAlignOptions(config);
  const participantPhotos = buildParticipantPhotoMap(config.collabParticipants);

  return (
    <div className={`ceo-chat-window ${isCollab ? 'collab-mode' : ''}`}>
      <header
        className={`ceo-chat-window-header${config.projectMode ? ' project-chat-header' : ''}`}
      >
        {config.projectMode ? (
          <ProjectChatHeader
            config={config}
            statusInfo={statusInfo}
            working={working}
            ownerDisplay={ownerDisplay}
            displayName={displayName}
          />
        ) : (
          <>
            {isCollab && config.collabParticipants && config.collabParticipants.length > 0 ? (
              <CollabAvatarGroup participants={config.collabParticipants} />
            ) : (
              <AgentAvatar name={displayName} photoUrl={config.profilePhotoUrl} />
            )}
            <div className="ceo-chat-window-header-text">
              <div className="ceo-chat-window-title-row">
                <h1>{isCollab ? collabTitle(config) : displayName}</h1>
                <span className={`ceo-chat-status-badge ${statusInfo.kind}`}>{statusInfo.label}</span>
              </div>
              <p>{collabSubtitle(config, ownerDisplay, displayName)}</p>
              {working && <p className="ceo-chat-working-detail">{working.content}</p>}
            </div>
          </>
        )}
      </header>

      <div className="ceo-chat-window-messages">
        {messages.length === 0 && !working ? (
          <div className="ceo-chat-empty">
            {isCollab
              ? '에이전트 간 대화가 여기에 표시됩니다.'
              : `${displayName}에게 명령을 입력하면 대화가 시작됩니다.`}
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              emotionPhotos={config.emotionPhotos}
              profilePhotoUrl={config.profilePhotoUrl}
              ownerEmotionPhotos={config.ownerEmotionPhotos}
              ownerProfilePhotoUrl={config.ownerProfilePhotoUrl}
              participantPhotos={participantPhotos}
              collabMode={isCollab}
              collabOptions={collabOptions}
              onConfirm={(id) => postMessage('confirmDelegate', { pendingId: id })}
              onReject={(id) => postMessage('rejectDelegate', { pendingId: id })}
            />
          ))
        )}
        {working && (
          <WorkingIndicator
            working={working}
            emotionPhotos={config.emotionPhotos}
            profilePhotoUrl={config.profilePhotoUrl}
            participantPhotos={participantPhotos}
            collabMode={isCollab}
            collabOptions={collabOptions}
          />
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="ceo-chat-window-input">
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
                    : `${displayName}에게 명령 입력...`
              }
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              autoFocus
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
                    className={`ceo-mention-option ${index === highlight ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectAgent(agent);
                    }}
                    onMouseEnter={() => setHighlight(index)}
                  >
                    <span className="ceo-mention-option-name">@{agent.name}</span>
                    <span className="ceo-mention-option-role">{agent.title?.trim() || agent.role}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
