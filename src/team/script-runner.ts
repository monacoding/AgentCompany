import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceEngine } from '../workspace';
import { getProjectWarehouseDir } from './project-artifacts';

export interface ScriptRunResult {
  scriptPath: string;
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

const SCRIPT_EXT = new Set(['.py', '.sh', '.bash']);

/** LLM·Kilo 산출물 중 실행 가능한 스크립트 경로 */
export function filterRunnableScriptPaths(relativePaths: string[]): string[] {
  return relativePaths.filter((p) => SCRIPT_EXT.has(path.extname(p).toLowerCase()));
}

function buildRunCommand(absPath: string, workspaceRoot: string): string {
  const ext = path.extname(absPath).toLowerCase();
  const quoted = `"${absPath}"`;
  if (ext === '.py') {
    return `python3 ${quoted}`;
  }
  if (ext === '.sh' || ext === '.bash') {
    return `bash ${quoted}`;
  }
  return quoted;
}

function inferScriptArgs(command: string, warehouseFolder: string): string {
  const lower = command.toLowerCase();
  const args: string[] = [];

  if (/수능|suneung|기출|pdf/i.test(lower)) {
    const yearMatch = command.match(/(20\d{2})\s*(?:~|~|부터|-)\s*(20\d{2})/);
    const rangeMatch = command.match(/(20\d{2})\s*~\s*(20\d{2})/);
    const singleYear = command.match(/(20\d{2})\s*학년도/);
    let years = '2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026';
    const rm = yearMatch ?? rangeMatch;
    if (rm) {
      const start = Number(rm[1]);
      const end = Number(rm[2]);
      years = Array.from({ length: end - start + 1 }, (_, i) => String(start + i)).join(',');
    } else if (singleYear) {
      years = singleYear[1];
    } else if (/2000/.test(command) && /2010/.test(command)) {
      years = Array.from({ length: 11 }, (_, i) => String(2000 + i)).join(',');
    } else if (/2010/.test(command) && /2020/.test(command)) {
      years = Array.from({ length: 11 }, (_, i) => String(2010 + i)).join(',');
    } else if (/2014/.test(command) && /2020/.test(command)) {
      years = Array.from({ length: 7 }, (_, i) => String(2014 + i)).join(',');
    }

    const subjects =
      /국어/.test(command) && /수학/.test(command)
        ? '국어,수학'
        : /국어/.test(command)
          ? '국어'
          : /수학/.test(command)
            ? '수학'
            : '국어,수학,영어';
    const outDir = path.posix.join('company', 'projects', warehouseFolder, 'files', 'pdfs');
    args.push('--out', outDir, '--subjects', subjects, '--years', years);
  }

  return args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ');
}

export async function runScriptFile(
  workspace: WorkspaceEngine,
  absolutePath: string,
  extraArgs = '',
  timeoutMs = 180000
): Promise<ScriptRunResult> {
  const baseCmd = buildRunCommand(absolutePath, workspace.getWorkspaceRoot() ?? '');
  const command = extraArgs ? `${baseCmd} ${extraArgs}` : baseCmd;

  const result = await workspace.executeTerminal(command, timeoutMs);
  return {
    scriptPath: absolutePath,
    command,
    exitCode: result.exitCode,
    stdout: result.stdout.slice(0, 8000),
    stderr: result.stderr.slice(0, 4000),
    success: result.exitCode === 0,
  };
}

export async function runProjectScripts(
  workspace: WorkspaceEngine,
  companyDir: string,
  warehouseFolder: string,
  extractedRelativePaths: string[],
  ceoCommand: string
): Promise<{ results: ScriptRunResult[]; producedFiles: string[] }> {
  const warehouse = getProjectWarehouseDir(companyDir, warehouseFolder);
  const workspaceRoot = workspace.getWorkspaceRoot();
  if (!workspaceRoot) {
    return { results: [], producedFiles: [] };
  }

  const scripts = filterRunnableScriptPaths(extractedRelativePaths);
  const results: ScriptRunResult[] = [];
  const producedFiles: string[] = [];

  for (const rel of scripts) {
    const abs = path.join(companyDir, rel);
    if (!fs.existsSync(abs)) continue;

    const args = inferScriptArgs(ceoCommand, warehouseFolder);
    const run = await runScriptFile(workspace, abs, args);
    results.push(run);

    if (run.success) {
      const pdfsDir = path.join(warehouse, 'files', 'pdfs');
      if (fs.existsSync(pdfsDir)) {
        for (const f of collectFilesRecursive(pdfsDir)) {
          producedFiles.push(path.relative(companyDir, f).replace(/\\/g, '/'));
        }
      }
    }
  }

  return { results, producedFiles };
}

/** 수능 PDF — 번들 템플릿 스크립트 직접 실행 */
export async function runBundledSuneungDownload(
  workspace: WorkspaceEngine,
  companyDir: string,
  warehouseFolder: string,
  ceoCommand: string,
  templateAbsPath: string
): Promise<{ results: ScriptRunResult[]; producedFiles: string[] }> {
  const warehouseFiles = path.join(getProjectWarehouseDir(companyDir, warehouseFolder), 'files');
  const scriptsDir = path.join(warehouseFiles, 'scripts');
  const pdfsDir = path.join(warehouseFiles, 'pdfs');
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.mkdirSync(pdfsDir, { recursive: true });

  const dest = path.join(scriptsDir, 'download_suneung_pdfs.py');
  if (fs.existsSync(templateAbsPath)) {
    fs.copyFileSync(templateAbsPath, dest);
  }

  const rel = path.relative(companyDir, dest).replace(/\\/g, '/');
  return runProjectScripts(workspace, companyDir, warehouseFolder, [rel], ceoCommand);
}

function collectFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFilesRecursive(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

export function formatScriptRunSummary(results: ScriptRunResult[]): string {
  if (results.length === 0) return '';
  const lines = ['\n\n## ⚙️ 프로그램 실행 결과'];
  for (const r of results) {
    lines.push(`\n### \`${path.basename(r.scriptPath)}\``);
    lines.push(`- 명령: \`${r.command}\``);
    lines.push(`- 종료 코드: ${r.exitCode} ${r.success ? '✅' : '❌'}`);
    if (r.stdout.trim()) {
      lines.push('```');
      lines.push(r.stdout.trim().slice(-2000));
      lines.push('```');
    }
    if (!r.success && r.stderr.trim()) {
      lines.push(`stderr: ${r.stderr.trim().slice(0, 500)}`);
    }
  }
  return lines.join('\n');
}
