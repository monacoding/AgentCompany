import { Database } from '../database';
import { Agent, AgentOrganization, OrgEdge, OrgNode } from '../types';
import { generateId, now, parseJson } from '../utils';
import { formatAgentLabel } from '../utils/agent-display';

export const CEO_NODE_ID = 'ceo';

const DEFAULT_ORG = (): AgentOrganization => ({
  enabled: true,
  nodes: [
    { id: CEO_NODE_ID, kind: 'ceo', label: 'CEO', x: 280, y: 40 },
  ],
  edges: [],
  updatedAt: now(),
});

export class OrgEngine {
  private cache: AgentOrganization | null = null;

  constructor(private db: Database) {}

  load(): AgentOrganization {
    if (this.cache) return this.clone(this.cache);
    const raw = this.db.getOrgChart();
    if (!raw) {
      this.cache = DEFAULT_ORG();
      this.persist(this.cache);
      return this.clone(this.cache);
    }
    this.cache = this.normalize(raw);
    return this.clone(this.cache);
  }

  save(org: AgentOrganization): AgentOrganization {
    const normalized = this.normalize(org);
    this.cache = normalized;
    this.db.saveOrgChart(normalized);
    return this.clone(normalized);
  }

  isEnabled(): boolean {
    return this.load().enabled;
  }

  /** 에이전트 ID → 조직도 노드 ID */
  resolveNodeId(agentOrNodeId: string): string {
    const org = this.load();
    if (org.nodes.some((n) => n.id === agentOrNodeId)) return agentOrNodeId;
    const byAgent = org.nodes.find((n) => n.agentId === agentOrNodeId);
    return byAgent?.id ?? agentOrNodeId;
  }

  /** agentId를 노드 ID로 변환해 agent.id 반환 (없으면 null) */
  resolveAgentId(nodeOrAgentId: string): string | null {
    const org = this.load();
    const node = org.nodes.find((n) => n.id === nodeOrAgentId || n.agentId === nodeOrAgentId);
    if (!node) return null;
    if (node.kind === 'ceo') return null;
    return node.agentId ?? node.id;
  }

  /** 저장된 조직도 기준 부하 → 상사 → … → CEO 경로 (노드 ID) */
  getReportingChain(agentId: string): string[] {
    const org = this.load();
    if (!org.enabled) return [agentId];

    const startId = this.resolveNodeId(agentId);
    const chain: string[] = [startId];
    let current = startId;
    const visited = new Set<string>([startId]);

    while (true) {
      const outgoing = org.edges.filter((e) => e.fromId === current);
      const edge =
        outgoing.find((e) => e.toId === CEO_NODE_ID) ??
        outgoing.sort((a, b) => a.id.localeCompare(b.id))[0];
      if (!edge || visited.has(edge.toId)) break;
      chain.push(edge.toId);
      visited.add(edge.toId);
      current = edge.toId;
      if (edge.toId === CEO_NODE_ID) break;
    }

    return chain;
  }

  /** 부하 → 상사 순서의 중간 관리자 agent ID (CEO 제외) */
  getOrderedManagers(agentId: string): string[] {
    return this.getReportingChain(agentId)
      .slice(1)
      .filter((id) => id !== CEO_NODE_ID)
      .map((nodeId) => this.resolveAgentId(nodeId))
      .filter((id): id is string => id !== null);
  }

  /** 저장된 관계가 있고 조직 보고가 켜져 있으면 계층 보고 사용 */
  shouldUseHierarchicalReport(agentId: string): boolean {
    if (!this.isEnabled()) return false;
    return this.getOrderedManagers(agentId).length > 0 || this.hasHierarchy(agentId);
  }

  hasHierarchy(agentId: string): boolean {
    const chain = this.getReportingChain(agentId);
    return chain.length > 1;
  }

  getManagerId(agentId: string): string | null {
    const org = this.load();
    return org.edges.find((e) => e.fromId === agentId)?.toId ?? null;
  }

