import { Agent } from './vscode';

type TileSize = 'sm' | 'md';

function statusDotClass(status: string): string {
  if (status === 'working' || status === 'progress') return 'thinking';
  if (status === 'idle' || status === 'waiting') return 'idle';
  return 'online';
}

/** iOS 홈 화면 스타일 — 원형 프로필 + 하단 이름·직책 */
export function AgentProfileTile({
  agent,
  photoUrl,
  size = 'md',
  onClick,
  selected,
  disabled,
  title,
  badge,
}: {
  agent: Agent;
  photoUrl?: string;
  size?: TileSize;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  title?: string;
  badge?: number;
}) {
  const initial = agent.name.trim().charAt(0) || '?';
  const roleLabel = agent.title?.trim() || agent.role;
  const isOffline = agent.status === 'offline' || disabled;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={[
        'agent-profile-tile',
        size,
        selected ? 'selected' : '',
        isOffline ? 'offline' : '',
        onClick ? 'clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={onClick ? isOffline : undefined}
      title={title ?? `${agent.name} · ${roleLabel}`}
    >
      <div className="agent-profile-tile-avatar-wrap">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="agent-profile-tile-photo" />
        ) : (
          <span className="agent-profile-tile-fallback" aria-hidden>
            {initial}
          </span>
        )}
        <span className={`agent-profile-tile-dot ${statusDotClass(agent.status)}`} />
      </div>
      <span className="agent-profile-tile-name">{agent.name}</span>
      <span className="agent-profile-tile-role">{roleLabel}</span>
      {badge !== undefined && badge > 0 && <span className="agent-profile-tile-badge">{badge}</span>}
    </Tag>
  );
}
