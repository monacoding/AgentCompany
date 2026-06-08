import { AgentFolderEngine } from '../agent-folders';
import { formatChatReply, formatResearchChatReply } from '../chat/reply-format';
import { isExternalResourceFetchTask } from '../chat/cross-agent-file';
import { KiloAgent, isDevTaskQuery, isKiloAgent } from '../kilo';
import { ProviderEngine } from '../providers';
import { ResearchAgent, isResearchAgent, isResearchTaskQuery } from '../research';
import { Agent, ProjectTask } from '../types';
import { formatAgentLabel } from '../utils/agent-display';
import { WorkspaceEngine } from '../workspace';
import { buildWorkerPhasePrompt } from './phase-prompts';
import { buildWorkerToolingHint, extractAndSaveProjectFiles } from './project-tooling';
import {
  formatScriptRunSummary,
  runBundledSuneungDownload,
  runProjectScripts,
} from './script-runner';

export interface ProjectWorkerDeps {
  workspace: WorkspaceEngine;
  research?: ResearchAgent;
  kilo?: KiloAgent;
}

/** 코드·스크립트·다운로드 등 실제 프로그램 실행이 필요한 업무 */
export function needsProgramExecution(command: string, taskDescription: string): boolean {
  const text = `${command} ${taskDescription}`.trim();
  if (!text) return false;
  return (
    isExternalResourceFetchTask(text) ||
    isResearchTaskQuery(text) ||
    isDevTaskQuery(text) ||
    /구현|자동화|스크립트|실행|다운|download|python|curl|저장|수집|크롤|배포|빌드/i.test(text)
  );
}

function isSuneungPdfTask(command: string, taskDescription: string): boolean {
  const text = `${command} ${taskDescription}`;
  return /수능|기출|suneung/i.test(text) && /pdf|다운/i.test(text);
}

async function executeViaResearch(
  agent: Agent,
  command: string,
  task: ProjectTask,
  deps: ProjectWorkerDeps
): Promise<string | null> {
  if (!deps.research || !isResearchAgent(agent)) return null;
  const query = `${command}\n${task.description}`.trim();
  if (!isResearchTaskQuery(query)) return null;

  const report = await deps.research.execute(query, agent, null);
  const output =
    formatResearchChatReply(report.summary, {
      reportPath: report.reportPath,
      sources: report.sources.map((s) => ({ title: s.title, url: s.url })),
      downloadedFiles: report.downloadedFiles?.map((f) => ({
        path: f.path,
        filename: f.filename,
      })),
      knownSourceNote: report.knownSourceNote,
    }) + '\n\nFINISHED';
  return output;
}

async function executeViaKilo(
  agent: Agent,
  command: string,
  task: ProjectTask,
  priorContext: string,
  deps: ProjectWorkerDeps
): Promise<string | null> {
  if (!deps.kilo || !isKiloAgent(agent)) return null;
  const query = [
    command,
    task.description,
    priorContext ? `이전 산출물:\n${priorContext.slice(0, 1500)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!needsProgramExecution(command, task.description)) return null;

  const result = await deps.kilo.execute(query, agent, null);
  let output = result.output;
  if (result.terminalOutput) {
    output += `\n\n## 터미널\n${result.terminalOutput}`;
  }
  if (result.filesModified.length) {
    output += `\n\n## 수정 파일\n${result.filesModified.map((f) => `- ${f}`).join('\n')}`;
  }
  if (result.selfCheckPassed || result.output.includes('FINISHED')) {
    output += '\n\nFINISHED';
  }
  return output;
}

