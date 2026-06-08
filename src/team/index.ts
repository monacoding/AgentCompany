export { TeamEngine } from './team-engine';
export { buildTeamThreadId, isTeamThreadId } from './thread-id';
export {
  shouldUseTeamCollaboration,
  stripTeamCommandPrefix,
  normalizeTeamCommand,
} from './trigger';
export { proposeTeamMembers, formatTeamMemberLabels } from './member-picker';
export { resolveTeamPm, planTeamWithPm, shouldOrchestrateWithPm } from './pm-planner';
export type { TeamPlanResult } from './pm-planner';
export type { TeamSession, TeamSessionStatus, TeamRunResult } from './types';
