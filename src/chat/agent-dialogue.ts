import { Agent } from '../types';

export function agentFirstName(agent) {
  const name = agent.name.trim();
  const first = name.split(/\s+/)[0];
  return first || name;
}
export function simplifyTask(command) {
  return command.replace(/^이전 사장 지시 후속 작업:\s*/i, "").replace(/^@?\S+\s+/i, "").replace(/\s+/g, " ").trim();
}
export function buildDelegateRequestMessage(_source, target, command) {
  const targetName = agentFirstName(target);
  const task = simplifyTask(command);
  if (!task) {
    return `${targetName}\uC528! \uC774\uC5B4\uC11C \uC791\uC5C5 \uC880 \uB3C4\uC640\uC904\uB798\uC694?`;
  }
  return `${targetName}\uC528! ${task}\uC5D0 \uB300\uD574 \uB3C4\uC640\uC904\uB798\uC694?`;
}
export function buildDelegateAckMessage(_target, source) {
  const sourceName = agentFirstName(source);
  return `${sourceName}\uC528, \uC54C\uACA0\uC5B4\uC694! \uBC14\uB85C \uC0B4\uD3B4\uBCFC\uAC8C\uC694.`;
}
export function buildDelegateWorkingMessage(_target, source, step) {
  const sourceName = agentFirstName(source);
  const cleaned = step.replace(/^[⏳✓•]\s*/, "").replace(/^\[[^\]]+\]\s*/, "").trim();
  if (!cleaned)
    return `${sourceName}\uC528, \uC791\uC5C5 \uC9C4\uD589 \uC911\uC774\uC5D0\uC694!`;
  return `${sourceName}\uC528, ${cleaned}`;
}
export function buildDelegateCompleteMessage(_target, source, summary) {
  const sourceName = agentFirstName(source);
  const body = summary.trim();
  if (!body)
    return `${sourceName}\uC528, \uC694\uCCAD\uD558\uC2E0 \uC791\uC5C5 \uB9C8\uBB34\uB9AC\uD588\uC5B4\uC694!`;
  return `${sourceName}\uC528, \uB9D0\uC500\uD558\uC2E0 \uAC70 \uB9C8\uBB34\uB9AC\uD588\uC5B4\uC694!

${body}`;
}
export function buildDelegatePermissionAsk(_source, target, command, ownerLabel = "\uC0AC\uC7A5\uB2D8") {
  const targetName = agentFirstName(target);
  const task = simplifyTask(command);
  if (!task) {
    return `${ownerLabel}, ${targetName}\uC528\uC5D0\uAC8C \uBD80\uD0C1\uD574\uB3C4 \uB420\uAE4C\uC694?`;
  }
  return `${ownerLabel}, ${targetName}\uC528\uC5D0\uAC8C "${task}" \uBD80\uD0C1\uD574\uB3C4 \uB420\uAE4C\uC694?`;
}
export function buildDelegatePermissionGranted(_source, target) {
  const targetName = agentFirstName(target);
  return `\uAC10\uC0AC\uD569\uB2C8\uB2E4! \uADF8\uB7FC ${targetName}\uC528\uC5D0\uAC8C \uB9D0\uC500\uB4DC\uB824\uBCFC\uAC8C\uC694.`;
}
export function buildDelegatePermissionDenied(_source, target) {
  const targetName = agentFirstName(target);
  return `\uC54C\uACA0\uC5B4\uC694, ${targetName}\uC528\uC5D0\uAC8C\uB294 \uC544\uC9C1 \uB9D0\uC500 \uC548 \uB4DC\uB9B4\uAC8C\uC694. \uC870\uAE08 \uB354 \uC81C\uAC00 \uC9C1\uC811 \uACE0\uBBFC\uD574\uBCFC\uAC8C\uC694 \u2014 \uADF8\uB798\uB3C4 \uB2F5\uC774 \uC798 \uC548 \uB098\uC624\uBA74 \uB2E4\uC2DC \uC5EC\uCB64\uBD10\uB3C4 \uB420\uAE4C\uC694?`;
}
export function buildFileTransferCompleteMessage(fileOwner, recipient, detail) {
  const recipientName = agentFirstName(recipient);
  const body = detail.trim();
  if (!body)
    return `${recipientName}\uC528, \uD30C\uC77C \uC804\uB2EC\uC744 \uC644\uB8CC\uD588\uC5B4\uC694.`;
  return `${recipientName}\uC528, \uD30C\uC77C \uC804\uB2EC \uC644\uB8CC\uD588\uC5B4\uC694!

${body}`;
}
export function buildFileTransferFailedMessage(fileOwner, recipient, detail) {
  const recipientName = agentFirstName(recipient);
  const ownerName = agentFirstName(fileOwner);
  const body = detail.trim();
  if (!body) {
    return `${recipientName}\uC528, \uC8C4\uC1A1\uD574\uC694. ${ownerName}\uC528 \uD3F4\uB354\uC5D0\uC11C \uC694\uCCAD\uD558\uC2E0 \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC5B4\uC694.`;
  }
  return `${recipientName}\uC528, \uC8C4\uC1A1\uD574\uC694. \uD30C\uC77C \uC804\uB2EC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694.

${body}`;
}
export function buildOwnFolderFileMatchAsk(agent, fileList, searchAttempt = 0) {
  const retry = searchAttempt > 0 ? `

(\uB2E4\uC2DC \uAC80\uC0C9 ${searchAttempt + 1}\uD68C\uCC28)` : "";
  if (!fileList.trim()) {
    return "\uC0AC\uC7A5\uB2D8, \uC81C \uD3F4\uB354\uC5D0\uC11C \uC870\uAC74\uC5D0 \uB9DE\uB294 \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC5B4\uC694.";
  }
  return `\uC0AC\uC7A5\uB2D8, \uC81C \uD3F4\uB354\uC5D0\uC11C \uC544\uB798 \uD30C\uC77C\uC744 \uCC3E\uC558\uC5B4\uC694. \uC774 \uD30C\uC77C\uC774 \uB9DE\uC744\uAE4C\uC694?

${fileList}${retry}`;
}
export function buildFileMatchConfirmationAsk(fileOwner, fileList, searchAttempt = 0) {
  const ownerName = agentFirstName(fileOwner);
  const retry = searchAttempt > 0 ? `

(\uB2E4\uC2DC \uAC80\uC0C9 ${searchAttempt + 1}\uD68C\uCC28)` : "";
  if (!fileList.trim()) {
    return `\uC0AC\uC7A5\uB2D8, ${ownerName}\uC528 DB\uC5D0\uC11C \uC870\uAC74\uC5D0 \uB9DE\uB294 \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC5B4\uC694.`;
  }
  return `\uC0AC\uC7A5\uB2D8, ${ownerName}\uC528 DB\uC5D0\uC11C \uC544\uB798 \uD30C\uC77C\uC744 \uCC3E\uC558\uC5B4\uC694. \uC774 \uD30C\uC77C\uC774 \uB9DE\uC744\uAE4C\uC694?

${fileList}${retry}`;
}
export function buildFileTransferReceivedMessage(recipient, fileOwner) {
  const ownerName = agentFirstName(fileOwner);
  return `${ownerName}\uC528, \uC798 \uBC1B\uC558\uC5B4\uC694! \uAC10\uC0AC\uD569\uB2C8\uB2E4.`;
}


