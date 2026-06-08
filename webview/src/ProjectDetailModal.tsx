import { Agent, ChatTokenUsage, TeamSession, postMessage } from './vscode';
import { formatAgentLabel } from './agent-display';

const STATUS_LABEL: Record<TeamSession['status'], string> = {
  planning: '계획 중',
  running: '진행 중',
  done: '완료',
  failed: '실패',
};

function formatTokenUsage(usage: ChatTokenUsage | null | undefined): string {
  if (!usage || usage.totalTokens <= 0) return '기록 없음';
  return `${usage.totalTokens.toLocaleString('ko-KR')} (입력 ${usage.promptTokens.toLocaleString('ko-KR')} / 출력 ${usage.completionTokens.toLocaleString('ko-KR')})`;
}

export interface ProjectDetail {
  session: TeamSession;
  agents: Agent[];
  tokenUsage?: ChatTokenUsage | null;
  warehousePath?: string;
  warehouseRelativePath?: string;
}

export function ProjectDetailModal({
  detail,
  onClose,
}: {
  detail: ProjectDetail;
  onClose: () => void;
}) {
  const { session, agents, tokenUsage, warehouseRelativePath } = detail;
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const lead = agentMap.get(session.leadAgentId);
  const members = session.memberAgentIds
    .map((id) => agentMap.get(id))
    .filter(Boolean)
    .map((a) => formatAgentLabel(a!));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel project-detail-modal project-detail-simple" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Project 상세</h2>
            <p className="modal-subtitle">
              {STATUS_LABEL[session.status]}
              {session.phase ? ` · ${session.phase}` : ''}
            </p>
          </div>
          <button type="button" className="btn-icon modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body project-detail-simple-body">
          <section className="project-detail-field">
            <h3>주제</h3>
            <p className="project-detail-value">{session.title}</p>
            {session.ceoCommand && session.ceoCommand !== session.title && (
              <p className="project-detail-subvalue">{session.ceoCommand}</p>
            )}
          </section>

          <section className="project-detail-field">
            <h3>소요 토큰</h3>
            <p className="project-detail-value">{formatTokenUsage(tokenUsage)}</p>
          </section>

          <section className="project-detail-field">
            <h3>참석 에이전트</h3>
            <ul className="project-detail-agents">
              {lead && (
                <li>
                  <span className="project-detail-agent-role">PM</span>
                  {formatAgentLabel(lead)}
                </li>
              )}
              {members.map((name) => (
                <li key={name}>
                  <span className="project-detail-agent-role">팀원</span>
                  {name}
                </li>
              ))}
              {!lead && members.length === 0 && <li className="empty">참여 에이전트 없음</li>}
            </ul>
          </section>

          {warehouseRelativePath && (
            <section className="project-detail-field">
              <h3>산출물 경로</h3>
              <p className="project-detail-path">{warehouseRelativePath}</p>
            </section>
          )}
        </div>

        <div className="company-modal-footer">
          <div className="company-modal-footer-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={() => postMessage('openProjectWarehouse', { sessionId: session.id })}
            >
              아웃풋 경로 열기
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
