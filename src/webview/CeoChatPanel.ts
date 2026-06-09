import * as vscode from 'vscode';
import { CHAT_EMOTIONS } from '../chat';
import { formatProjectDisplayTitle } from '../team/project-title';
import { formatAgentLabel } from '../utils/agent-display';
import { AgentCompanyService } from '../services';
import { handleVoiceWebviewMessage } from './voice-message-handlers';
import { pushVoiceShortcutToWebview, registerVoiceWebview } from './voice-webview-registry';

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
  preserveFocus?: boolean;
  viewColumn?: vscode.ViewColumn;
}

export interface CollabParticipant {
  agentId: string;
  displayName: string;
  profilePhotoUrl?: string;
}

export class CeoChatPanel {
  private static panels = new Map<string, CeoChatPanel>();
  private removeChatListener?: () => void;
  private removeWorkingListener?: () => void;

  static registerPanelOpener(extensionUri: vscode.Uri, service: AgentCompanyService): void {
    service.chat.setPanelOpenRequest((threadId, agentName) => {
      const agent = service.agents.get(threadId);
      CeoChatPanel.createOrShow(extensionUri, service, {
        threadId,
        agentName,
        agentTitle: agent?.title,
        agentDisplayName: agent ? formatAgentLabel(agent) : agentName,
        agentRole: agent?.title?.trim() || agent?.role,
      });
    });

    service.chat.setCollabPanelOpenRequest((collabThreadId, sourceAgentId, targetAgentId) => {
      CeoChatPanel.openCollabChat(extensionUri, service, collabThreadId, sourceAgentId, targetAgentId);
    });

    service.chat.setTeamPanelOpenRequest((threadId, participantIds, title, leadAgentId) => {
      CeoChatPanel.openProjectChat(extensionUri, service, threadId, participantIds, title, leadAgentId);
    });
  }

  static openProjectChat(
    extensionUri: vscode.Uri,
    service: AgentCompanyService,
    threadId: string,
    participantIds: string[],
    title: string,
    leadAgentId?: string
  ): CeoChatPanel {
    const pmId = leadAgentId ?? participantIds[0];
    const lead = pmId ? service.agents.get(pmId) : null;
    const displayTitle = formatProjectDisplayTitle(title);
    const collabParticipants: CollabParticipant[] = participantIds
      .map((id) => {
        const agent = service.agents.get(id);
        if (!agent) return null;
        return { agentId: id, displayName: formatAgentLabel(agent) };
      })
      .filter((p): p is CollabParticipant => p !== null);

    return CeoChatPanel.createOrShow(extensionUri, service, {
      threadId,
      agentName: lead?.name ?? 'Project',
      agentTitle: lead?.title,
      agentDisplayName: lead ? formatAgentLabel(lead) : 'Project',
      agentRole: lead?.title?.trim() || lead?.role,
      collabMode: true,
      projectMode: true,
      projectTitle: displayTitle,
      projectLeadAgentId: pmId,
      projectParticipantIds: participantIds,
      collabParticipants,
      panelTitle: displayTitle,
      preserveFocus: true,
      viewColumn: vscode.ViewColumn.Two,
    });
  }

  /** @deprecated use openProjectChat */
  static openTeamChat(
    extensionUri: vscode.Uri,
    service: AgentCompanyService,
    threadId: string,
    participantIds: string[],
    title: string,
    leadAgentId?: string
  ): CeoChatPanel {
    return CeoChatPanel.openProjectChat(
      extensionUri,
      service,
      threadId,
      participantIds,
      title,
      leadAgentId
    );
  }

  static openCollabChat(
    extensionUri: vscode.Uri,
    service: AgentCompanyService,
    collabThreadId: string,
    sourceAgentId: string,
    targetAgentId: string
  ): CeoChatPanel {
    const source = service.agents.get(sourceAgentId);
    const target = service.agents.get(targetAgentId);
    const sourceLabel = source ? formatAgentLabel(source) : '에이전트 A';
    const targetLabel = target ? formatAgentLabel(target) : '에이전트 B';

    return CeoChatPanel.createOrShow(extensionUri, service, {
      threadId: collabThreadId,
      agentName: target?.name ?? '협업',
      agentTitle: target?.title,
      agentDisplayName: targetLabel,
      agentRole: target?.title?.trim() || target?.role,
      collabMode: true,
      collabPeerName: sourceLabel,
      collabPeerId: sourceAgentId,
      targetAgentId,
      panelTitle: `${sourceLabel} ↔ ${targetLabel}`,
    });
  }

