import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AgentManager } from '../agents';
import { MemoryEngine } from '../memory';
import { ProviderEngine } from '../providers';
import { CredentialsService } from '../services/credentials';
import { Agent } from '../types';
import { now } from '../utils';
import { AgentFolderEngine } from './engine';
import { AGENT_FOLDER_LAYOUT } from './slug';

const INDEX_FILE = '.learn-index.json';
const LEARNED_DIR = '_learned';
const SKIP_FILES = new Set(['README.md', 'role-profile.md']);
const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.csv', '.html', '.htm']);
const MAX_DIRECT_CHARS = 3500;
const MAX_MEMORY_SNIPPET = 900;

export interface KnowledgeFileIndex {
  hash: string;
  mtimeMs: number;
  size: number;
  learnedAt: string;
}

export interface KnowledgeLearnIndex {
  version: 1;
  files: Record<string, KnowledgeFileIndex>;
}

const SYNC_THROTTLE_MS = 30_000;

export class KnowledgeLearner {
  private syncInFlight = new Map<string, Promise<{ learned: string[]; skipped: string[] }>>();
  private lastSyncAt = new Map<string, number>();

  constructor(
    private folders: AgentFolderEngine,
    private agents: AgentManager,
    private memory: MemoryEngine,
    private providers: ProviderEngine,
    private credentials: CredentialsService
  ) {}

  /** knowledge 파일 변경분 LLM 요약 — 업무 명령·파일 추가 시에만 호출 */
  async syncAgent(
    agent: Agent,
    opts?: { force?: boolean }
  ): Promise<{ learned: string[]; skipped: string[] }> {
    const slug = this.folders.resolveSlug(agent);
    const existing = this.syncInFlight.get(agent.id);
    if (existing) {
      return existing;
    }

    const last = this.lastSyncAt.get(agent.id) ?? 0;
    if (!opts?.force && Date.now() - last < SYNC_THROTTLE_MS) {
      return { learned: [], skipped: [] };
    }

    const job = this.runSync(agent, slug);
    this.syncInFlight.set(agent.id, job);
    try {
      const result = await job;
      this.lastSyncAt.set(agent.id, Date.now());
      if (result.learned.length > 0) {
        this.folders.invalidatePromptContext(agent.id);
      }
      return result;
    } finally {
      this.syncInFlight.delete(agent.id);
    }
  }

  async syncAllAgents(): Promise<void> {
    for (const agent of this.agents.getAll()) {
      await this.syncAgent(agent);
    }
  }

