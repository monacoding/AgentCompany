import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Agent, AgentOrganization, OrgEdge, OrgNode, postMessage } from './vscode';

const NODE_W = 108;
const NODE_H = 118;
const CEO_ID = 'ceo';
const CANVAS_W = 1200;
const CANVAS_H = 720;
const GRID = 24;
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2;
const DRAG_THRESHOLD = 5;

type PortKind = 'top' | 'bottom';

interface PendingConnect {
  nodeId: string;
  port: PortKind;
}

interface OrgChartTabProps {
  agents: Agent[];
  orgChart: AgentOrganization;
  agentPhotos: Record<string, string>;
  ownerPhotoUrl?: string;
}

function snapshotOrg(org: AgentOrganization) {
  return JSON.stringify({
    enabled: org.enabled,
    nodes: org.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, kind: n.kind, agentId: n.agentId, label: n.label })),
    edges: org.edges.map((e) => ({ fromId: e.fromId, toId: e.toId })),
  });
}

/** CSS .org-port top/bottom: -8px 와 맞춘 연결 앵커 */
const PORT_OUTSET = 8;

function subordinateAnchor(n: OrgNode) {
  return { x: n.x + NODE_W / 2, y: n.y + NODE_H + PORT_OUTSET };
}

function isCeoNode(n: OrgNode) {
  return n.kind === 'ceo' || n.id === CEO_ID;
}

function managerAnchor(n: OrgNode) {
  if (isCeoNode(n)) {
    return { x: n.x + NODE_W / 2, y: n.y };
  }
  return { x: n.x + NODE_W / 2, y: n.y - PORT_OUTSET };
}

function portPoint(node: OrgNode, port: PortKind) {
  return port === 'bottom' ? subordinateAnchor(node) : managerAnchor(node);
}

function edgePath(from: OrgNode, to: OrgNode) {
  const a = subordinateAnchor(from);
  const b = managerAnchor(to);
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
}

/** 하단(부하) → 상단(상사). 클릭 순서와 무관하게 포트 종류만으로 방향 결정 */
function resolveReportingEdge(
  a: PendingConnect,
  b: PendingConnect
): { fromId: string; toId: string } | null {
  if (a.nodeId === b.nodeId) return null;

  const bottom = a.port === 'bottom' ? a : b.port === 'bottom' ? b : null;
  const top = a.port === 'top' ? a : b.port === 'top' ? b : null;
  if (!bottom || !top) return null;

  let fromId = bottom.nodeId;
  let toId = top.nodeId;

  // 사장은 항상 상사(toId) — 사장 하단 포트를 먼저 눌러도 부하→사장으로 정규화
  if (fromId === CEO_ID) {
    fromId = toId;
    toId = CEO_ID;
  }

  if (fromId === toId) return null;
  return { fromId, toId };
}

