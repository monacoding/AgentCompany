import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { GeneratedAgentProfile } from './profile-generator';
import { Agent } from '../types';
import { WorkspaceEngine } from '../workspace';
import { AGENT_FOLDER_LAYOUT, resolveAgentSlug, resolveBundledTemplateSlug } from './slug';
import {
  buildCompanyPersonaMarkdown,
  buildCompanyPromptBlock,
  COMPANY_FOLDER_SLUG,
  COMPANY_PERSONA_FILE,
  COMPANY_PROFILE_FILE,
  CompanyInfo,
  CompanyInfoInput,
  EMPTY_COMPANY_INFO,
  parseCompanyProfile,
} from './company-persona';
import {
  buildOwnerPersonaMarkdown,
  buildOwnerPromptBlock,
  EMPTY_OWNER_INFO,
  OWNER_PERSONA_FILE,
  OWNER_PHOTO_FOLDER,
  OWNER_PROFILE_FILE,
  OwnerInfo,
  OwnerInfoInput,
  parseOwnerProfile,
} from './owner-persona';
import { buildOwnerDataPathPromptBlock } from './owner-path-knowledge';

const SUBDIRS = [
  AGENT_FOLDER_LAYOUT.knowledge,
  AGENT_FOLDER_LAYOUT.references,
  AGENT_FOLDER_LAYOUT.photo,
  AGENT_FOLDER_LAYOUT.outputReports,
  AGENT_FOLDER_LAYOUT.outputDownloads,
  AGENT_FOLDER_LAYOUT.outputPlans,
  AGENT_FOLDER_LAYOUT.outputExports,
];

const PHOTO_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
export const DEFAULT_PROFILE_PHOTO_NAME = '기본';

const LEGACY_COMPANY_FOLDER_SLUG = 'Company';

export class AgentFolderEngine {
  readonly bundledRoot: string;
  private readonly companyBundledRoot: string;
  private readonly storageRoot: string;

  constructor(
    private context: vscode.ExtensionContext,
    private workspace?: WorkspaceEngine
  ) {
    this.storageRoot = path.join(context.globalStorageUri.fsPath, 'agent');
    this.bundledRoot = path.join(context.extensionPath, 'agent');
    this.companyBundledRoot = path.join(context.extensionPath, 'company');
  }

  /** 워크스페이스가 열려 있으면 프로젝트 루트/agent, 아니면 globalStorage/agent */
  get runtimeRoot(): string {
    const wsRoot = this.workspace?.getWorkspaceRoot();
    if (wsRoot) return path.join(wsRoot, 'agent');
    return this.storageRoot;
  }

  getRuntimeRootLabel(): string {
    return this.runtimeRoot === this.storageRoot
      ? 'globalStorage/agent (워크스페이스를 열면 프로젝트/agent 에 생성됩니다)'
      : this.runtimeRoot;
  }

  async initialize(agents: Agent[]): Promise<void> {
    await fs.mkdir(this.runtimeRoot, { recursive: true });
    await this.ensureCompanyFolder();
    for (const agent of agents) {
      await this.provisionAgent(agent);
    }
  }

  getCompanyDir(): string {
    return path.join(this.getCompanyStorageRoot(), COMPANY_FOLDER_SLUG);
  }

  /** 워크스페이스 루트 또는 globalStorage (agent 폴더와 형제) */
  private getCompanyStorageRoot(): string {
    const wsRoot = this.workspace?.getWorkspaceRoot();
    if (wsRoot) return wsRoot;
    return this.context.globalStorageUri.fsPath;
  }

  /** 구 경로: agent/Company */
  private getLegacyCompanyDir(): string {
    const wsRoot = this.workspace?.getWorkspaceRoot();
    if (wsRoot) {
      return path.join(wsRoot, 'agent', LEGACY_COMPANY_FOLDER_SLUG);
    }
    return path.join(this.storageRoot, LEGACY_COMPANY_FOLDER_SLUG);
  }

  getCompanyRelativePath(...parts: string[]): string {
    return path.join(COMPANY_FOLDER_SLUG, ...parts).replace(/\\/g, '/');
  }

  getOwnerDir(): string {
    return path.join(this.getCompanyDir(), 'owner');
  }

