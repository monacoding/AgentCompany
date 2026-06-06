import { WorkspaceEngine } from '../../workspace';

export class TerminalRunner {
  constructor(private workspace: WorkspaceEngine) {}

  async runIfNeeded(task: string): Promise<string | undefined> {
    const lower = task.toLowerCase();
    const shouldRun =
      lower.includes('test') ||
      lower.includes('테스트') ||
      lower.includes('build') ||
      lower.includes('lint') ||
      lower.includes('npm');

    if (!shouldRun) return undefined;

    let command = 'npm test';
    if (lower.includes('build')) command = 'npm run build';
    else if (lower.includes('lint')) command = 'npm run lint';

    const result = await this.workspace.executeTerminal(command, 120000);
    return `Command: ${command}\nExit: ${result.exitCode}\n${result.stdout}\n${result.stderr}`.slice(
      0,
      3000
    );
  }
}