export function OrgChartTab({ agents, orgChart, agentPhotos, ownerPhotoUrl }: OrgChartTabProps) {
  const [draft, setDraft] = useState(orgChart);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshotOrg(orgChart));
  const [connectPending, setConnectPending] = useState<PendingConnect | null>(null);
  const [hoverPort, setHoverPort] = useState<PendingConnect | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [brokenPhotos, setBrokenPhotos] = useState<Set<string>>(() => new Set());
  const [zoom, setZoom] = useState(1);
  const [viewportSize, setViewportSize] = useState({ w: CANVAS_W, h: CANVAS_H });

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isFirstSync = useRef(true);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'saveOrgChartResult') {
        const result = event.data.payload as { success: boolean; message?: string };
        if (!result.success) {
          setError(result.message ?? '저장에 실패했습니다.');
          setSaveHint(null);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    setBrokenPhotos(new Set());
  }, [agentPhotos]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setDraft(orgChart);
    setSavedSnapshot(snapshotOrg(orgChart));
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    setSaveHint('조직도가 저장되었습니다. 보고 체계에 반영되었습니다.');
    const timer = window.setTimeout(() => setSaveHint(null), 2500);
    return () => window.clearTimeout(timer);
  }, [orgChart.updatedAt]);

  const isDirty = useMemo(() => snapshotOrg(draft) !== savedSnapshot, [draft, savedSnapshot]);

  const updateDraft = useCallback((updater: (prev: AgentOrganization) => AgentOrganization) => {
    setDraft((prev) => updater(prev));
    setSaveHint(null);
  }, []);

  const canvasPoint = (clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return { x: 0, y: 0 };
    const rect = viewport.getBoundingClientRect();
    return {
      x: (clientX - rect.left + viewport.scrollLeft) / zoom,
      y: (clientY - rect.top + viewport.scrollTop) / zoom,
    };
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragMovedRef.current = true;
      }
    }

    if (dragRef.current) {
      const drag = dragRef.current;
      const pt = canvasPoint(e.clientX, e.clientY);
      setDraft((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === drag.id
            ? { ...n, x: Math.max(0, pt.x - drag.ox), y: Math.max(0, pt.y - drag.oy) }
            : n
        ),
      }));
    }
  };

  const onCanvasMouseUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
      dragStartRef.current = null;
      dragMovedRef.current = false;
    }
  };

  const onNodeMouseDown = (e: React.MouseEvent, node: OrgNode) => {
    if ((e.target as HTMLElement).closest('.org-port')) return;
    e.stopPropagation();
    const pt = canvasPoint(e.clientX, e.clientY);
    dragRef.current = { id: node.id, ox: pt.x - node.x, oy: pt.y - node.y };
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragMovedRef.current = false;
  };

  useEffect(() => {
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        dragStartRef.current = null;
        dragMovedRef.current = false;
      }
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  const handlePortClick = (nodeId: string, port: PortKind, e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setSelectedEdgeId(null);
    setHoveredEdgeId(null);

    const next: PendingConnect = { nodeId, port };

    if (!connectPending) {
      setConnectPending(next);
      return;
    }

    if (connectPending.nodeId === nodeId && connectPending.port === port) {
      setConnectPending(null);
      return;
    }

    const direction = resolveReportingEdge(connectPending, next);
    if (!direction) {
      setError('하단(초록)과 상단(파랑) 노드를 연결하세요. 순서와 관계없이 부하 → 상사로 잡힙니다.');
      setConnectPending(null);
      return;
    }

    const { fromId, toId } = direction;

    updateDraft((prev) => {
      if (prev.edges.some((edge) => edge.fromId === fromId && edge.toId === toId)) {
        setError('이미 같은 연결이 있습니다.');
        return prev;
      }
      const edge: OrgEdge = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fromId,
        toId,
      };
      setConnectPending(null);
      return { ...prev, edges: [...prev.edges, edge] };
    });
  };

  const deleteEdge = (edgeId: string) => {
    updateDraft((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
    }));
    setSelectedEdgeId(null);
    setHoveredEdgeId(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId) {
        e.preventDefault();
        deleteEdge(selectedEdgeId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEdgeId]);

  const handleSave = () => {
    setError(null);
    const payload: AgentOrganization = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    postMessage('saveOrgChart', payload);
  };

  const handleDiscard = () => {
    setDraft(orgChart);
    setSavedSnapshot(snapshotOrg(orgChart));
    setConnectPending(null);
    setSelectedEdgeId(null);
    setError(null);
    setSaveHint(null);
  };

  const adjustZoom = (delta: number) => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 100) / 100)));
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      adjustZoom(e.deltaY > 0 ? -0.08 : 0.08);
    }
  };

  const nodeById = (id: string) => draft.nodes.find((n) => n.id === id);

  const agentForNode = (node: OrgNode): Agent | undefined => {
    if (node.kind === 'ceo') return undefined;
    return agents.find((a) => a.id === (node.agentId ?? node.id));
  };

  const isPortSelected = (nodeId: string, port: PortKind) =>
    connectPending?.nodeId === nodeId && connectPending.port === port;

  const isPortPairTarget = (nodeId: string, port: PortKind) =>
    !!connectPending &&
    !(connectPending.nodeId === nodeId && connectPending.port === port) &&
    !!resolveReportingEdge(connectPending, { nodeId, port });

  const isPortHoverTarget = (nodeId: string, port: PortKind) =>
    isPortPairTarget(nodeId, port) &&
    hoverPort?.nodeId === nodeId &&
    hoverPort.port === port;

  const canReceiveAsManager = (nodeId: string) => isPortPairTarget(nodeId, 'top');

  const handleNodeClick = (e: React.MouseEvent, node: OrgNode) => {
    if (dragMovedRef.current) return;
    e.stopPropagation();
    if (node.kind === 'ceo' && canReceiveAsManager(node.id)) {
      handlePortClick(node.id, 'top', e);
    }
  };

  const unplacedAgents = agents.filter((a) => !draft.nodes.some((n) => n.id === a.id));

  const addAgentNode = (agent: Agent) => {
    updateDraft((prev) => {
      if (prev.nodes.some((n) => n.id === agent.id)) return prev;
      const count = prev.nodes.filter((n) => n.kind === 'agent').length;
      return {
        ...prev,
        nodes: [
          ...prev.nodes,
          {
            id: agent.id,
            kind: 'agent',
            agentId: agent.id,
            label: agent.name,
            x: 60 + (count % 3) * 180,
            y: 240 + Math.floor(count / 3) * 140,
          },
        ],
      };
    });
  };

  const previewEdge = ((): { d: string; complete: boolean } | null => {
    if (!connectPending) return null;
    const fromNode = nodeById(connectPending.nodeId);
    if (!fromNode) return null;

    if (hoverPort && !(hoverPort.nodeId === connectPending.nodeId && hoverPort.port === connectPending.port)) {
      const hoverNode = nodeById(hoverPort.nodeId);
      if (!hoverNode) return null;
      const dir = resolveReportingEdge(connectPending, hoverPort);
      if (!dir) return null;
      const sub = nodeById(dir.fromId)!;
      const mgr = nodeById(dir.toId)!;
      return { d: edgePath(sub, mgr), complete: true };
    }

    const pt = portPoint(fromNode, connectPending.port);
    return { d: `M ${pt.x} ${pt.y} L ${pt.x} ${pt.y}`, complete: false };
  })();

  const renderPort = (nodeId: string, port: PortKind, title: string) => (
    <button
      type="button"
      className={`org-port org-port-${port} ${isPortSelected(nodeId, port) ? 'selected' : ''} ${isPortPairTarget(nodeId, port) ? 'pair-target' : ''} ${isPortHoverTarget(nodeId, port) ? 'hover-target' : ''}`}
      title={title}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => handlePortClick(nodeId, port, e)}
      onMouseEnter={() => {
        setHoverPort({ nodeId, port });
        setHoveredEdgeId(null);
        setSelectedEdgeId(null);
      }}
      onMouseLeave={() => setHoverPort((prev) => (prev?.nodeId === nodeId && prev.port === port ? null : prev))}
    />
  );

  const hintText =
    hoveredEdgeId || selectedEdgeId
      ? '선 클릭으로 선택 · 더블클릭 또는 Delete로 끊기'
      : isDirty
        ? '연결·배치 후 저장하면 보고 체계에 반영됩니다 — 부하가 작성한 모든 것에 상사가 관여하게 됩니다'
        : connectPending
          ? '반대쪽 노드를 클릭하세요 — 하단·상단 순서 무관, 자동으로 부하 → 상사'
          : '하단(초록)·상단(파랑) 노드 두 개를 클릭해 연결하세요';

  const canvasW = Math.max(CANVAS_W, Math.ceil(viewportSize.w / zoom));
  const canvasH = Math.max(CANVAS_H, Math.ceil(viewportSize.h / zoom));

  return (
    <div className="org-tab">
      <div className="org-toolbar">
        <div className="org-toolbar-row">
          <label className="org-toggle">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(e) => updateDraft((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            조직 보고 활성화
          </label>
          <div className="org-toolbar-actions">
            <button type="button" className="btn-primary btn-sm org-save-btn" onClick={handleSave}>
              저장
            </button>
            {isDirty && (
              <button type="button" className="btn-sm" onClick={handleDiscard}>
                변경 취소
              </button>
            )}
          </div>
        </div>
        <div className="org-toolbar-row org-toolbar-meta">
          <span className="org-toolbar-hint">{hintText}</span>
          <div className="org-toolbar-status">
            {isDirty && <span className="org-dirty-badge">저장 안 됨</span>}
            {saveHint && <span className="org-save-ok">{saveHint}</span>}
            {error && <span className="org-error">{error}</span>}
          </div>
        </div>
      </div>

      <div className="org-layout">
        <aside className="org-palette">
          <h4>에이전트</h4>
          {unplacedAgents.length === 0 ? (
            <p className="empty">모든 에이전트가 배치됨</p>
          ) : (
            unplacedAgents.map((a) => (
              <button key={a.id} type="button" className="btn-sm org-add-btn" onClick={() => addAgentNode(a)}>
                + {a.name}
                {a.title?.trim() ? ` (${a.title})` : ''}
              </button>
            ))
          )}
          {(selectedEdgeId || hoveredEdgeId) && (
            <button
              type="button"
              className="btn-sm btn-danger"
              onClick={() => deleteEdge(selectedEdgeId ?? hoveredEdgeId!)}
            >
              연결 끊기
            </button>
          )}
          {connectPending && (
            <button type="button" className="btn-sm" onClick={() => setConnectPending(null)}>
              연결 취소
            </button>
          )}
        </aside>

        <div
          ref={viewportRef}
          className={`org-canvas-viewport ${isDirty ? 'draft' : 'saved'}`}
          onWheel={onWheel}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onClick={() => {
            setSelectedEdgeId(null);
            setConnectPending(null);
          }}
        >
          <div className="org-zoom-controls" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn-sm" onClick={() => adjustZoom(-0.1)} aria-label="축소">
              −
            </button>
            <span className="org-zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="btn-sm" onClick={() => adjustZoom(0.1)} aria-label="확대">
              +
            </button>
          </div>
          <div
            className="org-canvas-spacer"
            style={{ width: canvasW * zoom, height: canvasH * zoom }}
          >
          <div
            className="org-canvas-inner"
            style={{
              width: canvasW,
              height: canvasH,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              backgroundSize: `${GRID}px ${GRID}px`,
            }}
          >
            <svg className="org-edges" width={canvasW} height={canvasH} aria-hidden>
              <defs>
                <marker id="org-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#60a5fa" />
                </marker>
                <marker id="org-arrow-draft" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" />
                </marker>
                <marker id="org-arrow-hover" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#fb923c" />
                </marker>
                <marker id="org-arrow-selected" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24" />
                </marker>
              </defs>
              {draft.edges.map((edge) => {
                const from = nodeById(edge.fromId);
                const to = nodeById(edge.toId);
                if (!from || !to) return null;
                const d = edgePath(from, to);
                const selected = selectedEdgeId === edge.id;
                const hovered = hoveredEdgeId === edge.id;
                const showArrow = !isCeoNode(to);
                const markerEnd = showArrow
                  ? selected
                    ? 'url(#org-arrow-selected)'
                    : hovered
                      ? 'url(#org-arrow-hover)'
                      : isDirty
                        ? 'url(#org-arrow-draft)'
                        : 'url(#org-arrow)'
                  : undefined;
                return (
                  <path
                    key={edge.id}
                    d={d}
                    className={`org-edge-line ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''} ${isDirty ? 'draft' : 'saved'}`}
                    markerEnd={markerEnd}
                  />
                );
              })}
              {previewEdge?.complete && hoverPort && connectPending && (() => {
                const dir = resolveReportingEdge(connectPending, hoverPort);
                const previewTo = dir ? nodeById(dir.toId) : null;
                const showPreviewArrow = previewTo ? !isCeoNode(previewTo) : true;
                return (
                  <path
                    d={previewEdge.d}
                    className="org-edge-line drafting"
                    markerEnd={showPreviewArrow ? 'url(#org-arrow-draft)' : undefined}
                  />
                );
              })()}
            </svg>

            <svg
              className={`org-edges-overlay${connectPending ? ' connecting-mode' : ''}`}
              width={canvasW}
              height={canvasH}
            >
              {draft.edges.map((edge) => {
                const from = nodeById(edge.fromId);
                const to = nodeById(edge.toId);
                if (!from || !to) return null;
                const d = edgePath(from, to);
                return (
                  <g
                    key={edge.id}
                    className="org-edge-group"
                    onMouseEnter={() => {
                      if (connectPending) return;
                      setHoveredEdgeId(edge.id);
                    }}
                    onMouseLeave={() => setHoveredEdgeId((prev) => (prev === edge.id ? null : prev))}
                    onClick={(e) => {
                      if (connectPending) return;
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setConnectPending(null);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      deleteEdge(edge.id);
                    }}
                  >
                    <path d={d} className="org-edge-hit" />
                  </g>
                );
              })}
            </svg>

            {draft.nodes.map((node) => {
              const agent = agentForNode(node);
              const photoUrl =
                node.kind === 'ceo' ? ownerPhotoUrl : agent ? agentPhotos[agent.id] : undefined;
              const title = agent?.title?.trim() ?? (node.kind === 'ceo' ? '사장' : '');
              const name = agent?.name ?? node.label;
              const nodeConnecting =
                connectPending?.nodeId === node.id ||
                (hoverPort?.nodeId === node.id && connectPending !== null);
              const ceoReceiveTarget = node.kind === 'ceo' && canReceiveAsManager(node.id);

              return (
                <div
                  key={node.id}
                  className={`org-node ${node.kind === 'ceo' ? 'ceo ceo-no-top-port' : 'agent'} ${nodeConnecting ? 'connecting' : ''} ${ceoReceiveTarget ? 'connect-target' : ''}`}
                  style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
                  onMouseDown={(e) => onNodeMouseDown(e, node)}
                  onClick={(e) => handleNodeClick(e, node)}
                >
                  {node.kind !== 'ceo' && renderPort(node.id, 'top', '상사 연결 (보고 받기)')}
                  <div className="org-node-avatar">
                    {photoUrl && !brokenPhotos.has(node.id) ? (
                      <img
                        src={photoUrl}
                        alt=""
                        className="org-node-photo"
                        draggable={false}
                        onError={() => {
                          setBrokenPhotos((prev) => new Set(prev).add(node.id));
                        }}
                      />
                    ) : (
                      <span className="org-node-photo-fallback">{node.kind === 'ceo' ? '👔' : '🤖'}</span>
                    )}
                  </div>
                  <div className="org-node-name">{name}</div>
                  {title && title !== name && <div className="org-node-title">({title})</div>}
                  {renderPort(node.id, 'bottom', '부하 연결 (보고 시작)')}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
