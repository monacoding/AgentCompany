import { detectPlatformInquiry } from '../platform';

export function isHaJeongWooAgent(agent: { name: string }): boolean {
  return agent.name.includes('하정우');
}

const LEGACY_KILO_CAPS = ['kilo-code'] as const;

export function stripLegacyKiloCapabilities(capabilities: string[] | undefined): string[] {
  const caps = capabilities ?? [];
  return caps.filter((c) => !LEGACY_KILO_CAPS.includes(c as (typeof LEGACY_KILO_CAPS)[number]));
}

export type ClineMode = 'plan' | 'act' | 'debug';

export interface ClinePipelineStep {
  step: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  message: string;
}

export interface ClinePlan {
  mode: ClineMode;
  objective: string;
  steps: string[];
  filesToModify: string[];
}

export interface ClineExecutionResult {
  mode: ClineMode;
  plan: ClinePlan;
  output: string;
  filesModified: string[];
  terminalOutput?: string;
  selfCheckPassed: boolean;
  reportPath?: string;
  usedCli: boolean;
}

const CLINE_CAPABILITIES = ['cline-code', 'code-gen', 'terminal', 'self-check'] as const;

/** 하정우 전용 Cline 개발 파이프라인 */
export function isClineAgent(agent: {
  name: string;
  capabilities?: string[];
}): boolean {
  return isHaJeongWooAgent(agent) || agent.capabilities?.includes('cline-code') === true;
}

export function getClineCapabilities(): string[] {
  return [...CLINE_CAPABILITIES];
}

/** 코드·자동화 구현 — Cline 파이프라인 대상 */
export function isClineDevTask(query: string): boolean {
  const text = query.trim();
  if (!text) return false;
  if (detectPlatformInquiry(text)) return false;
  if (/스택|도구|알려줘|설명만|추천해/i.test(text) && !/구현|자동화|작성/i.test(text)) {
    return false;
  }
  return /구현|자동화|스크립트|코드|개발|빌드|ffmpeg|remotion|파일|작성해|만들어|다운|저장|수집|실행|python|curl|수정|고쳐|버그/i.test(
    text
  );
}

export function detectClineMode(task: string): ClineMode {
  const lower = task.toLowerCase();
  if (/설계|plan|계획|아키텍처/i.test(lower)) return 'plan';
  if (/debug|fix|bug|에러|수정|고쳐|버그/i.test(lower)) return 'debug';
  return 'act';
}

export const CLINE_MODES: Record<ClineMode, { label: string; description: string }> = {
  plan: { label: 'Plan', description: '코드베이스 탐색·계획 수립' },
  act: { label: 'Act', description: '파일 수정·터미널 실행·구현' },
  debug: { label: 'Debug', description: '오류 분석·수정' },
};
