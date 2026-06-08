import { isSecretaryAgent } from '../secretary';
import { ProviderEngine } from '../providers';
import { Agent } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import { formatLlmError } from '../chat/reply-format';
import { proposeTeamMembers } from './member-picker';

export interface TeamPlanResult {
  pm: Agent;
  plan: string;
  members: Agent[];
  requester: Agent;
}

const MAX_TEAM_SIZE = 4;

/** 팀 오케스트레이션 PM — 비서·PM 역할 우선 */
export function resolveTeamPm(agents: Agent[], requester?: Agent | null): Agent | null {
  const active = agents.filter((a) => a.status !== 'offline');

  const secretary = active.find((a) => isSecretaryAgent(a));
  if (secretary) return secretary;

  const pm = active.find((a) => a.role === 'pm' && a.id !== requester?.id);
  if (pm) return pm;

  if (requester?.role === 'pm') return requester;

  const anyPm = active.find((a) => a.role === 'pm');
  if (anyPm) return anyPm;

  return requester ?? active[0] ?? null;
}

function buildAgentRoster(agents: Agent[]): string {
  return agents
    .filter((a) => a.status !== 'offline')
    .map(
      (a) =>
        `- id:${a.id} | @${a.name} | ${formatAgentLabel(a)} | role:${a.role} | ${a.description.slice(0, 80)}`
    )
    .join('\n');
}

function parseAgentsFromPlan(plan: string, agents: Agent[]): Agent[] {
  const active = agents.filter((a) => a.status !== 'offline');
  const selected = new Map<string, Agent>();

  for (const agent of active) {
    const name = agent.name.trim();
    if (!name) continue;
    const patterns = [
      new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`),
      new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`),
      new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*에게`),
      new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*한테`),
    ];
    if (patterns.some((p) => p.test(plan))) {
      selected.set(agent.id, agent);
    }
  }

  return [...selected.values()];
}

function mergeMembers(
  pm: Agent,
  requester: Agent,
  picked: Agent[],
  allAgents: Agent[]
): Agent[] {
  const map = new Map<string, Agent>();
  map.set(pm.id, pm);
  map.set(requester.id, requester);
  for (const agent of picked) {
    if (map.size >= MAX_TEAM_SIZE) break;
    map.set(agent.id, agent);
  }

  if (map.size < 2) {
    for (const fallback of proposeTeamMembers(requester, '', allAgents)) {
      if (map.size >= MAX_TEAM_SIZE) break;
      map.set(fallback.id, fallback);
    }
  }

  return [...map.values()].slice(0, MAX_TEAM_SIZE);
}

function fallbackPlan(pm: Agent, requester: Agent, command: string, members: Agent[]): string {
  const lines = members
    .filter((m) => m.id !== pm.id)
    .map((m, i) => `${i + 1}. @${m.name}: ${m.id === requester.id ? '사장님 지시 주도' : '지원 업무'}`);
  return [
    `PM ${pm.name}이(가) 팀 계획을 수립했습니다.`,
    '',
    `## 사장님 지시`,
    command,
    '',
    '## 분업',
    ...lines,
  ].join('\n');
}

export async function planTeamWithPm(
  providers: ProviderEngine,
  allAgents: Agent[],
  requester: Agent,
  command: string
): Promise<TeamPlanResult> {
  const pm = resolveTeamPm(allAgents, requester);
  if (!pm) {
    throw new Error('PM 에이전트를 찾을 수 없습니다.');
  }

  const roster = buildAgentRoster(allAgents);

  try {
    const response = await providers.chat(
      [
        {
          role: 'system',
          content: `You are ${formatAgentLabel(pm)}, the PM orchestrator in AgentCompany.
Your job:
1. Analyze the CEO's command
2. Select 2-${MAX_TEAM_SIZE} agents from the roster (including the requester when relevant)
3. Write a Korean task plan

Output format (strict):
---PLAN---
(한국어 계획, 각 줄: N. @에이전트명: 할 일)
---AGENTS---
(쉼표로 agent id만, 예: id1,id2,id3)
---END---

Rules:
- Always include requester @${requester.name} if they should lead the deliverable
- Pick specialists by role fit
- Keep plan under 10 lines
- Use only agents from the roster`,
        },
        {
          role: 'user',
          content: `## 사장님 지시\n${command}\n\n## 요청 에이전트\n@${requester.name} (${requester.title || requester.role})\n\n## 전체 에이전트\n${roster}`,
        },
      ],
      { type: pm.provider, model: pm.model }
    );

    const raw = (response.content || '').trim();
    const planMatch = raw.match(/---PLAN---\s*([\s\S]*?)\s*---AGENTS---/i);
    const agentsMatch = raw.match(/---AGENTS---\s*([\s\S]*?)\s*---END---/i);

    const planBody = (planMatch?.[1] ?? raw).trim();
    const plan =
      planBody ||
      fallbackPlan(pm, requester, command, mergeMembers(pm, requester, [], allAgents));

    let picked: Agent[] = [];
    if (agentsMatch?.[1]) {
      const ids = agentsMatch[1]
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      picked = ids
        .map((id) => allAgents.find((a) => a.id === id))
        .filter((a): a is Agent => a !== undefined);
    }

    if (picked.length === 0) {
      picked = parseAgentsFromPlan(plan, allAgents);
    }

    const members = mergeMembers(pm, requester, picked, allAgents);

    return { pm, plan, members, requester };
  } catch (error) {
    const members = mergeMembers(pm, requester, proposeTeamMembers(requester, command, allAgents), allAgents);
    const message = formatLlmError(error);
    const plan = [
      fallbackPlan(pm, requester, command, members),
      '',
      `(PM 계획 LLM 오류 — 휴리스틱 팀 구성으로 진행: ${message})`,
    ].join('\n');
    return { pm, plan, members, requester };
  }
}

/** 업무 지시 시 PM 팀 오케스트레이션 여부 */
export function shouldOrchestrateWithPm(
  command: string,
  options?: { suggestedAction?: string }
): boolean {
  const text = command.trim();
  if (!text) return false;

  if (/^\/팀|협업|함께|팀으로|연계|공동|멀티\s*에이전트|에이전트\s*팀/i.test(text)) {
    return true;
  }

  if (options?.suggestedAction === 'conversation_complete' || options?.suggestedAction === 'needs_clarification') {
    return false;
  }

  if (text.length >= 12 && /분석|조사|구현|작성|기획|제작|만들|수집|정리|개발|리서치|대본|쇼츠|기출|수능/i.test(text)) {
    return true;
  }

  return false;
}
