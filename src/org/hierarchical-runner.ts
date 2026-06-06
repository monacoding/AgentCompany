import { ProviderEngine } from '../providers';
import { Agent } from '../types';
import { CEO_NODE_ID } from './org-engine';
import { formatAgentLabel } from '../utils/agent-display';

export interface ManagerReviewStep {
  manager: Agent;
  subordinate: Agent;
  fullReview: string;
  upwardSummary: string;
  approved: boolean;
  revisionRound?: number;
}

export interface ManagerReviewResult {
  approved: boolean;
  fullReview: string;
  reviewComment: string;
  revisionFeedback: string;
  upwardSummary: string;
}

function extractSection(text: string, sectionPattern: string): string {
  const re = new RegExp(`##\\s*${sectionPattern}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
  const match = text.match(re);
  return match ? match[1].trim() : '';
}

/** 관리자 LLM 응답에서 CEO 보고용 요약만 추출 */
export function extractUpwardReportSummary(reviewText: string): string {
  const fromSection = extractSection(reviewText, 'CEO\\s*보고용\\s*요약');
  if (fromSection) return fromSection;
  return extractSection(reviewText, 'CEO\\s*보고\\s*요약');
}

/** 관리자 검토 응답 파싱 (승인 / 반려) */
export function parseManagerReview(reviewText: string): ManagerReviewResult {
  const text = reviewText.trim();
  const resultSection = extractSection(text, '검토\\s*결과');
  const resultLower = resultSection.toLowerCase();

  let approved = false;
  if (resultSection) {
    approved = resultLower.includes('승인') && !resultLower.includes('반려');
    if (resultLower.includes('반려')) approved = false;
  } else {
    approved = !!extractUpwardReportSummary(text);
  }

  const reviewComment = extractSection(text, '검토\\s*의견');
  const revisionFeedback =
    extractSection(text, '수정\\s*지시') ||
    extractSection(text, '재작업\\s*지시') ||
    reviewComment;

  const upwardSummary = extractUpwardReportSummary(text) || reviewComment || text;

  return {
    approved,
    fullReview: text,
    reviewComment,
    revisionFeedback,
    upwardSummary,
  };
}

export async function reviewAndSummarizeForManager(
  manager: Agent,
  subordinate: Agent,
  command: string,
  subordinateResult: string,
  providers: ProviderEngine,
  managerContext?: string
): Promise<string> {
  const personaBlock = managerContext?.trim()
    ? `\n\n## 당신의 페르소나·기준\n${managerContext}`
    : `\n\n당신의 성향: ${manager.description || manager.title || manager.role}`;

  const response = await providers.chat(
    manager.provider,
    [
      {
        role: 'system',
        content: `You are ${manager.name} (${manager.title || manager.role}), a manager in AgentCompany.
직속 부하 ${subordinate.name}의 CEO 지시 업무 결과를 **당신 자신의 기준·성향·페르소나**에 맞는지 엄격히 검토합니다.
기준에 충족되면 승인, 미충족이면 반려하고 구체적인 수정 지시를 내립니다.
반드시 한국어로, 아래 형식을 정확히 따르세요:

## 검토 결과
승인
(또는 반려 — 하나만 작성)

## 검토 의견
(당신 기준으로 충족/미충족 이유, 2-4문장)

## 수정 지시
(반려 시 필수 — 부하가 다시 작업할 수 있도록 구체적으로)

## CEO 보고용 요약
(승인 시 필수 — CEO에게 올릴 간결한 보고)${personaBlock}`,
      },
      {
        role: 'user',
        content: `직속 부하: ${formatAgentLabel(subordinate)}
CEO 지시 업무: ${command}

부하 작업 결과:
${subordinateResult.slice(0, 6000)}

당신의 기준에 맞는지 판단하세요. 미충족이면 반드시 "반려"하고 수정 지시를 작성하세요.`,
      },
    ],
    { type: manager.provider, model: manager.model }
  );

  return response.content.trim();
}

export function buildCeoFinalReport(
  worker: Agent,
  reviewSteps: ManagerReviewStep[],
  command: string,
  finalSummary: string,
  revisionCount = 0
): string {
  const chain = [worker.name, ...reviewSteps.map((s) => s.manager.name), 'CEO'].join(' → ');

  const reviewSections =
    reviewSteps.length > 0
      ? reviewSteps
          .map((step) => {
            const status = step.approved ? '✅ 승인' : '❌ 반려';
            const round = step.revisionRound ? ` (수정 ${step.revisionRound}회차)` : '';
            return `### ${formatAgentLabel(step.manager)} 검토 ${status}${round}\n${step.fullReview.slice(0, 1200)}`;
          })
          .join('\n\n')
      : '_중간 관리자 검토 없음 (조직도에서 부하→상사 연결 및 저장을 확인하세요)_';

  const revisionNote =
    revisionCount > 0 ? `\n**재작업 횟수:** ${revisionCount}회 (상사 반려 후 부하 수정)\n` : '';

  return `📋 **조직 보고 완료**

**보고 경로:** ${chain}
**원래 지시:** ${command}${revisionNote}

---

## 최종 CEO 보고
${finalSummary.slice(0, 2500)}

---

## 상사 검토 내역
${reviewSections}`;
}

export function isCeoNode(nodeId: string): boolean {
  return nodeId === CEO_NODE_ID;
}
