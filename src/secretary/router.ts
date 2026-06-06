import { isKiloAgent } from '../kilo';
import { isResearchAgent } from '../research';
import { Agent } from '../types';
import { SecretaryRouteResult } from './types';

const CONFIDENCE_AUTO = 0.8;

export function getAutoAssignThreshold(): number {
  return CONFIDENCE_AUTO;
}

export function routeCommand(command: string, agents: Agent[]): SecretaryRouteResult | null {
  const lower = command.toLowerCase();
  const active = agents.filter((a) => a.status !== 'offline' && !a.name.includes('비서'));

  for (const agent of active) {
    if (lower.includes(agent.name.toLowerCase())) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.95,
        reason: `명령에 "${agent.name}"이(가) 언급되었습니다`,
      };
    }
  }

  if (/다운|download|pdf|받아|저장|내려받/.test(lower)) {
    const agent = active.find((a) => isResearchAgent(a) || a.name.includes('원영'));
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.86,
        reason: '파일·PDF 다운로드 업무로 판단됩니다',
      };
    }
  }

  if (/조사|research|크롤|crawl|리서치|검색|survey/.test(lower)) {
    const agent = active.find((a) => isResearchAgent(a) || a.name.includes('원영'));
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.88,
        reason: '조사·리서치 업무로 판단됩니다',
      };
    }
  }

  if (/api|backend|코드|구현|버그|fix|debug|개발|refactor|kilo/.test(lower)) {
    const agent = active.find((a) => isKiloAgent(a) || a.name.includes('모나') || a.role === 'backend');
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.85,
        reason: '개발·코딩 업무로 판단됩니다',
      };
    }
  }

  if (/ui|frontend|페이지|화면|컴포넌트|디자인/.test(lower)) {
    const agent = active.find((a) => a.role === 'frontend' || a.role === 'designer');
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.82,
        reason: 'UI·프론트엔드 업무로 판단됩니다',
      };
    }
  }

  if (/문서|doc|readme|가이드/.test(lower)) {
    const agent = active.find((a) => a.role === 'writer');
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.82,
        reason: '문서 작성 업무로 판단됩니다',
      };
    }
  }

  if (/배포|deploy|docker|ci|cd|infra/.test(lower)) {
    const agent = active.find((a) => a.role === 'devops');
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.82,
        reason: 'DevOps·배포 업무로 판단됩니다',
      };
    }
  }

  if (/테스트|qa|검증|test/.test(lower)) {
    const agent = active.find((a) => a.role === 'qa');
    if (agent) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        confidence: 0.8,
        reason: 'QA·테스트 업무로 판단됩니다',
      };
    }
  }

  const fallback = active.find((a) => a.role === 'pm') ?? active[0];
  if (!fallback) return null;

  return {
    agentId: fallback.id,
    agentName: fallback.name,
    confidence: 0.45,
    reason: '업무 유형이 명확하지 않습니다',
  };
}
