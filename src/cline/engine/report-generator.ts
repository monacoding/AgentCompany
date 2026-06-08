import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../../agent-folders';
import { WorkspaceEngine } from '../../workspace';
import { Agent } from '../../types';
import { ClineExecutionResult } from '../types';
import { now } from '../../utils';

export class ClineReportGenerator {
  constructor(
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  buildMarkdown(task: string, result: ClineExecutionResult, agentName: string): string {
    return `# Cline Development Report

**Agent:** ${agentName}  
**Task:** ${task}  
**Mode:** ${result.mode}  
**Engine:** ${result.usedCli ? 'Cline CLI' : 'Internal Cline Engine'}  
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

**Self-check:** ${result.selfCheckPassed ? 'Passed' : 'Issues found'}

---

## Architecture

\`\`\`
하정우 (개발자)
      │
      ▼
Cline Engine
      ├── Cline CLI (headless -y) — 우선
      ├── Internal Engine — CLI 미설치 시
      │     ├── Code Planner
      │     ├── File Editor
      │     ├── Terminal Runner
      │     └── Self-Checker
      └── Collaboration Context (다른 에이전트 산출물)
\`\`\`

_Powered by [Cline](https://github.com/cline/cline)_
`;
  }

  async save(task: string, result: ClineExecutionResult, agent: Agent): Promise<string | undefined> {
    const markdown = this.buildMarkdown(task, result, agent.name);
    const slug = task.slice(0, 40).replace(/[^\w가-힣]+/g, '-').toLowerCase();
    const filename = `${now().slice(0, 10)}-${slug || 'report'}.md`;
    const agentRelative = `${AGENT_FOLDER_LAYOUT.outputReports}/${filename}`;

    if (this.agentFolders) {
      const agentSlug = this.agentFolders.resolveSlug(agent);
      return (await this.agentFolders.writeText(agentSlug, agentRelative, markdown)) ?? undefined;
    }

    const legacyPath = `cline/reports/${filename}`;
    return (await this.workspace.createFile(legacyPath, markdown)) ? legacyPath : undefined;
  }
}
