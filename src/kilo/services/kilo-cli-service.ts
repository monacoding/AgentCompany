import * as vscode from 'vscode';
import { WorkspaceEngine } from '../../workspace';
import { KiloCliAdapter } from '../adapters/kilo-cli';

export interface KiloCliStatus {
  available: boolean;
  command: string;
  message: string;
}

export class KiloCliService {
  private adapter: KiloCliAdapter;

  constructor(workspace: WorkspaceEngine) {
    this.adapter = new KiloCliAdapter(workspace);
  }

  isAutoCheckEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('kiloCliAutoCheck', true);
  }

  async checkStatus(): Promise<KiloCliStatus> {
    const command = this.adapter.getCliCommand();
    const available = await this.adapter.isAvailable();

    return {
      available,
      command,
      message: available
        ? `Kilo CLI (${command}) 사용 가능`
        : `Kilo CLI 미설치 — 내부 Kilo Engine 사용. 설치: npm install -g @kilocode/cli`,
    };
  }

  async ensureReady(): Promise<KiloCliStatus> {
    if (!this.isAutoCheckEnabled()) {
      return { available: false, command: this.adapter.getCliCommand(), message: 'Kilo CLI auto-check disabled' };
    }
    return this.checkStatus();
  }
}
