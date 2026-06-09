import { TabId } from '../vscode';

const NAV_ITEMS: { id: TabId; icon: string; label: string; badgeKey?: keyof SidebarBadges }[] = [
  { id: 'overview', icon: '◉', label: 'Overview' },
  { id: 'agents', icon: '👥', label: 'Agents', badgeKey: 'agents' },
  { id: 'org', icon: '🏛', label: 'Org' },
  { id: 'projects', icon: '📁', label: 'Projects', badgeKey: 'projects' },
  { id: 'tasks', icon: '✓', label: 'Tasks', badgeKey: 'tasks' },
  { id: 'activity', icon: '⚡', label: 'Activity' },
  { id: 'api', icon: '🔌', label: 'API' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
];

export interface SidebarBadges {
  agents: number;
  projects: number;
  tasks: number;
  review: number;
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  badges,
  onOpenCommandPalette,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  badges: SidebarBadges;
  onOpenCommandPalette: () => void;
}) {
  return (
    <aside className="dashboard-sidebar" aria-label="주요 탐색">
      <div className="sidebar-brand" title="AgentCompany">
        <span className="sidebar-brand-icon">🏢</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const badge = item.badgeKey ? badges[item.badgeKey] : 0;
          const showReview = item.id === 'tasks' && badges.review > 0;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {(badge > 0 || showReview) && (
                <span className={`sidebar-badge ${showReview ? 'review' : ''}`}>
                  {showReview ? badges.review : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-cmd-btn"
          onClick={onOpenCommandPalette}
          title="Command Palette (⌘K)"
        >
          <span>⌘</span>
          <span className="sidebar-cmd-label">K</span>
        </button>
      </div>
    </aside>
  );
}