  static createOrShow(
    extensionUri: vscode.Uri,
    service: AgentCompanyService,
    thread: AgentChatThreadConfig
  ): CeoChatPanel {
    const column = thread.viewColumn ?? vscode.ViewColumn.One;
    const preserveFocus = thread.preserveFocus ?? false;

    const existing = CeoChatPanel.panels.get(thread.threadId);
    if (existing) {
      existing.panel.reveal(column, preserveFocus);
      existing.syncToWebview();
      return existing;
    }

    const panelTitle = thread.panelTitle ?? thread.agentDisplayName ?? thread.agentName;
    const panel = vscode.window.createWebviewPanel(
      `agentCompany.agentChat.${thread.threadId}`,
      panelTitle,
      { viewColumn: column, preserveFocus },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          extensionUri,
          vscode.Uri.file(service.agentFolders.runtimeRoot),
          vscode.Uri.file(service.agentFolders.getCompanyDir()),
        ],
      }
    );

    const instance = new CeoChatPanel(panel, extensionUri, service, thread);
    CeoChatPanel.panels.set(thread.threadId, instance);
    return instance;
  }

  static openForCommand(
    extensionUri: vscode.Uri,
    service: AgentCompanyService,
    command: string
  ): CeoChatPanel {
    const thread = service.resolveCommandThread(command);
    return CeoChatPanel.createOrShow(extensionUri, service, thread);
  }

  static openSecretaryChat(extensionUri: vscode.Uri, service: AgentCompanyService): CeoChatPanel {
    const secretary = service.orchestrator.getSecretary();
    if (secretary) {
      return CeoChatPanel.createOrShow(extensionUri, service, {
        threadId: secretary.id,
        agentName: secretary.name,
        agentTitle: secretary.title,
        agentDisplayName: formatAgentLabel(secretary),
        agentRole: secretary.title?.trim() || secretary.role,
      });
    }

    const fallback = service.agents.getAll()[0];
    return CeoChatPanel.createOrShow(extensionUri, service, {
      threadId: fallback?.id ?? 'default',
      agentName: fallback?.name ?? 'CEO Command',
      agentTitle: fallback?.title,
      agentDisplayName: fallback ? formatAgentLabel(fallback) : 'CEO Command',
      agentRole: fallback?.title?.trim() || fallback?.role,
    });
  }

  static refreshAllProfilePhotos(): void {
    for (const panel of CeoChatPanel.panels.values()) {
      void panel.syncToWebview();
    }
  }

  static refreshThread(threadId: string): void {
    const panel = CeoChatPanel.panels.get(threadId);
    if (panel) {
      void panel.syncToWebview();
    }
  }

  private constructor(
    public readonly panel: vscode.WebviewPanel,
    private readonly extensionUri: vscode.Uri,
    private readonly service: AgentCompanyService,
    private readonly thread: AgentChatThreadConfig
  ) {
    panel.webview.html = this.getHtml(panel.webview);
    const unregisterVoiceWebview = registerVoiceWebview(panel.webview);

    this.removeChatListener = service.chat.addListener((msg) => {
      if (msg.threadId !== thread.threadId) return;
      panel.webview.postMessage({ type: 'chatMessage', payload: msg });
    });

    this.removeWorkingListener = service.chat.addWorkingListener((state, threadId) => {
      if (threadId !== thread.threadId) return;
      panel.webview.postMessage({ type: 'chatWorking', payload: state });
    });

    panel.webview.onDidReceiveMessage(async (message) => {
      await this.handleMessage(message);
    });

    panel.onDidDispose(() => {
      unregisterVoiceWebview();
      this.removeChatListener?.();
      this.removeWorkingListener?.();
      CeoChatPanel.panels.delete(thread.threadId);
    });

    this.syncToWebview();
  }

  async syncToWebview(): Promise<void> {
    const threadConfig = await this.buildThreadConfig();

    this.panel.webview.postMessage({
      type: 'chatHistory',
      payload: this.service.chat.getMessages(this.thread.threadId),
    });
    this.panel.webview.postMessage({
      type: 'chatWorking',
      payload: this.service.chat.getWorking(this.thread.threadId),
    });
    this.panel.webview.postMessage({
      type: 'threadConfig',
      payload: threadConfig,
    });
    pushVoiceShortcutToWebview(this.panel.webview, this.service.getVoiceShortcut());
    this.panel.webview.postMessage({
      type: 'dashboardData',
      payload: { agents: this.service.agents.getAll() },
    });
  }

  private async buildOwnerUrls(version: number): Promise<{
    ownerName: string;
    ownerEmotionPhotos?: Record<string, string>;
    ownerProfilePhotoUrl?: string;
  }> {
    const ownerName = await this.service.getOwnerDisplayName();
    const ownerEmotionPhotos: Record<string, string> = {};

    for (const emotion of CHAT_EMOTIONS) {
      const emotionPath = await this.service.agentFolders.resolveOwnerEmotionPhotoPath(emotion);
      if (!emotionPath) continue;
      const uri = this.panel.webview.asWebviewUri(vscode.Uri.file(emotionPath));
      ownerEmotionPhotos[emotion] = `${uri.toString()}?v=${version}`;
    }

    const profilePath = await this.service.agentFolders.resolveOwnerProfilePhotoPath();
    let ownerProfilePhotoUrl: string | undefined;
    if (profilePath) {
      const photoUri = this.panel.webview.asWebviewUri(vscode.Uri.file(profilePath));
      ownerProfilePhotoUrl = `${photoUri.toString()}?v=${version}`;
    }

    return {
      ownerName,
      ownerEmotionPhotos:
        Object.keys(ownerEmotionPhotos).length > 0 ? ownerEmotionPhotos : undefined,
      ownerProfilePhotoUrl,
    };
  }

  private async buildCollabParticipants(version: number): Promise<CollabParticipant[]> {
    const ids = (
      this.thread.projectParticipantIds?.length
        ? this.thread.projectParticipantIds
        : [this.thread.collabPeerId, this.thread.targetAgentId]
    ).filter((id): id is string => !!id);
    const participants: CollabParticipant[] = [];

    for (const id of ids) {
      const agent = this.service.agents.get(id);
      if (!agent) continue;
      const slug = this.service.agentFolders.resolveSlug(agent);
      const photoPath = await this.service.agentFolders.resolveProfilePhotoPath(slug);
      let profilePhotoUrl: string | undefined;
      if (photoPath) {
        const uri = this.panel.webview.asWebviewUri(vscode.Uri.file(photoPath));
        profilePhotoUrl = `${uri.toString()}?v=${version}`;
      }
      participants.push({
        agentId: id,
        displayName: formatAgentLabel(agent),
        profilePhotoUrl,
      });
    }

    return participants;
  }

  private async buildThreadConfig(): Promise<AgentChatThreadConfig> {
    const version = Date.now();
    const owner = await this.buildOwnerUrls(version);
    const agentLookupId = this.thread.projectMode
      ? this.thread.projectLeadAgentId ?? this.thread.targetAgentId
      : this.thread.collabMode
        ? this.thread.targetAgentId ?? this.thread.threadId
        : this.thread.threadId;

    const collabParticipants = this.thread.collabMode
      ? await this.buildCollabParticipants(version)
      : undefined;

    const agent = agentLookupId ? this.service.agents.get(agentLookupId) : null;
    if (!agent) {
      return { ...this.thread, ...owner, collabParticipants };
    }

    const slug = this.service.agentFolders.resolveSlug(agent);
    const photoPath = await this.service.agentFolders.resolveProfilePhotoPath(slug);

    const base = {
      ...this.thread,
      ...owner,
      agentName: agent.name,
      agentTitle: agent.title,
      agentDisplayName: formatAgentLabel(agent),
      agentRole: agent.title?.trim() || agent.role,
      agentStatus: this.service.mapAgentForDisplay(agent).status,
      collabParticipants,
    };

    const session = this.service.teams.getSessionByThreadId(this.thread.threadId);
    if (session?.title) {
      base.projectTitle = session.title;
      base.panelTitle = session.title;
      this.panel.title = session.title;
    }

    const emotionPhotos: Record<string, string> = {};
    for (const emotion of CHAT_EMOTIONS) {
      const emotionPath = await this.service.agentFolders.resolveEmotionPhotoPath(slug, emotion);
      if (!emotionPath) continue;
      const uri = this.panel.webview.asWebviewUri(vscode.Uri.file(emotionPath));
      emotionPhotos[emotion] = `${uri.toString()}?v=${version}`;
    }

    if (!photoPath) {
      return { ...base, emotionPhotos: Object.keys(emotionPhotos).length > 0 ? emotionPhotos : undefined };
    }

    const photoUri = this.panel.webview.asWebviewUri(vscode.Uri.file(photoPath));
    return {
      ...base,
      profilePhotoUrl: `${photoUri.toString()}?v=${version}`,
      emotionPhotos: Object.keys(emotionPhotos).length > 0 ? emotionPhotos : undefined,
    };
  }

  private async handleMessage(message: { type: string; payload?: unknown }): Promise<void> {
    if (await handleVoiceWebviewMessage(message, this.panel.webview, this.service)) {
      return;
    }

    switch (message.type) {
      case 'ready':
        this.service.prewarmAgentChat(this.thread.threadId);
        this.syncToWebview();
        break;

      case 'executeCommand': {
        const { command, threadId } = message.payload as { command: string; threadId?: string };
        const routeThreadId =
          this.thread.collabMode && this.thread.targetAgentId
            ? this.thread.targetAgentId
            : threadId ?? this.thread.threadId;
        await this.service.executeCeoCommand(command, routeThreadId, {
          collabThreadId: this.thread.collabMode ? this.thread.threadId : undefined,
        });
        this.service.notifications.showInfo('명령 처리 중...');
        break;
      }

      case 'transcribeVoice': {
        const { requestId, audioBase64, mimeType } = message.payload as {
          requestId: string;
          audioBase64: string;
          mimeType?: string;
        };
        try {
          const text = await this.service.transcribeVoice(audioBase64, mimeType);
          this.panel.webview.postMessage({
            type: 'voiceTranscriptionResult',
            payload: { requestId, text },
          });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.panel.webview.postMessage({
            type: 'voiceTranscriptionResult',
            payload: { requestId, error: errMsg },
          });
        }
        break;
      }

      case 'confirmDelegate': {
        const { pendingId } = message.payload as { pendingId: string };
        await this.service.confirmDelegate(pendingId);
        await this.syncToWebview();
        break;
      }

      case 'rejectDelegate': {
        const { pendingId } = message.payload as { pendingId: string };
        this.service.rejectDelegate(pendingId);
        void this.syncToWebview();
        break;
      }

      case 'getChatHistory':
        this.syncToWebview();
        break;
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const assetsBase = vscode.Uri.joinPath(this.extensionUri, 'webview', 'dist', 'assets');
    const chatJs = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'chat.js'));
    const stylesJs = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'styles.js'));
    const stylesCss = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'styles.css'));
    const chatCss = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'chat.css'));
    const nonce = getNonce();
    const threadJson = JSON.stringify(this.thread).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; img-src ${webview.cspSource} data:; media-src blob: data: mediastream: ${webview.cspSource};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${stylesCss}" rel="stylesheet">
  <link href="${chatCss}" rel="stylesheet">
  <link rel="modulepreload" href="${stylesJs}">
  <title>${this.thread.agentDisplayName ?? this.thread.agentName}</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">window.__AGENT_CHAT__=${threadJson};</script>
  <script nonce="${nonce}" type="module" src="${chatJs}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
