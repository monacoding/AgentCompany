import { ProgressRing } from './ProgressRing';
import { Sparkline, buildSparklineData } from './Sparkline';

export interface DashboardStats {
  agents: number;
  working: number;
  progress: number;
  tasks: number;
  inProgress: number;
  review: number;
  completed: number;
  projects: number;
}

function calcHealthScore(stats: DashboardStats): number {
  const total = stats.completed + stats.review + stats.inProgress + stats.progress;
  if (total === 0) return stats.agents > 0 ? 72 : 50;
  const completionRate = stats.completed / total;
  const reviewPenalty = stats.review * 3;
  const raw = Math.round(completionRate * 100 - reviewPenalty + stats.working * 2);
  return Math.min(99, Math.max(12, raw));
}

const STAT_CONFIG: {
  key: keyof DashboardStats;
  label: string;
  icon: string;
  color: string;
  variant?: 'accent' | 'success' | 'review' | 'project';
}[] = [
  { key: 'projects', label: 'Project', icon: '📁', color: '#60a5fa', variant: 'project' },
  { key: 'agents', label: 'Agents', icon: '👥', color: '#a78bfa' },
  { key: 'working', label: 'Working', icon: '⚡', color: '#3b82f6', variant: 'accent' },
  { key: 'progress', label: 'Progress', icon: '◐', color: '#8b5cf6' },
  { key: 'review', label: 'Review', icon: '📋', color: '#f97316', variant: 'review' },
  { key: 'completed', label: 'Completed', icon: '✓', color: '#22c55e', variant: 'success' },
];

export function StatsOverview({
  stats,
  onProjectClick,
}: {
  stats: DashboardStats;
  onProjectClick?: () => void;
}) {
  const health = calcHealthScore(stats);

  return (
    <section className="stats-overview" aria-label="운영 현황">
      <div className="stats-health-center">
        <ProgressRing
          value={health}
          size={108}
          stroke={9}
          label="Health"
          sublabel="전체 프로젝트"
          accent="#f97316"
        />
      </div>

      <div className="stats-grid-v2">
        {STAT_CONFIG.map((cfg) => {
          const value = stats[cfg.key];
          const spark = buildSparklineData(value);
          const clickable = cfg.key === 'projects' && onProjectClick;

          return (
            <div
              key={cfg.key}
              className={`stat-card-v2 ${cfg.variant ?? ''} ${clickable ? 'clickable' : ''}`}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? onProjectClick : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onProjectClick?.();
                      }
                    }
                  : undefined
              }
            >
              <div className="stat-card-v2-top">
                <span className="stat-card-v2-icon">{cfg.icon}</span>
                <Sparkline data={spark} color={cfg.color} />
              </div>
              <span className="stat-card-v2-value">{value}</span>
              <span className="stat-card-v2-label">{cfg.label}</span>
              {cfg.variant === 'success' && (
                <span className="stat-card-v2-badge success-badge">완료</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
