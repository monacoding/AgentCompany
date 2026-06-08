import { detectPlatformInquiry } from '../platform';

export type KiloMode = 'architect' | 'coder' | 'debugger';

export interface KiloPipelineStep {
  step: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  message: string;
}

export interface KiloPlan {
  mode: KiloMode;
  objective: string;
  steps: string[];
  filesToModify: string[];
}

export interface KiloExecutionResult {
  mode: KiloMode;
  plan: KiloPlan;
  output: string;
  filesModified: string[];
  terminalOutput?: string;
  selfCheckPassed: boolean;
  reportPath?: string;
  usedCli: boolean;
}

export const MONA_AGENT = {
  name: '모나',
  title: '개발자',
  role: 'backend' as const,
  description: `Kilo Code Agentic Engineering Agent
아키텍처: Mode Router → Architect/Coder/Debugger → Code Planner → File Editor → Terminal → Self-Check
Powered by Kilo (https://github.com/kilo-org/kilocode)`,
  capabilities: ['kilo-code', 'code-gen', 'terminal', 'self-check', 'mcp-ready'],
};

export function isMonaAgent(agent: { name: string }): boolean {
  return agent.name.includes('모나') || agent.name.toLowerCase() === 'mona';
}

export function isHaJeongWooAgent(agent: { name: string }): boolean {
  return agent.name.includes('하정우');
}

const KILO_CAPABILITIES = ['kilo-code', 'code-gen', 'terminal', 'self-check'] as const;

/** Kilo capability 제거 대상 */
export function stripKiloCapabilities(capabilities: string[] | undefined): string[] {
  const caps = capabilities ?? [];
  return caps.filter((c) => !KILO_CAPABILITIES.includes(c as (typeof KILO_CAPABILITIES)[number]));
}

/** Kilo Code 파이프라인 실행 대상 (모나·kilo-code capability — 하정우 제외) */
export function isKiloAgent(agent: {
  name: string;
  title?: string;
  role?: string;
  capabilities?: string[];
}): boolean {
  if (isHaJeongWooAgent(agent)) return false;
  return isMonaAgent(agent) || agent.capabilities?.includes('kilo-code') === true;
}

/** 코드·자동화 구현 파이프라인이 필요한 명령 */
export function isDevTaskQuery(query: string): boolean {
  const text = query.trim();
  if (!text) return false;
  if (detectPlatformInquiry(text)) return false;
  if (/스택|도구|알려줘|설명만|추천해/i.test(text) && !/구현|자동화|작성/i.test(text)) {
    return false;
  }
  return /구현|자동화|스크립트|코드|개발|빌드|ffmpeg|remotion|파일|작성해|만들어|다운|저장|수집|실행|python|curl/i.test(
    text
  );
}

export function detectKiloMode(task: string): KiloMode {
  const lower = task.toLowerCase();
  if (
    lower.includes('설계') ||
    lower.includes('plan') ||
    lower.includes('architect') ||
    lower.includes('계획')
  ) {
    return 'architect';
  }
  if (
    lower.includes('debug') ||
    lower.includes('fix') ||
    lower.includes('bug') ||
    lower.includes('에러') ||
    lower.includes('수정') ||
    lower.includes('고쳐')
  ) {
    return 'debugger';
  }
  return 'coder';
}

export const KILO_MODES: Record<KiloMode, { label: string; description: string }> = {
  architect: { label: 'Architect', description: 'Plan with Architect mode — 설계 및 계획' },
  coder: { label: 'Coder', description: 'Code with Coder mode — 코드 생성 및 파일 수정' },
  debugger: { label: 'Debugger', description: 'Debug with Debugger mode — 오류 분석 및 수정' },
};
