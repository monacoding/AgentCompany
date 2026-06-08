import { Agent, TeamSession, postMessage } from './vscode';
import { formatAgentLabel } from './agent-display';

const STATUS_LABEL: Record<TeamSession['status'], string> = {
  planning: '계획 중',
  running: '진행 중',
  done: '완료',
  failed: '실패',
};

const STATUS_COLOR: Record<TeamSession['status'], string> = {
  planning: '#8b5cf6',
  running: '#3b82f6',
  done: '#22c55e',
  failed: '#ef4444',
};

export function TeamsTab({
  sessions,
  agents,
}: {
  sessions: TeamSession[];
  agents: Agent[];
}) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  if (sessions.length === 0) {
    return (
      <section className="card">
        <h3>팀 협업</h3>
        <p className="muted">
          아직 팀 세션이 없습니다. CEO 명령에 <code>/팀</code> 또는 &quot;협업&quot;, &quot;함께&quot; 같은
          키워드를 넣으면 에이전트들이 자동으로 팀을 구성합니다.
        </p>
        <p className="muted" style={{ marginTop: 8 }}>
          예: <code>@김윤하 /팀 수능 기출 분석하고 쇼츠 대본까지 협업해줘</code>
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>팀 협업 ({sessions.length})</h3>
      <p className="muted" style={{ marginBottom: 12 }}>
        에이전트들이 자율적으로 논의·계획·분업한 세션입니다. 항목을 클릭하면 팀 대화방을 엽니다.
      </p>
      <ul className="task-list">
        {sessions.map((session) => {
          const lead = agentMap.get(session.leadAgentId);
          const members = session.memberAgentIds
            .map((id) => agentMap.get(id))
            .filter(Boolean) as Agent[];

          return (
            <li
              key={session.id}
              className="task-item"
              style={{ cursor: 'pointer' }}
              onClick={() => postMessage('openTeamChat', { sessionId: session.id })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>{session.title}</strong>
                <span style={{ color: STATUS_COLOR[session.status], fontSize: 12 }}>
                  {STATUS_LABEL[session.status]}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                리드: {lead ? formatAgentLabel(lead) : '—'} · {members.length}명 ·{' '}
                {new Date(session.createdAt).toLocaleString('ko-KR')}
              </div>
              {session.plan && (
                <div style={{ fontSize: 12, marginTop: 6, whiteSpace: 'pre-wrap' }}>
                  {session.plan.slice(0, 160)}
                  {session.plan.length > 160 ? '…' : ''}
                </div>
              )}
              {session.summary && session.status === 'done' && (
                <div style={{ fontSize: 12, marginTop: 6, color: '#22c55e' }}>
                  {session.summary.slice(0, 120)}
                  {session.summary.length > 120 ? '…' : ''}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
