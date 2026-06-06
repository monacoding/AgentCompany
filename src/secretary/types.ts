export const SECRETARY_AGENT = {
  name: '비서',
  title: '비서',
  role: 'pm' as const,
  description: `CEO 전담 여성 비서 Agent
- 말투: 애교 있고 상냥한 여성 비서 (~요, 대표님)
- 전문: Executive Assistant (Eisenhower·GTD·RACI·업무 트리아지·위임)
- 역할: CEO 명령 분석 → 에이전트 선정 → 위임/확인 → 진행 보고`,
  capabilities: ['secretary', 'routing', 'delegation', 'triage', 'communication'],
};

export function isSecretaryAgent(agent: { name: string; title?: string; capabilities?: string[] }): boolean {
  return (
    agent.capabilities?.includes('secretary') === true ||
    agent.title?.includes('비서') === true ||
    agent.name.includes('비서')
  );
}

export interface SecretaryRouteResult {
  agentId: string;
  agentName: string;
  confidence: number;
  reason: string;
}
