import { detectFolderOpenRequest, isContextDependentCommand } from '../chat';
import { detectPlatformInquiry } from '../platform';
import { isSecretaryAgent } from '../secretary';
import type { Agent, AgentRole } from '../types';

/**
 * Command Routing & Classification helpers
 *
 * Goal (long term):
 * - Move all "what kind of command is this?" decision logic here.
 * - Keep Orchestrator as a thin coordinator that asks the router "what should I do?"
 * - Make classification pure or near-pure where possible.
 */

// Currently unused but kept for potential future use / documentation
export const ROLE_TASK_MAP: Record<string, AgentRole[]> = {
  default: ['pm', 'backend', 'frontend', 'qa'],
  api: ['pm', 'backend', 'qa'],
  ui: ['pm', 'frontend', 'qa'],
  docs: ['pm', 'writer'],
  deploy: ['pm', 'devops'],
  research: ['pm', 'researcher'],
};

export const MAX_ORG_REVISIONS = 5;

/**
 * Determines if the given agent should be treated as a PM for special handling
 * (project planning, approvals, orchestration prompts, etc.).
 */
export function isPmAgent(agent: Agent): boolean {
  return agent.role === 'pm' || isSecretaryAgent(agent);
}

// Future candidates to move here (incrementally):
// - normalizeProjectCommand, shouldStartProjectImmediately, etc. (many already live in team/)
// - Command classification result type (e.g. CommandKind)

/**
 * 가벼운 대화(인사, 간단 질문, 폴더 경로 물음 등)인지 판단.
 * true이면 LLM을 통한 무거운 작업 없이 바로 답변 처리한다.
 */
export function isConversationalCommand(command: string): boolean {
  const text = command.trim();
  if (!text || text.length > 300) return false;
  if (detectFolderOpenRequest(text)) return true;
  if (detectPlatformInquiry(text)) return true;
  if (
    /폴더\s*경로|경로(?:는|이)?\s*(?:뭐|어디|알려)|(?:너|네|니|당신)(?:의)?\s*(?:경로|폴더)|[\uAC00-\uD7A3]{2,}\s*폴더\s*경로/i.test(
      text
    )
  ) {
    return true;
  }
  if (isContextDependentCommand(text)) return false;
  if (
    /```|\.(ts|tsx|js|py|md|json)|create|implement|fix|build|deploy|write|research|refactor|조사|구현|작성|수정|배포|리팩터|파일|코드|버그|찾|검색|다운|pdf|크롤|리서치|수집|확인|알아봐|수능|기출|제작|만들|쇼츠|숏폼|대본|기획해|스토리보드|썸네일|브리프/i.test(
      text
    )
  ) {
    return false;
  }
  return true;
}
