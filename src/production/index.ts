import { Agent } from '../types';
import { AgentFolderEngine } from '../agent-folders';
import { KnowledgeLearner } from '../agent-folders/knowledge-learner';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { now } from '../utils';
export { isProductionAgent, isProductionTaskQuery } from './types';

export interface ProductionStepUpdate {
  step: string;
  status: 'running' | 'done' | 'failed';
  message: string;
}

export interface ProductionResult {
  query: string;
  summary: string;
  briefPath?: string;
  scriptPath?: string;
  scenesPath?: string;
}

function slugifyQuery(query) {
  return query.slice(0, 36).replace(/[^\w가-힣]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "project";
}
export class ProductionAgent {
  constructor(
    private memory: MemoryEngine,
    private providers: ProviderEngine,
    private agentFolders: AgentFolderEngine,
    private knowledgeLearner: KnowledgeLearner
  ) {
    this.memory = memory;
    this.providers = providers;
    this.agentFolders = agentFolders;
    this.knowledgeLearner = knowledgeLearner;
  }
  async execute(
    query: string,
    agent: Agent,
    taskId: string,
    onStep?: (update: ProductionStepUpdate) => void
  ): Promise<ProductionResult> {
    const emit = (step, status, message) => {
      onStep?.({ step, status, message });
    };
    this.memory.logActivity(agent.id, taskId, `${agent.name} Production pipeline started: "${query}"`);
    await this.knowledgeLearner.syncAgent(agent, { force: true });
    const folderContext = await this.agentFolders.buildPromptContext(agent);
    const slug = this.agentFolders.resolveSlug(agent);
    const datePrefix = now().slice(0, 10);
    const querySlug = slugifyQuery(query);
    try {
      emit("\uAE30\uD68D", "running", "\uCF58\uD150\uCE20 \uBE0C\uB9AC\uD504 \uC791\uC131 \uC911\u2026");
      const brief = await this.generateBrief(query, agent, folderContext);
      const briefPath = await this.agentFolders.writeText(
        slug,
        `outputs/plans/${datePrefix}-${querySlug}-brief.md`,
        brief
      );
      emit("\uAE30\uD68D", "done", briefPath ? `\uBE0C\uB9AC\uD504 \uC800\uC7A5: ${briefPath}` : "\uBE0C\uB9AC\uD504 \uC791\uC131 \uC644\uB8CC");
      emit("\uB300\uBCF8", "running", "\uB300\uBCF8 \uC791\uC131 \uC911\u2026");
      const script = await this.generateScript(query, agent, brief, folderContext);
      const scriptPath = await this.agentFolders.writeText(
        slug,
        `outputs/plans/${datePrefix}-${querySlug}-script.md`,
        script
      );
      emit("\uB300\uBCF8", "done", scriptPath ? `\uB300\uBCF8 \uC800\uC7A5: ${scriptPath}` : "\uB300\uBCF8 \uC791\uC131 \uC644\uB8CC");
      emit("\uC2A4\uD1A0\uB9AC\uBCF4\uB4DC", "running", "\uC52C JSON \uC0DD\uC131 \uC911\u2026");
      const scenes = await this.generateScenes(query, agent, script, folderContext);
      const scenesPath = await this.agentFolders.writeText(
        slug,
        `outputs/plans/${datePrefix}-${querySlug}-scenes.json`,
        scenes
      );
      emit("\uC2A4\uD1A0\uB9AC\uBCF4\uB4DC", "done", scenesPath ? `\uC52C \uC800\uC7A5: ${scenesPath}` : "\uC52C \uC0DD\uC131 \uC644\uB8CC");
      const summary = [
        "\u2705 \uC601\uC0C1 \uC81C\uC791 \uAE30\uD68D \uC0B0\uCD9C\uBB3C\uC774 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
        briefPath ? `\u{1F4CB} \uBE0C\uB9AC\uD504: ${briefPath}` : "",
        scriptPath ? `\u{1F4DD} \uB300\uBCF8: ${scriptPath}` : "",
        scenesPath ? `\u{1F3AC} \uC52C: ${scenesPath}` : "",
        "",
        "\uB2E4\uC74C \uB2E8\uACC4: \uC774\uBBF8\uC9C0\xB7\uC601\uC0C1\xB7\uC74C\uC131 API \uC5F0\uB3D9 \uB610\uB294 @\uD558\uC815\uC6B0 \uC5D0\uAC8C \uC790\uB3D9\uD654 \uC2A4\uD06C\uB9BD\uD2B8 \uAD6C\uD604\uC744 \uC694\uCCAD\uD558\uC138\uC694."
      ].filter(Boolean).join("\n");
      this.memory.appendAgentMemory(agent.id, `[Production: ${query}]
${summary.slice(0, 500)}`);
      return { query, summary, briefPath, scriptPath, scenesPath };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      emit("\uD30C\uC774\uD504\uB77C\uC778", "failed", message);
      throw error;
    }
  }
  async generateBrief(query, agent, context) {
    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: "system",
          content: `You are ${agent.name}, AI video production director.
${context}
Output a Korean content brief in Markdown. Include: target audience, platform, length, hook strategy, tone, references, success metrics. Be concrete \u2014 no vague promises.`
        },
        {
          role: "user",
          content: `\uC694\uCCAD: ${query}

\uCF58\uD150\uCE20 \uBE0C\uB9AC\uD504(brief.md)\uB97C \uC791\uC131\uD558\uC138\uC694.`
        }
      ],
      { type: agent.provider, model: agent.model }
    );
    return response.content.trim();
  }
  async generateScript(query, agent, brief, context) {
    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: "system",
          content: `You are ${agent.name}, AI video scriptwriter.
${context}
Write a Korean video script in Markdown with scene breaks, narration, on-screen text, and timing hints.`
        },
        {
          role: "user",
          content: `\uC694\uCCAD: ${query}

\uBE0C\uB9AC\uD504:
${brief}

\uB300\uBCF8\uC744 \uC791\uC131\uD558\uC138\uC694.`
        }
      ],
      { type: agent.provider, model: agent.model }
    );
    return response.content.trim();
  }
  async generateScenes(query, agent, script, context) {
    const response = await this.providers.chat(
      agent.provider,
      [
        {
          role: "system",
          content: `You are ${agent.name}, storyboard producer.
${context}
Output ONLY valid JSON array. Each item: sceneId (number), durationSec, visual, narration, imagePrompt, videoPrompt, sfx (optional).
No markdown fences.`
        },
        {
          role: "user",
          content: `\uC694\uCCAD: ${query}

\uB300\uBCF8:
${script}

\uC52C JSON \uBC30\uC5F4\uC744 \uC0DD\uC131\uD558\uC138\uC694.`
        }
      ],
      { type: agent.provider, model: agent.model }
    );
    const raw = response.content.trim().replace(/^```json?\s*/i, "").replace(/```\s*$/i, "");
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      return JSON.stringify(
        [{ sceneId: 1, durationSec: 10, visual: "placeholder", narration: raw.slice(0, 200), imagePrompt: "", videoPrompt: "" }],
        null,
        2
      );
    }
  }
};
