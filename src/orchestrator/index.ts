import { AgentManager, canAgentEnterWorking } from '../agents';
import {
  AgentFolderEngine,
  buildOwnerFolderDeliveryMessage,
  copySelectedFiles,
  copySelectedFilesToOwner,
  formatFoundFilePaths,
  formatTransferredPaths,
  searchFilesInAgentDb,
  searchModeForAttempt,
} from '../agent-folders';
import { KnowledgeLearner } from '../agent-folders/knowledge-learner';
import {
  ChatService,
  buildCollabThreadId,
  buildDelegateAckMessage,
  buildDelegateCompleteMessage,
  buildDelegatePermissionAsk,
  buildDelegatePermissionDenied,
  buildDelegatePermissionGranted,
  buildDelegateRequestMessage,
  buildDelegateWorkingMessage,
  buildFileMatchConfirmationAsk,
  buildOwnFolderDeliveryCompleteMessage,
  buildOwnFolderFileMatchAsk,
  buildFileTransferCompleteMessage,
  buildFileTransferFailedMessage,
  detectFolderOpenRequest,
  detectFolderPathTargetAgent,
  inferFolderOpenTarget,
  resolveFolderPathScope,
  detectOwnFolderFileRequest,
  buildFileTransferReceivedMessage,
  detectChatEmotion,
  detectCrossAgentFileRequest,
  isExternalResourceFetchTask,
  detectDelegationSuggestion,
  formatChatReply,
  formatResearchChatReply,
  commandNeedsKnowledgeLearning,
  formatLlmError,
  isContextDependentCommand,
  resolveCommandWithContext,
  generateFileTransferDialogue,
  buildChatMessagesForLlm,
  formatChatContextString,
  interpretCeoCommand,
  isImplementationPlanReply,
  sanitizeAcknowledgmentForPendingWork,
} from '../chat';
import type {
  CeoCommandInterpretation,
  CrossAgentFileRequest,
  FolderPathScope,
  OwnFolderFileRequest,
  ResolvedCommand,
} from '../chat';
import type { CeoChatMessage, ChatWorkingDetail } from '../chat/types';
import { MemoryEngine } from '../memory';
import { NotificationEngine } from '../notifications';
import { ProviderEngine, runWithLlmAgent } from '../providers';
import { ClineAgent, isClineAgent, isClineDevTask } from '../cline';
import {
  buildPlatformInquiryReply,
  detectPlatformInquiry,
  isDeveloperAgent,
  type PlatformInquiryKind,
} from '../platform';
import { ProductionAgent, isProductionAgent, isProductionTaskQuery } from '../production';
import { ResearchAgent, isResearchAgent, isResearchTaskQuery } from '../research';
import { Crawl4AiDockerService } from '../research/docker/crawl4ai-docker';
import { getAutoAssignThreshold, routeCommand, SECRETARY_AGENT, SecretaryMessages, isSecretaryAgent } from '../secretary';
import { ExternalApiExecutor } from '../external-api/executor';
import { shouldTryExternalApi, isInquiryOrApiCommand } from '../external-api/auto-detect';
import { ExternalApiService } from '../services/external-api';
import { LlmStatusService } from '../services/llm-status';
import { TaskEngine } from '../tasks';
import { AgentRole, Agent, OrchestratorResult, ROLE_DESCRIPTIONS, Task } from '../types';
import { generateId } from '../utils';
import { WorkspaceActionExecutor } from '../workspace/action-executor';
import { buildWorkspacePrompt, parseAgentOutput } from '../workspace/action-parser';
import { WorkspaceEngine } from '../workspace';
import { OrgEngine, CEO_NODE_ID, buildCeoFinalReport, reviewAndSummarizeForManager, parseManagerReview, ManagerReviewStep } from '../org';
import { parseCeoMention } from './mention-parser';
import { collectAgentMentionNames, formatAgentLabel } from '../utils/agent-display';
import { isPmAgent, MAX_ORG_REVISIONS, isConversationalCommand } from './routing';
import { CeoChatPanel } from '../webview/CeoChatPanel';
import {
  TeamEngine,
  buildPmOrchestrationPromptBlock,
  buildPmPlanningContextBlock,
  buildPmApprovalConfirmationText,
  extractProjectBriefFromChat,
  hasProjectPlanningContext,
  isProjectGoAhead,
  isProjectPlanRevision,
  looksLikePmPlan,
  normalizeProjectCommand,
  proposeTeamMembers,
  shouldStartProjectImmediately,
} from '../team';

// Routing constants and classification logic have been moved to ./routing.ts
// (safe incremental extraction - see orchestrator/routing.ts for details)

export class Orchestrator {
  private collabMirrorThreadId: string | null = null;
  private collabSourceAgentId: string | null = null;
  private telegramCommandActive = false;
  private dashboardRefresh?: () => void;
  private dashboardNavigate?: (tab: string) => void;
  private workspaceExecutor: WorkspaceActionExecutor;
  private researchAgent: ResearchAgent;
  private productionAgent: ProductionAgent;
  private clineAgent: ClineAgent;
  private externalApiExecutor: ExternalApiExecutor;

  constructor(
    private agentManager: AgentManager,
    private taskEngine: TaskEngine,
    private memory: MemoryEngine,
    private workspace: WorkspaceEngine,
    private providers: ProviderEngine,
    private notifications: NotificationEngine,
    private crawl4aiDocker: Crawl4AiDockerService,
    private chat: ChatService,
    private externalApis: ExternalApiService,
    private agentFolders: AgentFolderEngine,
    private knowledgeLearner: KnowledgeLearner,
    private orgEngine: OrgEngine,
    private llmStatus: LlmStatusService,
    private teamEngine: TeamEngine
  ) {
    this.workspaceExecutor = new WorkspaceActionExecutor(workspace, memory);
    this.researchAgent = new ResearchAgent(
      memory,
      providers,
      workspace,
      agentFolders,
      knowledgeLearner,
      crawl4aiDocker
    );
    this.productionAgent = new ProductionAgent(memory, providers, agentFolders, knowledgeLearner);
    this.clineAgent = new ClineAgent(memory, providers, workspace, agentFolders, knowledgeLearner);
    this.externalApiExecutor = new ExternalApiExecutor(externalApis, providers, memory, agentFolders);
  }

  private trySetAgentWorking(agent: Agent): boolean {
    if (!canAgentEnterWorking(agent)) {
      this.agentSay(agent, '현재 offline 상태입니다. Activate 후 다시 시도해 주세요.', 'agent', 'failed');
      return false;
    }
    this.agentManager.setStatus(agent.id, 'working');
    return true;
  }

  beginTelegramCommand(): void {
    this.telegramCommandActive = true;
  }

  endTelegramCommand(): void {
    this.telegramCommandActive = false;
  }

  setDashboardHooks(refresh?: () => void, navigate?: (tab: string) => void): void {
    this.dashboardRefresh = refresh;
    this.dashboardNavigate = navigate;
  }

  isTelegramCommand(): boolean {
    return this.telegramCommandActive;
  }

  getResearchAgent(): ResearchAgent {
    return this.researchAgent;
  }

  getClineAgent(): ClineAgent {
    return this.clineAgent;
  }

  getSecretary(): Agent | null {
    return (
      this.agentManager.getAll().find((a) => isSecretaryAgent(a)) ??
      this.agentManager.getByRole('pm').find((a) => !a.name.includes('Alex')) ??
      this.agentManager.getByRole('pm')[0] ??
      null
    );
  }

  async executeCommand(command: string): Promise<OrchestratorResult> {
    const agentNames = collectAgentMentionNames(this.agentManager.getAll());
    const mention = parseCeoMention(command, agentNames);

    if (mention) {
      if (!mention.command) {
        this.agentSay(this.getSecretary(), SecretaryMessages.emptyMention(), 'system');
        return { taskId: '', success: false, message: 'Empty direct command' };
      }

      const agent =
        this.agentManager.getAll().find((a) => a.name === mention.agentName) ??
        this.agentManager.findByMention(mention.agentName);

      if (!agent) {
        this.agentSay(
          this.getSecretary(),
          SecretaryMessages.unknownMention(mention.agentName),
          'system'
        );
        return { taskId: '', success: false, message: `Unknown agent: ${mention.agentName}` };
      }

      return this.executeDirectCommand(agent, mention.command, command);
    }

    return this.executeViaSecretary(command);
  }

  async executeConfirmedDelegate(pendingId: string): Promise<OrchestratorResult> {
    const pending = this.chat.getPending();
    if (!pending || pending.pendingId !== pendingId) {
      return { taskId: '', success: false, message: 'No pending delegation' };
    }

    this.chat.resolveConfirmationByPendingId(pendingId, 'confirmed');
    this.chat.clearPending();

    if (pending.kind === 'pm-project') {
      const agent = this.agentManager.get(pending.agentId);
      if (!agent) {
        return { taskId: '', success: false, message: 'PM agent not found' };
      }
      const brief =
        pending.planBrief?.trim() ||
        extractProjectBriefFromChat(this.chat.getMessages(agent.id), '진행하세요');
      const fullCommand = `@${agent.name} 진행하세요`;
      return this.executeTeamCommand(agent, brief, fullCommand, { leadPm: agent });
    }

    if (pending.kind === 'file-match' && pending.sourceAgentId) {
      try {
        return await this.executeConfirmedFileMatch(pending);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const agent = this.agentManager.get(pending.sourceAgentId);
        if (agent) {
          this.finalizeFileDelivery(agent, false, `사장님, 파일 전달 중 문제가 생겼어요.\n\n${message}`);
        }
        return { taskId: '', success: false, message };
      }
    }

    if (pending.kind === 'agent-collab' && pending.sourceAgentId) {
      return this.executeConfirmedAgentDelegate(pending);
    }

    const agent = this.agentManager.get(pending.agentId);
    if (!agent) {
      return { taskId: '', success: false, message: 'Agent not found' };
    }

    this.agentSay(this.getSecretary(), SecretaryMessages.confirmedDelegate(agent.name), 'agent');
    return this.executeDirectCommand(agent, pending.command, `@${agent.name} ${pending.command}`);
  }

  private async executeConfirmedAgentDelegate(pending: {
    agentId: string;
    agentName: string;
    command: string;
    sourceAgentId?: string;
    sourceAgentName?: string;
    collabThreadId?: string;
    fileTransfer?: boolean;
    fileHint?: string;
    fileSummary?: string;
    filePermissionAsk?: string;
    fileCollabRequest?: string;
  }): Promise<OrchestratorResult> {
    const source = pending.sourceAgentId
      ? this.agentManager.get(pending.sourceAgentId)
      : null;
    const target = this.agentManager.get(pending.agentId);
    if (!source || !target) {
      return { taskId: '', success: false, message: 'Agent not found' };
    }

    if (pending.fileTransfer) {
      return this.executeCrossAgentFileTransfer(
        source,
        target,
        pending.fileHint ?? pending.command,
        pending.fileCollabRequest,
        pending.command
      );
    }

    const collabThreadId =
      pending.collabThreadId ?? buildCollabThreadId(source.id, target.id);

    this.agentSay(source, buildDelegatePermissionGranted(source, target), 'agent', 'done', undefined, true);

    this.chat.push({
      threadId: collabThreadId,
      senderId: source.id,
      senderName: formatAgentLabel(source),
      senderRole: source.title?.trim() || source.role,
      content: buildDelegateRequestMessage(source, target, pending.command),
      type: 'agent',
      status: 'done',
    });

    this.chat.requestOpenCollabPanel(collabThreadId, source.id, target.id);
    CeoChatPanel.refreshThread(collabThreadId);

    this.collabMirrorThreadId = collabThreadId;
    this.collabSourceAgentId = source.id;
    try {
      const fullCommand = `@${target.name} ${pending.command}`;
      return await this.executeDirectCommand(target, pending.command, fullCommand);
    } finally {
      this.collabMirrorThreadId = null;
      this.collabSourceAgentId = null;
    }
  }

