import { Agent } from '../types';
import { getAgentMatchTokens, textMentionsAgent } from '../utils/agent-display';
import { isInquiryOrApiCommand } from '../external-api/auto-detect';
import { detectFolderOpenRequest } from './folder-path';

export interface CrossAgentFileRequest {
  fileOwner: Agent;
  requester: Agent;
  fileHint: string;
  summary: string;
}

export interface OwnFolderFileRequest {
  agent: Agent;
  fileHint: string;
  summary: string;
}

export type FolderPathScope = 'owner' | 'agent' | 'both' | 'named';

const FOLDER_PATH_SIGNAL =
  /(?:폴더\s*경로|경로(?:는|이)?\s*(?:확인|알려|알려줘|뭐|무엇|어디)|폴더\s*(?:위치|어디|확인)|어디에\s*(?:저장|있)|(?:너|네|니|당신)(?:의)?\s*경로|내\s*폴더|제\s*폴더|작업\s*폴더|outputs?\s*경로|folder\s*path)/i;

/** 사장님·에이전트 폴더 **경로 안내** (파일 전달이 아님) */
export function detectFolderPathInquiry(command: string): FolderPathScope | null {
  const text = command.trim();
  if (!text || !FOLDER_PATH_SIGNAL.test(text)) return null;
  if (isExternalResourceFetchTask(text)) return null;
  if (/(?:가져|복사|전달|옮기|보내|줄래|줘|드릴|드려|제공)/i.test(text) && /파일|pdf/i.test(text)) {
    return null;
  }

  if (/(?:사장님\s*폴더|owner|company\/owner)/i.test(text)) return 'owner';
  if (
    /(?:너(?:의)?|니(?:가)?|네|당신(?:의)?)\s*경로|(?:너(?:의)?|니(?:가)?|네|당신(?:의)?|에이전트)\s*폴더|작업\s*폴더|outputs?\s*폴더/i.test(
      text
    )
  ) {
    return 'agent';
  }
  if (/내\s*폴더|제\s*폴더|우리\s*폴더/i.test(text)) return 'owner';
  return 'both';
}

var TRANSFER_SIGNAL = /(?:가져|옮기|복사|전달|이동|받아|넘겨|공유|옮겨|가져가|가져와|받을|전해|제공받|받은|저장|내\s*폴더|제\s*폴더|우리\s*폴더|갖고\s*있|가지고\s*있|추출하여|추출해서|저장하도록|저장해)/i;
var GIVE_TO_CEO_SIGNAL =
  /(?:파일|pdf|자료|문서|리포트|산출물|데이터).{0,40}(?:줄래|줘|보내|전달|드려|드릴)|(?:줄래|보내줘|보내|드릴|드려|전해줘|제공해)/i;
var SELF_FOLDER_SIGNAL = /(?:너(?:의)?|니(?:가)?|네|당신(?:의)?|본인(?:의)?|자기(?:의)?|제\s*폴더|내\s*폴더|우리\s*폴더|여기\s*폴더|여기\s*있)/i;
var AGENT_REQUEST_SIGNAL = /(?:에게|한테).{0,80}(?:요청|부탁|전달|제공받|제공해|말씀|연락|협력)/i;
var FILE_SIGNAL = /(?:파일|폴더|데이터(?:베이스)?|outputs?|다운(?:로드|받)|pdf|자료|산출물|리포트|보관|저장|문서)/i;
var CROSS_AGENT_FILE_SIGNAL = /(?:다른\s*에이전트|에이전트\s*폴더|서준이|서준|한서준).{0,60}(?:pdf|파일|폴더|갖고|보유|추출|저장)/i;

/** 로컬 폴더·에이전트 간 기존 파일 전달 */
function isLocalFileTransferCommand(text: string): boolean {
  return (
    /(?:다른\s*에이전트|에이전트\s*폴더).{0,40}(?:가져|복사|전달|옮)/i.test(text) ||
    /(?:내|제|우리|너(?:의)?|당신(?:의)?)\s*폴더.{0,40}(?:가져|복사|전달|있는\s*파일|찾)/i.test(text) ||
    /(?:가져|복사|전달).{0,30}(?:폴더|outputs?)/i.test(text) ||
    CROSS_AGENT_FILE_SIGNAL.test(text)
  );
}