  getOwnerPhotoDir(): string {
    return path.join(this.getOwnerDir(), OWNER_PHOTO_FOLDER);
  }

  async ensureOwnerFolder(): Promise<void> {
    await this.ensureCompanyFolder();
    const dir = this.getOwnerDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(this.getOwnerPhotoDir(), { recursive: true });

    const profilePath = path.join(dir, OWNER_PROFILE_FILE);
    const personaPath = path.join(dir, OWNER_PERSONA_FILE);
    const hasProfile = await this.fileExists(profilePath);
    const hasPersona = await this.fileExists(personaPath);

    if (!hasProfile && !hasPersona) {
      await fs.writeFile(profilePath, `${JSON.stringify(EMPTY_OWNER_INFO(), null, 2)}\n`, 'utf-8');
      await fs.writeFile(personaPath, buildOwnerPersonaMarkdown(EMPTY_OWNER_INFO()), 'utf-8');
    } else if (!hasProfile) {
      await fs.writeFile(profilePath, `${JSON.stringify(EMPTY_OWNER_INFO(), null, 2)}\n`, 'utf-8');
    } else if (!hasPersona) {
      const info = await this.loadOwnerInfo();
      await fs.writeFile(personaPath, buildOwnerPersonaMarkdown(info), 'utf-8');
    }
  }

  async loadOwnerInfo(): Promise<OwnerInfo> {
    await this.ensureOwnerFolder();
    try {
      const raw = await fs.readFile(path.join(this.getOwnerDir(), OWNER_PROFILE_FILE), 'utf-8');
      return parseOwnerProfile(raw) ?? EMPTY_OWNER_INFO();
    } catch {
      return EMPTY_OWNER_INFO();
    }
  }

  async loadOwnerPersona(): Promise<string> {
    await this.ensureOwnerFolder();
    try {
      return (await fs.readFile(path.join(this.getOwnerDir(), OWNER_PERSONA_FILE), 'utf-8')).trim();
    } catch {
      return '';
    }
  }

  async saveOwnerInfo(input: OwnerInfoInput): Promise<OwnerInfo> {
    await this.ensureOwnerFolder();
    const info: OwnerInfo = {
      name: input.name.trim(),
      personality: input.personality.trim(),
      tendency: input.tendency.trim(),
      orientation: input.orientation.trim(),
      updatedAt: new Date().toISOString(),
    };
    const dir = this.getOwnerDir();
    await fs.writeFile(path.join(dir, OWNER_PROFILE_FILE), `${JSON.stringify(info, null, 2)}\n`, 'utf-8');
    await fs.writeFile(path.join(dir, OWNER_PERSONA_FILE), buildOwnerPersonaMarkdown(info), 'utf-8');
    return info;
  }

  async buildOwnerPromptBlock(): Promise<string> {
    const persona = await this.loadOwnerPersona();
    const ownerDir = this.getOwnerDir();
    const workspaceRoot = this.workspace?.getWorkspaceRoot();
    const dataPathBlock = buildOwnerDataPathPromptBlock(ownerDir, workspaceRoot ?? undefined);
    return buildOwnerPromptBlock(persona, dataPathBlock);
  }

  async resolveOwnerProfilePhotoPath(): Promise<string | null> {
    return this.resolveOwnerPhotoByBaseName(DEFAULT_PROFILE_PHOTO_NAME);
  }

  async resolveOwnerEmotionPhotoPath(emotion: string): Promise<string | null> {
    const hit = await this.resolveOwnerPhotoByBaseName(emotion);
    if (hit) return hit;
    if (emotion !== DEFAULT_PROFILE_PHOTO_NAME) {
      return this.resolveOwnerPhotoByBaseName(DEFAULT_PROFILE_PHOTO_NAME);
    }
    return null;
  }

