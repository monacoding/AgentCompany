import { Activity, Agent } from '../vscode';
import { formatAgentLabel } from '../agent-display';

function formatFeedTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export function ActivityFeedPanel({
  activities,
  agents,
}: {
  activities: Activity[];
  agents: Agent[];
}) {
  const recent = activities.slice(0, 40);

  return (
    <aside className="activity-feed-panel" aria-label="실시간 활동">
      <div className="activity-feed-header">
        <h2>Live Activity</h2>
        <span className="activity-feed-live">
          <span className="live-dot" /> LIVE
        </span>
      </div>
      <div className="activity-feed-list">
        {recent.length === 0 ? (
          <p className="activity-feed-empty">아직 활동이 없습니다</p>
        ) : (
          recent.map((act) => {
            const agent = agents.find((a) => a.id === act.agentId);
            return (
              <div key={act.id} className="activity-feed-item">
                <div className="activity-feed-meta">
                  <span className="activity-feed-time">{formatFeedTime(act.createdAt)}</span>
                  {agent && (
                    <span className="activity-feed-agent">{formatAgentLabel(agent)}</span>
                  )}
                </div>
                <p className="activity-feed-message">{act.message}</p>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
