import { Agent, TeamSession, postMessage } from './vscode';
import { formatAgentLabel } from './agent-display';

const STATUS_LABEL: Record<TeamSession['status'], string> = {
  planning: '계획 중',
  running: '진행 중',
  done: '완료',
  failed: '실패',
};

const STATUS_CLASS: Record<TeamSession['status'], string> = {
  planning: 'project-status-planning',
  running: 'project-status-running',
  done: 'project-status-done',
  failed: 'project-status-failed',
};

const PHASE_LABEL: Record<string, string> = {
  planning: 'Planning',
  executing: 'Executing',
  reviewing: 'Reviewing',
  done: 'Done',
  failed: 'Failed',
};

function memberLabels(session: TeamSession, agentMap: Map<string, Agent>): string {
  return (
    session.memberAgentIds
      .map((id) => agentMap.get(id))
      .filter(Boolean)
      .map((a) => formatAgentLabel(a!))
      .join(', ') || '—'
  );
}

export function ProjectListPanel({
  sessions,
  agents,
  onDoubleClick,
  emptyHint,
}: {
  sessions: TeamSession[];
  agents: Agent[];
  onDoubleClick: (sessionId: string) => void;
  emptyHint?: string;
}) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  if (sessions.length === 0) {
    return (
      <section className="panel overview-project-panel">
        <h3>Project</h3>
        <p className="panel-hint">
          {emptyHint ??
            'PM과 계획을 확정한 뒤 「진행하세요」라고 하면 Project가 생성됩니다. 즉시 실행은 /project 명령을 사용하세요.'}
        </p>
      </section>
    );
  }

  return (
    <section className="panel overview-project-panel">
      <h3>Project ({sessions.length})</h3>
      <p className="panel-hint" style={{ marginBottom: 12 }}>
        항목을 <strong>더블클릭</strong>하면 주제·토큰·참여 에이전트·산출물 경로를 확인할 수 있습니다.
      </p>
      <div className="project-list">
        {sessions.map((session) => {
          const lead = agentMap.get(session.leadAgentId);
          const members = memberLabels(session, agentMap);
          const phase = session.phase ? PHASE_LABEL[session.phase] ?? session.phase : null;

          return (
            <article
              key={session.id}
              className="project-card"
              onDoubleClick={() => onDoubleClick(session.id)}
              title="더블클릭: 상세 보기"
            >
              <div className="project-card-head">
                <h4 className="project-card-title">{session.title}</h4>
                <span className={`project-status ${STATUS_CLASS[session.status]}`}>
                  {STATUS_LABEL[session.status]}
                  {phase && session.status === 'running' ? ` · ${phase}` : ''}
                </span>
              </div>
              <p className="project-card-meta">
                <span>
                  <strong>PM:</strong> {lead ? formatAgentLabel(lead) : '—'}
                </span>
                <span className="project-meta-sep">/</span>
                <span>
                  <strong>팀원:</strong> {members}
                </span>
              </p>
              <p className="project-card-time">
                {new Date(session.createdAt).toLocaleString('ko-KR')}
              </p>
              {session.summary && (session.status === 'done' || session.status === 'failed') && (
                <p className="project-card-summary">
                  {session.summary.slice(0, 160)}
                  {session.summary.length > 160 ? '…' : ''}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function openProjectDetail(sessionId: string) {
  postMessage('getProjectDetail', { sessionId });
}