async function executeViaLlm(
  agent: Agent,
  command: string,
  plan: string,
  task: ProjectTask,
  priorContext: string,
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  revision?: { previousOutput: string; feedback: string }
): Promise<string> {
  const folderContext = await agentFolders.buildPromptContext(agent);
  const toolingHint = buildWorkerToolingHint(agent);
  const userContent = buildWorkerPhasePrompt(
    agent,
    command,
    plan,
    task.description,
    priorContext,
    toolingHint,
    revision
  );

  const response = await providers.chat(
    agent.provider,
    [
      {
        role: 'system',
        content: `You are ${formatAgentLabel(agent)} executing ONE project task.
${folderContext}

Rules:
- Korean, concise, deliverable-focused
- **프로그램·스크립트를 작성하면 자동 실행됩니다** — filepath 블록으로 .py/.sh 저장 필수
- 다운로드·수집 업무는 실행 가능한 Python 스크립트를 반드시 포함
- 완료 시 마지막 줄에 FINISHED`,
      },
      { role: 'user', content: userContent },
    ],
    { type: agent.provider, model: agent.model }
  );

  return formatChatReply(response.content || '') || response.content.trim() || '완료';
}

export interface WorkerExecutionResult {
  output: string;
  extractedFiles: string[];
  executedArtifacts: string[];
}

export async function executeProjectWorkerTask(
  agent: Agent,
  command: string,
  plan: string,
  task: ProjectTask,
  priorContext: string,
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  deps: ProjectWorkerDeps,
  options: {
    companyDir: string;
    sessionId: string;
    warehouseFolder: string;
    templateScriptPath?: string;
  },
  revision?: { previousOutput: string; feedback: string }
): Promise<WorkerExecutionResult> {
  const folder = options.warehouseFolder || options.sessionId;

  if (
    isSuneungPdfTask(command, task.description) &&
    options.templateScriptPath &&
    deps.workspace.getWorkspaceRoot()
  ) {
    const bundled = await runBundledSuneungDownload(
      deps.workspace,
      options.companyDir,
      folder,
      command,
      options.templateScriptPath
    );
    if (bundled.producedFiles.length > 0) {
      const scriptRel = `projects/${folder}/files/scripts/download_suneung_pdfs.py`;
      const runSummary = formatScriptRunSummary(bundled.results);
      const output = [
        `평가원 공식 사이트(suneung.re.kr)에서 PDF ${bundled.producedFiles.length}개 다운로드 완료.`,
        '※ 2014년 이전 기출은 평가원 공식 게시판에 없을 수 있습니다.',
        runSummary,
        '',
        'FINISHED',
      ].join('\n');
      return {
        output: output.slice(0, 6000),
        extractedFiles: [scriptRel, ...bundled.producedFiles],
        executedArtifacts: bundled.producedFiles,
      };
    }
  }

  let output =
    (await executeViaResearch(agent, command, task, deps)) ??
    (await executeViaKilo(agent, command, task, priorContext, deps)) ??
    (await executeViaLlm(agent, command, plan, task, priorContext, providers, agentFolders, revision));

  let extractedFiles = extractAndSaveProjectFiles(options.companyDir, folder, output);
  let scriptResults = await runProjectScripts(
    deps.workspace,
    options.companyDir,
    folder,
    extractedFiles,
    command
  );

  if (
    scriptResults.results.length === 0 &&
    isSuneungPdfTask(command, task.description) &&
    options.templateScriptPath
  ) {
    scriptResults = await runBundledSuneungDownload(
      deps.workspace,
      options.companyDir,
      folder,
      command,
      options.templateScriptPath
    );
    const scriptRel = `projects/${folder}/files/scripts/download_suneung_pdfs.py`;
    if (!extractedFiles.includes(scriptRel)) {
      extractedFiles = [...extractedFiles, scriptRel];
    }
  }

  const runSummary = formatScriptRunSummary(scriptResults.results);
  if (runSummary) {
    output += runSummary;
  }

  const produced = [...new Set(scriptResults.producedFiles)];
  if (produced.length > 0) {
    output += `\n\n📁 생성 파일 ${produced.length}개:\n${produced.map((p) => `- company/${p}`).join('\n')}`;
    if (!output.includes('FINISHED') && scriptResults.results.some((r) => r.success)) {
      output += '\n\nFINISHED';
    }
  }

  return {
    output: output.slice(0, 6000),
    extractedFiles,
    executedArtifacts: produced,
  };
}