export function buildDelegateDeclinedMessage(_source: Agent, target: Agent): string {
  const targetName = agentFirstName(target);
  return `알겠어요, ${targetName}씨에게는 아직 말씀 안 드릴게요.`;
}

export function buildDelegateSentNotice(_source: Agent, target: Agent): string {
  const targetName = agentFirstName(target);
  return `${targetName}씨에게 요청 전달했어요!`;
}

export function buildOwnFolderDeliveryCompleteMessage(_agent: Agent, detail: string): string {
  const body = detail.trim();
  if (!body) return '사장님, 파일 전달을 완료했어요.';
  return `사장님, 파일 전달 완료했어요!\n\n${body}`;
}

export function buildFileTransferPermissionAsk(
  _source: Agent,
  fileOwner: Agent,
  command: string,
  ownerLabel = '사장님'
): string {
  const ownerName = agentFirstName(fileOwner);
  const task = simplifyTask(command);
  if (!task) return `${ownerLabel}, ${ownerName}씨에게 파일을 요청해도 될까요?`;
  return `${ownerLabel}, ${ownerName}씨에게 "${task}" — 파일 받아도 될까요?`;
}

export function buildFileTransferRequestMessage(
  requester: Agent,
  fileOwner: Agent,
  command: string
): string {
  const ownerName = agentFirstName(fileOwner);
  const requesterName = agentFirstName(requester);
  const task = simplifyTask(command);
  if (!task) {
    return `${ownerName}씨! 사장님께서 ${requesterName}씨한테 필요하다고 하셨어요. 파일 좀 부탁드려도 될까요?`;
  }
  return `${ownerName}씨! 사장님께서 ${requesterName}씨한테 ${task} 필요하다고 하셨어요. 가능할까요?`;
}