/**
 * 인터넷·공식 사이트 등 외부에서 PDF/자료를 수집·다운로드하는 업무.
 * "다운받아서 저장"은 로컬 폴더 전달이 아님.
 */
export function isExternalResourceFetchTask(command: string): boolean {
  const text = command.trim();
  if (!text) return false;
  if (isLocalFileTransferCommand(text)) return false;

  const wantsWebResource =
    /인터넷|웹|온라인|사이트|공식|평가원|suneung|크롤|검색(?:해서|하여)|찾아(?:서)?\s*(?:받|다운)|다운(?:로드|받)|download|http/i.test(
      text
    );
  const hasCollectTarget = /pdf|파일|문서|자료|기출|수능|문제/i.test(text);

  if (wantsWebResource && hasCollectTarget) return true;

  // 짧은 후속 지시 ("인터넷에서 다운받으라고")
  if (/인터넷|웹|온라인|사이트/.test(text) && /다운|받|수집|가져/.test(text)) {
    return true;
  }

  // "인터넷" 없이도 수능+PDF+다운로드 조합은 외부 수집 업무
  if (
    /수능|기출|csat/i.test(text) &&
    /pdf|다운/i.test(text) &&
    /다운|받|수집|저장|가져|수행/i.test(text)
  ) {
    return true;
  }

  return false;
}
function escapeRegex2(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeFileHint(hint) {
  return hint.replace(/수리/g, "\uC218\uD559").trim();
}
function extractFileHint(command, agents) {
  let text = command.trim();
  for (const agent of agents) {
    for (const token of getAgentMatchTokens(agent)) {
      text = text.replace(new RegExp(escapeRegex2(token), "g"), " ");
      text = text.replace(
        new RegExp(`${escapeRegex2(token)}(?:\uC774|\uAC00|\uC740|\uB294|\uC528|\uB2D8|\uC5D0\uAC8C|\uD55C\uD14C|\uC758)`, "g"),
        " "
      );
    }
  }
  text = text.replace(/@[^\s]+/g, " ").replace(
    /(?:가져|옮기|복사|전달|이동|받아|넘겨|공유|옮겨|가져가|가져와|받을|전해|달라|해줘|해주|부탁|요청|지시|폴더로|내\s*폴더|우리\s*폴더|제\s*폴더|저장하|제공받|연락|말씀|갖고\s*있|추출|협력)/gi,
    " "
  ).replace(/\s+/g, " ").trim();
  return normalizeFileHint(text || command.trim());
}
function buildFileRequestSummary(fileOwner, requester, fileHint) {
  const hint = fileHint.trim();
  if (!hint) {
    return `${fileOwner.name}\uC528 \uB370\uC774\uD130\uC5D0\uC11C \uD30C\uC77C\uC744 ${requester.name}\uC528 \uD3F4\uB354\uB85C \uAC00\uC838\uC624\uAE30`;
  }
  return `${fileOwner.name}\uC528\uC758 "${hint}" \uD30C\uC77C\uC744 ${requester.name}\uC528 \uD3F4\uB354\uB85C \uAC00\uC838\uC624\uAE30`;
}
function agentOwnsFilesInText(text, agent) {
  for (const token of getAgentMatchTokens(agent)) {
    const ownerPattern = new RegExp(
      `${escapeRegex2(token)}(?:\uC774|\uAC00|\uC758|\uC5D0\uAC8C|\uD55C\uD14C|\uC5D0\uAC8C\uC11C|\uD55C\uD14C\uC11C|\uC528\uC758|\uB2D8\uC758).{0,50}(?:\uCC3E|\uB2E4\uC6B4|\uC218\uC9D1|\uBCF4\uC720|\uD3F4\uB354|\uB370\uC774\uD130|\uD30C\uC77C|\uC0B0\uCD9C|\uB9AC\uD3EC\uD2B8|\uC800\uC7A5|\uC81C\uACF5|\uAC16\uACE0|\uAC00\uC9C0\uACE0|\uC788\uB294)`,
      "i"
    );
    const possessivePattern = new RegExp(
      `${escapeRegex2(token)}(?:\uC774|\uAC00|\uC758|\uC528|\uB2D8)?\\s*(?:\uD3F4\uB354|\uB370\uC774\uD130(?:\uBCA0\uC774\uC2A4)?|\uD30C\uC77C|\uC0B0\uCD9C\uBB3C|\uB9AC\uD3EC\uD2B8|outputs?)`,
      "i"
    );
    const requestToPattern = new RegExp(
      `${escapeRegex2(token)}(?:\uC5D0\uAC8C|\uD55C\uD14C).{0,80}(?:\uC694\uCCAD|\uBD80\uD0C1|\uC804\uB2EC|\uC81C\uACF5|\uD611\uB825)`,
      "i"
    );
    if (ownerPattern.test(text) || possessivePattern.test(text) || requestToPattern.test(text)) {
      return true;
    }
  }
  return false;
}
export function detectCrossAgentFileRequest(
  command: string,
  currentAgent: Agent,
  findAgent: (name: string) => Agent | null | undefined,
  allAgents: Agent[]
): CrossAgentFileRequest | null {
  const text = command.trim();
  if (!text || detectFolderOpenRequest(text) || isInquiryOrApiCommand(text) || !FILE_SIGNAL.test(text))
    return null;
  if (isExternalResourceFetchTask(text))
    return null;
  const hasTransferIntent = TRANSFER_SIGNAL.test(text) || AGENT_REQUEST_SIGNAL.test(text) || CROSS_AGENT_FILE_SIGNAL.test(text);
  if (!hasTransferIntent)
    return null;
  let fileOwner = null;
  for (const agent of allAgents) {
    if (agent.id === currentAgent.id)
      continue;
    if (!textMentionsAgent(text, agent))
      continue;
    if (agentOwnsFilesInText(text, agent)) {
      fileOwner = agent;
      break;
    }
  }
  if (!fileOwner) {
    for (const agent of allAgents) {
      if (agent.id === currentAgent.id)
        continue;
      if (textMentionsAgent(text, agent)) {
        fileOwner = findAgent(agent.name) ?? agent;
        break;
      }
    }
  }
  if (!fileOwner || fileOwner.id === currentAgent.id)
    return null;
  const fileHint = extractFileHint(text, allAgents);
  return {
    fileOwner,
    requester: currentAgent,
    fileHint,
    summary: buildFileRequestSummary(fileOwner, currentAgent, fileHint)
  };
}
function mentionsOtherAgentAsSource(text, currentAgent, allAgents) {
  for (const agent of allAgents) {
    if (agent.id === currentAgent.id)
      continue;
    if (textMentionsAgent(text, agent))
      return true;
  }
  return false;
}
export function detectOwnFolderFileRequest(
  command: string,
  currentAgent: Agent,
  allAgents: Agent[]
): OwnFolderFileRequest | null {
  const text = command.trim();
  if (!text || detectFolderOpenRequest(text) || isInquiryOrApiCommand(text) || !FILE_SIGNAL.test(text))
    return null;
  if (isExternalResourceFetchTask(text))
    return null;
  if (detectCrossAgentFileRequest(command, currentAgent, () => null, allAgents)) {
    return null;
  }
  const hasTransferIntent = TRANSFER_SIGNAL.test(text) || GIVE_TO_CEO_SIGNAL.test(text) || /(?:갖고\s*있|가지고\s*있).{0,50}(?:줄래|줘|전달|보내|드릴|드려)/i.test(text);
  if (!hasTransferIntent)
    return null;
  const selfFolder = SELF_FOLDER_SIGNAL.test(text) || textMentionsAgent(text, currentAgent) && agentOwnsFilesInText(text, currentAgent) || !mentionsOtherAgentAsSource(text, currentAgent, allAgents);
  if (!selfFolder)
    return null;
  const fileHint = extractFileHint(text, allAgents);
  const hint = fileHint.trim();
  return {
    agent: currentAgent,
    fileHint,
    summary: hint ? `${currentAgent.name}\uC528 \uD3F4\uB354\uC758 "${hint}" \uD30C\uC77C\uC744 \uC0AC\uC7A5\uB2D8\uAED8 \uC804\uB2EC` : `${currentAgent.name}\uC528 \uD3F4\uB354 \uD30C\uC77C\uC744 \uC0AC\uC7A5\uB2D8\uAED8 \uC804\uB2EC`
  };
}

