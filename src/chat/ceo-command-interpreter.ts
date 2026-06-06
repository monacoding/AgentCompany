import { Agent, ROLE_DESCRIPTIONS } from '../types';
import { AgentFolderEngine } from '../agent-folders';
import { KnowledgeLearner } from '../agent-folders/knowledge-learner';
import { ProviderEngine } from '../providers';
import { runWithLlmAgent } from '../providers/llm-context';

export type CeoCommandAction =
  | 'conversation_complete'
  | 'needs_work'
  | 'cross_agent_file'
  | 'needs_clarification';

export interface CeoCommandInterpretation {
  acknowledgment: string;
  understoodTask: string;
  suggestedAction: CeoCommandAction;
}

function parseInterpretationJson(raw) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    const parsed = JSON.parse(candidate);
    if (typeof parsed.acknowledgment === "string" || typeof parsed.understoodTask === "string") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}
function cleanLine(text, maxLen = 500) {
  return text.replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ").trim().slice(0, maxLen);
}
function normalizeAction(value) {
  const action = String(value ?? "").trim();
  if (action === "conversation_complete" || action === "needs_work" || action === "cross_agent_file" || action === "needs_clarification") {
    return action;
  }
  return "needs_work";
}
var FALSE_FILE_COMPLETION = /(?:저장했|옮겼|복사했|받았|전달했|보냈|완료했|가져왔|옮겨\s*뒀|저장해\s*뒀|받아\s*뒀|넣어\s*뒀)/i;
export function sanitizeAcknowledgmentForPendingWork(acknowledgment: string, action: CeoCommandAction): string {
  const text = acknowledgment.trim();
  if (!text)
    return text;
  if (action === "cross_agent_file" || action === "needs_work") {
    if (FALSE_FILE_COMPLETION.test(text)) {
      return "\uC54C\uACA0\uC2B5\uB2C8\uB2E4, \uC0AC\uC7A5\uB2D8! \uB9D0\uC500\uD558\uC2E0 \uB0B4\uC6A9 \uD655\uC778\uD588\uC5B4\uC694. \uBC14\uB85C \uC9C4\uD589\uD574\uBCFC\uAC8C\uC694.";
    }
  }
  if (action === "cross_agent_file" && /(?:완료|끝났|해뒀|해놨)/i.test(text)) {
    return "\uC54C\uACA0\uC2B5\uB2C8\uB2E4, \uC0AC\uC7A5\uB2D8! \uBA3C\uC800 \uC0AC\uC7A5\uB2D8\uAED8 \uC694\uCCAD \uC5EC\uBD80 \uC5EC\uCB64\uBCF4\uACE0 \uC9C4\uD589\uD560\uAC8C\uC694.";
  }
  return text;
}
function fallbackInterpretation(agent, command) {
  const task = command.trim();
  return {
    acknowledgment: `\uC54C\uACA0\uC2B5\uB2C8\uB2E4, \uC0AC\uC7A5\uB2D8! ${task ? "\uB9D0\uC500\uD558\uC2E0 \uB0B4\uC6A9 \uD655\uC778\uD588\uC5B4\uC694." : ""}`.trim(),
    understoodTask: task,
    suggestedAction: "needs_work"
  };
}
export async function interpretCeoCommand(
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  knowledgeLearner: KnowledgeLearner,
  agent: Agent,
  command: string,
  chatContext?: string
): Promise<CeoCommandInterpretation> {
  const task = command.trim();
  if (!task)
    return fallbackInterpretation(agent, task);
  try {
    await knowledgeLearner.syncAgent(agent);
    const folderContext = await agentFolders.buildPromptContext(agent);
    const response = await runWithLlmAgent(
      agent.id,
      () => providers.chat(
        agent.provider,
        [
          {
            role: "system",
            content: `You are ${agent.name}, a ${agent.role} agent (${agent.title ?? agent.role}) in AgentCompany.
${folderContext || agent.description || ROLE_DESCRIPTIONS[agent.role]}
${agent.memory ? `
Memory:
${agent.memory}` : ""}

\uC0AC\uC7A5\uB2D8\uC758 \uC9C0\uC2DC\uB97C **\uB2F9\uC2E0\uC758 \uD398\uB974\uC18C\uB098\xB7\uB9D0\uD22C\xB7\uC131\uACA9**\uC5D0 \uB9DE\uAC8C \uC774\uD574\uD558\uACE0 \uC751\uB2F5\uD558\uC138\uC694.
- \uC0AC\uC7A5\uB2D8\uC744 \uBD80\uB97C \uB54C\uB294 \uD56D\uC0C1 "\uC0AC\uC7A5\uB2D8" (CEO, \uB300\uD45C\uB2D8, \uC2E4\uBA85 \uAE08\uC9C0)
- \uD55C\uAD6D\uC5B4, \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uB3D9\uB8CC/\uC9C1\uC6D0 \uB9D0\uD22C
- \uCF54\uB4DC, Python, \uB2E8\uACC4\uBCC4 \uACC4\uD68D, \uC601\uBB38, \uBA54\uD0C0 \uC124\uBA85 \uAE08\uC9C0
- \uC778\uC0AC\xB7\uC7A1\uB2F4\uC774\uBA74 acknowledgment\uAC00 \uC644\uACB0\uB41C \uB2F5\uBCC0\uC774\uC5B4\uC57C \uD568
- **\uD6C4\uC18D \uC9C0\uC2DC**(\uC804\uB2EC\uD574\uC918, \uD574\uC918, \uC904\uB798 \uB4F1 \uC8FC\uC5B4 \uC5C6\uC74C): \uCD5C\uADFC \uB300\uD654 \uB9E5\uB77D\uACFC \uD569\uCCD0 understoodTask\uC5D0 **\uC804\uCCB4 \uC758\uB3C4**\uB97C \uC801\uC73C\uC138\uC694. \uB9E5\uB77D\uC0C1 \uD30C\uC77C \uC804\uB2EC\uC774\uBA74 cross_agent_file \uB610\uB294 needs_work (conversation_complete \uAE08\uC9C0)
- \uB2E4\uB978 \uC5D0\uC774\uC804\uD2B8 \uD3F4\uB354/\uD30C\uC77C \uC694\uCCAD\uC774\uBA74 cross_agent_file
- \uC870\uC0AC\xB7\uC81C\uC791\xB7\uAD6C\uD604\xB7\uBD84\uC11D \uB4F1 \uC2E4\uBB34\uB294 needs_work
- \uB9E5\uB77D \uC5C6\uC774 \uC815\uB9D0 \uBD88\uBA85\uD655\uD560 \uB54C\uB9CC needs_clarification
- **\uD30C\uC77C \uC774\uB3D9\xB7\uBCF5\uC0AC\xB7\uC800\uC7A5 \uC694\uCCAD**: acknowledgment\uC5D0 "\uC800\uC7A5\uD588\uC5B4\uC694/\uC62E\uACBC\uC5B4\uC694/\uBC1B\uC558\uC5B4\uC694" \uB4F1 **\uC644\uB8CC \uD45C\uD604 \uAE08\uC9C0**. "\uD560\uAC8C\uC694/\uC694\uCCAD\uD574\uBCFC\uAC8C\uC694/\uC5EC\uCB64\uBCFC\uAC8C\uC694"\uB9CC \uC0AC\uC6A9.

JSON\uB9CC \uC751\uB2F5:
{"acknowledgment":"...","understoodTask":"...","suggestedAction":"conversation_complete|needs_work|cross_agent_file|needs_clarification"}`
          },
          ...chatContext ? [{ role: "user", content: `\uCD5C\uADFC \uB300\uD654:
${chatContext}` }] : [],
          {
            role: "user",
            content: chatContext ? `\uC0AC\uC7A5\uB2D8 \uC9C0\uC2DC:
${task}

(\uC704 \uC9C0\uC2DC\uAC00 \uC9E7\uAC70\uB098 \uC8FC\uC5B4\uAC00 \uC5C6\uC73C\uBA74 **\uCD5C\uADFC \uB300\uD654**\uC640 \uD569\uCCD0 \uC758\uB3C4\uB97C \uD30C\uC545\uD558\uC138\uC694.)` : `\uC0AC\uC7A5\uB2D8 \uC9C0\uC2DC:
${task}`
          }
        ],
        { type: agent.provider, model: agent.model }
      )
    );
    const parsed = parseInterpretationJson(response.content.trim());
    if (!parsed)
      return fallbackInterpretation(agent, task);
    const action = normalizeAction(parsed.suggestedAction);
    const acknowledgment = sanitizeAcknowledgmentForPendingWork(
      cleanLine(parsed.acknowledgment ?? "") || fallbackInterpretation(agent, task).acknowledgment,
      action
    );
    return {
      acknowledgment,
      understoodTask: cleanLine(parsed.understoodTask ?? "", 300) || task,
      suggestedAction: action
    };
  } catch {
    return fallbackInterpretation(agent, task);
  }
}