  private async resolveOwnerPhotoByBaseName(baseName: string): Promise<string | null> {
    await this.ensureOwnerFolder();
    const photoDir = this.getOwnerPhotoDir();
    const normalizedBase = baseName.normalize('NFC');
    try {
      const names = await fs.readdir(photoDir);
      const hit = names.find((name) => {
        if (name.startsWith('.') || name.toLowerCase() === 'readme.md') return false;
        if (!PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase())) return false;
        return path.basename(name, path.extname(name)).normalize('NFC') === normalizedBase;
      });
      return hit ? path.join(photoDir, hit) : null;
    } catch {
      return null;
    }
  }

  async saveOwnerPhotoFromFile(sourcePath: string, emotion: string): Promise<boolean> {
    await this.ensureOwnerFolder();
    const ext = path.extname(sourcePath).toLowerCase();
    if (!PHOTO_EXTENSIONS.has(ext)) return false;

    const base = emotion.normalize('NFC');
    const photoDir = this.getOwnerPhotoDir();
    try {
      const names = await fs.readdir(photoDir);
      for (const name of names) {
        if (!PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase())) continue;
        if (path.basename(name, path.extname(name)).normalize('NFC') === base) {
          await fs.unlink(path.join(photoDir, name)).catch(() => undefined);
        }
      }
    } catch {
      // ignore
    }

    const data = await fs.readFile(sourcePath);
    await fs.writeFile(path.join(photoDir, `${base}${ext}`), data);
    return true;
  }

  async ensureCompanyFolder(): Promise<void> {
    await this.migrateLegacyCompanyFolder();

    const dir = this.getCompanyDir();
    await fs.mkdir(dir, { recursive: true });

    const profilePath = path.join(dir, COMPANY_PROFILE_FILE);
    const personaPath = path.join(dir, COMPANY_PERSONA_FILE);

    const hasProfile = await this.fileExists(profilePath);
    const hasPersona = await this.fileExists(personaPath);

    if (!hasProfile && !hasPersona) {
      if (await this.dirExists(this.companyBundledRoot)) {
        await this.copyDirMerge(this.companyBundledRoot, dir);
        return;
      }
      await fs.writeFile(profilePath, `${JSON.stringify(EMPTY_COMPANY_INFO(), null, 2)}\n`, 'utf-8');
      await fs.writeFile(personaPath, buildCompanyPersonaMarkdown(EMPTY_COMPANY_INFO()), 'utf-8');
    } else if (!hasProfile && hasPersona) {
      await fs.writeFile(profilePath, `${JSON.stringify(EMPTY_COMPANY_INFO(), null, 2)}\n`, 'utf-8');
    } else if (hasProfile && !hasPersona) {
      const info = await this.loadCompanyInfo();
      await fs.writeFile(personaPath, buildCompanyPersonaMarkdown(info), 'utf-8');
    }
  }

  /** agent/Company → company/ 자동 이전 */
  private async migrateLegacyCompanyFolder(): Promise<void> {
    const newDir = this.getCompanyDir();
    const legacyDir = this.getLegacyCompanyDir();

    const newHasData =
      (await this.fileExists(path.join(newDir, COMPANY_PROFILE_FILE))) ||
      (await this.fileExists(path.join(newDir, COMPANY_PERSONA_FILE)));
    if (newHasData) return;

    if (!(await this.dirExists(legacyDir))) return;

    const legacyHasData =
      (await this.fileExists(path.join(legacyDir, COMPANY_PROFILE_FILE))) ||
      (await this.fileExists(path.join(legacyDir, COMPANY_PERSONA_FILE)));
    if (!legacyHasData) return;

    await fs.mkdir(newDir, { recursive: true });
    await this.copyDirMerge(legacyDir, newDir, true);
  }

  async loadCompanyInfo(): Promise<CompanyInfo> {
    await this.ensureCompanyFolder();
    const profilePath = path.join(this.getCompanyDir(), COMPANY_PROFILE_FILE);
    try {
      const raw = await fs.readFile(profilePath, 'utf-8');
      return parseCompanyProfile(raw) ?? EMPTY_COMPANY_INFO();
    } catch {
      return EMPTY_COMPANY_INFO();
    }
  }

  async loadCompanyPersona(): Promise<string> {
    await this.ensureCompanyFolder();
    const personaPath = path.join(this.getCompanyDir(), COMPANY_PERSONA_FILE);
    try {
      return (await fs.readFile(personaPath, 'utf-8')).trim();
    } catch {
      return '';
    }
  }

  async saveCompanyInfo(input: CompanyInfoInput): Promise<CompanyInfo> {
    await this.ensureCompanyFolder();
    const info: CompanyInfo = {
      companyName: input.companyName.trim(),
      businessItem: input.businessItem.trim(),
      policy: input.policy.trim(),
      mindset: input.mindset.trim(),
      tendency: input.tendency.trim(),
      mission: input.mission.trim(),
      foundedAt: input.foundedAt.trim(),
      updatedAt: new Date().toISOString(),
    };

    const dir = this.getCompanyDir();
    await fs.writeFile(path.join(dir, COMPANY_PROFILE_FILE), `${JSON.stringify(info, null, 2)}\n`, 'utf-8');
    await fs.writeFile(path.join(dir, COMPANY_PERSONA_FILE), buildCompanyPersonaMarkdown(info), 'utf-8');
    return info;
  }

  async buildCompanyPromptBlock(): Promise<string> {
    const persona = await this.loadCompanyPersona();
    return buildCompanyPromptBlock(persona);
  }

  async resolveCompanyLogoPath(): Promise<string | null> {
    await this.ensureCompanyFolder();
    const dir = this.getCompanyDir();
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp', '.gif']) {
      const filePath = path.join(dir, `logo${ext}`);
      if (await this.fileExists(filePath)) return filePath;
    }
    return null;
  }

  async saveCompanyLogoFromFile(sourcePath: string): Promise<boolean> {
    await this.ensureCompanyFolder();
    const ext = path.extname(sourcePath).toLowerCase();
    if (!PHOTO_EXTENSIONS.has(ext)) return false;

    const data = await fs.readFile(sourcePath);
    await this.removeCompanyLogo();
    await fs.writeFile(path.join(this.getCompanyDir(), `logo${ext}`), data);
    return true;
  }

  async removeCompanyLogo(): Promise<void> {
    const dir = this.getCompanyDir();
    if (!(await this.dirExists(dir))) return;
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp', '.gif']) {
      const filePath = path.join(dir, `logo${ext}`);
      if (await this.fileExists(filePath)) {
        await fs.unlink(filePath).catch(() => undefined);
      }
    }
  }

  resolveSlug(agent: Agent): string {
    return resolveAgentSlug(agent);
  }

  getAgentDir(slug: string): string {
    return path.join(this.runtimeRoot, slug);
  }

  getDisplayPath(slug: string, ...parts: string[]): string {
    return path.join(this.getAgentDir(slug), ...parts);
  }

  /** UI·메모리에 표시할 상대 경로 (agent/{slug}/...) */
  getRelativePath(slug: string, ...parts: string[]): string {
    return path.join('agent', slug, ...parts).replace(/\\/g, '/');
  }

  getOutputPath(slug: string, ...parts: string[]): string {
    return this.getDisplayPath(slug, AGENT_FOLDER_LAYOUT.outputs, ...parts);
  }

  async provisionAgent(agent: Agent, profile?: GeneratedAgentProfile): Promise<void> {
    const slug = this.resolveSlug(agent);
    const agentDir = this.getAgentDir(slug);
    await fs.mkdir(agentDir, { recursive: true });
    await this.ensureDirectoryTree(agentDir);

    if (profile) {
      await this.writeProfileFiles(agent, slug, agentDir, profile);
    } else {
      const templateSlug = resolveBundledTemplateSlug(agent);
      if (templateSlug && (await this.dirExists(path.join(this.bundledRoot, templateSlug)))) {
        await this.copyBundledAgentToTarget(templateSlug, slug);
      } else if (await this.dirExists(path.join(this.bundledRoot, slug))) {
        await this.copyBundledAgent(slug);
      } else {
        await this.copyFromTemplate(agentDir);
      }
    }

    await this.ensureAgentFiles(agent, slug, agentDir);
    await this.syncToStorageMirror(slug, agentDir);
  }

  /** agent/{slug}/ 표준 하위 폴더 (knowledge, photo, outputs/...) */
  private async ensureDirectoryTree(agentDir: string): Promise<void> {
    for (const sub of SUBDIRS) {
      await fs.mkdir(path.join(agentDir, sub), { recursive: true });
    }
  }

  private async writeProfileFiles(
    agent: Agent,
    slug: string,
    agentDir: string,
    profile: GeneratedAgentProfile
  ): Promise<void> {
    await fs.writeFile(path.join(agentDir, AGENT_FOLDER_LAYOUT.persona), profile.persona, 'utf-8');
    await fs.writeFile(path.join(agentDir, AGENT_FOLDER_LAYOUT.description), `${profile.description.trim()}\n`, 'utf-8');
    await fs.writeFile(
      path.join(agentDir, AGENT_FOLDER_LAYOUT.knowledge, 'role-profile.md'),
      profile.knowledge,
      'utf-8'
    );
    await fs.writeFile(
      path.join(agentDir, AGENT_FOLDER_LAYOUT.memory),
      `# ${agent.name} — 누적 메모리\n\n`,
      'utf-8'
    );
  }

  /** 워크스페이스 사용 시 globalStorage에도 백업 미러 */
  private async syncToStorageMirror(slug: string, sourceDir: string): Promise<void> {
    if (this.runtimeRoot === this.storageRoot) return;
    const mirrorDir = path.join(this.storageRoot, slug);
    await fs.mkdir(mirrorDir, { recursive: true });
    await this.copyDirMerge(sourceDir, mirrorDir, true);
  }

  private async ensureAgentFiles(agent: Agent, slug: string, agentDir: string): Promise<void> {
    const displayTitle = agent.title?.trim() || agent.role;
    const label = `${agent.name} (${displayTitle})`;

    const personaPath = path.join(agentDir, AGENT_FOLDER_LAYOUT.persona);
    if (await this.shouldInitFile(personaPath)) {
      const persona = `# ${agent.name} — 페르소나

## 직책
${displayTitle}

## 말투
- ${displayTitle} 역할에 맞는 전문적이고 명확한 말투

## 행동 원칙
- CEO(대표님) 명령에 성실히 응답
- 작업 산출물은 agent/${slug}/outputs/ 에 저장
`;
      await fs.writeFile(personaPath, persona, 'utf-8');
    }

    const descPath = path.join(agentDir, AGENT_FOLDER_LAYOUT.description);
    const description = agent.description?.trim() || label;
    if (await this.shouldInitFile(descPath)) {
      await fs.writeFile(descPath, `${description}\n`, 'utf-8');
    }

    const memoryPath = path.join(agentDir, AGENT_FOLDER_LAYOUT.memory);
    if (await this.shouldInitFile(memoryPath)) {
      await fs.writeFile(memoryPath, `# ${agent.name} — 누적 메모리\n\n`, 'utf-8');
    }

    const knowledgeReadme = path.join(agentDir, AGENT_FOLDER_LAYOUT.knowledge, 'README.md');
    if (await this.shouldInitFile(knowledgeReadme)) {
      await fs.writeFile(
        knowledgeReadme,
        `# ${agent.name} — 학습·참고 자료\n\n이 폴더에 .md 파일을 추가하면 에이전트 프롬프트에 자동 반영됩니다.\n`,
        'utf-8'
      );
    }

    const referencesReadme = path.join(agentDir, AGENT_FOLDER_LAYOUT.references, 'README.md');
    if (await this.shouldInitFile(referencesReadme)) {
      await fs.writeFile(
        referencesReadme,
        `# ${agent.name} — 참고 자료\n\n링크·문서 메모를 이 폴더에 보관할 수 있습니다.\n`,
        'utf-8'
      );
    }

    const photoReadme = path.join(agentDir, AGENT_FOLDER_LAYOUT.photo, 'README.md');
    if (await this.shouldInitFile(photoReadme)) {
      await fs.writeFile(
        photoReadme,
        `# ${agent.name} — 프로필 사진\n\n\`profile.png\`, \`avatar.jpg\` 등 이미지를 이 폴더에 넣으면 채팅창 헤더에 표시됩니다.\n`,
        'utf-8'
      );
    }
  }

  /** 없거나 _template 플레이스홀더만 있으면 초기화 대상 */
  private async shouldInitFile(filePath: string): Promise<boolean> {
    if (!(await this.fileExists(filePath))) return true;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.includes('{에이전트명}') || content.trim() === '(역할·역량 설명)';
    } catch {
      return true;
    }
  }

  /** agent/{slug}/photo/ 에서 채팅 헤더용 기본 프로필 이미지 경로 탐색 */
  async resolveProfilePhotoPath(slug: string): Promise<string | null> {
    return this.resolvePhotoByBaseName(slug, DEFAULT_PROFILE_PHOTO_NAME);
  }

  /** agent/{slug}/photo/ 에서 감정별 이미지 경로 탐색 (없으면 기본으로 폴백) */
  async resolveEmotionPhotoPath(slug: string, emotion: string): Promise<string | null> {
    const hit = await this.resolvePhotoByBaseName(slug, emotion);
    if (hit) return hit;
    if (emotion !== DEFAULT_PROFILE_PHOTO_NAME) {
      return this.resolvePhotoByBaseName(slug, DEFAULT_PROFILE_PHOTO_NAME);
    }
    return null;
  }

  private async resolvePhotoByBaseName(slug: string, baseName: string): Promise<string | null> {
    const photoDir = path.join(this.getAgentDir(slug), AGENT_FOLDER_LAYOUT.photo);
    const normalizedBase = baseName.normalize('NFC');
    try {
      const names = await fs.readdir(photoDir);
      const hit = names.find((name) => {
        if (name.startsWith('.') || name.toLowerCase() === 'readme.md') return false;
        if (!PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase())) return false;
        const fileBase = path.basename(name, path.extname(name)).normalize('NFC');
        return fileBase === normalizedBase;
      });
      return hit ? path.join(photoDir, hit) : null;
    } catch {
      return null;
    }
  }

  async readText(slug: string, relativePath: string): Promise<string | null> {
    try {
      return await fs.readFile(path.join(this.getAgentDir(slug), relativePath), 'utf-8');
    } catch {
      return null;
    }
  }

  async writeText(slug: string, relativePath: string, content: string): Promise<string | null> {
    const fullPath = path.join(this.getAgentDir(slug), relativePath);
    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
      return this.getRelativePath(slug, relativePath);
    } catch {
      return null;
    }
  }

  async writeBinary(slug: string, relativePath: string, data: Uint8Array): Promise<string | null> {
    const fullPath = path.join(this.getAgentDir(slug), relativePath);
    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, data);
      return this.getRelativePath(slug, relativePath);
    } catch {
      return null;
    }
  }

  async loadPersona(slug: string): Promise<string> {
    return (await this.readText(slug, AGENT_FOLDER_LAYOUT.persona))?.trim() ?? '';
  }

  async loadDescription(slug: string): Promise<string> {
    return (await this.readText(slug, AGENT_FOLDER_LAYOUT.description))?.trim() ?? '';
  }

  getKnowledgeDir(slug: string): string {
    return path.join(this.getAgentDir(slug), AGENT_FOLDER_LAYOUT.knowledge);
  }

  async writeKnowledgeFile(slug: string, relativePath: string, content: string): Promise<string | null> {
    return this.writeText(slug, relativePath, content);
  }

  async loadKnowledge(slug: string): Promise<string> {
    const knowledgeDir = this.getKnowledgeDir(slug);
    try {
      const files = (await fs.readdir(knowledgeDir))
        .filter((f) => !this.isInternalKnowledgeFile(f))
        .sort();
      const chunks: string[] = [];

      for (const file of files) {
        const fullPath = path.join(knowledgeDir, file);
        const stat = await fs.stat(fullPath).catch(() => null);
        if (!stat?.isFile()) continue;

        const ext = path.extname(file).toLowerCase();
        if (!['.md', '.txt', '.json'].includes(ext)) continue;

        const learnedSummary = await this.readLearnedSummary(knowledgeDir, file);
        if (learnedSummary) {
          chunks.push(`## ${file}\n${learnedSummary}`);
          continue;
        }

        const content = await fs.readFile(fullPath, 'utf-8');
        chunks.push(`## ${file}\n${content.trim()}`);
      }

      return chunks.filter(Boolean).join('\n\n');
    } catch {
      return '';
    }
  }

  private isInternalKnowledgeFile(name: string): boolean {
    if (name.startsWith('.')) return true;
    if (name.startsWith('_')) return true;
    return false;
  }

  private async readLearnedSummary(knowledgeDir: string, filename: string): Promise<string | null> {
    const base = filename.replace(/\.[^.]+$/, '');
    const summaryPath = path.join(knowledgeDir, '_learned', `${base}.summary.md`);
    try {
      const raw = await fs.readFile(summaryPath, 'utf-8');
      return raw
        .replace(/^#\s.+?\n+/m, '')
        .replace(/^_(hash|learned):.+_\s*/gm, '')
        .trim();
    } catch {
      return null;
    }
  }

  async loadMemoryFile(slug: string): Promise<string> {
    const raw = await this.readText(slug, AGENT_FOLDER_LAYOUT.memory);
    if (!raw) return '';
    return raw.replace(/^#\s.+?\n+/m, '').trim();
  }

  async syncMemory(agent: Agent, memory: string): Promise<void> {
    const slug = this.resolveSlug(agent);
    await this.provisionAgent(agent);
    const header = `# ${agent.name} — 누적 메모리\n\n_마지막 동기화: ${new Date().toISOString()}_\n\n`;
    await this.writeText(slug, AGENT_FOLDER_LAYOUT.memory, `${header}${memory.trim()}\n`);
  }

  async buildPromptContext(agent: Agent): Promise<string> {
    const slug = this.resolveSlug(agent);
    const parts: string[] = [];

    const companyBlock = await this.buildCompanyPromptBlock();
    if (companyBlock) parts.push(companyBlock);

    const ownerBlock = await this.buildOwnerPromptBlock();
    if (ownerBlock) parts.push(ownerBlock);

    const persona = await this.loadPersona(slug);
    if (persona) parts.push(`Persona:\n${persona}`);

    const description = await this.loadDescription(slug);
    if (description) parts.push(`Description:\n${description}`);

    const knowledge = await this.loadKnowledge(slug);
    if (knowledge) parts.push(`Knowledge:\n${knowledge}`);

    return parts.join('\n\n');
  }

  async openAgentFolder(agent: Agent): Promise<void> {
    const slug = this.resolveSlug(agent);
    await this.provisionAgent(agent);
    const uri = vscode.Uri.file(this.getAgentDir(slug));
    await this.revealFolderInExplorer(uri);
  }

  async openAgentsRoot(): Promise<void> {
    await fs.mkdir(this.runtimeRoot, { recursive: true });
    const uri = vscode.Uri.file(this.runtimeRoot);
    await this.revealFolderInExplorer(uri);
  }

  /** Cursor·VS Code 모두에서 동작하도록 탐색기 reveal (실패해도 throw 안 함) */
  private async revealFolderInExplorer(uri: vscode.Uri): Promise<void> {
    const candidates = ['revealFileInExplorer', 'revealInExplorer', 'revealFileInOS'];
    const commands = await vscode.commands.getCommands(true);

    for (const command of candidates) {
      if (!commands.includes(command)) continue;
      try {
        await vscode.commands.executeCommand(command, uri);
        return;
      } catch {
        // 다음 후보 시도
      }
    }

    try {
      await vscode.env.openExternal(uri);
    } catch {
      void vscode.window.showInformationMessage(`에이전트 폴더: ${uri.fsPath}`);
    }
  }

  private async seedFromBundled(): Promise<void> {
    if (!(await this.dirExists(this.bundledRoot))) return;

    const entries = await fs.readdir(this.bundledRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
      await this.copyBundledAgent(entry.name);
    }
  }

  private async copyBundledAgent(slug: string): Promise<void> {
    await this.copyBundledAgentToTarget(slug, slug);
  }

  private async copyBundledAgentToTarget(templateSlug: string, targetSlug: string): Promise<void> {
    const source = path.join(this.bundledRoot, templateSlug);
    const target = this.getAgentDir(targetSlug);
    if (!(await this.dirExists(source))) return;

    await fs.mkdir(target, { recursive: true });
    await this.copyDirMerge(source, target);
  }

  private async copyFromTemplate(agentDir: string): Promise<void> {
    const templateDir = path.join(this.bundledRoot, '_template');
    if (!(await this.dirExists(templateDir))) return;
    await this.copyDirMerge(templateDir, agentDir);
  }

  private async copyDirMerge(source: string, target: string, overwrite = false): Promise<void> {
    const entries = await fs.readdir(source, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirMerge(srcPath, destPath, overwrite);
        continue;
      }

      if (entry.name === AGENT_FOLDER_LAYOUT.memory && !overwrite) continue;
      if (!overwrite && (await this.fileExists(destPath))) continue;
      await fs.copyFile(srcPath, destPath);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async dirExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}
