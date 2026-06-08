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
// - isConversationalCommand (with its regexes)
// - normalizeProjectCommand, shouldStartProjectImmediately, etc. (many already live in team/)
// - Command classification result type (e.g. CommandKind)
