export class AgentDuplicateNameError extends Error {
  readonly code = 'DUPLICATE_NAME';

  constructor(public readonly agentName: string) {
    super(`이미 "${agentName}" 이름의 에이전트가 있습니다. 다른 이름을 사용해 주세요.`);
    this.name = 'AgentDuplicateNameError';
  }
}

export class AgentDescriptionRequiredError extends Error {
  readonly code = 'DESCRIPTION_REQUIRED';

  constructor() {
    super('에이전트의 능력·성향·역할을 description에 입력해 주세요.');
    this.name = 'AgentDescriptionRequiredError';
  }
}
