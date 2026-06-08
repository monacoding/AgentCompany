import { Agent, CeoChatMessage, ProjectArtifact, TeamSession, postMessage } from './vscode';
import { formatAgentLabel } from './agent-display';

const STATUS_LABEL: Record<TeamSession['status'], string> = {
  planning: '계획 중',
  running: '진행 중',
  done: '완료',
  failed: '실패',
};

const ARTIFACT_KIND: Record<ProjectArtifact['kind'], string> = {
  task: '태스크',
  summary: 'PM 보고',
  file: '추출 파일',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export interface ProjectDetail {
  session: TeamSession;
  messages: CeoChatMessage[];
  agents: Agent[];
  artifacts?: ProjectArtifact[];
}

export function ProjectDetailModal({
  detail,
  onClose,
  onOpenChat,
}: {
  detail: ProjectDetail;
  onClose: () => void;
  onOpenChat: () => void;
}) {
  const { session, messages, agents, artifacts = [] } = detail;
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const lead = agentMap.get(session.leadAgentId);
  const members = session.memberAgentIds
    .map((id) => agentMap.get(id))
    .filter(Boolean)
    .map((a) => formatAgentLabel(a!))
    .join(', ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel project-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{session.title}</h2>
            <p className="modal-subtitle">
              {STATUS_LABEL[session.status]}
              {session.phase ? ` · ${session.phase}` : ''} · PM: {lead ? formatAgentLabel(lead) : '—'} · 팀원:{' '}
              {members || '—'}
            </p>
          </div>
          <button type="button" className="btn-icon modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {session.plan && (
            <section className="worklog-section">
              <h3>PM 계획</h3>
              <pre className="project-detail-pre">{session.plan}</pre>
            </section>
          )}

          {session.summary && (
            <section className="worklog-section">
              <h3>결과 / 보고</h3>
              <pre className="project-detail-pre project-detail-result">{session.summary}</pre>
            </section>
          )}

          <section className="worklog-section">
            <h3>산출물 WareHouse ({artifacts.length})</h3>
            {artifacts.length === 0 ? (
              <p className="empty">저장된 산출물이 없습니다.</p>
            ) : (
              <ul className="project-artifact-list">
                {artifacts.map((art) => (
                  <li key={art.absolutePath} className="project-artifact-item">
                    <button
                      type="button"
                      className="project-artifact-btn"
                      onClick={() =>
                        postMessage('openProjectArtifact', { absolutePath: art.absolutePath })
                      }
                    >
                      <span className="project-artifact-name">{art.name}</span>
                      <span className="project-artifact-meta">
                        {ARTIFACT_KIND[art.kind]} · {formatSize(art.sizeBytes)}
                      </span>
                      <span className="project-artifact-path">{art.relativePath}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="worklog-section">
            <h3>채팅 기록 ({messages.length})</h3>
            {messages.length === 0 ? (
              <p className="empty">채팅 기록이 없습니다.</p>
            ) : (
              <div className="project-chat-log">
                {messages.map((msg) => (
                  <div key={msg.id} className={`project-chat-line project-chat-${msg.type}`}>
                    <span className="project-chat-sender">{msg.senderName}</span>
                    <span className="project-chat-time">
                      {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <p className="project-chat-content">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="company-modal-footer">
          <div className="company-modal-footer-buttons">
            <button type="button" className="btn-primary" onClick={onOpenChat}>
              Project 채팅방 열기
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