  rejectDelegate(pendingId: string): void {
    const pending = this.chat.getPending();
    if (!pending || pending.pendingId !== pendingId) return;

    if (pending.kind === 'file-match' && pending.fileMatchPending) {
      this.chat.resolveConfirmationByPendingId(pendingId, 'rejected');
      this.chat.clearPending();
      void this.rejectFileMatchAndReSearch(pending);
      return;
    }

    if (pending.kind === 'pm-project') {
      this.chat.resolveConfirmationByPendingId(pendingId, 'rejected');
      this.chat.clearPending();
      const agent = this.agentManager.get(pending.agentId);
      if (agent) {
        this.agentSay(
          agent,
          '사장님, 어떤 부분을 수정할까요? 말씀해 주시면 계획을 다시 짜겠습니다.\n(예: "아니 @하정우 빼고 @한서준이 스크립트까지 해줘")',
          'agent',
          'done',
          undefined,
          true
        );
      }
      return;
    }

    this.chat.clearPending();

    if (pending.kind === 'agent-collab' && pending.sourceAgentId) {
      const source = this.agentManager.get(pending.sourceAgentId);
      const target = this.agentManager.get(pending.agentId);
      if (source && target) {
        this.agentSay(source, buildDelegatePermissionDenied(source, target), 'agent', 'done', undefined, true);
      }
      return;
    }

    this.agentSay(this.getSecretary(), SecretaryMessages.rejectedDelegate(), 'agent');
  }

  private async executeViaSecretary(command: string): Promise<OrchestratorResult> {
    const secretary = this.getSecretary();

    if (shouldTryExternalApi(command, this.externalApis.getEnabled()) && secretary) {
      this.agentWorking(
        secretary,
        `${SecretaryMessages.acknowledgeCommand()}\n등록된 API를 자동으로 연동해서 확인해 볼게요~ ✨`
      );
      return this.executeDirectCommand(secretary, command, command);
    }

    if (secretary) {
      this.agentWorking(secretary, SecretaryMessages.acknowledgeCommand());
    }

    const route = routeCommand(command, this.agentManager.getAll());
    if (!route) {
      if (secretary) this.agentClearWorking(secretary);
      this.agentSay(secretary, SecretaryMessages.noActiveAgents(), 'agent', 'failed');
      return { taskId: '', success: false, message: 'No agents available' };
    }

    const target = this.agentManager.get(route.agentId);
    if (!target) {
      if (secretary) this.agentClearWorking(secretary);
      this.agentSay(secretary, SecretaryMessages.agentNotFound(), 'agent', 'failed');
      return { taskId: '', success: false, message: 'Agent not found' };
    }

    const softenedRoute = {
      ...route,
      reason: SecretaryMessages.softenReason(route.reason),
    };

    if (route.confidence >= getAutoAssignThreshold()) {
      if (secretary) this.agentClearWorking(secretary);
      this.agentSay(
        secretary,
        SecretaryMessages.autoDelegate(softenedRoute, target.name),
        'agent',
        'done'
      );
      return this.executeDirectCommand(target, command, command);
    }

    if (secretary) this.agentClearWorking(secretary);

    const pendingId = generateId();
    this.chat.setPending({
      pendingId,
      command,
      agentId: target.id,
      agentName: target.name,
    });

    const secretaryId = secretary?.id ?? 'secretary';

    this.chat.push({
      threadId: secretaryId,
      senderId: secretary?.id ?? null,
      senderName: SECRETARY_AGENT.name,
      senderRole: 'pm',
      content: SecretaryMessages.askConfirmation(softenedRoute, target.name),
      type: 'confirmation',
      status: 'pending',
      confirmation: { pendingId, command, agentId: target.id, agentName: target.name },
    });

    if (this.isTelegramCommand()) {
      if (secretary && isConversationalCommand(command)) {
        return this.executeConversationalReply(secretary, command);
      }
      this.agentSay(
        secretary,
        `${SecretaryMessages.askConfirmation(softenedRoute, target.name)}\n\n텔레그램에서는 @${target.name} 으로 직접 지정해 주시면 바로 연결됩니다.`,
        'agent',
        'done'
      );
      this.chat.clearPending();
      return {
        taskId: '',
        success: true,
        message: 'Telegram: awaiting explicit @mention instead of auto-delegate',
      };
    }

    return {
      taskId: '',
      success: true,
      message: 'Awaiting CEO confirmation',
    };
  }

  private resolveCeoCommandForAgent(agentId: string, command: string): ResolvedCommand {
    return resolveCommandWithContext(command, this.chat.getMessages(agentId));
  }

  private async tryOfferFileTransferFromCommand(
    agent: Agent,
    resolved: ResolvedCommand,
    rawCommand: string,
    interpretation?: CeoCommandInterpretation
  ): Promise<OrchestratorResult | null> {
    const allAgents = this.agentManager.getAll();
    const effective = resolved.effective;

    if (isInquiryOrApiCommand(rawCommand)) {
      return null;
    }

    if (isExternalResourceFetchTask(effective)) {
      return null;
    }

    const folderHandled = await this.tryHandleFolderCommand(agent, rawCommand, effective);
    if (folderHandled) return folderHandled;

    const ownFileReq = detectOwnFolderFileRequest(effective, agent, allAgents);
    if (ownFileReq) {
      return this.offerOwnFolderFileMatch(agent, ownFileReq, rawCommand);
    }

    const crossFileReq = detectCrossAgentFileRequest(
      effective,
      agent,
      (mention) => this.agentManager.findByMention(mention),
      allAgents
    );
    if (crossFileReq) {
      return this.offerCrossAgentFileTransfer(agent, crossFileReq, rawCommand, interpretation);
    }

    return null;
  }

  private async executeDirectCommand(
    agent: Agent,
    command: string,
    fullCommand: string
  ): Promise<OrchestratorResult> {
    if (!this.collabMirrorThreadId) {
      this.chat.requestOpenPanel(agent.id, agent.name);
    }

    const projectTask = normalizeProjectCommand(command);
    if (shouldStartProjectImmediately(command) && projectTask) {
      return this.executeTeamCommand(agent, projectTask, fullCommand);
    }

    if (isPmAgent(agent) && isExternalResourceFetchTask(command)) {
      return this.executeDirectCommandFlat(agent, command, fullCommand, false);
    }

    if (
      isPmAgent(agent) &&
      isProjectPlanRevision(command) &&
      hasProjectPlanningContext(this.chat.getMessages(agent.id))
    ) {
      return this.executePmPlanRevision(agent, command, fullCommand);
    }

    if (isProjectGoAhead(command) && isPmAgent(agent)) {
      const pending = this.chat.getPending();
      if (pending?.kind === 'pm-project' && pending.agentId === agent.id) {
        this.chat.resolveConfirmationByPendingId(pending.pendingId, 'confirmed');
        this.chat.clearPending();
      }
      const threadMessages = this.chat.getMessages(agent.id);
      if (hasProjectPlanningContext(threadMessages)) {
        const brief = extractProjectBriefFromChat(threadMessages, command);
        return this.executeTeamCommand(agent, brief, fullCommand, { leadPm: agent });
      }
      this.agentSay(
        agent,
        '사장님, Project로 진행할 업무 내용이 아직 정리되지 않았어요. 먼저 목표·범위·참여 에이전트를 말씀해 주시고, 확정 후 "진행하세요"라고 해 주세요.',
        'agent',
        'done',
        { ceoMessage: command },
        true
      );
      return { taskId: '', success: true, message: 'Awaiting project brief' };
    }

    const resolved = this.resolveCeoCommandForAgent(agent.id, command);

    const folderHandled = await this.tryHandleFolderCommand(agent, command, resolved.effective);
    if (folderHandled) return folderHandled;

    const enabledApis = this.externalApis.getEnabled();
    if (enabledApis.length > 0 && shouldTryExternalApi(command, enabledApis)) {
      return this.executeDirectCommandFlat(agent, command, fullCommand, personaAckSent);
    }

    // 경량 대화: 분류 LLM 없이 1회 호출로 바로 답변
    if (isConversationalCommand(command)) {
      if (isResearchAgent(agent) && isResearchTaskQuery(command)) {
        return this.executeDirectCommandFlat(agent, command, fullCommand, false);
      }
      if (isProductionAgent(agent) && isProductionTaskQuery(command)) {
        return this.executeDirectCommandFlat(agent, command, fullCommand, false);
      }
      if (isClineAgent(agent) && isClineDevTask(command)) {
        return this.executeDirectCommandFlat(agent, command, fullCommand, false);
      }
      return this.executeConversationalReply(agent, command, resolved);
    }

    const interpretation = await this.interpretCeoCommandWithPersona(agent, command, resolved);

    if (
      interpretation.suggestedAction === 'conversation_complete' ||
      interpretation.suggestedAction === 'needs_clarification'
    ) {
      return this.executeConversationalReply(agent, command, resolved);
    }

    const acknowledgment = sanitizeAcknowledgmentForPendingWork(
      interpretation.acknowledgment,
      interpretation.suggestedAction
    );
    if (acknowledgment.trim()) {
      this.agentSay(
        agent,
        acknowledgment,
        'agent',
        'pending',
        { ceoMessage: command },
        true
      );
      this.agentManager.setStatus(agent.id, 'progress');
      this.agentWorking(agent, acknowledgment, undefined, {
        pipeline: '업무',
        step: '착수',
        summary: '말씀 확인 후 작업을 이어가고 있어요.',
        log: [acknowledgment.slice(0, 200)],
      });
      CeoChatPanel.refreshThread(agent.id);
    }

    const fileResolved: ResolvedCommand = {
      ...resolved,
      effective: interpretation.understoodTask?.trim() || resolved.effective,
    };
    const fileLate = await this.tryOfferFileTransferFromCommand(
      agent,
      fileResolved,
      command,
      interpretation
    );
    if (fileLate) return fileLate;

    if (interpretation.suggestedAction === 'cross_agent_file') {
      const crossOnly = detectCrossAgentFileRequest(
        fileResolved.effective,
        agent,
        (mention) => this.agentManager.findByMention(mention),
        this.agentManager.getAll()
      );
      if (crossOnly) {
        return await this.offerCrossAgentFileTransfer(agent, crossOnly, command, interpretation);
      }
    }

    if (this.orgEngine.shouldUseHierarchicalReport(agent.id)) {
      const chain = this.orgEngine.getReportingChain(agent.id);
      return this.executeHierarchicalCommand(agent, command, fullCommand, chain);
    }
    return this.executeDirectCommandFlat(agent, command, fullCommand, true);
  }

  /** 모든 사장 지시 — 페르소나 기반 LLM 인지 */
  private async interpretCeoCommandWithPersona(
    agent: Agent,
    command: string,
    resolved?: ResolvedCommand
  ): Promise<CeoCommandInterpretation> {
    if (!this.trySetAgentWorking(agent)) {
      return {
        acknowledgment: '현재 offline 상태라 말씀을 제대로 받지 못했어요. Activate 후 다시 말씀해 주세요.',
        understoodTask: command,
        suggestedAction: 'needs_clarification',
      };
    }

    this.agentWorking(agent, '사장님 말씀 이해 중…', undefined, {
      pipeline: '인지',
      step: '지시 파악',
      summary: '페르소나에 맞게 사장님 지시를 이해하고 있습니다.',
      log: [
        `에이전트: ${formatAgentLabel(agent)}`,
        `명령: ${command.slice(0, 200)}`,
      ],
    });

    const resolvedCmd = resolved ?? this.resolveCeoCommandForAgent(agent.id, command);
    const taskForLlm = resolvedCmd.usedContext
      ? `${command}\n[이전 맥락: ${resolvedCmd.contextSummary}]`
      : command;

    try {
      const history = buildChatMessagesForLlm(this.chat.getMessages(agent.id), {
        excludeLastCeo: true,
      });
      return await interpretCeoCommand(
        this.providers,
        this.agentFolders,
        agent,
        taskForLlm,
        history,
        isPmAgent(agent)
          ? buildPmOrchestrationPromptBlock(this.agentManager.getAll(), agent)
          : undefined
      );
    } finally {
      this.agentClearWorking(agent);
      const current = this.agentManager.get(agent.id);
      if (current?.status === 'working') {
        this.agentManager.setStatus(agent.id, 'idle');
      }
      CeoChatPanel.refreshThread(agent.id);
    }
  }

