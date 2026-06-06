import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../agent-folders';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { Agent } from '../types';
import { WorkspaceEngine } from '../workspace';
import { WorkspaceActionExecutor } from '../workspace/action-executor';
import { KiloCliAdapter } from './adapters/kilo-cli';
import { CodePlanner } from './engine/code-planner';
import { FileEditor } from './engine/file-editor';
import { KiloReportGenerator } from './engine/report-generator';
import { SelfChecker } from './engine/self-checker';
import { TerminalRunner } from './engine/terminal-runner';
import {
  KILO_MODES,
  KiloExecutionResult,
  KiloPipelineStep,
  detectKiloMode,
} from './types';
import { now } from '../utils';

export class KiloAgent {
  private cli: KiloCliAdapter;
  private planner: CodePlanner;
  private fileEditor: FileEditor;
  private terminal: TerminalRunner;
  private selfChecker: SelfChecker;
  private reportGenerator: KiloReportGenerator;

  constructor(
    private memory: MemoryEngine,
    providers: ProviderEngine,
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine
  ) {
    this.cli = new KiloCliAdapter(workspace);
    this.planner = new CodePlanner(providers);
    this.fileEditor = new FileEditor(providers, new WorkspaceActionExecutor(workspace, memory));
    this.terminal = new TerminalRunner(workspace);
    this.selfChecker = new SelfChecker(providers);
    this.reportGenerator = new KiloReportGenerator(workspace, agentFolders);
  }

  async execute(
    task: string,
    agent: Agent,
    taskId: string | null,
    onStep?: (step: KiloPipelineStep) => void
  ): Promise<KiloExecutionResult> {
    const emit = (step: string, status: KiloPipelineStep['status'], message: string) => {
      onStep?.({ step, status, message });
      this.memory.logActivity(agent.id, taskId, `[Kilo ${step}] ${status}: ${message}`);
    };

    emit('Mode Router', 'running', 'Detecting mode...');
    const mode = detectKiloMode(task);
    emit('Mode Router', 'done', `${KILO_MODES[mode].label} mode selected`);

    emit('Kilo CLI', 'running', 'Checking Kilo CLI...');
    const cliAvailable = await this.cli.isAvailable();
    if (cliAvailable && mode === 'coder') {
      const cliResult = await this.cli.execute(task);
      if (cliResult) {
        emit('Kilo CLI', 'done', 'Executed via kilo run');
        cliResult.reportPath = await this.reportGenerator.save(task, cliResult, agent);
        this.memory.appendAgentMemory(agent.id, `[Kilo CLI: ${task}]\n${cliResult.output.slice(0, 500)}`);
        return cliResult;
      }
      emit('Kilo CLI', 'done', 'CLI failed — falling back to internal engine');
    } else {
      emit(
        'Kilo CLI',
        'done',
        cliAvailable ? 'Skipped for non-coder mode' : 'CLI not installed — internal engine'
      );
    }

    const context = await this.gatherContext(task);

    emit('Code Planner', 'running', 'Planning...');
    const plan = await this.planner.plan(task, mode, context, agent);
    emit('Code Planner', 'done', `${plan.steps.length} steps planned`);

    if (mode === 'architect') {
      const architectMarkdown = `# Kilo Architect Plan

**Agent:** ${agent.name}  
**Task:** ${task}  
**Date:** ${now().slice(0, 10)}

## Objective
${plan.objective}

## Steps
${plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Files
${plan.filesToModify.map((f) => `- ${f}`).join('\n') || '_TBD_'}
`;
      const slug = task.slice(0, 30).replace(/[^\w가-힣]+/g, '-').toLowerCase();
      const planFilename = `${now().slice(0, 10)}-${slug || 'plan'}.md`;
      const agentRelative = `${AGENT_FOLDER_LAYOUT.outputPlans}/${planFilename}`;
      let reportPath: string | undefined;

      if (this.agentFolders) {
        const agentSlug = this.agentFolders.resolveSlug(agent);
        reportPath =
          (await this.agentFolders.writeText(agentSlug, agentRelative, architectMarkdown)) ?? undefined;
      } else {
        const legacyPath = `kilo/plans/${planFilename}`;
        reportPath = (await this.workspace.createFile(legacyPath, architectMarkdown))
          ? legacyPath
          : undefined;
      }

      const result: KiloExecutionResult = {
        mode,
        plan,
        output: plan.steps.join('\n'),
        filesModified: [],
        selfCheckPassed: true,
        reportPath,
        usedCli: false,
      };
      this.memory.appendAgentMemory(agent.id, `[Architect: ${task}]\n${plan.objective}`);
      return result;
    }

    emit('File Editor', 'running', 'Generating code...');
    const { summary, filesModified } = await this.fileEditor.generateAndApply(
      task,
      plan,
      context,
      agent,
      agent.id,
      taskId ?? ''
    );
    emit('File Editor', 'done', `${filesModified.length} files modified`);

    emit('Terminal Runner', 'running', 'Checking terminal...');
    const terminalOutput = await this.terminal.runIfNeeded(task);
    emit('Terminal Runner', 'done', terminalOutput ? 'Command executed' : 'Skipped');

    emit('Self-Checker', 'running', 'Reviewing work...');
    const check = await this.selfChecker.check(task, summary, filesModified, terminalOutput, agent);
    emit('Self-Checker', 'done', check.passed ? 'Passed' : `Issues: ${check.feedback}`);

    const result: KiloExecutionResult = {
      mode,
      plan,
      output: `${summary}\n\nSelf-check: ${check.feedback}`,
      filesModified,
      terminalOutput,
      selfCheckPassed: check.passed,
      usedCli: false,
    };

    result.reportPath = await this.reportGenerator.save(task, result, agent);
    this.memory.appendAgentMemory(agent.id, `[Kilo ${mode}: ${task}]\n${summary.slice(0, 500)}`);
    return result;
  }

  private async gatherContext(taskTitle: string): Promise<string> {
    const keywords = taskTitle
      .replace(/\[.*?\]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 4);

    const lines: string[] = [];
    for (const keyword of keywords) {
      const hits = await this.workspace.searchProject(keyword, 5);
      for (const hit of hits) {
        lines.push(`${hit.file}:${hit.line} — ${hit.text}`);
      }
    }

    if (lines.length === 0) {
      const root = this.workspace.getWorkspaceRoot();
      const pkg = root ? await this.workspace.readFile('package.json') : null;
      if (pkg) lines.push('package.json found in workspace');
    }

    return lines.slice(0, 20).join('\n') || 'No relevant files found';
  }
}

export { isDevTaskQuery, isKiloAgent, isMonaAgent, MONA_AGENT, detectKiloMode, KILO_MODES } from './types';
export type { KiloExecutionResult, KiloMode, KiloPipelineStep } from './types';
export { KiloCliService } from './services/kilo-cli-service';
