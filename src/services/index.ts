import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  AgentFolderEngine,
  buildAgentFolderSlug,
  FILE_TRANSFER_KNOWLEDGE_FILENAME,
  FILE_TRANSFER_KNOWLEDGE_MARKER,
  getFileTransferKnowledgeSummary,
  getOwnerPathKnowledgeSummary,
  KnowledgeLearner,
  OWNER_PATH_KNOWLEDGE_FILENAME,
  OWNER_PATH_KNOWLEDGE_MARKER,
} from '../agent-folders';
import { AgentPhotoWatcher } from '../agent-folders/photo-watcher';
import { AgentProfileGenerator } from '../agent-folders/profile-generator';
import { KnowledgeWatcher } from '../agent-folders/knowledge-watcher';
import { getOwnerDisplayName } from '../agent-folders/owner-persona';
import { inferRoleFromTitle } from '../agent-folders/title-inference';
import { AgentManager, isInProgressTask, isReviewReadyTask, resolveAgentDisplayStatus } from '../agents';
import { AgentDescriptionRequiredError, AgentDuplicateNameError } from '../agents/errors';
import { ChatService, detectSpeakerEmotion, resolveThreadForCommand } from '../chat';
import { Database } from '../database';
import { ExternalApiRegistrySync } from '../external-api/registry';
import { IdeaEngine } from '../ideas/idea-engine';
import { IdeaService } from '../ideas/idea-service';
import {
  CLINE_KNOWLEDGE_FILENAME,
  CLINE_KNOWLEDGE_MARKER,
  ClineCliService,
  getClineKnowledgeBody,
  getClineKnowledgeSummary,
  getClinerulesBody,
  getClineCapabilities,
  isClineAgent,
  isHaJeongWooAgent,
  stripLegacyKiloCapabilities,
} from '../cline';
import {
  buildPlatformStructurePromptBlock,
  getPlatformStructureBody,
  isDeveloperAgent,
  PLATFORM_STRUCTURE_FILENAME,
  PLATFORM_STRUCTURE_MARKER,
  resolvePlatformPaths,
} from '../platform';
import { MemoryEngine } from '../memory';
import { NotificationEngine } from '../notifications';
import { TelegramInboundPoller } from '../notifications/telegram-inbound';
import { CEO_NODE_ID, OrgEngine } from '../org';
import { Orchestrator } from '../orchestrator';
import { TeamEngine, formatProjectDisplayTitle, resolveSessionWarehouseFolder } from '../team';
import {
  getProjectPlaybookSummary,
  getRoleProjectPlaybookSnippet,
  getSuneungPdfPlaybook,
  PROJECT_PLAYBOOK_FILENAME,
  PROJECT_PLAYBOOK_MARKER,
  SUNEUNG_PDF_PLAYBOOK_FILENAME,
} from '../team/project-playbook';
import { isProductionAgent } from '../production';
import { LlmUsageTracker, ProviderEngine } from '../providers';
import { Crawl4AiDockerService } from '../research/docker/crawl4ai-docker';
import { isResearchAgent, WONYOUNG_AGENT } from '../research';
import {
  getDownloadKnowledgeSummary,
  WONYOUNG_DOWNLOAD_KNOWLEDGE_MARKER,
} from '../research/webcrawler/download-knowledge';
import {
  getSecretaryKnowledgeSummary,
  SECRETARY_AGENT,
  SECRETARY_KNOWLEDGE_MARKER,
} from '../secretary';
import { TaskEngine } from '../tasks';
import {
  AGENT_ROLES,
  Agent,
  AgentOrganization,
  AppSettings,
  CompanyInfoInput,
  CreateAgentInput,
  LlmStatus,
  OwnerInfoInput,
} from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import { now } from '../utils';
import { WorkspaceEngine } from '../workspace';
import { CredentialsService } from './credentials';
import { EnvService } from './env';
import { ExternalApiService } from './external-api';
import { getSettingsForWebview, SettingsService } from './settings';
import { LlmStatusService } from './llm-status';
import { VoiceCaptureService, VoiceCaptureResult } from './voice-capture';
import {
  BUILTIN_VOICE_SHORTCUT,
  VoiceShortcutConfig,
  VoiceShortcutSettings,
} from './voice-shortcut-settings';
import { VoiceTranscriptionService } from './voice-transcription';

export class AgentCompanyService {
  readonly db: Database;
  readonly memory: MemoryEngine;
  readonly agents: AgentManager;
  readonly tasks: TaskEngine;
  readonly workspace: WorkspaceEngine;
  readonly env: EnvService;
  readonly credentials: CredentialsService;
  readonly llmStatus: LlmStatusService;
  readonly llmUsage: LlmUsageTracker;
  readonly providers: ProviderEngine;
  readonly notifications: NotificationEngine;
  readonly orchestrator: Orchestrator;
  readonly settings: SettingsService;
  readonly crawl4aiDocker: Crawl4AiDockerService;
  readonly clineCli: ClineCliService;
  readonly chat: ChatService;
  readonly externalApis: ExternalApiService;
  readonly agentFolders: AgentFolderEngine;
  readonly agentProfileGenerator: AgentProfileGenerator;
  readonly knowledgeLearner: KnowledgeLearner;
  readonly ideaEngine: IdeaEngine;
  readonly ideas: IdeaService;
  readonly telegramInbound: TelegramInboundPoller;
  readonly teams: TeamEngine;
  readonly orgEngine: OrgEngine;
  readonly voiceTranscription: VoiceTranscriptionService;
  readonly voiceCapture: VoiceCaptureService;
  readonly voiceShortcutSettings: VoiceShortcutSettings;
  readonly apiRegistrySync: ExternalApiRegistrySync;

  private knowledgeWatcher?: KnowledgeWatcher;
  private photoWatcher?: AgentPhotoWatcher;
  private dashboardRefresh?: () => void;
  private dashboardNavigate?: (tab: string) => void;
  private initialized = false;
  private cachedLlmStatus: LlmStatus | null = null;
  private partialTranscriptTimer?: ReturnType<typeof setInterval>;
  private partialTranscriptBusy = false;
  private partialTranscriptSessionId: string | null = null;

