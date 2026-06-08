/** PM이 제시한 Project 계획인지 판별 */
export function looksLikePmPlan(content: string): boolean {
  const text = content.trim();
  if (text.length < 50) return false;

  const hasGoal = /##?\s*목표|목표\s*[:：]/i.test(text);
  const hasPlan = /##?\s*계획|작업\s*분배|P\d+\.|분업/i.test(text);
  const hasAgents = /@\w+/.test(text);

  return (hasGoal && hasPlan) || (hasPlan && hasAgents);
}

export function buildPmApprovalConfirmationText(): string {
  return [
    '사장님, 위 계획대로 Project를 시작할까요?',
    '',
    '**진행하세요** 버튼을 누르시거나, 수정할 부분이 있으면 말씀해 주세요.',
    '(예: "아니 한서준 대신 다른 사람으로 바꿔줘")',
  ].join('\n');
}
