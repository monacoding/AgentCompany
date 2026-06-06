import { Agent } from '../types';
import { formatAgentLabel, collectAgentMentionNames } from '../utils/agent-display';
import { parseCeoMention } from '../orchestrator/mention-parser';

export interface ChatThread {
  threadId: string;
  agentName: string;
  agentTitle?: string;
  agentDisplayName: string;
  agentRole?: string;
}

export function resolveThreadForCommand(
  command: string,
  agents: Agent[],
  secretary: Agent | null,
  findAgent?: (mention: string) => Agent | null
): ChatThread {
  const mention = parseCeoMention(command, collectAgentMentionNames(agents));

  if (mention) {
    const agent =
      agents.find((a) => a.name === mention.agentName) ??
      findAgent?.(mention.agentName) ??
      null;

    if (agent) {
      return {
        threadId: agent.id,
        agentName: agent.name,
        agentTitle: agent.title,
        agentDisplayName: formatAgentLabel(agent),
        agentRole: agent.title?.trim() || agent.role,
      };
    }
  }

  if (secretary) {
    return {
      threadId: secretary.id,
      agentName: secretary.name,
      agentTitle: secretary.title,
      agentDisplayName: formatAgentLabel(secretary),
      agentRole: secretary.title?.trim() || secretary.role,
    };
  }

  const fallback = agents[0];
  if (fallback) {
    return {
      threadId: fallback.id,
      agentName: fallback.name,
      agentTitle: fallback.title,
      agentDisplayName: formatAgentLabel(fallback),
      agentRole: fallback.title?.trim() || fallback.role,
    };
  }

  return { threadId: 'default', agentName: 'CEO Command', agentDisplayName: 'CEO Command' };
}
