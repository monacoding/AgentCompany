import type { ExternalApiPublic } from './external-api';

export type AgentStatus =
  | 'idle'
  | 'working'
  | 'progress'
  | 'review'
  | 'waiting'
  | 'failed'
  | 'offline';

export type AgentRole =
  | 'ceo'
  | 'pm'
  | 'backend'
  | 'frontend'
  | 'qa'
  | 'researcher'
  | 'writer'
  | 'designer'
  | 'devops';

export type TaskStatus =
  | 'pending'
  | 'assigned'
  | 'working'
  | 'review'
  | 'completed'
  | 'failed';

export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'ollama'
  | 'runpod'
  | 'custom';

export interface Agent {
  id: string;
  name: string;
  /** 직책 (UI 표기용) — 예: 비서, 연구원, PM */
  title: string;
  role: AgentRole;
  description: string;
  status: AgentStatus;
  model: string;
  provider: ProviderType;
  capabilities: string[];
  memory: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  agentId: string | null;
  parentTaskId: string | null;
  result: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  agentId: string | null;
  taskId: string | null;
  message: string;
  createdAt: string;
}

export type AgentIdeaStatus = 'pending' | 'accepted' | 'dismissed';

export interface AgentIdea {
  id: string;
  agentId: string;
  title: string;
  body: string;
  status: AgentIdeaStatus;
  createdAt: string;
  updatedAt: string;
}

/** 조직도 노드 — CEO 또는 에이전트 */
export type OrgNodeKind = 'ceo' | 'agent';

export interface OrgNode {
  id: string;
  kind: OrgNodeKind;
  agentId?: string;
  label: string;
  x: number;
  y: number;
}

/** fromId(부하) → toId(상사) 보고 관계 */
export interface OrgEdge {
  id: string;
  fromId: string;
  toId: string;
}

export interface AgentOrganization {
  enabled: boolean;
  nodes: OrgNode[];
  edges: OrgEdge[];
  updatedAt: string;
}

export interface CreateAgentInput {
  name: string;
  title: string;
  role?: AgentRole;
  description?: string;
  model?: string;
  provider?: ProviderType;
  capabilities?: string[];
}

export interface UpdateAgentInput {
  name?: string;
  title?: string;
  role?: AgentRole;
  description?: string;
  model?: string;
  provider?: ProviderType;
  capabilities?: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  agentId?: string;
  parentTaskId?: string;
}

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface WebviewMessage {
  type: string;
  payload?: unknown;
}

export interface OrchestratorResult {
  taskId: string;
  success: boolean;
  message: string;
  subTasks?: Task[];
}

export interface AgentWorkLog {
  agent: Agent;
  activeTasks: Task[];
  recentTasks: Task[];
  activities: Activity[];
  memorySnippet: string;
}

export type {
  CreateExternalApiInput,
  ExternalApi,
  ExternalApiAuthType,
  ExternalApiPublic,
  ExternalApiTestResult,
  UpdateExternalApiInput,
} from './external-api';

export interface AppSettings {
  defaultProvider: ProviderType;
  defaultModel: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  ollamaBaseUrl: string;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  proactiveIdeasEnabled: boolean;
  proactiveIdeasIntervalMinutes: number;
  telegramInboundEnabled: boolean;
}

export type TeamSessionStatus = 'planning' | 'running' | 'done' | 'failed';
export type ProjectPhase = 'planning' | 'executing' | 'reviewing' | 'done' | 'failed';

export interface ProjectTask {
  agentId: string;
  agentName: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  output?: string;
  artifactPath?: string;
  extractedFiles?: string[];
}

export interface ProjectArtifact {
  name: string;
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
  kind: 'task' | 'summary' | 'file';
}

/** DB/API: Project 세션 (legacy table name team_sessions) */
export interface TeamSession {
  id: string;
  title: string;
  status: TeamSessionStatus;
  phase: ProjectPhase;
  projectTasks: ProjectTask[];
  /** PM 오케스트레이터 */
  leadAgentId: string;
  memberAgentIds: string[];
  threadId: string;
  /** company/projects/ 하위 폴더명 (프로젝트명_YYYYMMDD) */
  warehouseFolder: string;
  ceoCommand: string;
  parentTaskId: string | null;
  plan: string;
  summary: string;
  maxTurns: number;
  /** @멘션으로 지시한 에이전트 */
  requesterAgentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardPayload {
  agents: Agent[];
  tasks: Task[];
  activities: Activity[];
  ideas: AgentIdea[];
  teamSessions?: TeamSession[];
  orgChart: AgentOrganization;
  agentPhotos?: Record<string, string>;
  companyInfo: CompanyInfo;
  companyLogoUrl?: string;
  ownerInfo: OwnerInfo;
  ownerEmotionPhotos?: Record<string, string>;
  ownerProfilePhotoUrl?: string;
  settings: AppSettings & { masked?: Record<string, string>; telegramStatus?: { enabled: boolean; configured: boolean; ready: boolean } };
  externalApis: ExternalApiPublic[];
  llmStatus: LlmConnectionStatus;
  version: string;
}

export interface CompanyInfo {
  companyName: string;
  businessItem: string;
  policy: string;
  mindset: string;
  tendency: string;
  mission: string;
  /** YYYY-MM-DD */
  foundedAt: string;
  updatedAt: string;
}

export type CompanyInfoInput = Omit<CompanyInfo, 'updatedAt'>;

export interface OwnerInfo {
  name: string;
  personality: string;
  tendency: string;
  orientation: string;
  updatedAt: string;
}

export type OwnerInfoInput = Omit<OwnerInfo, 'updatedAt'>;

export interface OpenAiBillingInfo {
  /** 일반 sk- API Key로 잔액 조회 가능 여부 (현재 OpenAI는 false) */
  balanceAvailable: boolean;
  balanceLabel?: string;
  /** OPENAI_ADMIN_KEY 설정 시 이번 달 누적 사용액(USD) */
  monthUsageUsd?: number;
  monthUsageAvailable: boolean;
  adminKeyConfigured: boolean;
  hint: string;
  dashboardUrl: string;
}

export interface LlmConnectionStatus {
  provider: ProviderType;
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
  /** 에이전트 provider 별 API 연결 여부 */
  providerConnections?: Partial<Record<ProviderType, boolean>>;
  openAiBilling?: OpenAiBillingInfo;
}

export const AGENT_ROLES: { value: AgentRole; label: string }[] = [
  { value: 'ceo', label: 'CEO' },
  { value: 'pm', label: 'PM' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'qa', label: 'QA' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'writer', label: 'Writer' },
  { value: 'designer', label: 'Designer' },
  { value: 'devops', label: 'DevOps' },
];

export const ROLE_DESCRIPTIONS: Record<AgentRole, string> = {
  ceo: '업무 생성 및 전략 수립',
  pm: '작업 분해 및 일정 관리',
  backend: 'API 및 서버 개발',
  frontend: 'UI/UX 개발',
  qa: '테스트 및 품질 검증',
  researcher: '조사 및 분석',
  writer: '문서 작성',
  designer: '디자인',
  devops: '배포 및 인프라',
};
