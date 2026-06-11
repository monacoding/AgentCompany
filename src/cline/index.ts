import { AgentFolderEngine } from '../agent-folders';
import { KnowledgeLearner } from '../agent-folders/knowledge-learner';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { Agent } from '../types';
import { WorkspaceEngine } from '../workspace';
import { ClineCliAdapter } from './adapters/cline-cli';
import { buildCollaborationPromptBlock } from './collaboration-context';
import { isDartPdfTask, runDartPdfPipeline } from './engine/dart-pdf-runner';
import { ClineInternalEngine } from './engine/internal-engine';
import { ClineReportGenerator } from './engine/report-generator';
import {
  CLINE_MODES,
  ClineExecutionResult,
  ClinePipelineStep,
  detectClineMode,
} from './types';

export class ClineAgent {
  private cli: ClineCliAdapter;
  private internal: ClineInternalEngine;
  private reportGenerator: ClineReportGenerator;

  constructor(
    private memory: MemoryEngine,
    providers: ProviderEngine,
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine,
    _knowledgeLearner?: KnowledgeLearner
  ) {
    this.cli = new ClineCliAdapter(workspace);
    this.internal = new ClineInternalEngine(memory, providers, workspace, agentFolders);
    this.reportGenerator = new ClineReportGenerator(workspace, agentFolders);
  }

  async execute(
    task: string,
    agent: Agent,
    taskId: string | null,
    onStep?: (step: ClinePipelineStep) => void,
    options?: { priorContext?: string }
  ): Promise<ClineExecutionResult> {
    const emit = (step: string, status: ClinePipelineStep['status'], message: string) => {
      onStep?.({ step, status, message });
      this.memory.logActivity(agent.id, taskId, `[Cline ${step}] ${status}: ${message}`);
    };

    const priorContext = options?.priorContext;
    const collabBlock = buildCollaborationPromptBlock(priorContext);
    const enrichedTask = collabBlock
      ? `${task}\n\n${collabBlock}`
      : task;

    const mode = detectClineMode(task);
    emit('Mode Router', 'running', 'Detecting mode...');
    emit('Mode Router', 'done', `${CLINE_MODES[mode].label} mode selected`);

    if (mode !== 'plan') {
      emit('DART PDF Runner', 'running', 'Checking bundled DART script...');
      const dartOutcome = await runDartPdfPipeline(this.workspace, agent, task);
      if (dartOutcome?.success) {
        emit('DART PDF Runner', 'done', `${dartOutcome.pdfFiles.length} PDF files created`);
        const dartResult: ClineExecutionResult = {
          mode,
          plan: {
            mode,
            objective: task,
            steps: ['Run download_dart_elestock_pdfs.py'],
            filesToModify: [],
          },
          output: dartOutcome.summary,
          filesModified: [],
          terminalOutput: `Command: ${dartOutcome.command}\nExit: ${dartOutcome.exitCode}\n${dartOutcome.stdout}`,
          selfCheckPassed: true,
          usedCli: false,
        };
        dartResult.reportPath = await this.reportGenerator.save(task, dartResult, agent);
        this.memory.appendAgentMemory(
          agent.id,
          `[Cline DART: ${task}]\n${dartOutcome.summary.slice(0, 500)}`
        );
        return dartResult;
      }
      if (dartOutcome && !dartOutcome.success) {
        emit('DART PDF Runner', 'failed', dartOutcome.summary.slice(0, 200));
        const failedResult: ClineExecutionResult = {
          mode,
          plan: {
            mode,
            objective: task,
            steps: ['Run download_dart_elestock_pdfs.py'],
            filesToModify: [],
          },
          output: dartOutcome.summary,
          filesModified: [],
          terminalOutput: `Command: ${dartOutcome.command}\nExit: ${dartOutcome.exitCode}\n${dartOutcome.stderr || dartOutcome.stdout}`,
          selfCheckPassed: false,
          usedCli: false,
        };
        failedResult.reportPath = await this.reportGenerator.save(task, failedResult, agent);
        this.memory.appendAgentMemory(agent.id, `[Cline DART failed: ${task}]\n${dartOutcome.summary.slice(0, 400)}`);
        return failedResult;
      }
      emit('DART PDF Runner', 'done', 'Not a DART PDF task');
    }

    emit('Cline CLI', 'running', 'Checking Cline CLI...');
    const cliAvailable = await Promise.race([
      this.cli.isAvailable(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 8000)),
    ]);

    if (cliAvailable && mode !== 'plan' && !isDartPdfTask(task)) {
      const cliResult = await this.cli.execute(enrichedTask, priorContext);
      if (cliResult) {
        emit('Cline CLI', 'done', 'Executed via cline -y');
        cliResult.reportPath = await this.reportGenerator.save(task, cliResult, agent);
        this.memory.appendAgentMemory(agent.id, `[Cline CLI: ${task}]\n${cliResult.output.slice(0, 500)}`);
        return cliResult;
      }
      emit('Cline CLI', 'done', 'CLI failed — falling back to internal engine');
    } else {
      emit(
        'Cline CLI',
        'done',
        cliAvailable ? 'Skipped for plan mode' : 'CLI not installed — internal engine'
      );
    }

    const result = await this.internal.execute(task, agent, taskId, priorContext, onStep);
    result.reportPath = await this.reportGenerator.save(task, result, agent);
    this.memory.appendAgentMemory(agent.id, `[Cline ${result.mode}: ${task}]\n${result.output.slice(0, 500)}`);
    return result;
  }
}

export {
  isClineAgent,
  isClineDevTask,
  isHaJeongWooAgent,
  stripLegacyKiloCapabilities,
  detectClineMode,
  CLINE_MODES,
  getClineCapabilities,
} from './types';
export type { ClineExecutionResult, ClineMode, ClinePipelineStep } from './types';
export { ClineCliService } from './services/cline-cli-service';
export {
  CLINE_KNOWLEDGE_MARKER,
  CLINE_KNOWLEDGE_FILENAME,
  getClineKnowledgeBody,
  getClineKnowledgeSummary,
  getClinerulesBody,
} from './cline-knowledge';
export { buildCollaborationPromptBlock, isCollaborativeDevTask } from './collaboration-context';
