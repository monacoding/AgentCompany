import { useEffect, useMemo, useState } from 'react';
import { TabId } from '../vscode';

export interface CommandPaletteItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  action: () => void;
}

export function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: CommandPaletteItem[];
}) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint?.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHighlight(0);
    }
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }
      if (e.key === 'Enter' && filtered[highlight]) {
        e.preventDefault();
        filtered[highlight].action();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, highlight, onClose]);

  if (!open) return null;

  const groups = [...new Set(filtered.map((i) => i.group))];

  return (
    <div className="cmd-palette-overlay" onClick={onClose} role="presentation">
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command Palette">
        <div className="cmd-palette-input-row">
          <span className="cmd-palette-icon">⌘K</span>
          <input
            className="cmd-palette-input"
            placeholder="명령, 탭, 프리셋 검색…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="cmd-palette-list">
          {filtered.length === 0 ? (
            <p className="cmd-palette-empty">일치하는 항목이 없습니다</p>
          ) : (
            groups.map((group) => (
              <div key={group} className="cmd-palette-group">
                <div className="cmd-palette-group-label">{group}</div>
                {filtered
                  .filter((i) => i.group === group)
                  .map((item) => {
                    const idx = filtered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`cmd-palette-item ${idx === highlight ? 'active' : ''}`}
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                      >
                        <span>{item.label}</span>
                        {item.hint && <span className="cmd-palette-hint">{item.hint}</span>}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Cmd+K / Ctrl+K 단축키 훅 */
export function useCommandPaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpen]);
}

export function buildNavigationItems(
  setActiveTab: (tab: TabId) => void,
  counts: { agents: number; tasks: number; projects: number; apis: number }
): CommandPaletteItem[] {
  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents', count: counts.agents },
    { id: 'org', label: 'Organization' },
    { id: 'projects', label: 'Projects', count: counts.projects },
    { id: 'tasks', label: 'Tasks', count: counts.tasks },
    { id: 'activity', label: 'Activity' },
    { id: 'api', label: 'API', count: counts.apis },
    { id: 'settings', label: 'Settings' },
  ];
  return tabs.map((t) => ({
    id: `nav-${t.id}`,
    label: t.label,
    hint: t.count !== undefined ? `${t.count}` : undefined,
    group: '탐색',
    action: () => setActiveTab(t.id),
  }));
}
