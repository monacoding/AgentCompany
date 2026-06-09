export type CeoChatMessageType = 'ceo' | 'agent' | 'system' | 'confirmation';

export interface ChatTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type DelegateConfirmationKind =
  | 'secretary'
  | 'agent-collab'
  | 'file-match'
  | 'pm-project'
  | 'pm-final-task';

export interface CeoChatConfirmation {
  pendingId: string;
  command: string;
  agentId: string;
  agentName: string;
  kind?: DelegateConfirmationKind;
  sourceAgentId?: string;
  sourceAgentName?: string;
}

export interface CeoChatMessage {
  id: string;
  /** 에이전트별 채팅 스레드 (에이전트 id) */
  threadId: string;
  senderId: string | null;
  senderName: string;
  senderRole?: string;
  content: string;
  type: CeoChatMessageType;
  status?: 'pending' | 'working' | 'done' | 'failed';
  /** 말풍선 사진용 감정 (agent/{slug}/photo/{감정}.png) */
  emotion?: string;
  timestamp: string;
  confirmation?: CeoChatConfirmation;
  /** 해당 말풍선 생성에 사용된 LLM 토큰 (에이전트 응답만) */
  tokenUsage?: ChatTokenUsage;
}

export interface PendingDelegate {
  pendingId: string;
  command: string;
  agentId: string;
  agentName: string;
  kind?: DelegateConfirmationKind;
  sourceAgentId?: string;
  sourceAgentName?: string;
  collabThreadId?: string;
  /** 다른 에이전트 폴더에서 파일 가져오기 */
  fileTransfer?: boolean;
  fileHint?: string;
  fileSummary?: string;
  filePermissionAsk?: string;
  fileCollabRequest?: string;
  /** PM Project 계획 승인 대기 */
  planBrief?: string;
  /** PM 최종 통합 작업 승인 대기 */
  teamSessionId?: string;
  pmFinalTaskDescription?: string;
  /** 사장님 파일 확인 대기 */
  fileMatchPending?: boolean;
  candidateFiles?: Array<{ fileName: string; fromRelative: string; fromAbsolute: string }>;
  searchAttempt?: number;
  rejectedRelativePaths?: string[];
  /** 파일 전달 대상: 사장님 폴더 또는 다른 에이전트 */
  deliveryTarget?: 'owner' | 'agent';
}

/** 작업 중 말풍선 클릭 시 표시할 상세 정보 */
export interface ChatWorkingDetail {
  pipeline?: string;
  step?: string;
  summary: string;
  log: string[];
}

/** 작업 중 실시간 스트림 한 줄 (Cursor 스타일) */
export interface ChatWorkStreamLine {
  id: string;
  text: string;
  timestamp: string;
}

/** 채팅 기록에 남지 않는 작업 중 표시 */
export interface ChatWorkingState {
  threadId: string;
  senderId: string | null;
  senderName: string;
  senderRole?: string;
  content: string;
  detail?: ChatWorkingDetail;
  streamLog?: ChatWorkStreamLine[];
}
