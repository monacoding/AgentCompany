import * as fs from 'fs';
import * as path from 'path';
import { Agent } from '../../types';
import {
  filterRunnableScriptPaths,
  inferDartScriptArgs,
  isDartPdfTask,
  runScriptFile,
  ScriptRunResult,
  shouldRunExplicitNpmCommand,
  taskRequiresScriptExecution,
} from '../../team/script-runner';
import { WorkspaceEngine } from '../../workspace';

export class TerminalRunner {
  constructor(private workspace: WorkspaceEngine) {}

  async runAfterEdit(
    task: string,
    _agent: Agent,
    filesModified: string[]
  ): Promise<string | undefined> {
    const outputs: string[] = [];

    const shouldRunScripts =
      taskRequiresScriptExecution(task) || isDartPdfTask(task) || filesModified.some((f) => /\.py$/i.test(f));

    if (shouldRunScripts) {
      const root = this.workspace.getWorkspaceRoot();
      if (root) {
        const candidates = [
          ...filterRunnableScriptPaths(filesModified).filter((p) => !p.startsWith('path:')),
        ];
        if (isDartPdfTask(task)) {
          const dartRel = filesModified.find((p) => /download_dart_elestock_pdfs\.py$/i.test(p));
          if (dartRel && !candidates.includes(dartRel)) {
            candidates.unshift(dartRel);
          }
        }

        for (const rel of candidates) {
          const abs = path.join(root, rel);
          if (!fs.existsSync(abs)) continue;
          const args = isDartPdfTask(task) && /download_dart/i.test(rel) ? inferDartScriptArgs(task) : '';
          const run = await runScriptFile(this.workspace, abs, args, 300000);
          outputs.push(this.formatRun(run));
        }
      }
    }

    const npmKind = shouldRunExplicitNpmCommand(task);
    if (npmKind) {
      const command =
        npmKind === 'build' ? 'npm run build' : npmKind === 'lint' ? 'npm run lint' : 'npm test';
      const result = await this.workspace.executeTerminal(command, 120000);
      outputs.push(
        `Command: ${command}\nExit: ${result.exitCode}\n${result.stdout}\n${result.stderr}`.slice(
          0,
          3000
        )
      );
    }

    return outputs.length ? outputs.join('\n\n---\n\n').slice(0, 6000) : undefined;
  }

  private formatRun(run: ScriptRunResult): string {
    const lines = [
      `Command: ${run.command}`,
      `Exit: ${run.exitCode}`,
      run.stdout.trim(),
      run.stderr.trim() ? `stderr: ${run.stderr.trim()}` : '',
    ].filter(Boolean);
    return lines.join('\n').slice(0, 4000);
  }
}
