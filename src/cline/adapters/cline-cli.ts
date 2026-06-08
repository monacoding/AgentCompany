import * as vscode from 'vscode';
import { WorkspaceEngine } from '../../workspace';
import { ClineExecutionResult, detectClineMode } from '../types';

const CLI_CHECK_TIMEOUT_MS = 8000;
const CLI_RUN_TIMEOUT_MS = 600000;

export class ClineCliAdapter {
  constructor(private workspace: WorkspaceEngine) {}

  getCliCommand(): string {
    return (
      vscode.workspace.getConfiguration('agentCompany').get<string>('clineCliCommand') ||
      process.env.CLINE_CLI_COMMAND ||
      'cline'
    );
  }

  isYoloEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('clineYoloMode', true);
  }

  isCliCheckEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('clineCliAutoCheck', true);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isCliCheckEnabled()) return false;

    const cmd = this.getCliCommand();
    const whichCmd = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;

    const located = await this.workspace.executeTerminal(whichCmd, CLI_CHECK_TIMEOUT_MS);
    if (located.exitCode !== 0) return false;

    const version = await this.workspace.executeTerminal(`${cmd} version`, CLI_CHECK_TIMEOUT_MS);
    return version.exitCode === 0;
  }

  async execute(prompt: string, priorContext?: string): Promise<ClineExecutionResult | null> {
    const root = this.workspace.getWorkspaceRoot();
    if (!root) return null;

    const cmd = this.getCliCommand();
    const yoloFlag = this.isYoloEnabled() ? '-y' : '';
    const fullPrompt = priorContext?.trim()
      ? `${prompt}\n\n[협업 맥락 — 이전 에이전트 산출물]\n${priorContext.slice(0, 6000)}`
      : prompt;
    const escaped = fullPrompt.replace(/"/g, '\\"').replace(/\n/g, ' ');

    let result = await this.workspace.executeTerminal(
      `${cmd} ${yoloFlag} "${escaped}"`.replace(/\s+/g, ' ').trim(),
      CLI_RUN_TIMEOUT_MS
    );

    if (result.exitCode !== 0 && cmd === 'cline') {
      result = await this.workspace.executeTerminal(
        `npx --yes cline ${yoloFlag} "${escaped}"`.replace(/\s+/g, ' ').trim(),
        CLI_RUN_TIMEOUT_MS
      );
    }

    if (result.exitCode !== 0) return null;

    const mode = detectClineMode(prompt);
    const output = (result.stdout || result.stderr).trim();

    return {
      mode,
      plan: {
        mode,
        objective: prompt,
        steps: ['Cline CLI headless execution'],
        filesToModify: [],
      },
      output,
      filesModified: [],
      terminalOutput: result.stdout,
      selfCheckPassed: true,
      usedCli: true,
    };
  }
}
