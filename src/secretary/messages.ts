import { SecretaryRouteResult } from './types';

/** 비서 전용 응답 — 여성 비서 말투 + 프로페셔널 */
export const SecretaryMessages = {
  acknowledgeCommand(): string {
    return '네~ 대표님! ✨ 명령 잘 받았어요. 딱 맞는 에이전트 찾아볼게요~';
  },

  noActiveAgents(): string {
    return (
      '앗, 대표님… 지금 활성화된 에이전트가 없어요 😢\n' +
      'Agents 탭에서 에이전트를 Activate 해 주시면, 바로 업무 배정 도와드릴게요~'
    );
  },

  agentNotFound(): string {
    return '음… 해당 에이전트를 찾지 못했어요. Agents 탭에서 이름을 확인해 주실 수 있을까요?';
  },

  emptyMention(): string {
    return '대표님~ @에이전트 뒤에 하실 말씀을 적어 주세요! 바로 전달해 드릴게요 ✨';
  },

  unknownMention(agentName: string): string {
    return (
      `앗, "@${agentName}" 에이전트는 아직 등록되어 있지 않은 것 같아요.\n` +
      'Agents 탭에서 이름을 확인해 주시거나, 다른 에이전트를 @로 지정해 주세요~'
    );
  },

  autoDelegate(route: SecretaryRouteResult, targetName: string): string {
    return (
      `네~ 대표님! 💼\n` +
      `${route.reason}.\n` +
      `${targetName} 에이전트에게 바로 업무 전달할게요~`
    );
  },

  askConfirmation(route: SecretaryRouteResult, targetName: string): string {
    const reasonLine =
      route.confidence < 0.5
        ? `이번 업무는 유형이 조금 애매해서요… 🤔\n${route.reason}`
        : route.reason;

    return `${reasonLine}\n\n${targetName} 에이전트에게 업무를 맡겨 드릴까요?`;
  },

  confirmedDelegate(agentName: string): string {
    return `네~ 알겠어요, 대표님! ✨ ${agentName} 에이전트에게 업무 전달할게요~`;
  },

  rejectedDelegate(): string {
    return (
      '알겠어요~ 다른 지시 내려주시면 바로 도와드릴게요!\n' +
      '@에이전트명 으로 직접 지정하셔도 편하세요~'
    );
  },

  /** 라우팅 근거를 비서 말투로 부드럽게 다듬 */
  softenReason(reason: string): string {
    const map: Record<string, string> = {
      '업무 유형이 명확하지 않습니다': '이번 업무는 유형을 조금 더 확인해 봐야 할 것 같아요',
      '조사·리서치 업무로 판단됩니다': '조사·리서치 업무로 보여요',
      '개발·코딩 업무로 판단됩니다': '개발·코딩 업무로 보여요',
      'UI·프론트엔드 업무로 판단됩니다': 'UI·프론트엔드 업무로 보여요',
      '문서 작성 업무로 판단됩니다': '문서 작성 업무로 보여요',
      'DevOps·배포 업무로 판단됩니다': 'DevOps·배포 업무로 보여요',
      'QA·테스트 업무로 판단됩니다': 'QA·테스트 업무로 보여요',
      '파일·PDF 다운로드 업무로 판단됩니다': '파일·PDF 다운로드 업무로 보여요',
    };

    for (const [key, value] of Object.entries(map)) {
      if (reason.includes(key)) return reason.replace(key, value);
    }
    return reason;
  },
};
