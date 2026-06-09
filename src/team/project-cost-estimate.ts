import { Agent, ProjectTask } from '../types';
import { buildPriorDeliverablesContext, PriorDeliverable } from './project-context';
import { buildWorkerPhasePrompt } from './phase-prompts';
import { PROJECT_REVIEW_MAX_ITERATIONS } from './project-loop';
import { PROJECT_TASK_MAX_OUTPUT_TOKENS } from './project-worker-engine';
import { buildWorkerToolingHint } from './project-tooling';

/** 한·영 혼합 텍스트 토큰 근사 (보수적) */
export function estimateTokensFromText(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.ceil(trimmed.length / 3);
}

interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
}

const MODEL_PRICING: Array<{ pattern: RegExp; pricing: ModelPricing }> = [
  { pattern: /gpt-4o-mini/i, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },
  { pattern: /gpt-4o/i, pricing: { inputPer1M: 2.5, outputPer1M: 10 } },
  { pattern: /gpt-4-turbo/i, pricing: { inputPer1M: 10, outputPer1M: 30 } },
  { pattern: /gpt-3\.5/i, pricing: { inputPer1M: 0.5, outputPer1M: 1.5 } },
  { pattern: /claude.*sonnet/i, pricing: { inputPer1M: 3, outputPer1M: 15 } },
  { pattern: /claude.*opus/i, pricing: { inputPer1M: 15, outputPer1M: 75 } },
  { pattern: /claude.*haiku/i, pricing: { inputPer1M: 0.25, outputPer1M: 1.25 } },
];

const KRW_PER_USD = 1400;
const FOLDER_CONTEXT_TOKEN_BUFFER = 2500;
const REVIEW_RESPONSE_TOKENS = 450;
const AVG_REVIEW_ITERATIONS = 2;

export interface ProjectTaskCostEstimate {
  taskDescription: string;
  agentName: string;
  provider: string;
  model: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedTotalTokens: number;
  estimatedPromptTokensMax: number;
  estimatedCompletionTokensMax: number;
  estimatedTotalTokensMax: number;
  estimatedCostUsd: number | null;
  estimatedCostUsdMax: number | null;
  estimatedCostKrw: number | null;
  estimatedCostKrwMax: number | null;
  maxReviewIterations: number;
  maxOutputTokens: number;
}

function resolveModelPricing(model: string): ModelPricing | null {
  for (const entry of MODEL_PRICING) {
    if (entry.pattern.test(model)) return entry.pricing;
  }
  return null;
}

function calcCostUsd(
  promptTokens: number,
  completionTokens: number,
  pricing: ModelPricing | null
): number | null {
  if (!pricing) return null;
  return (
    (promptTokens / 1_000_000) * pricing.inputPer1M +
    (completionTokens / 1_000_000) * pricing.outputPer1M
  );
}

export function isPmFinalIntegrationTask(
  tasks: ProjectTask[],
  index: number,
  pmAgentId: string
): boolean {
  return index === tasks.length - 1 && tasks[index]?.agentId === pmAgentId;
}

