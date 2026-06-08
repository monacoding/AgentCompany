import { isSecretaryAgent } from '../secretary';
import { ProviderEngine } from '../providers';
import { Agent } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import { formatLlmError } from '../chat/reply-format';
import { proposeTeamMembers } from './member-picker';
import {
  detectProjectTemplate,
  formatProjectTemplateHint,
  getProjectPlaybookSummary,
} from './project-playbook';

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

export function buildCompanyAgentRoster(agents: Agent[]): string {
  const active = agents.filter((a) => a.status !== 'offline');
  if (active.length === 0) {
    return '(활성 에이전트 없음 — Agents 탭에서 에이전트를 추가·활성화하세요)';
  }
  return active
    .map(
      (a) =>
        `- @${a.name} | ${formatAgentLabel(a)} | role:${a.role} | status:${a.status} | ${a.description.slice(0, 120)}`
    )
    .join('\n');
}

/** PM 1:1 대화·계획 시 LLM에 주입할 팀 컨텍스트 */
export function buildPmOrchestrationPromptBlock(allAgents: Agent[], pm?: Agent): string {
  const roster = buildCompanyAgentRoster(allAgents);
  const pmLine = pm ? `당신은 PM ${formatAgentLabel(pm)}입니다.` : '당신은 PM입니다.';
  return `${pmLine}

## 우리 회사 실제 에이전트 (가상 역할·외부 인력 금지 — 이 목록만 사용)
${roster}

PM 필수 규칙:
- "스크립트 전문가", "백엔드 개발자" 같은 **일반 직함을 새로 만들지 마세요**
- 협업·매칭·배정 시 **반드시 @에이전트명**으로 지목 (예: 1. @김윤하: 리서치)
- 각 에이전트의 role·description·title을 근거로 업무를 매칭하세요
- offline 에이전트는 배정하지 마세요
- 계획 확정 후 사장님이 "진행하세요"라고 하면 Project 채팅방이 생성됩니다

${getProjectPlaybookSummary().replace(/\[ProjectPlaybook v1\]\n*/, '')}`;
}

export function buildPmPlanningContextBlock(command: string): string {
  const template = detectProjectTemplate(command);
  if (!template) return '';
  return `\n${formatProjectTemplateHint(template)}`;
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
  command: string,
  forcedPm?: Agent
): Promise<TeamPlanResult> {
  const pm = forcedPm ?? resolveTeamPm(allAgents, requester);
  if (!pm) {
    throw new Error('PM 에이전트를 찾을 수 없습니다.');
  }

  const roster = buildCompanyAgentRoster(allAgents);

  try {
    const response = await providers.chat(
      [
        {
          role: 'system',
          content: `You are ${formatAgentLabel(pm)}, the PM orchestrator in AgentCompany.
Your job:
1. Clarify goal (목표)
2. Write phase plan (계획)
3. Assign tasks (작업 분배: N. @에이전트명: 할 일)
4. Select 2-${MAX_TEAM_SIZE} agents from roster (에이전트 선별)
5. Plan ends with CEO approval cue ("진행하세요")

Output format (strict):
---PLAN---
## 목표
(한 문장)

## 계획
P1 … / P2 …

## 작업 분배
1. @에이전트명: 할 일
...
---AGENTS---
(쉼표로 agent id만, 예: id1,id2,id3)
---END---

Rules:
- Use only agents from the roster (no fictional roles)
- Pick specialists by role fit (research→researcher, automation→backend, domain→expert)
- Keep plan under 12 lines
${buildPmPlanningContextBlock(command)}`,
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

