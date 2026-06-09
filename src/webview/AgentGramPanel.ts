import * as vscode from 'vscode';
import { AgentCompanyService } from '../services';

export class AgentGramPanel {
  private static instance: AgentGramPanel | null = null;

  static open(extensionUri: vscode.Uri, service: AgentCompanyService): void {
    if (AgentGramPanel.instance) {
      AgentGramPanel.instance.panel.reveal(vscode.ViewColumn.One);
      void AgentGramPanel.instance.syncToWebview();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'agentCompany.agentGram',
      'AgentGram',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          extensionUri,
          vscode.Uri.joinPath(extensionUri, 'webview', 'dist'),
        ],
      }
    );

    AgentGramPanel.instance = new AgentGramPanel(panel, extensionUri, service);
  }

  static refresh(): void {
    void AgentGramPanel.instance?.syncToWebview();
  }

  private constructor(
    public readonly panel: vscode.WebviewPanel,
    private readonly extensionUri: vscode.Uri,
    private readonly service: AgentCompanyService
  ) {
    panel.webview.html = this.getHtml(panel.webview);

    panel.webview.onDidReceiveMessage(async (message) => {
      await this.handleMessage(message);
    });

    panel.onDidDispose(() => {
      AgentGramPanel.instance = null;
    });

    void this.syncToWebview();
  }

  async syncToWebview(): Promise<void> {
    try {
      const payload = await this.service.agentGram.getSnapshot();
      this.panel.webview.postMessage({ type: 'agentGramData', payload });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.panel.webview.postMessage({ type: 'agentGramError', payload: message });
    }
  }

  private async handleMessage(message: { type: string; payload?: unknown }): Promise<void> {
    switch (message.type) {
      case 'ready':
      case 'refreshAgentGram':
        await this.syncToWebview();
        break;

      case 'createOwnerPost': {
        const { caption, emoji } = message.payload as { caption: string; emoji: string };
        this.service.agentGram.createOwnerPost(caption, emoji);
        await this.syncToWebview();
        break;
      }

      case 'toggleOwnerLike': {
        const { postId } = message.payload as { postId: string };
        this.service.agentGram.toggleOwnerLike(postId);
        await this.syncToWebview();
        break;
      }

      case 'respondFollowRequest': {
        const { requestId, accept } = message.payload as { requestId: string; accept: boolean };
        this.service.agentGram.respondFollowRequest(requestId, accept);
        await this.syncToWebview();
        break;
      }

      case 'runAgentGramCycle': {
        await this.service.agentGram.runCycle();
        await this.syncToWebview();
        break;
      }
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const assetsBase = vscode.Uri.joinPath(this.extensionUri, 'webview', 'dist', 'assets');
    const snsJs = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'sns.js'));
    const snsCss = webview.asWebviewUri(vscode.Uri.joinPath(assetsBase, 'sns.css'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; img-src ${webview.cspSource} data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${snsCss}" rel="stylesheet">
  <title>AgentGram</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" type="module" src="${snsJs}"></script>
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
