import * as vscode from 'vscode';
import { CeoChatPanel } from '../webview/CeoChatPanel';

const DEBOUNCE_MS = 400;

export class AgentPhotoWatcher {
  private timer?: ReturnType<typeof setTimeout>;

  start(context: vscode.ExtensionContext, onPhotoChange?: () => void): void {
    const schedule = () => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.timer = undefined;
        CeoChatPanel.refreshAllProfilePhotos();
        onPhotoChange?.();
      }, DEBOUNCE_MS);
    };

    const agentWatcher = vscode.workspace.createFileSystemWatcher('**/agent/**/photo/**');
    const ownerWatcher = vscode.workspace.createFileSystemWatcher('**/company/owner/photo/**');

    for (const watcher of [agentWatcher, ownerWatcher]) {
      watcher.onDidCreate(schedule);
      watcher.onDidChange(schedule);
      watcher.onDidDelete(schedule);
      context.subscriptions.push(watcher);
    }
    context.subscriptions.push({
      dispose: () => {
        if (this.timer) clearTimeout(this.timer);
      },
    });
  }
}