  private async executeTeamCommand(
    requester: Agent,
    command: string,
    fullCommand: string,
    options?: { leadPm?: Agent }
  ): Promise<OrchestratorResult> {
    let teamPlan;
    try {
      teamPlan = await this.teamEngine.prepareTeam(requester, command, options?.leadPm);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.agentSay(
        requester,
        `사장님, PM Project 구성 중 문제가 생겼어요.\n\n${message}`,
        'agent',
        'failed',
        { ceoMessage: command },
        true
      );
      return { taskId: '', success: false, message };
    }

    const { pm, plan, members } = teamPlan;

    if (members.length < 2) {
      this.agentSay(
        requester,
        '사장님, Project를 하려면 활성 에이전트가 2명 이상 필요해요. Agents 탭에서 에이전트를 추가해 주세요.',
        'agent',
        'failed',
        { ceoMessage: command },
        true
      );
      return { taskId: '', success: false, message: 'Not enough agents for team collaboration' };
    }

    const session = this.teamEngine.createSession(pm, command, members, plan, requester.id);

    this.chat.requestOpenTeamPanel(
      session.threadId,
      session.memberAgentIds,
      session.title,
      session.leadAgentId
    );
    CeoChatPanel.refreshThread(session.threadId);
    this.dashboardRefresh?.();

    const memberLabels = members.map((m) => formatAgentLabel(m)).join(', ');
    this.agentSay(
      requester,
      `사장님, ${formatAgentLabel(pm)} PM이 Project 채팅방을 열고 순차 실행을 시작할게요.\n참여: ${memberLabels}\nProject 탭에서 진행 상황을 보실 수 있어요.`,
      'agent',
      'done',
      { ceoMessage: command },
      true
    );

    try {
      const result = await this.teamEngine.runSession(session, command);
      this.memory.logActivity(
        pm.id,
        null,
        `PM Project 완료 (${result.turns}태스크): ${command.slice(0, 80)}`
      );
      this.agentSay(
        requester,
        `[PM ${pm.name} 보고]\n${result.summary.slice(0, 1400)}`,
        'agent',
        'done',
        { ceoMessage: command },
        true
      );
      this.notifications.showInfo(`Project 완료 — PM ${pm.name}`);
      this.dashboardRefresh?.();
      return {
        taskId: session.id,
        success: result.success,
        message: result.summary,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.teamEngine.failSession(session.id, message);
      this.agentSay(requester, `Project 중 오류가 발생했어요.\n\n${message}`, 'agent', 'failed');
      return { taskId: session.id, success: false, message };
    } finally {
      CeoChatPanel.refreshThread(session.threadId);
      void fullCommand;
    }
  }

  private async executeConversationalReply(
    agent: Agent,
    command: string,
    resolvedInput?: ResolvedCommand
  ): Promise<OrchestratorResult> {
    this.chat.requestOpenPanel(agent.id, agent.name);

    const resolved = resolvedInput ?? this.resolveCeoCommandForAgent(agent.id, command);

    if (!this.trySetAgentWorking(agent)) {
      return { taskId: '', success: false, message: `Agent "${agent.name}" is offline` };
    }

    const workingDetail: ChatWorkingDetail = {
      pipeline: '대화',
      step: '답변 생성',
      summary: '최근 대화 맥락을 읽고 답변하고 있어요.',
      log: [
        `에이전트: ${formatAgentLabel(agent)}`,
        `역할: ${agent.title?.trim() || agent.role}`,
        `명령: ${command.slice(0, 200)}`,
      ],
    };
    this.agentWorking(agent, '답변 준비 중…', undefined, workingDetail);

    try {
      const folderContext = await this.agentFolders.buildConversationalPromptContext(agent);
      const history = buildChatMessagesForLlm(this.chat.getMessages(agent.id), {
        excludeLastCeo: true,
        limit: isPmAgent(agent) ? 20 : 12,
      });
      const memorySnippet = agent.memory?.trim().slice(0, 600);
      const pmBlock = isPmAgent(agent)
        ? buildPmOrchestrationPromptBlock(this.agentManager.getAll(), agent)
        : '';
      const devBlock = isDeveloperAgent(agent)
        ? agent.name.includes('하정우')
          ? '\n당신은 AgentCompany 개발자(하정우)입니다. 코드·스크립트 업무는 Cline 엔진으로 실행합니다. 플랫폼 구조·DB·src/ 경로를 정확히 알고 있으며, 다른 에이전트 산출물을 바탕으로 src/에 코드를 추가합니다.'
          : '\n당신은 AgentCompany 확장 개발자입니다. 위 플랫폼 구조·DB·src/ 경로를 정확히 알고 있으며, "경로가 없다"고 하지 마세요. 구조 변경은 src/ 코드 수정으로 수행합니다.'
        : '';
      const systemPrompt = `You are ${agent.name}, a ${agent.role} agent in AgentCompany.
${folderContext || agent.description || ROLE_DESCRIPTIONS[agent.role]}
${memorySnippet ? `\nMemory:\n${memorySnippet}` : ''}
${pmBlock}${devBlock}

사장님과 자연스럽게 대화하세요. 사장을 부를 때는 항상 "사장님"이라고 하세요. "CEO", "대표님", 실명은 쓰지 마세요. 한국어로 간결하게 답변하고, 불필요한 보고서 형식·메타 정보는 쓰지 마세요.
**주어 없는 후속 말**(전달해줘, 해줘 등)은 **이전 대화**와 합쳐 의도를 파악하세요.
사장님이 짜증·분노·질책을 하면 밝게 넘기지 말고 사과·수정·조용히 대기 등 상황에 맞게 답하세요. 이모지는 남발하지 마세요.`;

      const userLine = resolved.usedContext
        ? `${command}\n(이전 맥락: ${resolved.contextSummary})`
        : command;

      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userLine },
      ];

      let streamed = '';
      const response = await runWithLlmAgent(agent.id, () =>
        this.providers.chatStream(
          agent.provider,
          messages,
          { type: agent.provider, model: agent.model },
          (chunk) => {
            streamed += chunk;
            this.agentWorking(agent, streamed, undefined, workingDetail);
          }
        )
      );

      const raw = (response.content || streamed).trim();
      const reply = formatChatReply(raw) || raw || '네, 사장님.';
      this.agentSay(agent, reply.slice(0, 1500), 'agent', 'done', { ceoMessage: command });
      if (isPmAgent(agent)) {
        this.maybeOfferPmProjectApproval(agent, reply);
      }
      this.memory.logActivity(agent.id, null, `대화 응답: ${command.slice(0, 80)}`);

      return { taskId: '', success: true, message: 'Conversational reply sent' };
    } catch (error) {
      const message = formatLlmError(error);
      this.agentSay(agent, message, 'agent', 'failed');
      return { taskId: '', success: false, message };
    } finally {
      this.agentClearWorking(agent);
      const current = this.agentManager.get(agent.id);
      if (current?.status === 'working') {
        this.agentManager.setStatus(agent.id, 'idle');
      }
      CeoChatPanel.refreshThread(agent.id);
    }
  }

  /** 조직도(저장됨): 부하 작업 → 직속 상사 → … → CEO 최종 보고 */
  private async executeHierarchicalCommand(
    worker: Agent,
    command: string,
    fullCommand: string,
    chain: string[]
  ): Promise<OrchestratorResult> {
    this.chat.requestOpenPanel(worker.id, worker.name);

    const parentTask = this.taskEngine.create({
      title: fullCommand,
      description: `CEO command (조직 보고) → ${worker.name}: ${command}`,
    });
    this.taskEngine.transition(parentTask.id, 'working');

    const subTask = this.taskEngine.create({
      title: `[${worker.name}] ${command}`,
      description: worker.description || ROLE_DESCRIPTIONS[worker.role],
      agentId: worker.id,
      parentTaskId: parentTask.id,
    });

    if (worker.status === 'offline') {
      this.agentSay(worker, '현재 offline 상태입니다.', 'agent', 'failed');
      this.taskEngine.transition(subTask.id, 'failed');
      this.taskEngine.transition(parentTask.id, 'failed');
      return { taskId: parentTask.id, success: false, message: 'Worker offline', subTasks: [subTask] };
    }

    this.agentWorking(worker, `"${command}" — 작업 중…`);
    try {
      await this.runAgentTask(worker.id, subTask.id);
    } finally {
      this.agentClearWorking(worker);
    }

    const subResult = this.taskEngine.get(subTask.id);
    const workerRawResult = subResult?.result?.trim() || '';
    let rollingSummary = workerRawResult || '작업 결과 없음';
    const workerSuccess = subResult?.status !== 'failed';

    if (!workerSuccess) {
      this.agentSay(worker, '작업 중 오류가 발생했습니다.', 'agent', 'failed');
      this.taskEngine.transition(parentTask.id, 'failed');
      return { taskId: parentTask.id, success: false, message: 'Worker task failed', subTasks: [subTask] };
    }

    const reviewSteps: ManagerReviewStep[] = [];
    const managerIds = this.orgEngine.getOrderedManagers(worker.id);
    let revisionCount = 0;
    let chainComplete = false;

    while (!chainComplete && revisionCount <= MAX_ORG_REVISIONS) {
      reviewSteps.length = 0;
      chainComplete = true;
      let subordinate: Agent = worker;

      for (const managerId of managerIds) {
        const manager = this.agentManager.get(managerId);
        if (!manager) {
          this.memory.logActivity(worker.id, parentTask.id, `조직 보고: 상사 ${managerId} 없음 — 건너뜀`);
          continue;
        }
        if (manager.status === 'offline') {
          this.memory.logActivity(worker.id, parentTask.id, `조직 보고: ${manager.name} offline — 검토 건너뜀`);
          continue;
        }

        this.chat.requestOpenPanel(manager.id, manager.name);
        this.agentWorking(manager, `${formatAgentLabel(subordinate)} 업무 검토 중… (본인 기준)`);

        let parsed;
        try {
          const managerContext = await this.agentFolders.buildPromptContext(manager, {
            taskHint: [command, rollingSummary].join('\n'),
          });
          const fullReview = await runWithLlmAgent(manager.id, () =>
            reviewAndSummarizeForManager(
              manager,
              subordinate,
              command,
              rollingSummary,
              this.providers,
              managerContext
            )
          );
          parsed = parseManagerReview(fullReview);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          this.agentSay(manager, `검토 중 오류: ${msg}`, 'agent', 'failed');
          this.memory.logActivity(worker.id, parentTask.id, `조직 보고: ${manager.name} 검토 오류 — ${msg}`);
          this.agentClearWorking(manager);
          continue;
        } finally {
          this.agentClearWorking(manager);
        }

        if (parsed.approved) {
          rollingSummary = parsed.upwardSummary;
          reviewSteps.push({
            manager,
            subordinate,
            fullReview: parsed.fullReview,
            upwardSummary: rollingSummary,
            approved: true,
            revisionRound: revisionCount > 0 ? revisionCount : undefined,
          });
          subordinate = manager;
          continue;
        }

        const feedback =
          parsed.revisionFeedback.trim() ||
          parsed.reviewComment.trim() ||
          '품질 기준에 미치지 않습니다. CEO 지시와 피드백을 반영해 다시 작업해 주세요.';

        revisionCount++;
        if (revisionCount > MAX_ORG_REVISIONS) {
          reviewSteps.push({
            manager,
            subordinate,
            fullReview: `${parsed.fullReview}\n\n_(최대 재작업 ${MAX_ORG_REVISIONS}회 초과 — 현재 결과로 보고)_`,
            upwardSummary: rollingSummary,
            approved: false,
            revisionRound: revisionCount,
          });
          this.memory.logActivity(
            worker.id,
            parentTask.id,
            `조직 보고: ${manager.name} 반려 — 수정 한도 초과`
          );
          chainComplete = true;
          break;
        }

        this.memory.logActivity(
          worker.id,
          parentTask.id,
          `조직 보고: ${manager.name} 반려 → ${worker.name} 재작업 (${revisionCount}/${MAX_ORG_REVISIONS})`
        );

        const reworkResult = await this.reworkWorkerTask(
          worker,
          subTask.id,
          command,
          manager,
          feedback
        );

        if (!reworkResult) {
          this.taskEngine.transition(parentTask.id, 'failed');
          return {
            taskId: parentTask.id,
            success: false,
            message: 'Worker revision failed',
            subTasks: [subTask],
          };
        }

        rollingSummary = reworkResult;
        chainComplete = false;
        break;
      }
    }

    const ceoReport = buildCeoFinalReport(worker, reviewSteps, command, rollingSummary, revisionCount);
    this.memory.logActivity(worker.id, parentTask.id, ceoReport.slice(0, 2000));

    this.chat.requestOpenPanel(worker.id, worker.name);
    const reply =
      formatChatReply(rollingSummary) || rollingSummary.trim() || '처리가 완료되었습니다.';
    this.agentSay(worker, reply, 'agent', 'done', undefined, true);
    if (isPmAgent(worker)) {
      this.maybeOfferPmProjectApproval(worker, workerRawResult || reply);
    }
    void this.maybeOfferAgentDelegation(worker, workerRawResult || reply, worker.id);

    this.memory.logActivity(
      worker.id,
      parentTask.id,
      `조직 보고 완료: ${chain.map((id) => (id === CEO_NODE_ID ? 'CEO' : id)).join(' → ')}`
    );

    this.taskEngine.transition(parentTask.id, 'completed');
    this.notifications.showInfo(`${worker.name} → 조직 보고 완료`);

    return {
      taskId: parentTask.id,
      success: true,
      message: 'Hierarchical report complete',
      subTasks: [subTask],
    };
  }

  private async executeDirectCommandFlat(
    agent: Agent,
    command: string,
    fullCommand: string,
    personaAckSent = false
  ): Promise<OrchestratorResult> {
    const resolved = this.resolveCeoCommandForAgent(agent.id, command);
    if (!personaAckSent) {
      const fileEarly = await this.tryOfferFileTransferFromCommand(agent, resolved, command);
      if (fileEarly) return fileEarly;
    }

    const allAgents = this.agentManager.getAll();
    const fileReq = detectCrossAgentFileRequest(
      resolved.effective,
      agent,
      (mention) => this.agentManager.findByMention(mention),
      allAgents
    );
    if (fileReq) {
      let interpretation: CeoCommandInterpretation | undefined;
      if (!personaAckSent) {
        interpretation = await this.interpretCeoCommandWithPersona(agent, command, resolved);
        if (interpretation.acknowledgment.trim()) {
          this.agentSay(
            agent,
            interpretation.acknowledgment,
            'agent',
            'pending',
            { ceoMessage: command },
            true
          );
          this.agentManager.setStatus(agent.id, 'progress');
          CeoChatPanel.refreshThread(agent.id);
        }
      }
      return await this.offerCrossAgentFileTransfer(agent, fileReq, command, interpretation);
    }

    if (!this.collabMirrorThreadId && !personaAckSent) {
      this.chat.requestOpenPanel(agent.id, agent.name);
    }

    const parentTask = this.taskEngine.create({
      title: fullCommand,
      description: `CEO command → ${agent.name}: ${command}`,
    });

    this.taskEngine.transition(parentTask.id, 'working');

    const subTask = this.taskEngine.create({
      title: `[${agent.name}] ${command}`,
      description: agent.description || ROLE_DESCRIPTIONS[agent.role],
      agentId: agent.id,
      parentTaskId: parentTask.id,
    });

    if (!this.trySetAgentWorking(agent)) {
      this.taskEngine.transition(subTask.id, 'failed');
      this.taskEngine.transition(parentTask.id, 'failed');
      return {
        taskId: parentTask.id,
        success: false,
        message: `Agent "${agent.name}" is offline`,
        subTasks: [subTask],
      };
    }

    if (this.collabMirrorThreadId && this.collabSourceAgentId) {
      const source = this.agentManager.get(this.collabSourceAgentId);
      if (source) {
        this.chat.push({
          threadId: this.collabMirrorThreadId,
          senderId: agent.id,
          senderName: formatAgentLabel(agent),
          senderRole: agent.title?.trim() || agent.role,
          content: buildDelegateAckMessage(agent, source),
          type: 'agent',
          status: 'done',
        });
        CeoChatPanel.refreshThread(this.collabMirrorThreadId);
      }
    }

    this.agentWorking(
      agent,
      `"${command}" — 작업 중…`,
      undefined,
      this.buildWorkingDetail(agent, '업무 실행', '작업 착수', command)
    );
    try {
      await this.runAgentTask(agent.id, subTask.id);
    } finally {
      this.agentClearWorking(agent);
      const current = this.agentManager.get(agent.id);
      if (current?.status === 'working') {
        this.agentManager.setStatus(agent.id, 'idle');
      }
      CeoChatPanel.refreshThread(agent.id);
    }

    const subResult = this.taskEngine.get(subTask.id);
    const success = subResult?.status !== 'failed';

    if (success) {
      this.taskEngine.transition(
        parentTask.id,
        subResult?.status === 'review' ? 'review' : 'completed'
      );
      const raw = subResult?.result?.trim() ?? '';
      const blockedPlan = isImplementationPlanReply(raw);
      let reply = formatChatReply(raw) || (blockedPlan ? '' : raw) || '';

      if (!reply.trim() || blockedPlan) {
        const lateResolved = this.resolveCeoCommandForAgent(agent.id, command);
        const lateFile = await this.tryOfferFileTransferFromCommand(agent, lateResolved, command, {
          acknowledgment: '',
          understoodTask: lateResolved.effective,
          suggestedAction: 'cross_agent_file',
        });
        if (lateFile) return lateFile;
        if (!reply.trim()) {
          reply = blockedPlan ? '' : '처리가 완료되었습니다.';
        }
      }

      if (!reply.trim()) {
        return {
          taskId: parentTask.id,
          success: true,
          message: 'Suppressed non-actionable agent reply',
          subTasks: [subTask],
        };
      }

      if (this.collabSourceAgentId) {
        const source = this.agentManager.get(this.collabSourceAgentId);
        if (source) {
          reply = buildDelegateCompleteMessage(agent, source, reply);
        }
      }
      if (reply.trim()) {
        this.agentSay(agent, reply.slice(0, 1500), 'agent', 'done', undefined, true);
        if (isPmAgent(agent)) {
          this.maybeOfferPmProjectApproval(agent, reply);
        }
      }
      void this.maybeOfferAgentDelegation(agent, raw, agent.id);
    } else {
      this.taskEngine.transition(parentTask.id, 'failed');
      this.agentSay(agent, '작업 중 오류가 발생했습니다.', 'agent', 'failed');
    }

    return {
      taskId: parentTask.id,
      success,
      message: success ? `Direct command sent to ${agent.name}` : `Direct command failed`,
      subTasks: [subTask],
    };
  }

  /** 상사 반려 시 부하 재작업 */
  private async reworkWorkerTask(
    worker: Agent,
    taskId: string,
    command: string,
    manager: Agent,
    feedback: string
  ): Promise<string | null> {
    const task = this.taskEngine.get(taskId);
    if (!task) return null;

    const revisionNote = `[상사 ${formatAgentLabel(manager)} 수정 지시]\n${feedback}\n\n원래 CEO 지시: ${command}\n위 피드백을 반영해 작업을 수정하세요.`;

    this.taskEngine.update(taskId, {
      description: `${worker.description || ROLE_DESCRIPTIONS[worker.role]}\n\n---\n${revisionNote}`,
      result: '',
      status: 'working',
    });

    this.agentWorking(worker, `${formatAgentLabel(manager)} 피드백 반영 수정 중…`);
    try {
      await this.runAgentTask(worker.id, taskId);
    } finally {
      this.agentClearWorking(worker);
    }

    const updated = this.taskEngine.get(taskId);
    if (!updated || updated.status === 'failed') {
      this.agentSay(worker, '수정 작업 중 오류가 발생했습니다.', 'agent', 'failed');
      return null;
    }

    return updated.result?.trim() || null;
  }

  async runAgentTask(agentId: string, taskId: string): Promise<void> {
    return runWithLlmAgent(agentId, () => this.runAgentTaskInner(agentId, taskId));
  }

  private async runAgentTaskInner(agentId: string, taskId: string): Promise<void> {
    const agent = this.agentManager.get(agentId);
    const task = this.taskEngine.get(taskId);
    if (!agent || !task) return;

    if (agent.status === 'offline') {
      this.memory.logActivity(agentId, taskId, `Agent "${agent.name}" is offline — skipping`);
      return;
    }

    if (!this.llmStatus.isProviderConnected(agent.provider)) {
      this.memory.logActivity(
        agentId,
        taskId,
        `Agent "${agent.name}" — AI API 미연결로 작업을 시작하지 않습니다`
      );
      this.taskEngine.transition(taskId, 'failed');
      return;
    }

    this.agentManager.setStatus(agentId, 'working');
    this.taskEngine.transition(taskId, 'working');

    try {
      const command = this.extractCommandFromTask(task);
      const resolved = this.resolveCeoCommandForAgent(agentId, command);

      if (detectFolderOpenRequest(command)) {
        const target = inferFolderOpenTarget(
          command,
          agent,
          this.agentManager.getAll(),
          this.chat.getMessages(agent.id)
        );
        if (target === 'owner') {
          await this.agentFolders.openOwnerFolder();
        } else {
          await this.agentFolders.openAgentFolder(target);
        }
        const reply =
          target === 'owner'
            ? '사장님, Owner 폴더를 탐색기에서 열었어요.'
            : `사장님, ${target.name} 작업 폴더를 탐색기에서 열었어요.`;
        this.taskEngine.setResult(taskId, reply);
        this.taskEngine.transition(taskId, 'completed');
        this.agentManager.setStatus(agentId, 'idle');
        this.agentSay(agent, reply, 'agent', 'done');
        return;
      }

      const allAgents = this.agentManager.getAll();
      const folderScope = resolveFolderPathScope(resolved.effective, agent, allAgents);
      if (folderScope) {
        let reply: string;
        if (folderScope === 'named') {
          const namedTarget = detectFolderPathTargetAgent(resolved.effective, agent, allAgents);
          reply = namedTarget
            ? this.agentFolders.buildNamedAgentFolderPathReply(namedTarget)
            : this.agentFolders.buildFolderPathReply(agent, 'agent');
        } else {
          reply = this.agentFolders.buildFolderPathReply(agent, folderScope);
        }
        this.taskEngine.setResult(taskId, reply);
        this.taskEngine.transition(taskId, 'completed');
        this.agentManager.setStatus(agentId, 'idle');
        this.agentSay(agent, reply, 'agent', 'done');
        return;
      }

      if (isDeveloperAgent(agent)) {
        const platformKind = detectPlatformInquiry(resolved.effective);
        if (platformKind) {
          const reply = buildPlatformInquiryReply(this.agentFolders, agent, platformKind);
          this.taskEngine.setResult(taskId, reply);
          this.taskEngine.transition(taskId, 'completed');
          this.agentManager.setStatus(agentId, 'idle');
          this.agentSay(agent, reply, 'agent', 'done');
          return;
        }
      }

      if (isExternalResourceFetchTask(resolved.effective)) {
        // 외부 다운로드 업무 — 폴더 검색 생략, PM/리서치 등 실제 작업으로 진행
      } else if (!isInquiryOrApiCommand(command)) {
      const ownFileReq = detectOwnFolderFileRequest(resolved.effective, agent, allAgents);
      if (ownFileReq) {
        this.memory.logActivity(
          agentId,
          taskId,
          `Own-folder file delivery — LLM 작업 생략 (${agent.name} → 사장님)`
        );
        this.taskEngine.setResult(taskId, '');
        this.taskEngine.transition(taskId, 'completed');
        this.agentManager.setStatus(agentId, 'idle');
        void this.offerOwnFolderFileMatch(agent, ownFileReq, command);
        return;
      }

      const fileReq = detectCrossAgentFileRequest(
        resolved.effective,
        agent,
        (mention) => this.agentManager.findByMention(mention),
        allAgents
      );
      if (fileReq) {
        this.memory.logActivity(
          agentId,
          taskId,
          `Cross-agent file transfer — LLM/workspace 작업 생략 (${fileReq.fileOwner.name} → ${agent.name})`
        );
        this.taskEngine.setResult(taskId, '');
        this.taskEngine.transition(taskId, 'completed');
        this.agentManager.setStatus(agentId, 'idle');
        return;
      }
      }

      if (isResearchAgent(agent)) {
        if (commandNeedsKnowledgeLearning(command)) {
          void this.knowledgeLearner.syncAgent(agent, { force: true });
        }
        await this.runResearchTask(agent, task);
        return;
      }

      if (isProductionAgent(agent) && isProductionTaskQuery(command)) {
        await this.runProductionTask(agent, task);
        return;
      }

      if (isClineAgent(agent) && isClineDevTask(command)) {
        if (commandNeedsKnowledgeLearning(command)) {
          void this.knowledgeLearner.syncAgent(agent, { force: true });
        }
        await this.runClineTask(agent, task);
        return;
      }

      const enabledApis = this.externalApis.getEnabled();
      const chatContext = this.buildChatContext(agent.id);
      const apiCommand = this.resolveApiCommand(agent.id, command);

      if (enabledApis.length > 0 && shouldTryExternalApi(apiCommand, enabledApis)) {
        try {
          const autoResult = await this.externalApiExecutor.tryAutoExecute(
            agent,
            task,
            apiCommand,
            chatContext
          );
          if (autoResult) {
            this.taskEngine.setResult(task.id, autoResult);
            this.memory.logActivity(agent.id, task.id, `${agent.name} external API auto-linked`);
            this.taskEngine.transition(task.id, 'review');
            this.agentManager.setStatus(agent.id, 'idle');
            this.notifications.showTaskComplete(task.title);
            return;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.memory.logActivity(agent.id, task.id, `External API auto-link error: ${message}`);
          this.taskEngine.setResult(task.id, message);
          this.taskEngine.transition(task.id, 'failed');
          this.agentManager.setStatus(agent.id, 'failed');
          this.notifications.showError(message.split('\n')[0]);
          this.agentSay(
            agent,
            agent.name.includes('비서')
              ? `앗, 대표님… API 연동 중 문제가 생겼어요 😢\n\n${message}`
              : message,
            'agent',
            'failed'
          );
          return;
        }
      }

      if (isPmAgent(agent) && !isInquiryOrApiCommand(command)) {
        await this.runPmPlanningTask(agent, task, command, resolved);
        return;
      }

      if (commandNeedsKnowledgeLearning(command)) {
        await this.knowledgeLearner.syncAgent(agent, { force: true });
      }

      const workspaceRoot = this.workspace.getWorkspaceRoot();
      const projectFiles = workspaceRoot
        ? await this.gatherProjectContext(task.title)
        : 'No workspace open';

      const folderContext = await this.agentFolders.buildPromptContext(agent, { taskHint: command });
      const memorySnippet = agent.memory?.trim().slice(0, 2000);

      const systemPrompt = `You are ${agent.name}, a ${agent.role} agent.
${folderContext || agent.description || ROLE_DESCRIPTIONS[agent.role]}
${memorySnippet ? `\nMemory:\n${memorySnippet}` : ''}
${this.externalApiExecutor.getRegistryPrompt()}
${buildWorkspacePrompt(agent.role)}`;

      const response = await this.providers.chat(
        agent.provider,
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Task: ${task.title}
Description: ${task.description}
Workspace: ${workspaceRoot ?? 'none'}

Project context:
${projectFiles}

Complete this task. If code/files are needed, output them in the specified file format.`,
          },
        ],
        { type: agent.provider, model: agent.model }
      );

      const parsed = parseAgentOutput(response.content);
      let resultSummary = parsed.summary.trim() || response.content.trim();

      if (parsed.files.length > 0 && workspaceRoot) {
        const applyResults = await this.workspaceExecutor.applyActions(parsed.files, agentId, taskId);
        const succeeded = applyResults.filter((r) => r.success).length;
        resultSummary += `\n\nFiles modified: ${succeeded}/${applyResults.length}`;
        this.notifications.showInfo(`${agent.name} modified ${succeeded} file(s)`);
      }

      this.taskEngine.setResult(taskId, resultSummary);
      this.memory.appendAgentMemory(agentId, `[${task.title}]\n${resultSummary}`);
      this.memory.logActivity(agentId, taskId, `${agent.name} completed: "${task.title}"`);

      if (agent.role === 'qa') {
        this.taskEngine.transition(taskId, 'review');
      } else {
        this.taskEngine.transition(taskId, 'completed');
      }

      this.agentManager.setStatus(agentId, 'idle');
      this.notifications.showTaskComplete(task.title);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.memory.logActivity(agentId, taskId, `Error: ${message}`);
      this.taskEngine.transition(taskId, 'failed');
      this.agentManager.setStatus(agentId, 'failed');
      this.notifications.showError(`${agent.name} failed: ${message}`);
      this.agentSay(agent, `오류: ${message}`, 'agent', 'failed');
    }
  }

  private async runClineTask(agent: Agent, task: Task): Promise<void> {
    const prompt = task.title.replace(/^\[[^\]]+\]\s*/, '').trim() || task.description;
    const priorContext = task.description?.trim() !== prompt ? task.description : undefined;

    try {
      const result = await this.clineAgent.execute(
        prompt,
        agent,
        task.id,
        (step) => {
          this.agentWorking(
            agent,
            `[${step.step}] ${step.message}`,
            step.status === 'failed' ? 'failed' : undefined,
            this.buildWorkingDetail(agent, 'Cline 개발', step.step, step.message, [
              `상태: ${step.status}`,
              `엔진: Cline (CLI → Internal 폴백)`,
              `요청: ${prompt.slice(0, 200)}`,
            ])
          );
        },
        { priorContext }
      );

      let resultSummary = result.output;
      if (result.filesModified.length > 0) {
        resultSummary += `\n\nFiles modified: ${result.filesModified.join(', ')}`;
      }
      if (result.reportPath) {
        resultSummary += `\n\n📄 Report: ${result.reportPath}`;
        const abs = this.agentFolders.resolveDeliverablePath(result.reportPath);
        if (abs) {
          void this.notifications.deliverMarkdownFile(abs, `📄 Cline 보고서\n${prompt.slice(0, 120)}`);
        }
      }
      resultSummary += `\n\nMode: ${result.mode} | Engine: ${result.usedCli ? 'Cline CLI' : 'Internal'}`;

      const chatReply = formatChatReply(resultSummary) || resultSummary;
      this.taskEngine.setResult(task.id, chatReply);
      this.memory.logActivity(agent.id, task.id, `${agent.name} Cline complete (${result.mode})`);
      this.taskEngine.transition(task.id, result.selfCheckPassed ? 'review' : 'completed');
      this.agentManager.setStatus(agent.id, 'idle');
      this.agentSay(agent, chatReply, 'agent', 'done');
      this.notifications.showTaskComplete(task.title);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.memory.logActivity(agent.id, task.id, `Cline error: ${message}`);
      this.taskEngine.transition(task.id, 'failed');
      this.agentManager.setStatus(agent.id, 'failed');
      this.notifications.showError(`${agent.name} Cline failed: ${message}`);
      this.agentSay(agent, `Cline 오류: ${message}`, 'agent', 'failed');
    }
  }

  private extractCommandFromTask(task: Task): string {
    return task.title.replace(/^\[[^\]]+\]\s*/, '').trim();
  }

  /** PM 전용 — 실제 팀 에이전트 목록 + 대화 맥락 기반 계획·매칭 */
  private async runPmPlanningTask(
    agent: Agent,
    task: Task,
    command: string,
    resolved: ResolvedCommand
  ): Promise<void> {
    const allAgents = this.agentManager.getAll();
    const recentCeoContext = this.chat
      .getMessages(agent.id)
      .filter((m) => m.type === 'ceo')
      .slice(-5)
      .map((m) => m.content)
      .join('\n');
    const fullContext = `${recentCeoContext}\n${command}`;
    const folderContext = await this.agentFolders.buildPromptContext(agent, { taskHint: fullContext });
    const pmBlock = buildPmOrchestrationPromptBlock(allAgents, agent);
    const memorySnippet = agent.memory?.trim().slice(0, 800);
    const matchHint = proposeTeamMembers(agent, fullContext, allAgents);
    const hintBlock =
      matchHint.length > 0
        ? `\n## 참고: 업무 키워드 기반 추천 조합\n${matchHint.map((m, i) => `${i + 1}. @${m.name} (${formatAgentLabel(m)})`).join('\n')}`
        : '';
    const templateBlock = buildPmPlanningContextBlock(fullContext);

    const history = buildChatMessagesForLlm(this.chat.getMessages(agent.id), {
      excludeLastCeo: true,
      limit: 20,
    });

    const systemPrompt = `You are ${formatAgentLabel(agent)}, PM in AgentCompany.
${folderContext || agent.description || ROLE_DESCRIPTIONS[agent.role]}
${memorySnippet ? `\nMemory:\n${memorySnippet}` : ''}
${pmBlock}
${hintBlock}
${templateBlock}

사장님과 PM으로 대화합니다.
- 응답에 **목표 → 계획 → 작업 분배 → 참여 에이전트** 순서로 제시
- **인터넷·웹 PDF 다운로드** 요청 시 knowledge/폴더·로컬 파일 검색 금지 — @한서준(출처조사)→@하정우(스크립트) Project 계획 제시
- 팀 에이전트 매칭·협업 계획 시 **위 실제 @에이전트명만** 사용
- 가상의 외부 전문가·일반 직함 나열 금지
- 한국어, "사장님" 호칭, @이름: 담당업무 형식 권장
- 계획 제시 후 마지막에 **"사장님, 이대로 진행할까요?"** 로 승인을 요청
- 사장님이 "진행하세요" 버튼·승인 또는 수정 요청(예: "아니 ~ 바꿔줘")으로 확정`;

    const userLine = resolved.usedContext
      ? `${command}\n(이전 맥락: ${resolved.contextSummary})`
      : command;

    const response = await this.providers.chat(
      agent.provider,
      [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userLine },
      ],
      { type: agent.provider, model: agent.model }
    );

    const raw = (response.content || '').trim();
    const resultSummary = formatChatReply(raw) || raw || '계획을 정리했습니다.';

    this.taskEngine.setResult(task.id, resultSummary);
    this.memory.appendAgentMemory(agent.id, `[PM 계획] ${command.slice(0, 80)}\n${resultSummary.slice(0, 500)}`);
    this.memory.logActivity(agent.id, task.id, `${agent.name} PM planning: "${command.slice(0, 60)}"`);
    this.taskEngine.transition(task.id, 'completed');
    this.agentManager.setStatus(agent.id, 'idle');
    this.notifications.showTaskComplete(task.title);
  }

  private async executePmPlanRevision(
    agent: Agent,
    command: string,
    fullCommand: string
  ): Promise<OrchestratorResult> {
    const pending = this.chat.getPending();
    if (pending?.kind === 'pm-project') {
      this.chat.resolveConfirmationByPendingId(pending.pendingId, 'rejected');
      this.chat.clearPending();
    }
    const revisionCommand = `계획 수정 요청: ${command}`;
    return this.executeDirectCommandFlat(agent, revisionCommand, fullCommand, false);
  }

  /** PM 계획 제시 후 사장님 승인(진행하세요 버튼) 또는 수정 요청 대기 */
  private maybeOfferPmProjectApproval(agent: Agent, planText: string): void {
    if (!isPmAgent(agent) || this.isTelegramCommand()) return;
    if (!looksLikePmPlan(planText)) return;
    if (this.chat.getPending()) return;

    const brief = extractProjectBriefFromChat(this.chat.getMessages(agent.id), '');
    if (!brief.trim()) return;

    const pendingId = generateId();
    this.chat.setPending({
      pendingId,
      command: brief,
      agentId: agent.id,
      agentName: agent.name,
      kind: 'pm-project',
      planBrief: brief,
    });

    this.chat.push({
      threadId: agent.id,
      senderId: agent.id,
      senderName: formatAgentLabel(agent),
      senderRole: agent.title?.trim() || agent.role,
      content: buildPmApprovalConfirmationText(),
      type: 'confirmation',
      status: 'pending',
      confirmation: {
        pendingId,
        command: brief,
        agentId: agent.id,
        agentName: agent.name,
        kind: 'pm-project',
      },
    });
    CeoChatPanel.refreshThread(agent.id);
  }

  private async runProductionTask(agent: Agent, task: Task): Promise<void> {
    const query = task.title.replace(/^\[[^\]]+\]\s*/, '').trim() || task.description;

    try {
      this.agentWorking(
        agent,
        '영상 제작 파이프라인을 시작합니다…',
        undefined,
        this.buildWorkingDetail(agent, '영상 제작', '시작', '브리프 → 대본 → 스토리보드 순으로 진행합니다.', [
          `요청: ${query.slice(0, 200)}`,
        ])
      );

      const result = await this.productionAgent.execute(query, agent, task.id, (step) => {
        const prefix = step.status === 'running' ? '⏳' : step.status === 'done' ? '✓' : '•';
        this.agentWorking(
          agent,
          `${prefix} ${step.step}: ${step.message}`,
          undefined,
          this.buildWorkingDetail(agent, '영상 제작', step.step, step.message, [
            `상태: ${step.status}`,
            `로직: LLM으로 ${step.step} 산출물 생성 → agent 폴더 outputs/plans/ 에 저장`,
            `요청: ${query.slice(0, 200)}`,
          ])
        );
      });

      this.taskEngine.setResult(task.id, result.summary);
      this.memory.logActivity(agent.id, task.id, `${agent.name} production complete`);
      this.taskEngine.transition(task.id, 'review');
      this.agentManager.setStatus(agent.id, 'idle');
      this.notifications.showTaskComplete(task.title);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.memory.logActivity(agent.id, task.id, `Production error: ${message}`);
      this.taskEngine.transition(task.id, 'failed');
      this.agentManager.setStatus(agent.id, 'failed');
      this.notifications.showError(`${agent.name} production failed: ${message}`);
      this.agentSay(agent, `제작 오류: ${message}`, 'agent', 'failed');
    }
  }

  private async runResearchTask(agent: Agent, task: Task): Promise<void> {
    const query = task.title.replace(/^\[[^\]]+\]\s*/, '').trim() || task.description;

    try {
      this.agentWorking(
        agent,
        'Research 파이프라인을 시작합니다…',
        undefined,
        this.buildWorkingDetail(agent, '리서치', '시작', '검색 → 크롤링 → 요약 → 보고서 생성 순으로 진행합니다.', [
          `요청: ${query.slice(0, 200)}`,
        ])
      );

      const engine = await this.crawl4aiDocker.resolveEngine();
      this.agentWorking(
        agent,
        engine.message,
        undefined,
        this.buildWorkingDetail(agent, '리서치', '크롤 엔진', engine.message, [
          `모드: ${engine.mode === 'crawl4ai' ? 'Crawl4AI Docker' : 'DuckDuckGo + Jina/Fetch'}`,
        ])
      );

      const report = await this.researchAgent.execute(
        query,
        agent,
        task.id,
        (step) => {
        const prefix = step.status === 'running' ? '⏳' : step.status === 'done' ? '✓' : '•';
        this.agentWorking(
          agent,
          `${prefix} ${step.step}: ${step.message}`,
          undefined,
          this.buildWorkingDetail(agent, '리서치', step.step, step.message, [
            `상태: ${step.status}`,
            `로직: ${engine.mode === 'crawl4ai' ? 'Crawl4AI + LLM' : 'DuckDuckGo + Jina/Fetch + LLM'} 파이프라인`,
            `요청: ${query.slice(0, 200)}`,
          ])
        );
      },
        {
          preferFallback: engine.mode === 'fallback',
          crawlEngineMessage: engine.message,
        }
      );

      if (report.downloadedFiles && report.downloadedFiles.length > 0) {
        for (const f of report.downloadedFiles) {
          this.notifications.showInfo(`${agent.name} downloaded → ${f.path}`);
        }
      }

      const chatReply = formatResearchChatReply(report.summary, {
        reportPath: report.reportPath,
        sources: report.sources.map((s) => ({ title: s.title, url: s.url })),
        downloadedFiles: report.downloadedFiles?.map((f) => ({
          path: f.path,
          filename: f.filename,
        })),
        knownSourceNote: report.knownSourceNote,
      });

      if (report.reportPath) {
        const abs = this.agentFolders.resolveDeliverablePath(report.reportPath);
        if (abs) {
          void this.notifications.deliverMarkdownFile(abs, `📄 리서치 보고서\n${query.slice(0, 120)}`);
        }
      }

      this.taskEngine.setResult(task.id, chatReply);
      this.memory.logActivity(agent.id, task.id, `${agent.name} research complete: ${report.sources.length} sources`);
      this.taskEngine.transition(task.id, 'review');
      this.agentManager.setStatus(agent.id, 'idle');
      this.notifications.showTaskComplete(task.title);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.memory.logActivity(agent.id, task.id, `Research error: ${message}`);
      this.taskEngine.transition(task.id, 'failed');
      this.agentManager.setStatus(agent.id, 'failed');
      this.notifications.showError(`${agent.name} research failed: ${message}`);
      this.agentSay(agent, `Research 오류: ${message}`, 'agent', 'failed');
    }
  }

  private buildChatContext(agentId: string): string {
    return formatChatContextString(this.chat.getMessages(agentId));
  }

  /** "파리는?" 같은 후속 질문 → 날씨 API용 명령으로 보강 */
  private resolveApiCommand(agentId: string, command: string): string {
    if (/날씨|weather|기온|온도|확인|조회|알려/.test(command)) return command;

    const recent = this.chat.getMessages(agentId).slice(-6);
    const hadWeather = recent.some((m) => /날씨|weather|기온|온도/.test(m.content));
    if (!hadWeather) return command;

    const cityFollowUp = command.trim().match(/^([가-힣a-zA-Z][가-힣a-zA-Z\s]{0,14}?)(?:은|는|의|은요|는요)?\??$/);
    if (cityFollowUp) {
      const city = cityFollowUp[1].trim();
      if (city.length >= 2 && !/^(그럼|그리고|근데|네|아|음|응)$/i.test(city)) {
        return `${city} 날씨 확인`;
      }
    }

    return command;
  }

  private buildWorkingDetail(
    agent: Agent,
    pipeline: string,
    step: string,
    message: string,
    extraLog: string[] = []
  ): ChatWorkingDetail {
    return {
      pipeline,
      step,
      summary: `${step} 단계를 진행 중이에요.`,
      log: [
        `에이전트: ${formatAgentLabel(agent)}`,
        `역할: ${agent.title?.trim() || agent.role}`,
        `파이프라인: ${pipeline}`,
        `현재 단계: ${step}`,
        `진행 내용: ${message}`,
        ...extraLog,
      ],
    };
  }

  private agentWorking(
    agent: Agent,
    content: string,
    tone?: 'failed',
    detail?: ChatWorkingDetail
  ): void {
    if (tone === 'failed') {
      this.agentClearWorking(agent);
      return;
    }
    const streamAppend = content.trim() ? [content] : [];

    const state = {
      threadId: agent.id,
      senderId: agent.id,
      senderName: formatAgentLabel(agent),
      senderRole: agent.title?.trim() || agent.role,
      content,
      detail,
      streamAppend,
    };
    this.chat.updateWorking(state);
    if (this.collabMirrorThreadId && agent.id !== this.collabMirrorThreadId) {
      let mirrorContent = content;
      if (this.collabSourceAgentId) {
        const source = this.agentManager.get(this.collabSourceAgentId);
        if (source) {
          mirrorContent = buildDelegateWorkingMessage(agent, source, content);
        }
      }
      this.chat.updateWorking({
        ...state,
        threadId: this.collabMirrorThreadId,
        content: mirrorContent,
        streamAppend: mirrorContent.trim() ? [mirrorContent] : [],
      });
      CeoChatPanel.refreshThread(this.collabMirrorThreadId);
    }
    CeoChatPanel.refreshThread(agent.id);
  }

  private agentClearWorking(agent: Agent): void {
    this.chat.clearWorking(agent.id);
    if (this.collabMirrorThreadId) {
      this.chat.clearWorking(this.collabMirrorThreadId);
      CeoChatPanel.refreshThread(this.collabMirrorThreadId);
    }
    CeoChatPanel.refreshThread(agent.id);
  }

  private agentSay(
    agent: Agent | null,
    content: string,
    type: 'agent' | 'system' = 'agent',
    status?: 'pending' | 'working' | 'done' | 'failed',
    emotionContext?: { ceoMessage?: string },
    skipDelegationOffer?: boolean
  ): void {
    let text = content.trim();

    if (type === 'agent' && agent && isImplementationPlanReply(text)) {
      const recentCeo = this.chat
        .getMessages(agent.id)
        .filter((m) => m.type === 'ceo')
        .slice(-1)[0]?.content;
      if (recentCeo) {
        const fileReq = detectCrossAgentFileRequest(
          recentCeo,
          agent,
          (mention) => this.agentManager.findByMention(mention),
          this.agentManager.getAll()
        );
        if (fileReq && !this.chat.getPending()) {
          void (async () => {
            const interpretation = await this.interpretCeoCommandWithPersona(agent, recentCeo);
            if (interpretation.acknowledgment.trim()) {
              this.agentSay(
                agent,
                interpretation.acknowledgment,
                'agent',
                'pending',
                { ceoMessage: recentCeo },
                true
              );
              this.agentManager.setStatus(agent.id, 'progress');
              CeoChatPanel.refreshThread(agent.id);
            }
            await this.offerCrossAgentFileTransfer(agent, fileReq, recentCeo, interpretation);
          })();
          return;
        }
      }
      return;
    }

    if (type === 'agent') {
      text = formatChatReply(text) || text;
    }

    if (type === 'agent' && !text) return;

    const secretary = this.getSecretary();
    const threadId = agent?.id ?? secretary?.id ?? 'secretary';
    const emotion =
      type === 'agent'
        ? detectChatEmotion(text, status, this.buildEmotionContext(threadId, emotionContext?.ceoMessage))
        : undefined;

    const tokenUsage =
      type === 'agent' && agent?.id ? this.providers.takeTokenUsage(agent.id) : undefined;

    const message: Omit<CeoChatMessage, 'id' | 'timestamp'> = {
      threadId,
      senderId: agent?.id ?? null,
      senderName: agent ? formatAgentLabel(agent) : formatAgentLabel({ name: SECRETARY_AGENT.name, title: SECRETARY_AGENT.title }),
      senderRole: agent?.title?.trim() || agent?.role,
      content: text,
      type,
      status,
      emotion,
      ...(tokenUsage ? { tokenUsage } : {}),
    };

    this.chat.push(message);

    if (this.collabMirrorThreadId && threadId !== this.collabMirrorThreadId) {
      this.chat.push({ ...message, threadId: this.collabMirrorThreadId });
      CeoChatPanel.refreshThread(this.collabMirrorThreadId);
    }

    if (agent) {
      CeoChatPanel.refreshThread(agent.id);
      if (status === 'done' && type === 'agent' && !skipDelegationOffer && !this.isTelegramCommand()) {
        void this.maybeOfferAgentDelegation(agent, text, threadId);
      }
    }
  }

  private async offerCrossAgentFileTransfer(
    requester: Agent,
    fileReq: CrossAgentFileRequest,
    command: string,
    interpretation?: CeoCommandInterpretation
  ): Promise<OrchestratorResult> {
    if (this.chat.getPending()) {
      return {
        taskId: '',
        success: false,
        message: '이미 승인 대기 중인 요청이 있어요.',
      };
    }

    const { fileOwner } = fileReq;
    const collabThreadId = buildCollabThreadId(requester.id, fileOwner.id);
    const fileHint = interpretation?.understoodTask?.trim() || fileReq.fileHint;

    this.agentWorking(
      requester,
      '파일 검색 중…',
      undefined,
      this.buildWorkingDetail(requester, '파일 요청', 'DB 검색', command)
    );

    try {
      return await this.offerFileMatchConfirmation(
        requester,
        fileOwner,
        fileHint,
        command,
        collabThreadId,
        0,
        []
      );
    } finally {
      this.agentClearWorking(requester);
    }
  }

  private async tryHandleFolderCommand(
    agent: Agent,
    rawCommand: string,
    effective: string
  ): Promise<OrchestratorResult | null> {
    const allAgents = this.agentManager.getAll();
    const threadMessages = this.chat.getMessages(agent.id);

    if (detectFolderOpenRequest(rawCommand)) {
      return this.executeFolderOpen(agent, rawCommand, threadMessages);
    }

    const scope = resolveFolderPathScope(effective, agent, allAgents);
    if (scope) {
      if (scope === 'named') {
        const target = detectFolderPathTargetAgent(effective, agent, allAgents);
        if (target) return this.replyNamedFolderPath(agent, rawCommand, target);
      }
      return this.replyFolderPathInquiry(agent, rawCommand, scope as 'owner' | 'agent' | 'both');
    }

    if (isDeveloperAgent(agent)) {
      const platformKind = detectPlatformInquiry(effective);
      if (platformKind) {
        return this.replyPlatformInquiry(agent, rawCommand, platformKind);
      }
    }

    return null;
  }

  /** 착수 ack 등으로 남은 progress/working 배지 정리 */
  private clearAgentChatProgress(agent: Agent): void {
    this.agentClearWorking(agent);
    const current = this.agentManager.get(agent.id);
    if (current && (current.status === 'progress' || current.status === 'working')) {
      this.agentManager.setStatus(agent.id, 'idle');
    }
    CeoChatPanel.refreshThread(agent.id);
  }

  private async executeFolderOpen(
    agent: Agent,
    command: string,
    threadMessages: CeoChatMessage[]
  ): Promise<OrchestratorResult> {
    this.chat.requestOpenPanel(agent.id, agent.name);
    const target = inferFolderOpenTarget(
      command,
      agent,
      this.agentManager.getAll(),
      threadMessages
    );

    try {
      if (target === 'owner') {
        await this.agentFolders.openOwnerFolder();
      } else {
        await this.agentFolders.openAgentFolder(target);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.agentSay(agent, `폴더를 열지 못했어요.\n\n${message}`, 'agent', 'failed', { ceoMessage: command });
      return { taskId: '', success: false, message };
    }

    const slug =
      target === 'owner'
        ? this.agentFolders.getCompanyRelativePath('owner')
        : this.agentFolders.getRelativePath(this.agentFolders.resolveSlug(target));
    const reply =
      target === 'owner'
        ? `사장님, Owner 폴더(\`${slug}\`)를 탐색기에서 열었어요.`
        : `사장님, ${target.name} 작업 폴더(\`${slug}\`)를 탐색기에서 열었어요.`;

    this.agentSay(agent, reply, 'agent', 'done', { ceoMessage: command });
    this.clearAgentChatProgress(agent);
    this.memory.logActivity(agent.id, null, `폴더 열기 (${target === 'owner' ? 'owner' : target.name})`);
    return { taskId: '', success: true, message: 'Folder opened' };
  }

  private replyNamedFolderPath(
    agent: Agent,
    command: string,
    target: Agent
  ): OrchestratorResult {
    this.chat.requestOpenPanel(agent.id, agent.name);
    const reply = this.agentFolders.buildNamedAgentFolderPathReply(target);
    this.agentSay(agent, reply, 'agent', 'done', { ceoMessage: command });
    this.clearAgentChatProgress(agent);
    this.memory.logActivity(agent.id, null, `폴더 경로 안내 (named: ${target.name})`);
    return { taskId: '', success: true, message: 'Named folder path inquiry answered' };
  }

  private replyFolderPathInquiry(
    agent: Agent,
    command: string,
    scope: 'owner' | 'agent' | 'both'
  ): OrchestratorResult {
    this.chat.requestOpenPanel(agent.id, agent.name);
    const reply = this.agentFolders.buildFolderPathReply(agent, scope);
    this.agentSay(agent, reply, 'agent', 'done', { ceoMessage: command });
    this.clearAgentChatProgress(agent);
    this.memory.logActivity(agent.id, null, `폴더 경로 안내 (${scope})`);
    return { taskId: '', success: true, message: 'Folder path inquiry answered' };
  }

  private replyPlatformInquiry(
    agent: Agent,
    command: string,
    kind: PlatformInquiryKind
  ): OrchestratorResult {
    this.chat.requestOpenPanel(agent.id, agent.name);
    const reply = buildPlatformInquiryReply(this.agentFolders, agent, kind);
    this.agentSay(agent, reply, 'agent', 'done', { ceoMessage: command });
    this.clearAgentChatProgress(agent);
    this.memory.logActivity(agent.id, null, `플랫폼 구조 안내 (${kind})`);
    return { taskId: '', success: true, message: 'Platform inquiry answered' };
  }

  private async offerOwnFolderFileMatch(
    agent: Agent,
    ownReq: OwnFolderFileRequest,
    command: string
  ): Promise<OrchestratorResult> {
    if (this.chat.getPending()) {
      return {
        taskId: '',
        success: false,
        message: '이미 승인 대기 중인 요청이 있어요.',
      };
    }

    if (agent.status === 'failed') {
      this.agentManager.setStatus(agent.id, 'idle');
    }

    this.agentWorking(
      agent,
      '제 폴더에서 파일 검색 중…',
      undefined,
      this.buildWorkingDetail(agent, '파일 전달', 'DB 검색', command)
    );

    try {
      return await this.offerFileMatchConfirmation(
        agent,
        agent,
        ownReq.fileHint,
        command,
        agent.id,
        0,
        [],
        undefined,
        { deliveryTarget: 'owner' }
      );
    } finally {
      this.agentClearWorking(agent);
    }
  }

  private async offerFileMatchConfirmation(
    requester: Agent,
    fileOwner: Agent,
    fileHint: string,
    command: string,
    collabThreadId: string,
    searchAttempt: number,
    rejectedRelativePaths: string[],
    existingPendingId?: string,
    options?: { deliveryTarget?: 'owner' | 'agent' }
  ): Promise<OrchestratorResult> {
    if (this.chat.getPending()) {
      return {
        taskId: '',
        success: false,
        message: '이미 승인 대기 중인 요청이 있어요.',
      };
    }

    const workspaceRoot = this.workspace.getWorkspaceRoot() ?? undefined;
    const mode = searchModeForAttempt(searchAttempt);
    const { files } = await searchFilesInAgentDb(
      this.agentFolders,
      fileOwner,
      fileHint,
      workspaceRoot,
      { mode, excludeRelativePaths: rejectedRelativePaths }
    );

    if (files.length === 0 && searchAttempt < 3) {
      return this.offerFileMatchConfirmation(
        requester,
        fileOwner,
        fileHint,
        command,
        collabThreadId,
        searchAttempt + 1,
        rejectedRelativePaths,
        undefined,
        options
      );
    }

    const deliveryTarget = options?.deliveryTarget ?? 'agent';

    if (files.length === 0) {
      const failMsg =
        deliveryTarget === 'owner'
          ? buildOwnFolderFileMatchAsk(requester, '', searchAttempt)
          : buildFileMatchConfirmationAsk(fileOwner, '', searchAttempt);
      this.agentSay(requester, failMsg, 'agent', 'failed', undefined, true);
      return {
        taskId: '',
        success: false,
        message: 'No matching files found',
      };
    }

    const candidates = files.slice(0, 15);
    const pendingId = existingPendingId ?? generateId();
    const fileList = formatFoundFilePaths(candidates);
    const askContent =
      deliveryTarget === 'owner'
        ? buildOwnFolderFileMatchAsk(requester, fileList, searchAttempt)
        : buildFileMatchConfirmationAsk(fileOwner, fileList, searchAttempt);

    this.chat.setPending({
      pendingId,
      command,
      agentId: fileOwner.id,
      agentName: fileOwner.name,
      kind: 'file-match',
      sourceAgentId: requester.id,
      sourceAgentName: requester.name,
      collabThreadId,
      fileTransfer: true,
      fileHint,
      fileMatchPending: true,
      candidateFiles: candidates,
      searchAttempt,
      rejectedRelativePaths,
      deliveryTarget,
    });

    this.chat.push({
      threadId: requester.id,
      senderId: requester.id,
      senderName: formatAgentLabel(requester),
      senderRole: requester.title?.trim() || requester.role,
      content: askContent,
      type: 'confirmation',
      status: 'pending',
      emotion: '기본',
      confirmation: {
        pendingId,
        command,
        agentId: fileOwner.id,
        agentName: fileOwner.name,
        kind: 'file-match',
        sourceAgentId: requester.id,
        sourceAgentName: requester.name,
      },
    });
    CeoChatPanel.refreshThread(requester.id);

    if (this.isTelegramCommand()) {
      return this.executeConfirmedDelegate(pendingId);
    }

    return {
      taskId: '',
      success: true,
      message: 'Awaiting CEO file match confirmation',
    };
  }

  private async rejectFileMatchAndReSearch(pending: {
    agentId: string;
    agentName: string;
    command: string;
    sourceAgentId?: string;
    sourceAgentName?: string;
    collabThreadId?: string;
    fileHint?: string;
    candidateFiles?: Array<{ fileName: string; fromRelative: string; fromAbsolute: string }>;
    searchAttempt?: number;
    rejectedRelativePaths?: string[];
    deliveryTarget?: 'owner' | 'agent';
  }): Promise<void> {
    const requester = pending.sourceAgentId
      ? this.agentManager.get(pending.sourceAgentId)
      : null;
    const fileOwner = this.agentManager.get(pending.agentId);
    if (!requester || !fileOwner) return;

    const rejected = [
      ...(pending.rejectedRelativePaths ?? []),
      ...(pending.candidateFiles ?? []).map((f) => f.fromRelative),
    ];
    const nextAttempt = (pending.searchAttempt ?? 0) + 1;

    this.agentSay(
      requester,
      '알겠어요, 다른 파일을 다시 찾아볼게요.',
      'agent',
      'working',
      undefined,
      true
    );

    if (nextAttempt > 3) {
      this.agentSay(
        requester,
        '사장님, 다른 파일을 찾지 못했어요. 파일 이름이나 과목을 더 알려주시면 다시 찾아볼게요.',
        'agent',
        'failed',
        undefined,
        true
      );
      return;
    }

    const collabThreadId =
      pending.collabThreadId ??
      (pending.deliveryTarget === 'owner'
        ? requester.id
        : buildCollabThreadId(requester.id, fileOwner.id));

    await this.offerFileMatchConfirmation(
      requester,
      fileOwner,
      pending.fileHint ?? pending.command,
      pending.command,
      collabThreadId,
      nextAttempt,
      rejected,
      undefined,
      { deliveryTarget: pending.deliveryTarget ?? 'agent' }
    );
  }

  private async executeConfirmedFileMatch(pending: {
    agentId: string;
    agentName: string;
    command: string;
    sourceAgentId?: string;
    sourceAgentName?: string;
    collabThreadId?: string;
    fileHint?: string;
    candidateFiles?: Array<{ fileName: string; fromRelative: string; fromAbsolute: string }>;
    deliveryTarget?: 'owner' | 'agent';
  }): Promise<OrchestratorResult> {
    const requester = pending.sourceAgentId
      ? this.agentManager.get(pending.sourceAgentId)
      : null;
    const fileOwner = this.agentManager.get(pending.agentId);
    if (!requester || !fileOwner) {
      return { taskId: '', success: false, message: 'Agent not found' };
    }

    const candidates = pending.candidateFiles ?? [];

    if (pending.deliveryTarget === 'owner') {
      return this.executeOwnFolderFileDelivery(fileOwner, candidates, pending.command);
    }

    return this.executeCrossAgentFileTransfer(
      requester,
      fileOwner,
      pending.fileHint ?? pending.command,
      undefined,
      pending.command,
      candidates
    );
  }

  private finalizeFileDelivery(
    agent: Agent,
    succeeded: boolean,
    message: string,
    duplicateOnly = false
  ): void {
    this.agentClearWorking(agent);
    this.agentManager.setStatus(agent.id, succeeded ? 'idle' : 'failed');

    const report = message.trim();
    if (report) {
      this.chat.push({
        threadId: agent.id,
        senderId: agent.id,
        senderName: formatAgentLabel(agent),
        senderRole: agent.title?.trim() || agent.role,
        content: report,
        type: 'agent',
        status: succeeded ? 'done' : 'failed',
        emotion: succeeded ? '기본' : '슬픔',
      });
    }

    if (succeeded) {
      this.notifications.showInfo(
        duplicateOnly ? `${agent.name} — 이미 사장님 폴더에 있는 파일` : `${agent.name} — 파일 전달 완료`
      );
    } else {
      this.notifications.showError(`${agent.name} — 파일 전달 실패`);
    }
    CeoChatPanel.refreshThread(agent.id);
  }

  private async executeOwnFolderFileDelivery(
    agent: Agent,
    confirmedFiles: Array<{ fileName: string; fromRelative: string; fromAbsolute: string }>,
    ceoCommand: string
  ): Promise<OrchestratorResult> {
    this.agentManager.setStatus(agent.id, 'working');

    this.agentSay(
      agent,
      '사장님 확인해 주셔서 감사해요. 지금 파일을 전달할게요.',
      'agent',
      'done',
      undefined,
      true
    );
    CeoChatPanel.refreshThread(agent.id);

    this.agentWorking(agent, '사장님 폴더로 파일 전달 중…');

    const workspaceRoot = this.workspace.getWorkspaceRoot() ?? undefined;
    const transfer = await copySelectedFilesToOwner(
      this.agentFolders,
      agent,
      confirmedFiles,
      workspaceRoot
    );

    const pathReport = formatTransferredPaths(transfer.copied);
    const hasDuplicates = (transfer.skippedDuplicates?.length ?? 0) > 0;
    const succeeded = transfer.copied.length > 0 || hasDuplicates;
    const completionMessage = succeeded
      ? buildOwnerFolderDeliveryMessage(transfer)
      : `사장님, 죄송해요. 파일 전달에 실패했어요.\n\n${transfer.message}`;

    this.finalizeFileDelivery(agent, succeeded, completionMessage, hasDuplicates && transfer.copied.length === 0);

    if (transfer.copied.length > 0) {
      this.memory.appendAgentMemory(
        agent.id,
        `[파일전달→사장님] ${ceoCommand.slice(0, 80)}\n${pathReport}`
      );
    } else if (hasDuplicates) {
      this.memory.appendAgentMemory(
        agent.id,
        `[파일전달→사장님·중복스킵] ${ceoCommand.slice(0, 80)}`
      );
    }

    return {
      taskId: '',
      success: succeeded,
      message: transfer.message,
    };
  }

  private async executeCrossAgentFileTransfer(
    requester: Agent,
    fileOwner: Agent,
    fileHint: string,
    collabRequest: string | undefined,
    ceoCommand: string,
    confirmedFiles?: Array<{ fileName: string; fromRelative: string; fromAbsolute: string }>
  ): Promise<OrchestratorResult> {
    const collabThreadId = buildCollabThreadId(requester.id, fileOwner.id);

    this.agentSay(
      requester,
      '사장님 확인해 주셔서 감사해요. 파일을 전달할게요.',
      'agent',
      'done',
      undefined,
      true
    );

    let requestMessage = collabRequest?.trim();
    if (!requestMessage) {
      const dialogue = await generateFileTransferDialogue(
        this.providers,
        requester,
        fileOwner,
        ceoCommand,
        fileHint,
        ceoCommand
      );
      requestMessage = dialogue.collabRequest;
    }

    this.chat.push({
      threadId: collabThreadId,
      senderId: requester.id,
      senderName: formatAgentLabel(requester),
      senderRole: requester.title?.trim() || requester.role,
      content: requestMessage,
      type: 'agent',
      status: 'done',
    });

    this.chat.push({
      threadId: collabThreadId,
      senderId: fileOwner.id,
      senderName: formatAgentLabel(fileOwner),
      senderRole: fileOwner.title?.trim() || fileOwner.role,
      content: buildDelegateAckMessage(fileOwner, requester),
      type: 'agent',
      status: 'working',
    });

    this.chat.requestOpenCollabPanel(collabThreadId, requester.id, fileOwner.id);
    CeoChatPanel.refreshThread(collabThreadId);

    const workspaceRoot = this.workspace.getWorkspaceRoot() ?? undefined;
    const transfer = confirmedFiles
      ? await copySelectedFiles(
          this.agentFolders,
          fileOwner,
          requester,
          confirmedFiles,
          workspaceRoot
        )
      : await copySelectedFiles(
          this.agentFolders,
          fileOwner,
          requester,
          (
            await searchFilesInAgentDb(
              this.agentFolders,
              fileOwner,
              fileHint,
              workspaceRoot
            )
          ).files,
          workspaceRoot
        );

    const pathReport = formatTransferredPaths(transfer.copied);
    const succeeded = transfer.copied.length > 0;

    this.chat.push({
      threadId: collabThreadId,
      senderId: fileOwner.id,
      senderName: formatAgentLabel(fileOwner),
      senderRole: fileOwner.title?.trim() || fileOwner.role,
      content: succeeded
        ? buildFileTransferCompleteMessage(fileOwner, requester, transfer.message)
        : buildFileTransferFailedMessage(fileOwner, requester, transfer.message),
      type: 'agent',
      status: succeeded ? 'done' : 'failed',
    });

    if (succeeded) {
      const receivedContent = `${buildFileTransferReceivedMessage(requester, fileOwner)}\n\n${transfer.message}`;

      this.chat.push({
        threadId: collabThreadId,
        senderId: requester.id,
        senderName: formatAgentLabel(requester),
        senderRole: requester.title?.trim() || requester.role,
        content: receivedContent,
        type: 'agent',
        status: 'done',
      });

      this.finalizeFileDelivery(
        requester,
        true,
        `사장님, 파일 전달 완료했어요!\n\n${transfer.message}`
      );
      this.memory.appendAgentMemory(
        requester.id,
        `[파일교환] ${fileOwner.name} → ${requester.name}\n${pathReport}`
      );
    } else {
      this.finalizeFileDelivery(
        requester,
        false,
        `사장님, 죄송해요. 파일 복사에 실패했어요.\n\n${transfer.message}`
      );
    }

    CeoChatPanel.refreshThread(collabThreadId);

    return {
      taskId: '',
      success: transfer.copied.length > 0,
      message: transfer.message,
    };
  }

  private async maybeOfferAgentDelegation(source: Agent, content: string, threadId: string): Promise<void> {
    try {
      if (this.chat.getPending()) return;

      const recentCeo = this.chat
        .getMessages(threadId)
        .filter((m) => m.type === 'ceo')
        .slice(-1)[0]?.content;

      const suggestion = detectDelegationSuggestion(
        content,
        (mention) => this.agentManager.findByMention(mention),
        source.id,
        recentCeo
      );
      if (!suggestion) return;

      const { target, command } = suggestion;
      const collabThreadId = buildCollabThreadId(source.id, target.id);
      const pendingId = generateId();

      this.chat.setPending({
        pendingId,
        command,
        agentId: target.id,
        agentName: target.name,
        kind: 'agent-collab',
        sourceAgentId: source.id,
        sourceAgentName: source.name,
        collabThreadId,
      });

      const askContent = buildDelegatePermissionAsk(source, target, command, '사장님');

      this.chat.push({
        threadId: source.id,
        senderId: source.id,
        senderName: formatAgentLabel(source),
        senderRole: source.title?.trim() || source.role,
        content: askContent,
        type: 'confirmation',
        status: 'pending',
        emotion: '기본',
        confirmation: {
          pendingId,
          command,
          agentId: target.id,
          agentName: target.name,
          kind: 'agent-collab',
          sourceAgentId: source.id,
          sourceAgentName: source.name,
        },
      });
      CeoChatPanel.refreshThread(source.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[AgentCompany] maybeOfferAgentDelegation failed:', message);
    }
  }

  private buildEmotionContext(threadId: string, latestCeoMessage?: string): {
    ceoMessage?: string;
    recentCeoMessages?: string[];
  } {
    const recentCeo = this.chat
      .getMessages(threadId)
      .filter((m) => m.type === 'ceo')
      .slice(-4)
      .map((m) => m.content);

    const ceoMessage = latestCeoMessage ?? recentCeo[recentCeo.length - 1];
    const recentCeoMessages =
      latestCeoMessage && recentCeo[recentCeo.length - 1] !== latestCeoMessage
        ? [...recentCeo.slice(-3), latestCeoMessage]
        : recentCeo;

    return { ceoMessage, recentCeoMessages };
  }

  private async gatherProjectContext(taskTitle: string): Promise<string> {
    const keywords = taskTitle
      .replace(/\[.*?\]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 3);

    const lines: string[] = [];
    for (const keyword of keywords) {
      const hits = await this.workspace.searchProject(keyword, 5);
      for (const hit of hits) {
        lines.push(`${hit.file}:${hit.line} — ${hit.text}`);
      }
    }

    if (lines.length === 0) {
      const root = this.workspace.getWorkspaceRoot();
      const pkg = root ? await this.workspace.readFile('package.json') : null;
      if (pkg) lines.push('package.json found in workspace');
    }

    return lines.slice(0, 15).join('\n') || 'No relevant files found';
  }
}
