import { Agent } from '../types';
import { ProviderEngine } from '../providers';
import { runWithLlmAgent } from '../providers/llm-context';
import { agentFirstName } from './agent-dialogue';

export interface FileTransferDialogue {
  permissionAsk: string;
  collabRequest: string;
  searchHint: string;
}

function simplifyCeoCommand(command) {
  return command.replace(/^@\S+\s+/i, "").replace(/\s+/g, " ").trim();
}
function fallbackDialogue(requester, fileOwner, ceoCommand, searchHint) {
  const ownerName = agentFirstName(fileOwner);
  const requesterName = agentFirstName(requester);
  const task = simplifyCeoCommand(ceoCommand);
  return {
    permissionAsk: task ? `\uC0AC\uC7A5\uB2D8, ${ownerName}\uC528\uC5D0\uAC8C ${task} \u2014 \uC774\uAC70 \uD30C\uC77C\uB85C \uC880 \uBC1B\uC544\uB3C4 \uB420\uAE4C\uC694?` : `\uC0AC\uC7A5\uB2D8, ${ownerName}\uC528\uC5D0\uAC8C \uD30C\uC77C \uC880 \uC694\uCCAD\uD574\uB3C4 \uB420\uAE4C\uC694?`,
    collabRequest: task ? `${ownerName}\uC528! \uC0AC\uC7A5\uB2D8\uAED8\uC11C ${requesterName}\uC528\uD55C\uD14C \uD544\uC694\uD558\uB2E4\uACE0 \uD558\uC154\uC11C\uC694. ${task} \uAC00\uB2A5\uD560\uAE4C\uC694?` : `${ownerName}\uC528! \uC0AC\uC7A5\uB2D8 \uC9C0\uC2DC\uB85C \uD30C\uC77C \uC880 \uBD80\uD0C1\uB4DC\uB824\uB3C4 \uB420\uAE4C\uC694?`,
    searchHint: searchHint.trim() || task
  };
}
function parseDialogueJson(raw) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    const parsed = JSON.parse(candidate);
    if (typeof parsed.permissionAsk === "string" || typeof parsed.collabRequest === "string" || typeof parsed.searchHint === "string") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}
function cleanDialogueLine(text, maxLen = 220) {
  return text.replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ").trim().slice(0, maxLen);
}
export async function generateFileTransferDialogue(
  providers: ProviderEngine,
  requester: Agent,
  fileOwner: Agent,
  ceoCommand: string,
  fallbackSearchHint: string,
  understoodTask?: string
): Promise<FileTransferDialogue> {
  const fallback = fallbackDialogue(
    requester,
    fileOwner,
    understoodTask?.trim() || ceoCommand,
    fallbackSearchHint
  );
  const ownerName = agentFirstName(fileOwner);
  const requesterName = agentFirstName(requester);
  const task = (understoodTask?.trim() || simplifyCeoCommand(ceoCommand)).trim();
  if (!task)
    return fallback;
  try {
    const response = await runWithLlmAgent(
      requester.id,
      () => providers.chat(
        requester.provider,
        [
          {
            role: "system",
            content: `You are ${requester.name} (${requester.title ?? requester.role}). Write short, natural Korean workplace messages in your persona voice.
Rules:
- Use the understood task summary \u2014 never paste the CEO message verbatim or wrap it in quotes
- No numbered lists, no code, no template phrases like "\uD30C\uC77C\uC744 ~ \uD3F4\uB354\uB85C \uAC00\uC838\uC624\uAE30"
- permissionAsk: 1-2 sentences asking the CEO (call them "\uC0AC\uC7A5\uB2D8") for permission to ask ${fileOwner.name} for files
- collabRequest: 1-2 sentences to ${fileOwner.name} (call them "${ownerName}\uC528"), mention ${requesterName}\uC528 needs the files because the CEO asked
- searchHint: only file search keywords (subject, exam, format) \u2014 e.g. "\uC218\uB2A5 \uC218\uD559 pdf". No agent names.`
          },
          {
            role: "user",
            content: `Understood task:
${task}

Reply with JSON only:
{"permissionAsk":"...","collabRequest":"...","searchHint":"..."}`
          }
        ],
        { type: requester.provider, model: requester.model }
      )
    );
    const parsed = parseDialogueJson(response.content.trim());
    if (!parsed)
      return fallback;
    return {
      permissionAsk: cleanDialogueLine(parsed.permissionAsk ?? "") || fallback.permissionAsk,
      collabRequest: cleanDialogueLine(parsed.collabRequest ?? "") || fallback.collabRequest,
      searchHint: cleanDialogueLine(parsed.searchHint ?? "", 80) || fallback.searchHint
    };
  } catch {
    return fallback;
  }
}