  constructor(private context: vscode.ExtensionContext) {
    this.context = context;
    this.db = new Database(context.globalStorageUri.fsPath);
    this.orgEngine = new OrgEngine(this.db);
    this.memory = new MemoryEngine(this.db);
    this.tasks = new TaskEngine(this.db, this.memory);
    this.workspace = new WorkspaceEngine(context);
    this.agentFolders = new AgentFolderEngine(context, this.workspace);
    this.agents = new AgentManager(this.db, this.memory, this.agentFolders);
    this.memory.setMemorySyncHandler(async (agentId, memory) => {
      const agent = this.agents.get(agentId);
      if (agent)
        await this.agentFolders.syncMemory(agent, memory);
    });
    this.settings = new SettingsService(context);
    this.env = new EnvService(this.workspace, context.extensionPath);
    this.credentials = new CredentialsService(this.settings, this.env);
    this.voiceTranscription = new VoiceTranscriptionService(this.credentials);
    this.voiceCapture = new VoiceCaptureService();
    this.voiceShortcutSettings = new VoiceShortcutSettings(context);
    this.llmStatus = new LlmStatusService(this.credentials, this.env);
    this.llmUsage = new LlmUsageTracker();
    this.providers = new ProviderEngine(this.credentials, this.llmUsage);
    this.agentProfileGenerator = new AgentProfileGenerator(this.providers, this.credentials);
    this.knowledgeLearner = new KnowledgeLearner(
      this.agentFolders,
      this.agents,
      this.memory,
      this.providers,
      this.credentials
    );
    this.notifications = new NotificationEngine();
    this.crawl4aiDocker = new Crawl4AiDockerService(this.workspace);
    this.clineCli = new ClineCliService(this.workspace);
    this.chat = new ChatService();
    this.teams = new TeamEngine(
      this.db,
      this.agents,
      this.chat,
      this.providers,
      this.agentFolders
    );
    this.telegramInbound = new TelegramInboundPoller(
      this.context,
      {
        getAgents: () => this.agents.getAll(),
        getSecretary: () => this.orchestrator.getSecretary(),
        findByMention: (mention) => this.agents.findByMention(mention),
        getLastAgentId: () =>
          this.context.globalState.get<string>('telegramLastAgentId') ?? null,
        setLastAgentId: async (agentId) => {
          await this.context.globalState.update('telegramLastAgentId', agentId);
        },
        getBotUsername: () =>
          this.context.globalState.get<string>('telegramBotUsername') ?? undefined,
      },
      (text) => this.executeCeoCommand(text, undefined, { fromTelegram: true }),
      (text) => this.notifications.getTelegram().send(text)
    );
    this.chat.addListener((msg) => {
      this.telegramInbound.forwardAgentMessage(msg);
    });
    this.ideaEngine = new IdeaEngine(
      this.providers,
      this.credentials,
      this.workspace,
      this.agentFolders,
      this.chat,
      this.memory
    );
    this.ideas = new IdeaService(
      this.context,
      this.db,
      this.agents,
      this.tasks,
      this.memory,
      this.notifications,
      this.chat,
      this.ideaEngine
    );
    this.externalApis = new ExternalApiService(context);
    this.apiRegistrySync = new ExternalApiRegistrySync(this.externalApis, this.agents, this.memory);
    this.orchestrator = new Orchestrator(
      this.agents,
      this.tasks,
      this.memory,
      this.workspace,
      this.providers,
      this.notifications,
      this.crawl4aiDocker,
      this.chat,
      this.externalApis,
      this.agentFolders,
      this.knowledgeLearner,
      this.orgEngine,
      this.llmStatus,
      this.teams
    );
    this.teams.setRunContext({
      workerDeps: {
        workspace: this.workspace,
        research: this.orchestrator.getResearchAgent(),
        cline: this.orchestrator.getClineAgent(),
      },
      templateScriptPath: path.join(
        context.extensionPath,
        'src/team/templates/download_suneung_pdfs.py'
      ),
    });
  }
  startKnowledgeWatcher(context: vscode.ExtensionContext): void {
    if (this.knowledgeWatcher)
      return;
    this.knowledgeWatcher = new KnowledgeWatcher();
    this.knowledgeWatcher.start(context, this);
  }
  startPhotoWatcher(context: vscode.ExtensionContext): void {
    if (this.photoWatcher)
      return;
    this.photoWatcher = new AgentPhotoWatcher();
    this.photoWatcher.start(context, () => this.dashboardRefresh?.());
  }
  async initialize() {
    if (this.initialized)
      return;
    await this.db.initialize();
    await this.env.load();
    this.cachedLlmStatus = await this.llmStatus.getStatus(false);
    this.initialized = true;
    if (this.agents.getAll().length === 0) {
      await this.seedDefaultAgents();
    } else {
      await Promise.all([this.ensureWonyoungAgent(), this.ensureSecretaryAgent()]);
    }
    this.removeMonaAgent();
    await this.agentFolders.initialize(this.agents.getAll());
    await this.ensureWonyoungDownloadKnowledge();
    await this.ensureSecretaryKnowledge();
    const migrated = await this.externalApis.migrateStoredApis();
    if (migrated > 0) {
      this.memory.logActivity(null, null, `External API URL ${migrated}\uAC74 \uC790\uB3D9 \uBCF4\uC815`);
    }
    this.syncExternalApiRegistry();
    await this.syncExistingMemoriesToFiles();
    await this.ensureAgentTitles();
    await this.ensureResearcherAgents();
    await this.ensureProductionAgents();
    await this.ensureDeveloperAgents();
    await this.ensureFileTransferKnowledge();
    await this.ensureOwnerPathKnowledge();
    await this.ensureProjectPlaybookKnowledge();
    await this.ensurePlatformStructureKnowledge();
    await this.ensureClineKnowledge();
    this.orgEngine.ensureAgentNodes(this.agents.getAll());
    await this.settings.ensureProactiveIdeasDefaultOff();
    await this.syncOrgOwnerLabel();
    await this.llmStatus.refreshProviderConnections(
      this.agents.getAll().map((a) => a.provider)
    );
    this.ideas.start();
    this.telegramInbound.start();
    void this.prewarmChatContexts();
  }

