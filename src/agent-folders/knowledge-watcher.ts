import * as vscode from 'vscode';
import { AgentCompanyService } from '../services';

const DEBOUNCE_MS = 600;

export class KnowledgeWatcher {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  start(context: vscode.ExtensionContext, service: AgentCompanyService): void {
    const watcher = vscode.workspace.createFileSystemWatcher('**/agent/**/knowledge/**');

    const schedule = (uri: vscode.Uri) => {
      const agent = service.knowledgeLearner.findAgentByKnowledgePath(uri.fsPath);
      if (!agent) return;

      const key = agent.id;
      const prev = this.timers.get(key);
      if (prev) clearTimeout(prev);

      this.timers.set(
        key,
        setTimeout(() => {
          this.timers.delete(key);
          void service.knowledgeLearner.syncAgent(agent).then(({ learned }) => {
            if (learned.length > 0) {
              service.notifications.showInfo(
                `${agent.name}: knowledge ${learned.length}건 학습 반영`
              );
            }
          });
        }, DEBOUNCE_MS)
      );
    };

    watcher.onDidCreate(schedule);
    watcher.onDidChange(schedule);
    watcher.onDidDelete((uri) => schedule(uri));

    context.subscriptions.push(watcher);
    context.subscriptions.push({
      dispose: () => {
        for (const t of this.timers.values()) clearTimeout(t);
        this.timers.clear();
      },
    });
  }
}