  ensureAgentNodes(agents: Agent[]): AgentOrganization {
    const org = this.load();
    let changed = false;

    if (!org.nodes.some((n) => n.id === CEO_NODE_ID)) {
      org.nodes.unshift({ id: CEO_NODE_ID, kind: 'ceo', label: 'CEO', x: 280, y: 40 });
      changed = true;
    }

    for (const agent of agents) {
      if (org.nodes.some((n) => n.id === agent.id)) continue;
      const col = org.nodes.filter((n) => n.kind === 'agent').length;
      org.nodes.push({
        id: agent.id,
        kind: 'agent',
        agentId: agent.id,
        label: formatAgentLabel(agent),
        x: 80 + (col % 4) * 160,
        y: 180 + Math.floor(col / 4) * 120,
      });
      changed = true;
    }

    org.nodes = org.nodes.filter(
      (n) => n.kind === 'ceo' || agents.some((a) => a.id === n.id)
    );
    org.edges = org.edges.filter(
      (e) =>
        org.nodes.some((n) => n.id === e.fromId) && org.nodes.some((n) => n.id === e.toId)
    );

    if (changed) {
      org.updatedAt = now();
      return this.save(org);
    }
    return org;
  }

  validateEdge(
    org: AgentOrganization,
    fromId: string,
    toId: string,
    excludeEdgeId?: string
  ): string | null {
    if (fromId === toId) return '같은 노드는 연결할 수 없습니다.';
    if (fromId === CEO_NODE_ID) return 'CEO는 부하 역할로 연결할 수 없습니다.';
    if (toId !== CEO_NODE_ID) {
      const toNode = org.nodes.find((n) => n.id === toId);
      if (toNode?.kind === 'agent' && toNode.agentId === fromId) return '순환 연결은 불가합니다.';
    }

    const draft = {
      ...org,
      edges: [
        ...org.edges.filter((e) => e.id !== excludeEdgeId),
        { id: '__draft__', fromId, toId },
      ],
    };
    if (this.wouldCycle(draft, fromId)) return '순환 보고 구조는 만들 수 없습니다.';
    if (
      org.edges.some(
        (e) => e.fromId === fromId && e.toId === toId && e.id !== excludeEdgeId
      )
    ) {
      return '이미 같은 연결이 있습니다.';
    }
    return null;
  }

  /** 저장 시 전체 조직도 검증 */
  validateOrgChart(org: AgentOrganization): string | null {
    const nodeIds = new Set(org.nodes.map((n) => n.id));
    const pairKeys = new Set<string>();

    for (const edge of org.edges) {
      if (!nodeIds.has(edge.fromId) || !nodeIds.has(edge.toId)) {
        return '존재하지 않는 노드가 연결되어 있습니다.';
      }
      const err = this.validateEdge(org, edge.fromId, edge.toId, edge.id);
      if (err) return err;
      const key = `${edge.fromId}->${edge.toId}`;
      if (pairKeys.has(key)) {
        return '이미 같은 연결이 있습니다.';
      }
      pairKeys.add(key);
    }

    return null;
  }

  private wouldCycle(org: AgentOrganization, startId: string): boolean {
    let current: string | null = startId;
    const visited = new Set<string>();
    while (current) {
      if (visited.has(current)) return true;
      visited.add(current);
      const edge = org.edges.find((e) => e.fromId === current);
      current = edge?.toId ?? null;
    }
    return false;
  }

  private normalize(org: AgentOrganization): AgentOrganization {
    return {
      enabled: org.enabled ?? true,
      nodes: Array.isArray(org.nodes) ? org.nodes : DEFAULT_ORG().nodes,
      edges: Array.isArray(org.edges) ? org.edges : [],
      updatedAt: org.updatedAt ?? now(),
    };
  }

  private clone(org: AgentOrganization): AgentOrganization {
    return JSON.parse(JSON.stringify(org)) as AgentOrganization;
  }

  private persist(org: AgentOrganization): void {
    this.db.saveOrgChart(org);
  }
}

export function createOrgEdge(fromId: string, toId: string): OrgEdge {
  return { id: generateId(), fromId, toId };
}