  /** 대화창 첫 메시지 지연 방지 — persona·description 미리 로드 */
  prewarmAgentChat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent && agent.status !== 'offline') {
      void this.agentFolders.prewarmConversationalContext(agent);
    }
  }

  private prewarmChatContexts(): void {
    for (const agent of this.agents.getAll()) {
      if (agent.status !== 'offline') {
        void this.agentFolders.prewarmConversationalContext(agent);
      }
    }
  }
  bindDashboardRefresh(refresh: () => void): void {
    this.dashboardRefresh = refresh;
    this.ideas.setOnChange(refresh);
    this.llmUsage.setOnChange(refresh);
    this.syncDashboardHooks();
  }

  bindDashboardNavigate(navigate: (tab: string) => void): void {
    this.dashboardNavigate = navigate;
    this.syncDashboardHooks();
  }

  private syncDashboardHooks(): void {
    if (!this.dashboardRefresh && !this.dashboardNavigate) return;
    this.orchestrator.setDashboardHooks(this.dashboardRefresh, this.dashboardNavigate);
  }
  /** 기존 DB 에이전트에 title 백필 */
  async ensureAgentTitles() {
    for (const agent of this.agents.getAll()) {
      if (agent.title?.trim())
        continue;
      let title = "";
      if (agent.capabilities?.includes("secretary") || agent.name.includes("\uBE44\uC11C")) {
        title = "\uBE44\uC11C";
      } else if (agent.capabilities?.includes("web-crawl") || agent.name.includes("\uC6D0\uC601")) {
        title = "\uB9AC\uC11C\uCC98";
      } else if (agent.capabilities?.includes("cline-code") || isHaJeongWooAgent(agent)) {
        title = "\uAC1C\uBC1C\uC790";
      } else {
        const roleLabel = AGENT_ROLES.find((r) => r.value === agent.role)?.label;
        title = roleLabel ?? agent.role;
      }
      this.agents.update(agent.id, { title });
    }
  }
  async syncExistingMemoriesToFiles() {
    for (const agent of this.agents.getAll()) {
      if (agent.memory.trim()) {
        await this.agentFolders.syncMemory(agent, agent.memory);
      }
    }
  }
  /** API 탭 변경 시 모든 에이전트 메모리에 레지스트리 자동 반영 */
  syncExternalApiRegistry() {
    if (this.agents.getAll().length === 0)
      return;
    this.apiRegistrySync.sync();
  }
  /**
   * 사용자가 Dashboard/명령으로 에이전트 생성.
   * description 기반 프로필·폴더 자동 생성, 이름 중복 불가.
   */
  async createAgent(input: CreateAgentInput): Promise<Agent> {
    const name = input.name.trim();
    const title = input.title?.trim() ?? "";
    if (!name) {
      throw new Error("\uC5D0\uC774\uC804\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
    }
    if (!title) {
      throw new Error("\uC9C1\uCC45\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
    }
    if (this.agents.isNameTaken(name)) {
      throw new AgentDuplicateNameError(name);
    }
    if (!input.description?.trim()) {
      throw new AgentDescriptionRequiredError();
    }
    const slug = buildAgentFolderSlug(name, title);
    const roleOverride = input.role && String(input.role) !== "auto" ? input.role : inferRoleFromTitle(title);
    this.notifications.showInfo(`"${formatAgentLabel({ name, title })}" \uD504\uB85C\uD544 \uC0DD\uC131 \uC911...`);
    const profile = await this.agentProfileGenerator.generate(
      name,
      title,
      input.description.trim(),
      slug,
      roleOverride
    );
    const agent = await this.agents.create(
      {
        name,
        title,
        role: profile.role,
        description: profile.description,
        model: input.model,
        provider: input.provider,
        capabilities: profile.capabilities
      },
      { profile }
    );
    await this.agentFolders.openAgentFolder(agent);
    const folderRel = this.agentFolders.getRelativePath(this.agentFolders.resolveSlug(agent));
    await this.knowledgeLearner.syncAgent(agent);
    this.notifications.showInfo(
      `"${formatAgentLabel(agent)}" \uC0DD\uC131 \uC644\uB8CC \u2014 ${folderRel}/ \uD3F4\uB354\uAC00 \uC5F4\uB838\uC2B5\uB2C8\uB2E4.`
    );
    this.memory.logActivity(agent.id, null, `Agent folder: ${folderRel}/`);
    return agent;
  }
  async executeCeoCommand(
    command: string,
    panelThreadId?: string,
    options?: { fromTelegram?: boolean; collabThreadId?: string }
  ): Promise<void> {
    const trimmed = command.trim();
    if (!trimmed)
      return;
    const hasTarget = Boolean(panelThreadId) || trimmed.includes('@');
    if (!options?.fromTelegram && !hasTarget && trimmed.length < 3) {
      this.notifications.showWarning('명령이 너무 짧아요. @에이전트 또는 3글자 이상 입력해 주세요.');
      return;
    }
    await this.ensureEnvForLlm();
    let effectiveCommand = trimmed;
    if (panelThreadId && !trimmed.startsWith("@")) {
      const panelAgent = this.agents.get(panelThreadId);
      if (panelAgent) {
        effectiveCommand = `@${panelAgent.name} ${trimmed}`;
      }
    }
    const thread = resolveThreadForCommand(
      effectiveCommand,
      this.agents.getAll(),
      this.orchestrator.getSecretary(),
      (mention) => this.agents.findByMention(mention)
    );
    if (!options?.fromTelegram && !options?.collabThreadId) {
      this.chat.requestOpenPanel(thread.threadId, thread.agentDisplayName);
    }
    const ceoMessage = {
      threadId: thread.threadId,
      senderId: null,
      senderName: "\uC0AC\uC7A5\uB2D8",
      content: trimmed,
      type: "ceo",
      emotion: detectSpeakerEmotion(trimmed)
    };
    this.chat.push(ceoMessage);
    if (options?.collabThreadId) {
      this.chat.push({ ...ceoMessage, threadId: options.collabThreadId });
    }
    this.prewarmAgentChat(thread.threadId);
    if (options?.fromTelegram) {
      this.orchestrator.beginTelegramCommand();
      this.telegramInbound.beginReplySession();
    }
    try {
      await this.orchestrator.executeCommand(effectiveCommand);
    } catch (error) {
      if (options?.fromTelegram) {
        const message = error instanceof Error ? error.message : String(error);
        void this.notifications.getTelegram().send(`❌ 처리 중 오류\n${message.slice(0, 500)}`);
      }
      throw error;
    } finally {
      if (options?.fromTelegram) {
        this.orchestrator.endTelegramCommand();
        this.telegramInbound.endReplySession();
      }
    }
  }
  resolveCommandThread(command: string) {
    return resolveThreadForCommand(
      command.trim(),
      this.agents.getAll(),
      this.orchestrator.getSecretary(),
      (mention) => this.agents.findByMention(mention)
    );
  }
  async transcribeVoice(audioBase64: string, mimeType?: string): Promise<string> {
    await this.ensureEnvForLlm();
    return this.voiceTranscription.transcribe(audioBase64, mimeType);
  }
  async listVoiceDevices() {
    return this.voiceCapture.listDevices();
  }
  async isVoiceCaptureAvailable(): Promise<boolean> {
    return this.voiceCapture.isAvailable();
  }
  getVoiceShortcut(): VoiceShortcutConfig {
    return this.voiceShortcutSettings.get();
  }
  async saveVoiceShortcut(shortcut: VoiceShortcutConfig): Promise<VoiceShortcutConfig> {
    return this.voiceShortcutSettings.save(shortcut);
  }
  async clearVoiceShortcut(): Promise<VoiceShortcutConfig> {
    return this.voiceShortcutSettings.clear();
  }
  getBuiltinVoiceShortcut(): VoiceShortcutConfig {
    return { ...BUILTIN_VOICE_SHORTCUT };
  }
    startVoiceCapture(
    sessionId: string,
    deviceId: string,
    onLevel: (level: { level: number; decibels: number }) => void,
    onPartialTranscript?: (text: string) => void
  ): void {
    this.stopPartialTranscriptLoop();
    this.partialTranscriptSessionId = sessionId;
    this.voiceCapture.start(sessionId, deviceId, onLevel);
    if (!onPartialTranscript)
      return;
    this.partialTranscriptTimer = setInterval(() => {
      void this.runPartialTranscript(onPartialTranscript);
    }, 1200);
  }
  private async runPartialTranscript(onPartialTranscript: (text: string) => void): Promise<void> {
    if (this.partialTranscriptBusy)
      return;
    const audioBase64 = this.voiceCapture.getWavSnapshotBase64();
    if (!audioBase64)
      return;
    this.partialTranscriptBusy = true;
    try {
      await this.ensureEnvForLlm();
      const text = await this.voiceTranscription.transcribe(audioBase64, "audio/wav");
      if (text.trim())
        onPartialTranscript(text.trim());
    } catch {
    } finally {
      this.partialTranscriptBusy = false;
    }
  }
  private stopPartialTranscriptLoop(): void {
    if (this.partialTranscriptTimer) {
      clearInterval(this.partialTranscriptTimer);
      this.partialTranscriptTimer = undefined;
    }
    this.partialTranscriptBusy = false;
    this.partialTranscriptSessionId = null;
  }
  stopVoiceCapture(): VoiceCaptureResult {
    this.stopPartialTranscriptLoop();
    return this.voiceCapture.stop();
  }
  cancelVoiceCapture(): void {
    this.stopPartialTranscriptLoop();
    this.voiceCapture.cancel();
  }
  async confirmDelegate(pendingId: string): Promise<void> {
    await this.orchestrator.executeConfirmedDelegate(pendingId);
  }
  rejectDelegate(pendingId: string): void {
    this.orchestrator.rejectDelegate(pendingId);
  }
  async reloadEnv(): Promise<void> {
    await this.env.load();
    this.cachedLlmStatus = await this.llmStatus.getStatus(false);
  }

  /** 대시보드 ↻ — npm run release 후 Reload Window */
  async runReleaseAndReload(): Promise<{ success: boolean; message: string }> {
    const root = this.workspace.getWorkspaceRoot();
    if (!root) {
      return { success: false, message: '워크스페이스 폴더를 열어 주세요.' };
    }

    const pkgPath = path.join(root, 'package.json');
    try {
      await fs.access(pkgPath);
    } catch {
      return { success: false, message: 'package.json이 없는 워크스페이스입니다.' };
    }

    this.notifications.showInfo('릴리스 시작 — 빌드·VSIX·GitHub 푸시·확장 설치 후 Reload 합니다.');

    const result = await this.workspace.executeTerminal('npm run release', 600_000);
    if (result.exitCode !== 0) {
      const detail = (result.stderr || result.stdout || '').trim().slice(-800);
      return {
        success: false,
        message: `릴리스 실패 (exit ${result.exitCode})${detail ? `\n${detail}` : ''}`,
      };
    }

    await vscode.commands.executeCommand('workbench.action.reloadWindow');
    return { success: true, message: '릴리스 완료 — Reload 중…' };
  }
  /** 대시보드 연결 표시와 채팅 LLM 호출이 같은 키를 쓰도록 보장 */
  async ensureEnvForLlm(): Promise<void> {
    if (!this.env.isEnvLoaded()) {
      await this.env.load();
    }
  }
  async refreshLlmConnection(): Promise<LlmStatus> {
    await this.llmStatus.refreshProviderConnections(
      this.agents.getAll().map((a) => a.provider)
    );
    this.cachedLlmStatus = await this.llmStatus.getStatus(false);
    return this.cachedLlmStatus;
  }
  mapAgentForDisplay(agent: Agent) {
    const agentTasks = this.tasks.getAll().filter((t) => t.agentId === agent.id);
    return {
      ...agent,
      deactivated: agent.status === "offline",
      status: resolveAgentDisplayStatus(agent, this.llmUsage.isActive(agent.id), agentTasks)
    };
  }
  mapAgentsForDisplay() {
    return this.agents.getAll().map((agent) => this.mapAgentForDisplay(agent));
  }
  async setDefaultModel(model: string): Promise<void> {
    await this.settings.updateSettings({ defaultModel: model });
    if (await this.env.envFileExists()) {
      await this.env.updateKey("DEFAULT_MODEL", model);
    }
    for (const agent of this.agents.getAll()) {
      this.agents.update(agent.id, { model });
    }
    this.cachedLlmStatus = await this.llmStatus.getStatus(true);
    if (this.cachedLlmStatus) {
      this.cachedLlmStatus = { ...this.cachedLlmStatus, model };
    }
    this.memory.logActivity(null, null, `Default model changed to ${model}`);
  }
  async activateAgent(id: string): Promise<Agent | null> {
    const agent = this.agents.get(id);
    if (!agent)
      return null;
    const activated = this.agents.activate(id);
    if (!activated)
      return null;
    if (isResearchAgent(activated)) {
      await this.startCrawl4AiDocker(activated);
    }
    if (isClineAgent(activated)) {
      await this.checkClineCli(activated);
    }
    return activated;
  }

  private async checkClineCli(agent?: Agent): Promise<void> {
    const label = agent?.name ?? '하정우';
    this.notifications.showInfo(`${label}: Cline CLI 확인 중...`);
    const result = await this.clineCli.ensureReady();
    this.memory.logActivity(agent?.id ?? null, null, `Cline CLI: ${result.message}`);
    if (result.available) {
      this.notifications.showInfo(result.message);
    } else {
      this.notifications.showWarning(result.message);
    }
  }
  private async startCrawl4AiDocker(agent?: Agent): Promise<void> {
    const label = agent?.name ?? "\uC6D0\uC601";
    const healthy = await this.crawl4aiDocker.isHealthy();
    if (healthy) {
      this.memory.logActivity(agent?.id ?? null, null, 'Crawl4AI Docker 연결됨');
      this.notifications.showInfo(`${label}: Crawl4AI Docker 실행 중`);
      return;
    }

    const dockerOk = await this.crawl4aiDocker.isDockerRunning(800);
    if (!dockerOk) {
      const message = 'Docker 미실행 — 리서치는 DuckDuckGo·Jina·Fetch로 즉시 진행 가능';
      this.memory.logActivity(agent?.id ?? null, null, message);
      this.notifications.showWarning(message);
      return;
    }

    this.notifications.showInfo(`${label}: Crawl4AI Docker 백그라운드 기동 시도…`);
    void this.crawl4aiDocker.ensureRunning().then((result) => {
      this.memory.logActivity(agent?.id ?? null, null, `Crawl4AI: ${result.message}`);
      if (result.success) {
        this.notifications.showInfo(result.message);
      }
    });
  }
  async seedDefaultAgents() {
    const config = this.credentials;
    const defaults = [
      {
        name: SECRETARY_AGENT.name,
        title: SECRETARY_AGENT.title,
        role: SECRETARY_AGENT.role,
        description: SECRETARY_AGENT.description,
        model: config.getDefaultModel(),
        provider: config.getDefaultProvider(),
        capabilities: SECRETARY_AGENT.capabilities
      },
      { name: "Alex PM", title: "PM", role: "pm", description: "\uD504\uB85C\uC81D\uD2B8 \uB9E4\uB2C8\uC800 \u2014 \uC791\uC5C5 \uBD84\uD574 \uBC0F \uC870\uC728", model: config.getDefaultModel(), provider: config.getDefaultProvider() },
      { name: "Sam Backend", title: "\uBC31\uC5D4\uB4DC \uAC1C\uBC1C\uC790", role: "backend", description: "\uBC31\uC5D4\uB4DC API \uAC1C\uBC1C", model: config.getDefaultModel(), provider: config.getDefaultProvider() },
      { name: "Jordan Frontend", title: "\uD504\uB860\uD2B8\uC5D4\uB4DC \uAC1C\uBC1C\uC790", role: "frontend", description: "\uD504\uB860\uD2B8\uC5D4\uB4DC UI \uAC1C\uBC1C", model: config.getDefaultModel(), provider: config.getDefaultProvider() },
      { name: "Casey QA", title: "QA", role: "qa", description: "\uD488\uC9C8 \uAC80\uC99D \uBC0F \uD14C\uC2A4\uD2B8", model: config.getDefaultModel(), provider: config.getDefaultProvider() },
      {
        name: WONYOUNG_AGENT.name,
        title: WONYOUNG_AGENT.title,
        role: WONYOUNG_AGENT.role,
        description: WONYOUNG_AGENT.description,
        model: config.getDefaultModel(),
        provider: config.getDefaultProvider(),
        capabilities: WONYOUNG_AGENT.capabilities
      },
    ];
    for (const input of defaults) {
      if (this.isAgentDismissed(input.name))
        continue;
      await this.agents.create(input);
    }
    this.memory.logActivity(null, null, "Default agents seeded (\uBE44\uC11C + \uC6D0\uC601 \uD3EC\uD568)");
  }
  async ensureSecretaryAgent() {
    if (this.isAgentDismissed(SECRETARY_AGENT.name))
      return;
    const exists = this.agents.getAll().some((a) => a.name.includes("\uBE44\uC11C") || a.name === SECRETARY_AGENT.name);
    if (exists)
      return;
    const config = this.credentials;
    await this.agents.create({
      name: SECRETARY_AGENT.name,
      title: SECRETARY_AGENT.title,
      role: SECRETARY_AGENT.role,
      description: SECRETARY_AGENT.description,
      model: config.getDefaultModel(),
      provider: config.getDefaultProvider(),
      capabilities: SECRETARY_AGENT.capabilities
    });
    this.memory.logActivity(null, null, "\uBE44\uC11C Agent added");
  }
  /** 비서 페르소나 · Executive Assistant 이론 학습 주입 */
  async ensureSecretaryKnowledge() {
    const secretary = this.agents.getAll().find((a) => a.name.includes("\uBE44\uC11C") || a.name === SECRETARY_AGENT.name);
    if (!secretary)
      return;
    const needsDescription = !secretary.description.includes("\uC5EC\uC131 \uBE44\uC11C") || !secretary.capabilities?.includes("triage");
    if (needsDescription) {
      this.agents.update(secretary.id, {
        description: SECRETARY_AGENT.description,
        capabilities: SECRETARY_AGENT.capabilities
      });
    }
    const memory = this.memory.getAgentMemory(secretary.id);
    const knowledge = await this.agentFolders.loadKnowledge(this.agentFolders.resolveSlug(secretary));
    if (knowledge && !memory.includes(SECRETARY_KNOWLEDGE_MARKER)) {
      this.memory.appendAgentMemory(secretary.id, knowledge);
    } else if (!memory.includes(SECRETARY_KNOWLEDGE_MARKER)) {
      this.memory.appendAgentMemory(secretary.id, getSecretaryKnowledgeSummary());
    }
  }
  /** DB·조직도에서 모나 에이전트 제거 */
  removeMonaAgent(): void {
    for (const agent of [...this.agents.getAll()]) {
      if (!agent.name.includes('\uBAA8\uB098') && agent.name.toLowerCase() !== 'mona') continue;
      this.db.dismissAgent('모나');
      this.agents.delete(agent.id);
      const org = this.orgEngine.load();
      org.nodes = org.nodes.filter((n) => n.id !== agent.id);
      org.edges = org.edges.filter((e) => e.fromId !== agent.id && e.toId !== agent.id);
      this.orgEngine.save(org);
      this.memory.logActivity(null, null, `모나 에이전트 제거 (${agent.name})`);
    }
  }

  async ensureWonyoungAgent() {
    if (this.isAgentDismissed(WONYOUNG_AGENT.name))
      return;
    const exists = this.agents.getAll().some((a) => a.name.includes("\uC6D0\uC601") || a.name === WONYOUNG_AGENT.name);
    if (exists)
      return;
    const config = this.credentials;
    await this.agents.create({
      name: WONYOUNG_AGENT.name,
      title: WONYOUNG_AGENT.title,
      role: WONYOUNG_AGENT.role,
      description: WONYOUNG_AGENT.description,
      model: config.getDefaultModel(),
      provider: config.getDefaultProvider(),
      capabilities: WONYOUNG_AGENT.capabilities
    });
    this.memory.logActivity(null, null, "\uC6D0\uC601 Research Agent added");
  }
  /** 모든 에이전트에 사장님(Owner) 데이터 폴더 경로 주입 */
  async ensureOwnerPathKnowledge() {
    const ownerDir = this.agentFolders.getOwnerDir();
    const workspaceRoot = this.workspace.getWorkspaceRoot() ?? undefined;
    const summary = getOwnerPathKnowledgeSummary(ownerDir, workspaceRoot);
    const body = summary.replace(`${OWNER_PATH_KNOWLEDGE_MARKER}

`, "");
    for (const agent of this.agents.getAll()) {
      const slug = this.agentFolders.resolveSlug(agent);
      const knowledgeDir = path.join(this.agentFolders.getAgentDir(slug), "knowledge");
      const knowledgePath = path.join(knowledgeDir, OWNER_PATH_KNOWLEDGE_FILENAME);
      await fs.mkdir(knowledgeDir, { recursive: true });
      try {
        const existing = await fs.readFile(knowledgePath, "utf-8");
        if (!existing.includes(OWNER_PATH_KNOWLEDGE_MARKER)) {
          await fs.writeFile(knowledgePath, `${existing.trim()}

${body}`.trim() + "\n", "utf-8");
        } else if (!existing.includes(ownerDir)) {
          await fs.writeFile(knowledgePath, `${body}
`, "utf-8");
        }
      } catch {
        await fs.writeFile(knowledgePath, `# \uC0AC\uC7A5\uB2D8 \uB370\uC774\uD130 \uACBD\uB85C

${body}
`, "utf-8");
      }
      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(OWNER_PATH_KNOWLEDGE_MARKER) || !memory.includes(ownerDir)) {
        if (memory.includes(OWNER_PATH_KNOWLEDGE_MARKER)) {
          this.memory.appendAgentMemory(agent.id, `
\uC0AC\uC7A5\uB2D8 \uB370\uC774\uD130 \uACBD\uB85C \uAC31\uC2E0: ${ownerDir}`);
        } else {
          this.memory.appendAgentMemory(agent.id, summary);
        }
      }
    }
  }
  /** 모든 에이전트에 파일 이동 규칙(완료 전 금지·경로 필수) 주입 */
  async ensureFileTransferKnowledge() {
    const summary = getFileTransferKnowledgeSummary();
    const body = summary.replace(`${FILE_TRANSFER_KNOWLEDGE_MARKER}

`, "");
    for (const agent of this.agents.getAll()) {
      const slug = this.agentFolders.resolveSlug(agent);
      const knowledgeDir = path.join(this.agentFolders.getAgentDir(slug), "knowledge");
      const knowledgePath = path.join(knowledgeDir, FILE_TRANSFER_KNOWLEDGE_FILENAME);
      await fs.mkdir(knowledgeDir, { recursive: true });
      try {
        const existing = await fs.readFile(knowledgePath, "utf-8");
        if (!existing.includes(FILE_TRANSFER_KNOWLEDGE_MARKER)) {
          await fs.writeFile(knowledgePath, `${existing.trim()}

${body}`.trim() + "\n", "utf-8");
        }
      } catch {
        await fs.writeFile(knowledgePath, `# \uC5D0\uC774\uC804\uD2B8 \uAC04 \uD30C\uC77C \uC774\uB3D9

${body}
`, "utf-8");
      }
      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(FILE_TRANSFER_KNOWLEDGE_MARKER)) {
        this.memory.appendAgentMemory(agent.id, summary);
      }
    }
  }
  /** 개발자 에이전트에 AgentCompany 플랫폼 구조 knowledge + memory 주입 */
  async ensurePlatformStructureKnowledge() {
    for (const agent of this.agents.getAll()) {
      if (!isDeveloperAgent(agent)) continue;

      const slug = this.agentFolders.resolveSlug(agent);
      const knowledgeDir = path.join(this.agentFolders.getAgentDir(slug), 'knowledge');
      await fs.mkdir(knowledgeDir, { recursive: true });

      const paths = resolvePlatformPaths(this.agentFolders, agent);
      const body = getPlatformStructureBody(paths, agent);
      const summary = buildPlatformStructurePromptBlock(this.agentFolders, agent);
      const knowledgePath = path.join(knowledgeDir, PLATFORM_STRUCTURE_FILENAME);

      try {
        const existing = await fs.readFile(knowledgePath, 'utf-8');
        if (!existing.includes(PLATFORM_STRUCTURE_MARKER)) {
          await fs.writeFile(
            knowledgePath,
            `${existing.trim()}\n\n${body}`.trim() + '\n',
            'utf-8'
          );
        } else if (!existing.includes(paths.dbPath)) {
          await fs.writeFile(knowledgePath, `${body}\n`, 'utf-8');
        }
      } catch {
        await fs.writeFile(knowledgePath, `${body}\n`, 'utf-8');
      }

      this.agentFolders.invalidatePromptContext(agent.id);

      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(PLATFORM_STRUCTURE_MARKER) || !memory.includes(paths.dbPath)) {
        this.memory.appendAgentMemory(agent.id, summary.slice(0, 1400));
      }
    }
  }

  /** 모든 에이전트에 Project 5단계 플레이북 + 역할별 스니펫 주입 */
  async ensureProjectPlaybookKnowledge() {
    const playbookSummary = getProjectPlaybookSummary();
    const playbookBody = playbookSummary.replace(`${PROJECT_PLAYBOOK_MARKER}\n\n`, '');
    const suneungBody = getSuneungPdfPlaybook();

    for (const agent of this.agents.getAll()) {
      const slug = this.agentFolders.resolveSlug(agent);
      const knowledgeDir = path.join(this.agentFolders.getAgentDir(slug), 'knowledge');
      await fs.mkdir(knowledgeDir, { recursive: true });

      const playbookPath = path.join(knowledgeDir, PROJECT_PLAYBOOK_FILENAME);
      const roleSnippet = getRoleProjectPlaybookSnippet(agent.role, agent);
      const combinedPlaybook = `# Project 협업 플레이북

${playbookBody}

${roleSnippet}
`;
      try {
        const existing = await fs.readFile(playbookPath, 'utf-8');
        if (!existing.includes(PROJECT_PLAYBOOK_MARKER)) {
          await fs.writeFile(
            playbookPath,
            `${existing.trim()}\n\n${combinedPlaybook}`.trim() + '\n',
            'utf-8'
          );
        } else if (!existing.includes(roleSnippet.slice(0, 40))) {
          await fs.writeFile(playbookPath, `${combinedPlaybook}\n`, 'utf-8');
        }
      } catch {
        await fs.writeFile(playbookPath, combinedPlaybook + '\n', 'utf-8');
      }

      const isResearchOrDev =
        agent.role === 'researcher' ||
        agent.role === 'backend' ||
        agent.role === 'frontend' ||
        agent.role === 'devops' ||
        agent.role === 'pm' ||
        /한서준|하정우|김윤하|최현석|박준호/.test(agent.name);

      if (isResearchOrDev) {
        const suneungPath = path.join(knowledgeDir, SUNEUNG_PDF_PLAYBOOK_FILENAME);
        try {
          const existing = await fs.readFile(suneungPath, 'utf-8');
          if (!existing.includes('[SuneungPdfPlaybook v1]')) {
            await fs.writeFile(
              suneungPath,
              `# 수능 PDF 다운로드\n\n${suneungBody}\n`,
              'utf-8'
            );
          }
        } catch {
          await fs.writeFile(
            suneungPath,
            `# 수능 PDF 다운로드\n\n${suneungBody}\n`,
            'utf-8'
          );
        }
      }

      this.agentFolders.invalidatePromptContext(agent.id);

      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(PROJECT_PLAYBOOK_MARKER)) {
        this.memory.appendAgentMemory(agent.id, playbookSummary.slice(0, 1200));
      }
    }
  }

  /** 리서처 역할 에이전트에 web-crawl capability·다운로드 지식 주입 */
  async ensureResearcherAgents() {
    const researchCaps = ["web-crawl", "search", "summarize", "report", "download"];
    for (const agent of this.agents.getAll()) {
      if (!isResearchAgent(agent) && agent.role !== "researcher" && !agent.name.includes("\uD55C\uC11C\uC900")) {
        continue;
      }
      const caps = agent.capabilities ?? [];
      const merged = [.../* @__PURE__ */ new Set([...caps, ...researchCaps])];
      const patch = {};
      if (merged.length !== caps.length)
        patch.capabilities = merged;
      if (!agent.title?.trim())
        patch.title = "\uB9AC\uC11C\uCC98";
      if (Object.keys(patch).length > 0) {
        this.agents.update(agent.id, patch);
      }
      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(WONYOUNG_DOWNLOAD_KNOWLEDGE_MARKER)) {
        const knowledge = await this.agentFolders.loadKnowledge(this.agentFolders.resolveSlug(agent));
        this.memory.appendAgentMemory(
          agent.id,
          knowledge?.includes(WONYOUNG_DOWNLOAD_KNOWLEDGE_MARKER) ? knowledge : getDownloadKnowledgeSummary()
        );
      }
    }
  }
  /** 영상 제작 에이전트에 video-production capability 부여 */
  async ensureProductionAgents() {
    const productionCaps = ["video-production", "writing", "planning", "storyboard"];
    for (const agent of this.agents.getAll()) {
      if (!isProductionAgent(agent) && !agent.name.includes("\uC11C\uC724"))
        continue;
      const caps = agent.capabilities ?? [];
      const merged = [.../* @__PURE__ */ new Set([...caps, ...productionCaps])];
      const patch = {};
      if (merged.length !== caps.length)
        patch.capabilities = merged;
      if (!agent.title?.trim())
        patch.title = "\uC601\uC0C1\uC81C\uC791\uC790";
      if (Object.keys(patch).length > 0) {
        this.agents.update(agent.id, patch);
      }
    }
  }
  /** 하정우에 Cline capability 부여, 레거시 kilo-code 제거 */
  async ensureDeveloperAgents() {
    const clineCaps = getClineCapabilities();
    for (const agent of this.agents.getAll()) {
      if (!isHaJeongWooAgent(agent)) continue;

      const caps = agent.capabilities ?? [];
      const stripped = stripLegacyKiloCapabilities(caps);
      const merged = [.../* @__PURE__ */ new Set([...stripped, ...clineCaps])];
      const patch: { capabilities?: string[]; title?: string } = {};

      if (merged.length !== caps.length || stripped.length !== caps.length) {
        patch.capabilities = merged;
      }
      if (!agent.title?.trim()) patch.title = '\uAC1C\uBC1C\uC790';
      if (Object.keys(patch).length > 0) {
        this.agents.update(agent.id, patch);
      }
    }
  }

  /** 하정우에 Cline 협업 knowledge + .clinerules 주입 */
  async ensureClineKnowledge() {
    const wsRoot = this.workspace.getWorkspaceRoot();
    if (wsRoot) {
      const clinerulesPath = path.join(wsRoot, '.clinerules');
      try {
        const existing = await fs.readFile(clinerulesPath, 'utf-8');
        if (!existing.includes('AgentCompany')) {
          await fs.writeFile(
            clinerulesPath,
            `${existing.trim()}\n\n${getClinerulesBody()}\n`,
            'utf-8'
          );
        }
      } catch {
        await fs.writeFile(clinerulesPath, `${getClinerulesBody()}\n`, 'utf-8');
      }
    }

    for (const agent of this.agents.getAll()) {
      if (!isClineAgent(agent)) continue;

      const slug = this.agentFolders.resolveSlug(agent);
      const knowledgeDir = path.join(this.agentFolders.getAgentDir(slug), 'knowledge');
      await fs.mkdir(knowledgeDir, { recursive: true });

      const body = getClineKnowledgeBody(slug);
      const summary = getClineKnowledgeSummary(slug);
      const knowledgePath = path.join(knowledgeDir, CLINE_KNOWLEDGE_FILENAME);

      try {
        const existing = await fs.readFile(knowledgePath, 'utf-8');
        if (!existing.includes(CLINE_KNOWLEDGE_MARKER)) {
          await fs.writeFile(
            knowledgePath,
            `${existing.trim()}\n\n${body}`.trim() + '\n',
            'utf-8'
          );
        }
      } catch {
        await fs.writeFile(knowledgePath, `${body}\n`, 'utf-8');
      }

      this.agentFolders.invalidatePromptContext(agent.id);

      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(CLINE_KNOWLEDGE_MARKER)) {
        this.memory.appendAgentMemory(agent.id, summary);
      }
    }
  }
  async ensureWonyoungDownloadKnowledge() {
    const wonyoung = this.agents.getAll().find((a) => a.name.includes("\uC6D0\uC601") || a.name === WONYOUNG_AGENT.name);
    if (!wonyoung)
      return;
    const memory = this.memory.getAgentMemory(wonyoung.id);
    const knowledge = await this.agentFolders.loadKnowledge(this.agentFolders.resolveSlug(wonyoung));
    if (knowledge && !memory.includes(WONYOUNG_DOWNLOAD_KNOWLEDGE_MARKER)) {
      this.memory.appendAgentMemory(wonyoung.id, knowledge);
    } else if (!memory.includes(WONYOUNG_DOWNLOAD_KNOWLEDGE_MARKER)) {
      this.memory.appendAgentMemory(wonyoung.id, getDownloadKnowledgeSummary());
    }
  }
  getAgentWorkLog(agentId: string) {
    const agent = this.agents.get(agentId);
    if (!agent)
      return null;
    const displayAgent = this.mapAgentForDisplay(agent);
    const agentTasks = this.tasks.getAll().filter((t) => t.agentId === agentId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const activeTasks = agentTasks.filter((t) => isInProgressTask(t) || isReviewReadyTask(t));
    return {
      agent: displayAgent,
      activeTasks,
      recentTasks: agentTasks.slice(0, 8),
      activities: this.memory.getActivitiesByAgent(agentId, 50),
      memorySnippet: agent.memory.slice(-1500)
    };
  }

  getProjectDetail(sessionId: string) {
    const session = this.teams.getSession(sessionId);
    if (!session) return null;

    const companyDir = this.agentFolders.getCompanyDir();
    const warehouseFolder = resolveSessionWarehouseFolder(session);
    const warehousePath = path.join(companyDir, 'projects', warehouseFolder);
    const warehouseRelativePath = path
      .join('company', 'projects', warehouseFolder)
      .replace(/\\/g, '/');

    const threadMessages = this.chat.getMessages(session.threadId);
    let promptTokens = 0;
    let completionTokens = 0;
    for (const msg of threadMessages) {
      if (!msg.tokenUsage) continue;
      promptTokens += msg.tokenUsage.promptTokens;
      completionTokens += msg.tokenUsage.completionTokens;
    }
    const tokenUsage =
      promptTokens > 0 || completionTokens > 0
        ? {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          }
        : null;

    const agents = session.memberAgentIds
      .map((id) => this.agents.get(id))
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .map((a) => this.mapAgentForDisplay(a));

    return {
      session,
      agents,
      tokenUsage,
      warehousePath,
      warehouseRelativePath,
    };
  }

  async openProjectWarehouse(sessionId: string): Promise<void> {
    const session = this.teams.getSession(sessionId);
    if (!session) return;
    await this.agentFolders.openProjectWarehouse(resolveSessionWarehouseFolder(session));
  }
  saveOrgChart(org: AgentOrganization) {
    return this.orgEngine.save(org);
  }
  deleteAgent(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent)
      return false;
    this.db.dismissAgent(agent.name);
    this.recordSpecialDismissAliases(agent);
    this.agents.delete(id);
    const org = this.orgEngine.load();
    org.nodes = org.nodes.filter((n) => n.id !== id);
    org.edges = org.edges.filter((e) => e.fromId !== id && e.toId !== id);
    org.updatedAt = now();
    this.orgEngine.save(org);
    return true;
  }
  private recordSpecialDismissAliases(agent: Agent): void {
    if (agent.name.includes('\uBAA8\uB098') || agent.name.toLowerCase() === 'mona') {
      this.db.dismissAgent('모나');
    }
    if (agent.name.includes("\uC6D0\uC601") || agent.name === WONYOUNG_AGENT.name) {
      this.db.dismissAgent(WONYOUNG_AGENT.name);
    }
    if (agent.name.includes("\uBE44\uC11C") || agent.name === SECRETARY_AGENT.name) {
      this.db.dismissAgent(SECRETARY_AGENT.name);
    }
  }
  isAgentDismissed(name: string): boolean {
    return this.db.isAgentDismissed(name);
  }
  getDashboardData() {
    const rawSettings = this.settings.getSettings();
    const telegram = this.notifications.getTelegram();
    const defaultLlmStatus = {
      provider: this.credentials.getDefaultProvider(),
      model: this.credentials.getDefaultModel(),
      configured: this.credentials.isOpenAiConfigured(),
      connected: false,
      envFileExists: false,
      keySource: this.credentials.getKeySource(),
      envFilePath: this.env.getDisplayPath(),
      maskedKey: "",
      message: "Loading...",
      lastChecked: (/* @__PURE__ */ new Date()).toISOString(),
      availableModels: this.llmStatus.getCachedModels()
    };
    let companyInfo = {
      companyName: "",
      businessItem: "",
      policy: "",
      mindset: "",
      tendency: "",
      mission: "",
      foundedAt: "",
      updatedAt: ""
    };
    let ownerInfo = {
      name: "",
      personality: "",
      tendency: "",
      orientation: "",
      updatedAt: ""
    };
    return {
      agents: this.mapAgentsForDisplay(),
      tasks: this.tasks.getAll(),
      activities: this.memory.getRecentActivities(30),
      ideas: this.ideas.getPendingIdeas(),
      orgChart: this.orgEngine.ensureAgentNodes(this.agents.getAll()),
      companyInfo,
      ownerInfo,
      settings: {
        ...getSettingsForWebview(rawSettings),
        telegramStatus: telegram.getStatus()
      },
      externalApis: this.externalApis.getAllPublic(),
      teamSessions: this.teams.getAllSessions().map((s) => ({
        ...s,
        title: formatProjectDisplayTitle(s.title),
      })),
      llmStatus: this.cachedLlmStatus ?? defaultLlmStatus,
      version: this.context.extension.packageJSON.version ?? "0.0.0"
    };
  }
  async getDashboardDataAsync() {
    const data = this.getDashboardData();
    data.companyInfo = await this.agentFolders.loadCompanyInfo();
    data.ownerInfo = await this.agentFolders.loadOwnerInfo();
    return data;
  }
  async getOwnerDisplayName(): Promise<string> {
    const info = await this.agentFolders.loadOwnerInfo();
    return getOwnerDisplayName(info);
  }
  private async syncOrgOwnerLabel(): Promise<void> {
    const info = await this.agentFolders.loadOwnerInfo();
    const name = info.name.trim();
    if (!name)
      return;
    const org = this.orgEngine.load();
    const ceoNode = org.nodes.find((n) => n.id === CEO_NODE_ID);
    if (ceoNode && ceoNode.label !== name) {
      ceoNode.label = name;
      this.orgEngine.save(org);
    }
  }
  async saveCompanyInfo(input: CompanyInfoInput) {
    const saved = await this.agentFolders.saveCompanyInfo(input);
    this.memory.logActivity(null, null, `\uD68C\uC0AC \uC815\uBCF4 \uC800\uC7A5: ${saved.companyName || "(\uC774\uB984 \uBBF8\uC124\uC815)"}`);
    return saved;
  }
  async saveOwnerInfo(input: OwnerInfoInput) {
    const saved = await this.agentFolders.saveOwnerInfo(input);
    await this.syncOrgOwnerLabel();
    this.memory.logActivity(null, null, `\uC0AC\uC7A5 \uC815\uBCF4 \uC800\uC7A5: ${saved.name || "(\uC774\uB984 \uBBF8\uC124\uC815)"}`);
    return saved;
  }
  async pickOwnerPhoto(emotion: string): Promise<boolean> {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: `${emotion} \uC0AC\uC9C4 \uC120\uD0DD`,
      filters: { Images: ["png", "jpg", "jpeg", "webp", "gif"] }
    });
    if (!uris?.[0])
      return false;
    return this.agentFolders.saveOwnerPhotoFromFile(uris[0].fsPath, emotion);
  }
  async openOwnerPhotoFolder(): Promise<void> {
    await this.agentFolders.ensureOwnerFolder();
    const uri = vscode.Uri.file(this.agentFolders.getOwnerPhotoDir());
    await vscode.commands.executeCommand("revealFileInOS", uri);
  }
  async pickCompanyLogo(): Promise<boolean> {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: "\uB85C\uACE0 \uC120\uD0DD",
      filters: { Images: ["png", "jpg", "jpeg", "webp", "gif"] }
    });
    if (!uris?.[0])
      return false;
    return this.agentFolders.saveCompanyLogoFromFile(uris[0].fsPath);
  }
  async removeCompanyLogo(): Promise<void> {
    await this.agentFolders.removeCompanyLogo();
  }
  dispose(): void {
    this.ideas.stop();
    this.telegramInbound.stop();
    this.db.close();
  }
};
