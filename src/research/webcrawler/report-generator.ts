import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../../agent-folders';
import { WorkspaceEngine } from '../../workspace';
import { Agent } from '../../types';
import { ExtractedContent, ResearchReport } from '../types';
import { now } from '../../utils';

export class ReportGenerator {
  constructor(
    private workspace: WorkspaceEngine,
    private agentFolders?: AgentFolderEngine
  ) {}

  buildMarkdown(
    query: string,
    summary: string,
    contents: ExtractedContent[],
    downloadedFiles?: ResearchReport['downloadedFiles'],
    agentName = 'Research Agent'
  ): string {
    const date = new Date().toISOString().slice(0, 10);
    const sources = contents
      .map(
        (c, i) =>
          `${i + 1}. **[${c.title}](${c.url})**\n   > ${c.text.slice(0, 200)}...`
      )
      .join('\n');

    const downloadsSection =
      downloadedFiles && downloadedFiles.length > 0
        ? downloadedFiles
            .map(
              (f, i) =>
                `${i + 1}. **${f.filename}** (\`${f.path}\`, ${this.formatSize(f.size)})\n   - Source: ${f.url}`
            )
            .join('\n')
        : '_No files downloaded_';

    return `# Research Report

**Query:** ${query}  
**Date:** ${date}  
**Agent:** ${agentName}  
**Engine:** Crawl4AI + multi-query OSINT pipeline

---

## Summary

${summary}

---

## Downloaded Files

${downloadsSection}

---

## Sources

${sources || '_No sources collected_'}

---

## Pipeline

\`\`\`
Research Agent
      │
      ▼
WebCrawler Agent
      │
      ├── Research Planner (LLM + Knowledge)
      ├── Search Engine (multi-query + fallback)
      ├── Known Sources Registry
      ├── Browser Engine (Crawl4AI → Jina → Fetch)
      ├── Extractor + Summarizer (cross-verify)
      └── Report Generator
\`\`\`

---
_Powered by [Crawl4AI](https://github.com/unclecode/crawl4ai) architecture_
`;
  }

  async saveReport(
    query: string,
    summary: string,
    contents: ExtractedContent[],
    agent: Agent,
    downloadedFiles?: ResearchReport['downloadedFiles']
  ): Promise<ResearchReport> {
    const markdown = this.buildMarkdown(query, summary, contents, downloadedFiles, agent.name);
    const slug = query
      .slice(0, 40)
      .replace(/[^\w가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const filename = `${now().slice(0, 10)}-${slug || 'report'}.md`;
    const agentRelative = `${AGENT_FOLDER_LAYOUT.outputReports}/${filename}`;
    const legacyFilename = `research/reports/${filename}`;

    let reportPath: string | undefined;
    if (this.agentFolders) {
      const agentSlug = this.agentFolders.resolveSlug(agent);
      reportPath = (await this.agentFolders.writeText(agentSlug, agentRelative, markdown)) ?? undefined;
    } else {
      reportPath = (await this.workspace.createFile(legacyFilename, markdown)) ? legacyFilename : undefined;
    }

    return {
      query,
      summary,
      sources: contents.map((c) => ({
        title: c.title,
        url: c.url,
        excerpt: c.text.slice(0, 300),
      })),
      markdown,
      reportPath,
      downloadedFiles,
    };
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
