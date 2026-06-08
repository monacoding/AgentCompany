import * as vscode from 'vscode';
import { AgentDescriptionRequiredError, AgentDuplicateNameError } from '../agents/errors';
import { formatAgentLabel } from '../utils/agent-display';
import { CHAT_EMOTIONS } from '../chat';
import { AgentCompanyService } from '../services';
import { AppSettings, CreateAgentInput, CreateTaskInput, TaskStatus, UpdateAgentInput, CreateExternalApiInput, UpdateExternalApiInput, AgentOrganization } from '../types';
import { CeoChatPanel } from './CeoChatPanel';
import { handleVoiceWebviewMessage } from './voice-message-handlers';
import { pushVoiceShortcutToWebview, registerVoiceWebview } from './voice-webview-registry';

export class DashboardProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'agentCompany.dashboard';

  private view?: vscode.WebviewView;
  private unregisterVoiceWebview?: () => void;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly service: AgentCompanyService
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    this.unregisterVoiceWebview?.();
    this.unregisterVoiceWebview = registerVoiceWebview(webviewView.webview);

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.extensionUri,
        vscode.Uri.joinPath(this.extensionUri, 'webview', 'dist'),
        vscode.Uri.file(this.service.agentFolders.runtimeRoot),
        vscode.Uri.file(this.service.agentFolders.getCompanyDir()),
      ],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this.handleMessage(message);
    });

    void this.refreshQuick();
    void this.refreshAsync();
  }

  refresh(): void {
    void this.refreshAsync();
  }

  private postDashboardData(payload: Awaited<ReturnType<AgentCompanyService['getDashboardDataAsync']>>): void {
    this.view?.webview.postMessage({
      type: 'dashboardData',
      payload,
    });
  }

  private async refreshQuick(): Promise<void> {
    if (!this.view) return;
    try {
      const payload = await this.service.getDashboardDataAsync();
      payload.companyLogoUrl = await this.buildCompanyLogoUrl(payload.companyInfo.updatedAt);
      this.postDashboardData(payload);
    } catch (error) {
      console.error('[AgentCompany] dashboard quick refresh failed:', error);
    }
  }

  private async refreshAsync(): Promise<void> {
    if (!this.view) return;
    try {
      await this.service.reloadEnv();
      await this.service.refreshLlmConnection();
      const payload = await this.service.getDashboardDataAsync();
      const [agentPhotos, ownerPhotos] = await Promise.all([
        this.buildAgentPhotos(payload.agents),
        this.buildOwnerEmotionPhotos(payload.ownerInfo.updatedAt),
      ]);
      payload.agentPhotos = agentPhotos;
      payload.companyLogoUrl = await this.buildCompanyLogoUrl(payload.companyInfo.updatedAt);
      payload.ownerEmotionPhotos = ownerPhotos.emotionPhotos;
      payload.ownerProfilePhotoUrl = ownerPhotos.profilePhotoUrl;
      this.postDashboardData(payload);
    } catch (error) {
      console.error('[AgentCompany] dashboard refresh failed:', error);
    }
  }

  private async buildAgentPhotos(agents: { id: string; updatedAt?: string }[]): Promise<Record<string, string>> {
    if (!this.view) return {};
    const photos: Record<string, string> = {};
    for (const agent of agents) {
      const full = this.service.agents.get(agent.id);
      if (!full) continue;
      const slug = this.service.agentFolders.resolveSlug(full);
      const photoPath = await this.service.agentFolders.resolveProfilePhotoPath(slug);
      if (!photoPath) continue;
      const uri = this.view.webview.asWebviewUri(vscode.Uri.file(photoPath));
      photos[agent.id] = `${uri.toString()}?v=${agent.updatedAt ?? Date.now()}`;
    }
    return photos;
  }

  private async buildOwnerEmotionPhotos(versionKey?: string): Promise<{
    emotionPhotos?: Record<string, string>;
    profilePhotoUrl?: string;
  }> {
    if (!this.view) return {};
    const version = versionKey ?? Date.now();
    const emotionPhotos: Record<string, string> = {};

    for (const emotion of CHAT_EMOTIONS) {
      const emotionPath = await this.service.agentFolders.resolveOwnerEmotionPhotoPath(emotion);
      if (!emotionPath) continue;
      const uri = this.view.webview.asWebviewUri(vscode.Uri.file(emotionPath));
      emotionPhotos[emotion] = `${uri.toString()}?v=${version}`;
    }

    const profilePath = await this.service.agentFolders.resolveOwnerProfilePhotoPath();
    const profilePhotoUrl = profilePath
      ? `${this.view.webview.asWebviewUri(vscode.Uri.file(profilePath)).toString()}?v=${version}`
      : undefined;

    return {
      emotionPhotos: Object.keys(emotionPhotos).length > 0 ? emotionPhotos : undefined,
      profilePhotoUrl,
    };
  }

  private async buildCompanyLogoUrl(versionKey?: string): Promise<string | undefined> {
    if (!this.view) return undefined;
    const logoPath = await this.service.agentFolders.resolveCompanyLogoPath();
    if (!logoPath) return undefined;
    const uri = this.view.webview.asWebviewUri(vscode.Uri.file(logoPath));
    return `${uri.toString()}?v=${versionKey ?? Date.now()}`;
  }

  navigateTo(tab: string): void {
    this.view?.webview.postMessage({ type: 'navigate', payload: { tab } });
  }

  private async handleMessage(message: { type: string; payload?: unknown }): Promise<void> {
    if (this.view && (await handleVoiceWebviewMessage(message, this.view.webview, this.service))) {
      return;
    }

    switch (message.type) {
      case 'ready':
        void this.refreshQuick();
        void this.refreshAsync();
        if (this.view) {
          pushVoiceShortcutToWebview(this.view.webview, this.service.getVoiceShortcut());
        }
        break;

      case 'createAgent': {
        const input = message.payload as CreateAgentInput & { role?: string };
        try {
          const agent = await this.service.createAgent(input);
          this.view?.webview.postMessage({
            type: 'createAgentResult',
            payload: {
              success: true,
              agent,
              folder: this.service.agentFolders.getRelativePath(
                this.service.agentFolders.resolveSlug(agent)
              ),
            },
          });
        } catch (error) {
          const messageText = error instanceof Error ? error.message : String(error);
          const code =
            error instanceof AgentDuplicateNameError
              ? 'DUPLICATE_NAME'
              : error instanceof AgentDescriptionRequiredError
                ? 'DESCRIPTION_REQUIRED'
                : 'UNKNOWN';
          this.service.notifications.showWarning(messageText);
          this.view?.webview.postMessage({
            type: 'createAgentResult',
            payload: { success: false, message: messageText, code },
          });
        }
        this.refresh();
        break;
      }

      case 'updateAgent': {
        const { id, ...fields } = message.payload as UpdateAgentInput & { id: string };
        try {
          this.service.agents.update(id, fields);
        } catch (error) {
          const messageText = error instanceof Error ? error.message : String(error);
          this.service.notifications.showWarning(messageText);
        }
        this.refresh();
        break;
      }

      case 'deleteAgent': {
        const { id } = message.payload as { id: string };
        this.service.deleteAgent(id);
        this.refresh();
        break;
      }

      case 'activateAgent': {
        const { id } = message.payload as { id: string };
        await this.service.activateAgent(id);
        this.refresh();
        break;
      }

      case 'deactivateAgent': {
        const { id } = message.payload as { id: string };
        this.service.agents.deactivate(id);
        this.refresh();
        break;
      }

      case 'createTask': {
        const input = message.payload as CreateTaskInput;
        this.service.tasks.create(input);
        this.refresh();
        break;
      }

      case 'deleteTask': {
        const { id } = message.payload as { id: string };
        this.service.tasks.delete(id);
        this.refresh();
        break;
      }

      case 'assignTask': {
        const { taskId, agentId } = message.payload as { taskId: string; agentId: string };
        this.service.tasks.assign(taskId, agentId);
        this.refresh();
        break;
      }

      case 'updateTaskStatus': {
        const { taskId, status } = message.payload as { taskId: string; status: TaskStatus };
        this.service.tasks.transition(taskId, status);
        this.refresh();
        break;
      }

      case 'approveTask': {
        const { taskId } = message.payload as { taskId: string };
        this.service.tasks.approve(taskId);
        this.service.notifications.showInfo('Task approved');
        this.refresh();
        break;
      }

      case 'rejectTask': {
        const { taskId, reason } = message.payload as { taskId: string; reason?: string };
        this.service.tasks.reject(taskId, reason);
        this.service.notifications.showWarning('Task rejected — sent back to working');
        this.refresh();
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
          this.view?.webview.postMessage({
            type: 'voiceTranscriptionResult',
            payload: { requestId, text },
          });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.view?.webview.postMessage({
            type: 'voiceTranscriptionResult',
            payload: { requestId, error: errMsg },
          });
        }
        break;
      }

      case 'executeCommand': {
        const { command } = message.payload as { command: string };
        try {
          await this.service.executeCeoCommand(command);
          this.refresh();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.service.notifications.showWarning(errMsg);
        }
        break;
      }

      case 'openCeoChat': {
        CeoChatPanel.openSecretaryChat(this.extensionUri, this.service);
        break;
      }

      case 'openAgentChat': {
        const { agentId } = message.payload as { agentId: string };
        const agent = this.service.agents.get(agentId);
        if (agent) {
          CeoChatPanel.createOrShow(this.extensionUri, this.service, {
            threadId: agent.id,
            agentName: agent.name,
            agentTitle: agent.title,
            agentDisplayName: formatAgentLabel(agent),
            agentRole: agent.title?.trim() || agent.role,
          });
        }
        break;
      }

      case 'openTeamChat': {
        const { sessionId } = message.payload as { sessionId: string };
        const session = this.service.teams.getSession(sessionId);
        if (session) {
          CeoChatPanel.openTeamChat(
            this.extensionUri,
            this.service,
            session.threadId,
            session.memberAgentIds,
            session.title
          );
        }
        break;
      }

      case 'openAgentFolder': {
        const { agentId } = message.payload as { agentId: string };
        const agent = this.service.agents.get(agentId);
        if (agent) {
          await this.service.agentFolders.openAgentFolder(agent);
        }
        break;
      }

      case 'openAgentsRoot': {
        await this.service.agentFolders.openAgentsRoot();
        break;
      }

      case 'getAgentWorkLog': {
        const { agentId } = message.payload as { agentId: string };
        const log = this.service.getAgentWorkLog(agentId);
        this.view?.webview.postMessage({ type: 'agentWorkLog', payload: log });
        break;
      }

      case 'requestIdeas': {
        const count = await this.service.ideas.requestIdeasNow(3);
        if (count > 0) {
          this.service.notifications.showInfo(`에이전트 ${count}명이 아이디어를 제안했습니다.`);
        } else {
          this.service.notifications.showWarning('지금은 제안할 idle 에이전트가 없거나 대기 아이디어가 가득 찼습니다.');
        }
        this.refresh();
        break;
      }

      case 'acceptIdea': {
        const { ideaId } = message.payload as { ideaId: string };
        const result = await this.service.ideas.acceptIdea(ideaId);
        if (result) {
          this.service.notifications.showInfo('아이디어를 수락해 태스크를 생성했습니다.');
        }
        this.refresh();
        break;
      }

      case 'dismissIdea': {
        const { ideaId } = message.payload as { ideaId: string };
        if (this.service.ideas.dismissIdea(ideaId)) {
          this.service.notifications.showInfo('아이디어를 보류했습니다.');
        }
        this.refresh();
        break;
      }

      case 'runTask': {
        const { taskId, agentId } = message.payload as { taskId: string; agentId: string };
        await this.service.orchestrator.runAgentTask(agentId, taskId);
        this.refresh();
        break;
      }

      case 'updateSettings': {
        const partial = message.payload as Partial<AppSettings>;
        await this.service.settings.updateSettings(partial);
        if (partial.openaiApiKey || partial.anthropicApiKey || partial.defaultProvider) {
          await this.service.reloadEnv();
          await this.service.llmStatus.fetchModels();
        }
        if (
          partial.proactiveIdeasEnabled !== undefined ||
          partial.proactiveIdeasIntervalMinutes !== undefined
        ) {
          this.service.ideas.restart();
        }
        if (
          partial.telegramEnabled !== undefined ||
          partial.telegramInboundEnabled !== undefined ||
          partial.telegramBotToken !== undefined ||
          partial.telegramChatId !== undefined
        ) {
          this.service.telegramInbound.restart();
        }
        this.service.notifications.showInfo('Settings saved');
        this.refresh();
        break;
      }

      case 'createExternalApi': {
        const input = message.payload as CreateExternalApiInput;
        if (!input.name?.trim() || !input.baseUrl?.trim()) {
          this.service.notifications.showWarning('API 이름과 Base URL은 필수입니다.');
          break;
        }
        const created = await this.service.externalApis.create(input);
        this.service.syncExternalApiRegistry();
        this.service.notifications.showInfo(`API "${created.name}" added (인증: ${created.authType})`);
        this.refresh();
        break;
      }

      case 'updateExternalApi': {
        const { id, ...fields } = message.payload as UpdateExternalApiInput & { id: string };
        const updated = await this.service.externalApis.update(id, fields);
        if (updated) {
          this.service.syncExternalApiRegistry();
          this.service.notifications.showInfo(`API "${updated.name}" updated`);
        }
        this.refresh();
        break;
      }

      case 'deleteExternalApi': {
        const { id } = message.payload as { id: string };
        const api = this.service.externalApis.get(id);
        await this.service.externalApis.delete(id);
        this.service.syncExternalApiRegistry();
        this.service.notifications.showInfo(api ? `API "${api.name}" deleted` : 'API deleted');
        this.refresh();
        break;
      }

      case 'testExternalApi': {
        const { id } = message.payload as { id: string };
        const result = await this.service.externalApis.testConnection(id);
        this.view?.webview.postMessage({ type: 'externalApiTestResult', payload: { id, ...result } });
        if (result.success) {
          this.service.notifications.showInfo(result.message);
        } else {
          this.service.notifications.showWarning(result.message);
        }
        break;
      }

      case 'toggleExternalApi': {
        const { id, enabled } = message.payload as { id: string; enabled: boolean };
        await this.service.externalApis.update(id, { enabled });
        this.service.syncExternalApiRegistry();
        this.refresh();
        break;
      }

      case 'saveOrgChart': {
        const org = message.payload as AgentOrganization;
        const err = this.service.orgEngine.validateOrgChart(org);
        if (err) {
          this.service.notifications.showWarning(err);
          this.view?.webview.postMessage({
            type: 'saveOrgChartResult',
            payload: { success: false, message: err },
          });
          return;
        }
        this.service.saveOrgChart(org);
        this.service.notifications.showInfo('조직도가 저장되었습니다. 부하 → 상사 보고 체계가 반영되었습니다.');
        this.view?.webview.postMessage({
          type: 'saveOrgChartResult',
          payload: { success: true },
        });
        this.refresh();
        break;
      }

      case 'readClipboard': {
        const { requestId } = message.payload as { requestId: string };
        const text = await vscode.env.clipboard.readText();
        this.view?.webview.postMessage({
          type: 'clipboardText',
          payload: { requestId, text },
        });
        break;
      }

      case 'testTelegram': {
        const partial = message.payload as Partial<AppSettings> | undefined;
        if (partial && Object.keys(partial).length > 0) {
          await this.service.settings.updateSettings(partial);
        }
        const saved = this.service.settings.getSettings();
        const result = await this.service.notifications.getTelegram().testConnection({
          token: partial?.telegramBotToken?.trim() || saved.telegramBotToken,
          chatId: partial?.telegramChatId?.trim() || saved.telegramChatId,
        });
        this.view?.webview.postMessage({ type: 'telegramTestResult', payload: result });
        if (result.success) {
          this.service.notifications.showInfo('Telegram 테스트 메시지를 보냈습니다.');
          this.service.telegramInbound.restart();
        } else {
          this.service.notifications.showWarning(result.message);
        }
        this.refresh();
        break;
      }

      case 'checkLlmConnection': {
        const status = await this.service.refreshLlmConnection();
        this.view?.webview.postMessage({ type: 'llmStatusUpdate', payload: status });
        this.refresh();
        break;
      }

      case 'fetchModels': {
        await this.service.reloadEnv();
        const models = await this.service.llmStatus.fetchModels();
        await this.service.refreshLlmConnection();
        this.view?.webview.postMessage({ type: 'modelsUpdate', payload: { models } });
        this.refresh();
        break;
      }

      case 'selectModel': {
        const { model } = message.payload as { model: string };
        await this.service.setDefaultModel(model);
        this.service.notifications.showInfo(`Model changed to ${model}`);
        this.refresh();
        break;
      }

      case 'createEnvFile': {
        const result = await this.service.env.createEnvTemplate();
        if (result.success) {
          await this.service.reloadEnv();
          await this.service.refreshLlmConnection();
          const doc = vscode.workspace.textDocuments.find((d) => d.fileName.endsWith('.env'));
          if (doc) {
            await vscode.window.showTextDocument(doc);
          } else {
            const root = this.service.workspace.getWorkspaceRoot();
            if (root) {
              const uri = vscode.Uri.joinPath(vscode.Uri.file(root), '.env');
              const opened = await vscode.workspace.openTextDocument(uri);
              await vscode.window.showTextDocument(opened);
            }
          }
          this.service.notifications.showInfo(result.message);
        } else {
          this.service.notifications.showWarning(result.message);
        }
        this.view?.webview.postMessage({ type: 'envFileResult', payload: result });
        this.refresh();
        break;
      }

      case 'openEnvFile': {
        const root = this.service.workspace.getWorkspaceRoot();
        if (!root) {
          this.service.notifications.showWarning('워크스페이스가 열려 있지 않습니다.');
          break;
        }
        const uri = vscode.Uri.joinPath(vscode.Uri.file(root), '.env');
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc);
        } catch {
          this.service.notifications.showWarning('.env 파일이 없습니다. 먼저 생성해 주세요.');
        }
        break;
      }

      case 'openOpenAiBilling': {
        const url =
          (message.payload as { url?: string } | undefined)?.url ??
          'https://platform.openai.com/usage';
        await vscode.env.openExternal(vscode.Uri.parse(url));
        break;
      }

      case 'saveCompanyInfo': {
        const input = message.payload as {
          companyName: string;
          businessItem: string;
          policy: string;
          mindset: string;
          tendency: string;
          mission: string;
        };
        const saved = await this.service.saveCompanyInfo(input);
        this.service.notifications.showInfo(
          saved.companyName
            ? `회사 정보 저장: ${saved.companyName}`
            : '회사 정보가 저장되었습니다.'
        );
        this.view?.webview.postMessage({ type: 'companyInfoSaved', payload: saved });
        this.refresh();
        break;
      }

      case 'pickCompanyLogo': {
        const ok = await this.service.pickCompanyLogo();
        if (ok) {
          this.service.notifications.showInfo('회사 로고가 저장되었습니다.');
        }
        this.refresh();
        break;
      }

      case 'removeCompanyLogo': {
        await this.service.removeCompanyLogo();
        this.service.notifications.showInfo('회사 로고가 제거되었습니다.');
        this.refresh();
        break;
      }

      case 'saveOwnerInfo': {
        const input = message.payload as {
          name: string;
          personality: string;
          tendency: string;
          orientation: string;
        };
        const saved = await this.service.saveOwnerInfo(input);
        this.service.notifications.showInfo(
          saved.name ? `사장 정보 저장: ${saved.name}` : '사장 정보가 저장되었습니다.'
        );
        this.view?.webview.postMessage({ type: 'ownerInfoSaved', payload: saved });
        CeoChatPanel.refreshAllProfilePhotos();
        this.refresh();
        break;
      }

      case 'pickOwnerPhoto': {
        const { emotion } = message.payload as { emotion: string };
        const ok = await this.service.pickOwnerPhoto(emotion);
        if (ok) {
          this.service.notifications.showInfo(`${emotion} 사진이 저장되었습니다.`);
        }
        CeoChatPanel.refreshAllProfilePhotos();
        this.refresh();
        break;
      }

      case 'openOwnerPhotoFolder': {
        await this.service.openOwnerPhotoFolder();
        break;
      }

      case 'refresh':
        await this.service.reloadEnv();
        this.refresh();
        break;
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const assetsBase = vscode.Uri.joinPath(this.extensionUri, 'webview', 'dist', 'assets');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'index.js'));
    const vendorUri = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'styles.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'styles.css'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; img-src ${webview.cspSource} data:; media-src blob: data: mediastream: ${webview.cspSource};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <link rel="modulepreload" href="${vendorUri}">
  <title>AgentCompany Dashboard</title>
</head>
<body>
  <div id="root">
    <div class="extension-splash" id="html-boot-splash" role="status" aria-live="polite">
      <div class="extension-splash-card">
        <div class="extension-splash-logo-wrap">
          <span class="extension-splash-logo-fallback" aria-hidden="true">🏢</span>
        </div>
        <h2 class="extension-splash-ceo">사장</h2>
        <p class="extension-splash-role">(CEO)</p>
        <p class="extension-splash-status">출근중<span class="extension-splash-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
      </div>
    </div>
  </div>
  <script nonce="${nonce}">
    window.addEventListener('error', function (event) {
      var boot = document.getElementById('html-boot-splash');
      if (!boot) return;
      var msg = (event.error && event.error.message) || event.message || '알 수 없는 오류';
      boot.innerHTML = '<div class="extension-splash-card"><p class="extension-splash-status">대시보드 로드 실패</p><p class="extension-splash-role">' + msg + '</p></div>';
    });
  </script>
  <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
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