  /** 웹서핑·리서치 중 수집한 자료를 outputs/reports에 저장 (학습 대상 아님) */
  async captureFromWeb(
    agent: Agent,
    params: { query: string; title: string; url: string; body: string }
  ): Promise<string | null> {
    const slug = this.folders.resolveSlug(agent);
    const date = now().slice(0, 10);
    const titleSlug = params.title
      .slice(0, 40)
      .replace(/[^\w가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const filename = `web-${date}-${titleSlug || 'source'}.md`;
    const markdown = `# ${params.title}

_자동 수집: ${now()}_

- **Query:** ${params.query}
- **Source:** ${params.url}

---

${params.body.trim()}
`;

    const relPath = `${AGENT_FOLDER_LAYOUT.outputReports}/${filename}`;
    const saved = await this.folders.writeText(slug, relPath, markdown);
    if (!saved) return null;

    this.memory.logActivity(agent.id, null, `Research report saved: ${saved}`);
    return saved;
  }

  findAgentByKnowledgePath(filePath: string): Agent | null {
    const normalized = filePath.replace(/\\/g, '/');
    const match = normalized.match(/\/agent\/([^/]+)\/knowledge\//);
    if (!match) return null;

    const slug = match[1];
    return (
      this.agents.getAll().find((a) => this.folders.resolveSlug(a) === slug) ?? null
    );
  }

  private async runSync(agent: Agent, slug: string): Promise<{ learned: string[]; skipped: string[] }> {
    const knowledgeDir = this.folders.getKnowledgeDir(slug);
    await fs.mkdir(path.join(knowledgeDir, LEARNED_DIR), { recursive: true });

    const index = await this.loadIndex(knowledgeDir);
    const learned: string[] = [];
    const skipped: string[] = [];

    let entries: string[];
    try {
      entries = await fs.readdir(knowledgeDir);
    } catch {
      return { learned, skipped };
    }

    for (const name of entries) {
      if (this.shouldSkipFile(name)) continue;

      const fullPath = path.join(knowledgeDir, name);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (!stat?.isFile()) continue;

      const ext = path.extname(name).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext)) {
        skipped.push(name);
        continue;
      }

      const raw = await fs.readFile(fullPath, 'utf-8');
      const hash = this.hashContent(raw);
      const prev = index.files[name];

      if (prev && prev.hash === hash) {
        skipped.push(name);
        continue;
      }

      const snippet = await this.buildLearnSnippet(name, raw, agent);
      await this.writeLearnedSummary(knowledgeDir, name, snippet, hash);

      const marker = `[KnowledgeLearned: ${name}@${hash.slice(0, 8)}]`;
      const memory = this.memory.getAgentMemory(agent.id);
      if (!memory.includes(marker)) {
        this.memory.appendAgentMemory(
          agent.id,
          `${marker}\n${snippet.slice(0, MAX_MEMORY_SNIPPET)}`
        );
      }

      index.files[name] = {
        hash,
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        learnedAt: now(),
      };
      learned.push(name);
    }

    await this.saveIndex(knowledgeDir, index);

    if (learned.length > 0) {
      this.memory.logActivity(
        agent.id,
        null,
        `Knowledge 학습 ${learned.length}건: ${learned.join(', ')}`
      );
    }

    return { learned, skipped };
  }

  private shouldSkipFile(name: string): boolean {
    if (name.startsWith('.')) return true;
    if (name.startsWith('_')) return true;
    if (SKIP_FILES.has(name)) return true;
    // 이전 버전에서 knowledge에 저장된 웹 수집본 — outputs로 이전됨, 재학습 불필요
    if (name.startsWith('web-') && name.endsWith('.md')) return true;
    return false;
  }

  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  private async buildLearnSnippet(filename: string, raw: string, agent: Agent): Promise<string> {
    const trimmed = raw.trim();
    if (trimmed.length <= MAX_DIRECT_CHARS) {
      return trimmed;
    }

    if (!this.credentials.isOpenAiConfigured()) {
      return `${trimmed.slice(0, MAX_DIRECT_CHARS)}\n\n...(truncated ${trimmed.length - MAX_DIRECT_CHARS} chars)`;
    }

    try {
      const response = await this.providers.chat(
        'openai',
        [
          {
            role: 'system',
            content:
              'You summarize knowledge files for an AI agent. Output Korean markdown, concise bullet points, max 400 words.',
          },
          {
            role: 'user',
            content: `Agent: ${agent.name} (${agent.role})\nFile: ${filename}\n\n${trimmed.slice(0, 12000)}`,
          },
        ],
        { type: 'openai', model: this.credentials.getDefaultModel() }
      );
      return response.content.trim() || trimmed.slice(0, MAX_DIRECT_CHARS);
    } catch {
      return `${trimmed.slice(0, MAX_DIRECT_CHARS)}\n\n...(truncated)`;
    }
  }

  private async writeLearnedSummary(
    knowledgeDir: string,
    filename: string,
    snippet: string,
    hash: string
  ): Promise<void> {
    const base = filename.replace(/\.[^.]+$/, '');
    const outPath = path.join(knowledgeDir, LEARNED_DIR, `${base}.summary.md`);
    const body = `# Learned: ${filename}

_hash: ${hash}_  
_learned: ${now()}_

${snippet}
`;
    await fs.writeFile(outPath, body, 'utf-8');
  }

  private async loadIndex(knowledgeDir: string): Promise<KnowledgeLearnIndex> {
    const indexPath = path.join(knowledgeDir, INDEX_FILE);
    try {
      const raw = await fs.readFile(indexPath, 'utf-8');
      const parsed = JSON.parse(raw) as KnowledgeLearnIndex;
      if (parsed.version === 1 && parsed.files) return parsed;
    } catch {
      // new index
    }
    return { version: 1, files: {} };
  }

  private async saveIndex(knowledgeDir: string, index: KnowledgeLearnIndex): Promise<void> {
    const indexPath = path.join(knowledgeDir, INDEX_FILE);
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }
}
