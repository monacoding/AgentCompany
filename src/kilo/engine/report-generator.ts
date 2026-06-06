import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../../agent-folders';
import { WorkspaceEngine } from '../../workspace';
import { Agent } from '../../types';
import { KiloExecutionResult } from '../types';
import { now } from '../../utils';

export class KiloReportGenerator {
  constructor(
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  buildMarkdown(task: string, result: KiloExecutionResult, agentName: string): string {
    return `# Kilo Code Report

**Agent:** ${agentName}  
**Task:** ${task}  
**Mode:** ${result.mode}  
**Engine:** ${result.usedCli ? 'Kilo CLI' : 'Internal Kilo Engine'}  
**Date:** ${now().slice(0, 10)}

---

## Objective

${result.plan.objective}

## Plan Steps

${result.plan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

## Output

${result.output}

---

## Files Modified

${result.filesModified.map((f) => `- \`${f}\``).join('\n') || '_None_'}

${result.terminalOutput ? `\n## Terminal\n\`\`\`\n${result.terminalOutput}\n\`\`\`` : ''}

**Self-check:** ${result.selfCheckPassed ? '✅ Passed' : '⚠️ Issues found'}

---

## Architecture

\`\`\`
Coding Agent (모나)
      │
      ▼
Kilo Engine
      ├── Mode Router (Architect / Coder / Debugger)
      ├── Code Planner
      ├── File Editor
      ├── Terminal Runner
      ├── Self-Checker
      └── Kilo CLI Adapter (optional)
\`\`\`

---
_Powered by [Kilo Code](https://github.com/kilo-org/kilocode)_
`;
  }

  async save(task: string, result: KiloExecutionResult, agent: Agent): Promise<string | undefined> {
    const markdown = this.buildMarkdown(task, result, agent.name);
    const slug = task
      .slice(0, 40)
      .replace(/[^\w가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const filename = `${now().slice(0, 10)}-${slug || 'report'}.md`;
    const agentRelative = `${AGENT_FOLDER_LAYOUT.outputReports}/${filename}`;
    const legacyFilename = `kilo/reports/${filename}`;

    if (this.agentFolders) {
      const agentSlug = this.agentFolders.resolveSlug(agent);
      return (await this.agentFolders.writeText(agentSlug, agentRelative, markdown)) ?? undefined;
    }
    return (await this.workspace.createFile(legacyFilename, markdown)) ? legacyFilename : undefined;
  }
}
