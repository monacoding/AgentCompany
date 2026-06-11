import { AgentFolderEngine } from '../../agent-folders';
import { MemoryEngine } from '../../memory';
import { ProviderEngine } from '../../providers';
import { Agent } from '../../types';
import { WorkspaceEngine } from '../../workspace';
import { WorkspaceActionExecutor } from '../../workspace/action-executor';
import { CodePlanner } from './code-planner';
import { FileEditor } from './file-editor';
import { SelfChecker } from './self-checker';
import { runDartPdfPipeline } from './dart-pdf-runner';
import { TerminalRunner } from './terminal-runner';
import { detectDevPlanMode } from './planner-types';
import { buildCollaborationPromptBlock } from '../collaboration-context';
import { buildPlatformStructurePromptBlock } from '../../platform';
import { ClineExecutionResult, ClinePipelineStep, detectClineMode } from '../types';

export class ClineInternalEngine {
  private planner: CodePlanner;
  private fileEditor: FileEditor;
  private terminal: TerminalRunner;
  private selfChecker: SelfChecker;

  constructor(
    private memory: MemoryEngine,
    providers: ProviderEngine,
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine
  ) {
    this.planner = new CodePlanner(providers);
    this.fileEditor = new FileEditor(providers, new WorkspaceActionExecutor(workspace, memory));
    this.terminal = new TerminalRunner(workspace);
    this.selfChecker = new SelfChecker(providers);
  }

  async execute(
    task: string,
    agent: Agent,
    taskId: string | null,
    priorContext?: string,
    onStep?: (step: ClinePipelineStep) => void
  ): Promise<ClineExecutionResult> {
    const emit = (step: string, status: ClinePipelineStep['status'], message: string) => {
      onStep?.({ step, status, message });
      this.memory.logActivity(agent.id, taskId, `[Cline ${step}] ${status}: ${message}`);
    };

    const mode = detectClineMode(task);
    const planMode = detectDevPlanMode(task);
    emit('Mode', 'done', `${mode} mode (internal)`);

    const contextParts: string[] = [];
    if (this.agentFolders) {
      contextParts.push(buildPlatformStructurePromptBlock(this.agentFolders, agent));
      const folderContext = await this.agentFolders.buildPromptContext(agent, { taskHint: task });
      if (folderContext?.trim()) {
        contextParts.push(folderContext);
      }
    }
    const collab = buildCollaborationPromptBlock(priorContext);
    if (collab) contextParts.push(collab);
    const gathered = await this.gatherContext(task);
    if (gathered) contextParts.push(gathered);
    const context = contextParts.join('\n\n');

    emit('Code Planner', 'running', 'Planning...');
    const plan = await this.planner.plan(task, planMode, context, agent);
    emit('Code Planner', 'done', `${plan.steps.length} steps planned`);

    if (mode === 'plan') {
      const planMarkdown = `# Cline Plan\n\n**Objective:** ${plan.objective}\n\n## Steps\n${plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
      return {
        mode,
        plan: { mode, objective: plan.objective, steps: plan.steps, filesToModify: plan.filesToModify },
        output: planMarkdown,
        filesModified: [],
        selfCheckPassed: true,
        usedCli: false,
      };
    }

    emit('DART PDF Runner', 'running', 'Checking bundled DART script...');
    const dartOutcome = await runDartPdfPipeline(this.workspace, agent, task);
    if (dartOutcome?.success) {
      emit('DART PDF Runner', 'done', `${dartOutcome.pdfFiles.length} PDF files created`);
      return {
        mode,
        plan: {
          mode,
          objective: plan.objective,
          steps: ['Run download_dart_elestock_pdfs.py'],
          filesToModify: [],
        },
        output: dartOutcome.summary,
        filesModified: [],
        terminalOutput: `Command: ${dartOutcome.command}\nExit: ${dartOutcome.exitCode}\n${dartOutcome.stdout}`,
        selfCheckPassed: true,
        usedCli: false,
      };
    }
    emit(
      'DART PDF Runner',
      'done',
      dartOutcome ? 'Bundled script failed — continuing with code generation' : 'Not a DART PDF task'
    );

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

    emit('Terminal Runner', 'running', 'Running scripts...');
    const terminalOutput = await this.terminal.runAfterEdit(task, agent, filesModified);
    emit('Terminal Runner', 'done', terminalOutput ? 'Command executed' : 'Skipped');

    emit('Self-Checker', 'running', 'Reviewing work...');
    const check = await this.selfChecker.check(task, summary, filesModified, terminalOutput, agent);
    emit('Self-Checker', 'done', check.passed ? 'Passed' : `Issues: ${check.feedback}`);

    const output = `${summary}\n\nSelf-check: ${check.feedback}`;

    return {
      mode,
      plan: { mode, objective: plan.objective, steps: plan.steps, filesToModify: plan.filesToModify },
      output,
      filesModified,
      terminalOutput,
      selfCheckPassed: check.passed,
      usedCli: false,
    };
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

    return lines.slice(0, 20).join('\n') || '';
  }
}
