import * as vscode from 'vscode';
import { WorkspaceEngine } from '../../workspace';
import { KiloExecutionResult } from '../types';

const CLI_CHECK_TIMEOUT_MS = 5000;
const CLI_VERSION_TIMEOUT_MS = 5000;

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

  isCliCheckEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('kiloCliAutoCheck', true);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isCliCheckEnabled()) return false;

    const cmd = this.getCliCommand();
    const whichCmd =
      process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;

    const located = await this.workspace.executeTerminal(whichCmd, CLI_CHECK_TIMEOUT_MS);
    if (located.exitCode !== 0) return false;

    const version = await this.workspace.executeTerminal(`${cmd} --version`, CLI_VERSION_TIMEOUT_MS);
    return version.exitCode === 0;
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
        `npx --yes @kilocode/cli run ${autoFlag} "${escaped}"`.replace(/\s+/g, ' ').trim(),
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
