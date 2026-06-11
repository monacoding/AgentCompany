import * as fs from 'fs';
import * as path from 'path';
import { resolveAgentSlug } from '../../agent-folders/slug';
import { Agent } from '../../types';
import {
  inferDartScriptArgs,
  isDartPdfTask,
  runScriptFile,
} from '../../team/script-runner';
import { WorkspaceEngine } from '../../workspace';

export { isDartPdfTask };

export interface DartPdfRunOutcome {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  pdfFiles: string[];
  outDir: string;
  summary: string;
}

function collectPdfs(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectPdfs(full));
    } else if (entry.name.toLowerCase().endsWith('.pdf')) {
      out.push(full);
    }
  }
  return out;
}

/** 번들 DART PDF 스크립트 직접 실행 — LLM 코드 생성 없이 PDF까지 완료 */
export async function runDartPdfPipeline(
  workspace: WorkspaceEngine,
  agent: Agent,
  task: string
): Promise<DartPdfRunOutcome | null> {
  if (!isDartPdfTask(task)) return null;

  const root = workspace.getWorkspaceRoot();
  if (!root) return null;

  const slug = resolveAgentSlug(agent);
  const scriptRel = path.join('agent', slug, 'outputs', 'scripts', 'download_dart_elestock_pdfs.py');
  const scriptAbs = path.join(root, scriptRel);

  if (!fs.existsSync(scriptAbs)) {
    return {
      success: false,
      command: '',
      stdout: '',
      stderr: `스크립트 없음: ${scriptRel.replace(/\\/g, '/')}`,
      exitCode: 1,
      pdfFiles: [],
      outDir: '',
      summary: `DART PDF 스크립트를 찾지 못했습니다: ${scriptRel}`,
    };
  }

  const args = inferDartScriptArgs(task);
  const run = await runScriptFile(workspace, scriptAbs, args, 300000);

  const outMatch = args.match(/--out\s+"?([^"\s]+)"?/);
  const outRel = outMatch?.[1] ?? '';
  const outAbs = outRel ? path.join(root, outRel) : '';

  const pdfFiles: string[] = [];
  if (outAbs) {
    for (const f of collectPdfs(outAbs)) {
      pdfFiles.push(path.relative(root, f).replace(/\\/g, '/'));
    }
  }

  const success = run.success && pdfFiles.length > 0;
  const summary = success
    ? [
        `DART PDF ${pdfFiles.length}건 생성 완료.`,
        `저장 경로: ${outRel}`,
        '',
        ...pdfFiles.map((f) => `- ${f}`),
        '',
        run.stdout.trim().slice(-1500),
      ].join('\n')
    : [
        `DART PDF 실행 실패 (exit ${run.exitCode}).`,
        run.stderr.trim() || run.stdout.trim(),
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, 3000);

  return {
    success,
    command: run.command,
    stdout: run.stdout,
    stderr: run.stderr,
    exitCode: run.exitCode,
    pdfFiles,
    outDir: outRel,
    summary,
  };
}
