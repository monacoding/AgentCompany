import * as vscode from 'vscode';
import { WorkspaceEngine } from '../../workspace';
import { KiloExecutionResult } from '../types';

export class KiloCliAdapter {
  constructor(private workspace: WorkspaceEngine) {}

  getCliCommand(): string {
    return (
      vscode.workspace.getConfiguration('agentCompany').get<string>('kiloCliCommand') ||
      process.env.KILO_CLI_COMMAND ||
      'kilo'
    );
  }

  isAutoModeEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('kiloAutoMode', true);
  }

  async isAvailable(): Promise<boolean> {
    const cmd = this.getCliCommand();
    const result = await this.workspace.executeTerminal(`${cmd} --version`, 15000);
    if (result.exitCode === 0) return true;

    if (cmd === 'kilo') {
      const npx = await this.workspace.executeTerminal('npx @kilocode/cli --version', 30000);
      return npx.exitCode === 0;
    }
    return false;
  }

  async execute(prompt: string): Promise<KiloExecutionResult | null> {
    const root = this.workspace.getWorkspaceRoot();
    if (!root) return null;

    const cmd = this.getCliCommand();
    const autoFlag = this.isAutoModeEnabled() ? '--auto' : '';
    const escaped = prompt.replace(/"/g, '\\"');

    let result = await this.workspace.executeTerminal(
      `${cmd} run ${autoFlag} "${escaped}"`.replace(/\s+/g, ' ').trim(),
      300000
    );

    if (result.exitCode !== 0 && cmd === 'kilo') {
      result = await this.workspace.executeTerminal(
        `npx @kilocode/cli run ${autoFlag} "${escaped}"`.replace(/\s+/g, ' ').trim(),
        300000
      );
    }

    if (result.exitCode !== 0) return null;

    return {
      mode: 'coder',
      plan: { mode: 'coder', objective: prompt, steps: ['Kilo CLI execution'], filesToModify: [] },
      output: result.stdout || result.stderr,
      filesModified: [],
      terminalOutput: result.stdout,
      selfCheckPassed: true,
      usedCli: true,
    };
  }
}
