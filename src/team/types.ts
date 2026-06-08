export type { TeamSession, TeamSessionStatus } from '../types';

export interface TeamTurnMessage {
  agentId: string;
  agentName: string;
  content: string;
}

export interface TeamRunResult {
  success: boolean;
  summary: string;
  turns: number;
}
