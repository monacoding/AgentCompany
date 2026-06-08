import { AgentFolderEngine } from '../agent-folders';
import { KnowledgeLearner } from '../agent-folders/knowledge-learner';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { Agent } from '../types';
import { WorkspaceEngine } from '../workspace';
import { Crawl4AiDockerService } from './docker/crawl4ai-docker';
import { ResearchPipelineStep, ResearchReport, ResearchRunOptions } from './types';
import { ReportGenerator } from './webcrawler/report-generator';
import { WebCrawlerAgent } from './webcrawler';

export class ResearchAgent {
  private webCrawler: WebCrawlerAgent;

  constructor(
    private memory: MemoryEngine,
    providers: ProviderEngine,
    workspace: WorkspaceEngine,
    agentFolders?: AgentFolderEngine,
    private knowledgeLearner?: KnowledgeLearner,
    crawl4aiDocker?: Crawl4AiDockerService
  ) {
    const reportGenerator = new ReportGenerator(workspace, agentFolders);
    this.webCrawler = new WebCrawlerAgent(
      workspace,
      providers,
      reportGenerator,
      agentFolders,
      knowledgeLearner,
      crawl4aiDocker
    );
  }

  async execute(
    query: string,
    agent: Agent,
    taskId: string | null,
    onStep?: (step: ResearchPipelineStep) => void,
    options?: ResearchRunOptions
  ): Promise<ResearchReport> {
    this.memory.logActivity(agent.id, taskId, `${agent.name} Research Agent started: "${query}"`);

    const report = await this.webCrawler.run(query, agent, (step) => {
      this.memory.logActivity(
        agent.id,
        taskId,
        `[${step.step}] ${step.status}: ${step.message}`
      );
      onStep?.(step);
    }, options);

    this.memory.appendAgentMemory(
      agent.id,
      `[Research: ${query}]\n${report.summary.slice(0, 500)}`
    );

    if (report.downloadedFiles && report.downloadedFiles.length > 0) {
      const paths = report.downloadedFiles.map((f) => f.path).join(', ');
      this.memory.appendAgentMemory(
        agent.id,
        `[Download success: ${query}]\nSaved: ${paths}`
      );
    }

    return report;
  }
}

export { isResearchAgent, isResearchTaskQuery, isWonyoungAgent, WONYOUNG_AGENT } from './types';
export type { ResearchReport, ResearchPipelineStep, ResearchRunOptions, CrawlEngineMode } from './types';
