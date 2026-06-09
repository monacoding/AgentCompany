import * as vscode from 'vscode';

export class AgentGramPanel {
  private static instance: AgentGramPanel | null = null;

  static open(extensionUri: vscode.Uri): void {
    if (AgentGramPanel.instance) {
      AgentGramPanel.instance.panel.reveal(vscode.ViewColumn.One);
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

    AgentGramPanel.instance = new AgentGramPanel(panel, extensionUri);
  }

  private constructor(
    public readonly panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri
  ) {
    panel.webview.html = this.getHtml(panel.webview, extensionUri);

    panel.onDidDispose(() => {
      AgentGramPanel.instance = null;
    });
  }

  private getHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const assetsBase = vscode.Uri.joinPath(extensionUri, 'webview', 'dist', 'assets');
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
