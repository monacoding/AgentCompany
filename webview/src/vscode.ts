/// <reference types="vite/client" />

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

interface Window {
  acquireVsCodeApi?: typeof acquireVsCodeApi;
}

export interface Agent {
  id: string;
  name: string;
  title?: string;
  role: string;
  description: string;
  status: string;
  model: string;
  provider: string;
  capabilities?: string[];
  deactivated?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  agentId: string | null;
  parentTaskId: string | null;
  result: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  agentId: string | null;
  taskId: string | null;
  message: string;
  createdAt: string;
}

export interface AgentIdea {
  id: string;
  agentId: string;
  title: string;
  body: string;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultProvider: string;
  defaultModel: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  ollamaBaseUrl: string;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  proactiveIdeasEnabled?: boolean;
  proactiveIdeasIntervalMinutes?: number;
  telegramInboundEnabled?: boolean;
  telegramStatus?: { enabled: boolean; configured: boolean; ready: boolean };
  masked?: Record<string, string>;
}

export interface OpenAiBillingInfo {
  balanceAvailable: boolean;
  balanceLabel?: string;
  monthUsageUsd?: number;
  monthUsageAvailable: boolean;
  adminKeyConfigured: boolean;
  hint: string;
  dashboardUrl: string;
}

export interface LlmConnectionStatus {
  provider: string;
  model: string;
  configured: boolean;
  connected: boolean;
  envFileExists: boolean;
  keySource: 'env' | 'settings' | 'none';
  envFilePath: string | null;
  maskedKey: string;
  message: string;
  lastChecked: string;
  availableModels: string[];
  providerConnections?: Record<string, boolean>;
  openAiBilling?: OpenAiBillingInfo;
}

export interface ExternalApiPublic {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  authType: 'none' | 'bearer' | 'api-key' | 'basic' | 'query-param';
  authHeaderName: string;
  authQueryParam: string;
  maskedApiKey: string;
  hasApiKey: boolean;
  defaultHeaders: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentOrganization {
  enabled: boolean;
  nodes: OrgNode[];
  edges: OrgEdge[];
  updatedAt: string;
}

export type OrgNodeKind = 'ceo' | 'agent';

export interface OrgNode {
  id: string;
  kind: OrgNodeKind;
  agentId?: string;
  label: string;
  x: number;
  y: number;
}

export interface OrgEdge {
  id: string;
  fromId: string;
  toId: string;
}

export interface CompanyInfo {
  companyName: string;
  businessItem: string;
  policy: string;
  mindset: string;
  tendency: string;
  mission: string;
  foundedAt: string;
  updatedAt: string;
}

export interface OwnerInfo {
  name: string;
  personality: string;
  tendency: string;
  orientation: string;
  updatedAt: string;
}

export interface DashboardData {
  agents: Agent[];
  tasks: Task[];
  activities: Activity[];
  ideas?: AgentIdea[];
  teamSessions?: TeamSession[];
  orgChart: AgentOrganization;
  agentPhotos?: Record<string, string>;
  companyInfo?: CompanyInfo;
  companyLogoUrl?: string;
  ownerInfo?: OwnerInfo;
  ownerEmotionPhotos?: Record<string, string>;
  ownerProfilePhotoUrl?: string;
  settings: AppSettings;
  externalApis: ExternalApiPublic[];
  llmStatus: LlmConnectionStatus;
  version: string;
}

export type DelegateConfirmationKind = 'secretary' | 'agent-collab' | 'file-match' | 'pm-project';

export interface CeoChatConfirmation {
  pendingId: string;
  command: string;
  agentId: string;
  agentName: string;
  kind?: DelegateConfirmationKind;
  sourceAgentId?: string;
  sourceAgentName?: string;
}

export interface ChatTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CeoChatMessage {
  id: string;
  threadId: string;
  senderId: string | null;
  senderName: string;
  senderRole?: string;
  content: string;
  type: 'ceo' | 'agent' | 'system' | 'confirmation';
  status?: 'pending' | 'working' | 'done' | 'failed';
  emotion?: string;
  timestamp: string;
  confirmation?: CeoChatConfirmation;
  tokenUsage?: ChatTokenUsage;
}

/** 작업 중 말풍선 클릭 시 표시할 상세 정보 */
export interface ChatWorkingDetail {
  pipeline?: string;
  step?: string;
  summary: string;
  log: string[];
}

/** 작업 중 실시간 스트림 한 줄 */
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

export interface AgentChatThreadConfig {
  threadId: string;
  agentName: string;
  agentTitle?: string;
  agentDisplayName?: string;
  agentRole?: string;
  profilePhotoUrl?: string;
  emotionPhotos?: Record<string, string>;
  ownerName?: string;
  ownerEmotionPhotos?: Record<string, string>;
  ownerProfilePhotoUrl?: string;
  agentStatus?: string;
  collabMode?: boolean;
  collabPeerName?: string;
  collabPeerId?: string;
  targetAgentId?: string;
  panelTitle?: string;
  collabParticipants?: CollabParticipant[];
  projectMode?: boolean;
  projectTitle?: string;
  projectLeadAgentId?: string;
  projectParticipantIds?: string[];
}

export interface CollabParticipant {
  agentId: string;
  displayName: string;
  profilePhotoUrl?: string;
}

export interface AgentWorkLog {
  agent: Agent;
  activeTasks: Task[];
  recentTasks: Task[];
  activities: Activity[];
  memorySnippet: string;
}

export const vscode = window.acquireVsCodeApi?.() ?? {
  postMessage: (msg: unknown) => console.log('vscode.postMessage', msg),
  getState: () => null,
  setState: () => {},
};

export function postMessage(type: string, payload?: unknown): void {
  vscode.postMessage({ type, payload });
}

export type TabId = 'overview' | 'agents' | 'org' | 'projects' | 'tasks' | 'activity' | 'api' | 'settings';

export interface ProjectArtifact {
  name: string;
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
  kind: 'task' | 'summary' | 'file';
}

export interface TeamSession {
  id: string;
  title: string;
  status: 'planning' | 'running' | 'done' | 'failed';
  phase?: 'planning' | 'executing' | 'reviewing' | 'done' | 'failed';
  leadAgentId: string;
  memberAgentIds: string[];
  threadId: string;
  warehouseFolder?: string;
  ceoCommand: string;
  plan: string;
  summary: string;
  maxTurns: number;
  requesterAgentId?: string | null;
  createdAt: string;
  updatedAt: string;
  projectTasks?: Array<{
    agentId: string;
    agentName: string;
    description: string;
    status: string;
    output?: string;
    artifactPath?: string;
    extractedFiles?: string[];
  }>;
}