export function estimatePmFinalTaskCost(params: {
  pm: Agent;
  command: string;
  plan: string;
  task: ProjectTask;
  priorDeliverables: PriorDeliverable[];
}): ProjectTaskCostEstimate {
  const priorContext = buildPriorDeliverablesContext(params.priorDeliverables, 120_000);
  const toolingHint = buildWorkerToolingHint(params.pm);
  const workerPrompt = buildWorkerPhasePrompt(
    params.pm,
    params.command,
    params.plan,
    params.task.description,
    priorContext,
    toolingHint
  );

  const largestPrior = params.priorDeliverables.reduce(
    (max, d) => Math.max(max, d.output.length),
    0
  );
  const expectedOutputTokens = Math.min(
    Math.max(estimateTokensFromText('x'.repeat(largestPrior)) || 4000, 4000),
    PROJECT_TASK_MAX_OUTPUT_TOKENS
  );

  const basePromptTokens =
    estimateTokensFromText(workerPrompt) + FOLDER_CONTEXT_TOKEN_BUFFER + 500;

  const avgRevisionOutput = Math.round(expectedOutputTokens * 0.45 * AVG_REVIEW_ITERATIONS);
  const avgReviewPrompt =
    AVG_REVIEW_ITERATIONS * (expectedOutputTokens + estimateTokensFromText(params.task.description) + 600);
  const avgReviewCompletion = AVG_REVIEW_ITERATIONS * REVIEW_RESPONSE_TOKENS;

  const estimatedPromptTokens = basePromptTokens + avgReviewPrompt;
  const estimatedCompletionTokens = expectedOutputTokens + avgRevisionOutput + avgReviewCompletion;

  const maxRevisionOutput = Math.round(
    expectedOutputTokens * 0.55 * PROJECT_REVIEW_MAX_ITERATIONS
  );
  const maxReviewPrompt =
    PROJECT_REVIEW_MAX_ITERATIONS *
    (expectedOutputTokens + estimateTokensFromText(params.task.description) + 600);
  const maxReviewCompletion = PROJECT_REVIEW_MAX_ITERATIONS * REVIEW_RESPONSE_TOKENS;

  const estimatedPromptTokensMax = basePromptTokens + maxReviewPrompt;
  const estimatedCompletionTokensMax =
    expectedOutputTokens + maxRevisionOutput + maxReviewCompletion;

  const pricing = resolveModelPricing(params.pm.model);
  const estimatedCostUsd = calcCostUsd(estimatedPromptTokens, estimatedCompletionTokens, pricing);
  const estimatedCostUsdMax = calcCostUsd(
    estimatedPromptTokensMax,
    estimatedCompletionTokensMax,
    pricing
  );

  return {
    taskDescription: params.task.description,
    agentName: params.pm.name,
    provider: params.pm.provider,
    model: params.pm.model,
    estimatedPromptTokens,
    estimatedCompletionTokens,
    estimatedTotalTokens: estimatedPromptTokens + estimatedCompletionTokens,
    estimatedPromptTokensMax,
    estimatedCompletionTokensMax,
    estimatedTotalTokensMax: estimatedPromptTokensMax + estimatedCompletionTokensMax,
    estimatedCostUsd,
    estimatedCostUsdMax,
    estimatedCostKrw: estimatedCostUsd != null ? Math.round(estimatedCostUsd * KRW_PER_USD) : null,
    estimatedCostKrwMax:
      estimatedCostUsdMax != null ? Math.round(estimatedCostUsdMax * KRW_PER_USD) : null,
    maxReviewIterations: PROJECT_REVIEW_MAX_ITERATIONS,
    maxOutputTokens: PROJECT_TASK_MAX_OUTPUT_TOKENS,
  };
}

function formatUsd(value: number | null): string {
  if (value == null) return '미산출 (로컬/미지원 모델)';
  if (value < 0.01) return `~$${value.toFixed(4)}`;
  return `~$${value.toFixed(2)}`;
}

function formatKrw(value: number | null): string {
  if (value == null) return '';
  return ` (약 ${value.toLocaleString('ko-KR')}원)`;
}

export function formatPmFinalTaskCostReport(estimate: ProjectTaskCostEstimate): string {
  const costLine =
    estimate.estimatedCostUsd != null
      ? `${formatUsd(estimate.estimatedCostUsd)}${formatKrw(estimate.estimatedCostKrw)}`
      : '미산출 (로컬/미지원 모델)';
  const costMaxLine =
    estimate.estimatedCostUsdMax != null
      ? `${formatUsd(estimate.estimatedCostUsdMax)}${formatKrw(estimate.estimatedCostKrwMax)}`
      : '';

  return [
    '사장님, PM 최종 통합 작업을 시작하기 전 **예상 LLM 비용**을 보고드립니다.',
    '',
    `**작업:** ${estimate.taskDescription}`,
    `**담당:** @${estimate.agentName}`,
    `**모델:** ${estimate.provider} / ${estimate.model}`,
    '',
    '| 항목 | 예상 (평균) | 최대 |',
    '|------|------------|------|',
    `| 입력 토큰 | ~${estimate.estimatedPromptTokens.toLocaleString('ko-KR')} | ~${estimate.estimatedPromptTokensMax.toLocaleString('ko-KR')} |`,
    `| 출력 토큰 | ~${estimate.estimatedCompletionTokens.toLocaleString('ko-KR')} | ~${estimate.estimatedCompletionTokensMax.toLocaleString('ko-KR')} |`,
    `| 합계 토큰 | ~${estimate.estimatedTotalTokens.toLocaleString('ko-KR')} | ~${estimate.estimatedTotalTokensMax.toLocaleString('ko-KR')} |`,
    `| 예상 비용 | ${costLine} | ${costMaxLine || '—'} |`,
    '',
    `- 검토 루프 최대 ${estimate.maxReviewIterations}회·출력 상한 ${estimate.maxOutputTokens.toLocaleString('ko-KR')} 토큰 기준`,
    '- 에이전트 knowledge·이전 산출물 길이에 따라 실제 비용은 달라질 수 있습니다.',
    '- 승인 시 PM 최종 통합 작업을 시작합니다.',
  ].join('\n');
}

export function buildPmFinalTaskApprovalConfirmationText(): string {
  return [
    '위 예상 비용으로 PM 최종 작업을 진행할까요?',
    '',
    '**승인**을 누르시면 최종 통합 작업이 시작됩니다.',
    '**거절**하시면 PM 최종 작업을 건너뛰고 기존 산출물로 보고서를 마무리합니다.',
  ].join('\n');
}
