import { MemoryEngine } from '../memory';
import { WorkspaceFileAction } from './action-parser';
import { WorkspaceEngine } from './index';

export interface ApplyResult {
  path: string;
  action: string;
  success: boolean;
  error?: string;
}

export class WorkspaceActionExecutor {
  constructor(
    private workspace: WorkspaceEngine,
    private memory: MemoryEngine
  ) {}

  async applyActions(
    actions: WorkspaceFileAction[],
    agentId: string | null,
    taskId: string | null
  ): Promise<ApplyResult[]> {
    const results: ApplyResult[] = [];

    for (const action of actions) {
      const result = await this.applyOne(action);
      results.push(result);

      const status = result.success ? 'applied' : 'failed';
      this.memory.logActivity(
        agentId,
        taskId,
        `Workspace ${action.action} ${action.path} → ${status}${result.error ? `: ${result.error}` : ''}`
      );
    }

    return results;
  }

  private async applyOne(action: WorkspaceFileAction): Promise<ApplyResult> {
    try {
      switch (action.action) {
        case 'create':
        case 'update': {
          if (action.content === undefined || action.content === null) {
            return { path: action.path, action: action.action, success: false, error: 'No content' };
          }
          const exists = await this.workspace.readFile(action.path);
          const ok = exists
            ? await this.workspace.updateFile(action.path, action.content!)
            : await this.workspace.createFile(action.path, action.content!);
          return { path: action.path, action: action.action, success: ok, error: ok ? undefined : 'Write failed' };
        }
        case 'delete': {
          const ok = await this.workspace.deleteFile(action.path);
          return { path: action.path, action: 'delete', success: ok, error: ok ? undefined : 'Delete failed' };
        }
        default:
          return { path: action.path, action: action.action, success: false, error: 'Unknown action' };
      }
    } catch (error) {
      return {
        path: action.path,
        action: action.action,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
