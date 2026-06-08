import * as vscode from 'vscode';
import { WorkspaceEngine } from '../../workspace';
import { ClineCliAdapter } from '../adapters/cline-cli';

export interface ClineCliStatus {
  available: boolean;
  command: string;
  message: string;
}

export class ClineCliService {
  private adapter: ClineCliAdapter;

  constructor(workspace: WorkspaceEngine) {
    this.adapter = new ClineCliAdapter(workspace);
  }

  isAutoCheckEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('clineCliAutoCheck', true);
  }

  async checkStatus(): Promise<ClineCliStatus> {
    const command = this.adapter.getCliCommand();
    const available = await this.adapter.isAvailable();

    return {
      available,
      command,
      message: available
        ? `Cline CLI (${command}) 사용 가능`
        : `Cline CLI 미설치 — 내부 Cline Engine 사용. 설치: npm install -g cline`,
    };
  }

  async ensureReady(): Promise<ClineCliStatus> {
    if (!this.isAutoCheckEnabled()) {
      return {
        available: false,
        command: this.adapter.getCliCommand(),
        message: 'Cline CLI auto-check disabled',
      };
    }
    return this.checkStatus();
  }
}
