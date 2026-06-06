import * as vscode from 'vscode';
import { AgentCompanyService } from './services';
import { DashboardProvider } from './webview/DashboardProvider';
import { CeoChatPanel } from './webview/CeoChatPanel';
import { formatAgentLabel } from './utils/agent-display';
import type { CreateAgentInput } from './types';

let service: AgentCompanyService | undefined;
let dashboardProvider: DashboardProvider | undefined;
let initPromise: Promise<void> | undefined;

async function whenReady(): Promise<AgentCompanyService> {
  if (!service) {
    throw new Error('AgentCompany가 활성화되지 않았습니다.');
  }
  if (initPromise) {
    await initPromise;
  }
  return service;
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  service = new AgentCompanyService(context);
  dashboardProvider = new DashboardProvider(context.extensionUri, service);

  CeoChatPanel.registerPanelOpener(context.extensionUri, service);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(DashboardProvider.viewType, dashboardProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  service.bindDashboardRefresh(() => dashboardProvider?.refresh());

  initPromise = service
    .initialize()
    .then(() => {
      service!.startKnowledgeWatcher(context);
      service!.startPhotoWatcher(context);
      dashboardProvider?.refresh();
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[AgentCompany] initialize failed:', error);
      void vscode.window.showErrorMessage(`AgentCompany 초기화 실패: ${message}`);
      throw error;
    });

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.openDashboard', () => {
      vscode.commands.executeCommand('agentCompany.dashboard.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.createAgent', async () => {
      const name = await vscode.window.showInputBox({ prompt: '에이전트 이름 (예: 강하늘)' });
      if (!name?.trim()) return;

      const title = await vscode.window.showInputBox({ prompt: '직책 (예: 비서, 연구원, PM)' });
      if (!title?.trim()) {
        service!.notifications.showWarning('직책을 입력해 주세요.');
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: '능력·성향·역할 설명 (필수)',
        placeHolder: '예: 친절한 QA 전문가, 테스트·버그 재현에 강함',
      });
      if (!description?.trim()) {
        service!.notifications.showWarning('능력·성향·역할 설명을 입력해 주세요.');
        return;
      }

      try {
        const svc = await whenReady();
        await svc.createAgent({
          name: name.trim(),
          title: title.trim(),
          description: description.trim(),
        });
        dashboardProvider?.refresh();
      } catch (error) {
        const svc = service!;
        svc.notifications.showWarning(error instanceof Error ? error.message : String(error));
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.requestIdeas', async () => {
      const svc = await whenReady();
      const count = await svc.ideas.requestIdeasNow(3);
      dashboardProvider?.refresh();
      if (count > 0) {
        service!.notifications.showInfo(`에이전트 ${count}명이 아이디어를 제안했습니다.`);
      } else {
        service!.notifications.showWarning('지금은 제안할 idle 에이전트가 없거나 대기 아이디어가 가득 찼습니다.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.openSettings', async () => {
      await vscode.commands.executeCommand('agentCompany.dashboard.focus');
      dashboardProvider?.navigateTo('settings');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.createTask', async () => {
      const title = await vscode.window.showInputBox({ prompt: 'Task title' });
      if (!title) return;

      const svc = await whenReady();
      svc.tasks.create({ title });
      dashboardProvider?.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.openCeoChat', () => {
      void whenReady().then((svc) => {
        CeoChatPanel.openSecretaryChat(context.extensionUri, svc);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.openAgentsRoot', async () => {
      const svc = await whenReady();
      await svc.agentFolders.openAgentsRoot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.openAgentFolder', async (agentId?: string) => {
      let id = agentId;
      if (!id) {
        const svc = await whenReady();
        const agents = svc.agents.getAll();
        const picked = await vscode.window.showQuickPick(
          agents.map((a) => ({ label: formatAgentLabel(a), description: a.title?.trim() || a.role, id: a.id })),
          { placeHolder: '에이전트 폴더 열기' }
        );
        id = picked?.id;
      }
      if (!id) return;
      const svc = await whenReady();
      const agent = svc.agents.get(id);
      if (agent) await svc.agentFolders.openAgentFolder(agent);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentCompany.createEnvFile', async () => {
      const svc = await whenReady();
      const result = await svc.env.createEnvTemplate();
      if (result.success) {
        await svc.reloadEnv();
        await svc.refreshLlmConnection();
        dashboardProvider?.refresh();
        svc.notifications.showInfo(result.message);
      } else {
        svc.notifications.showWarning(result.message);
      }
    })
  );

  const envWatcher = vscode.workspace.createFileSystemWatcher('**/.env');
  const onEnvChange = async () => {
    await service?.reloadEnv();
    await service?.refreshLlmConnection();
    dashboardProvider?.refresh();
  };
  envWatcher.onDidChange(onEnvChange);
  envWatcher.onDidCreate(onEnvChange);
  context.subscriptions.push(envWatcher);

  context.subscriptions.push({ dispose: () => service?.dispose() });
}

export function deactivate(): void {
  service?.dispose();
}
