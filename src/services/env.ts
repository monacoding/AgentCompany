import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { WorkspaceEngine } from '../workspace';

const ENV_TEMPLATE = `# AgentCompany LLM Configuration
# ChatGPT / OpenAI API Key (둘 중 하나만 설정해도 됩니다)
CHATGPT_API_KEY=sk-your-openai-api-key-here
OPENAI_API_KEY=

# Optional — 이번 달 API 사용액 조회 (잔액은 대시보드에서 확인)
# OPENAI_ADMIN_KEY=sk-admin-...

# Optional — 기본 모델 (Settings에서도 변경 가능)
# DEFAULT_MODEL=gpt-4o
# DEFAULT_PROVIDER=openai
`;

const API_KEY_VARS = ['CHATGPT_API_KEY', 'OPENAI_API_KEY', 'CHATGPT_API', 'ANTHROPIC_API_KEY'];

export class EnvService {
  private vars: Record<string, string> = {};
  private loaded = false;
  private resolvedEnvPath: string | null = null;

  constructor(
    private workspace: WorkspaceEngine,
    private extensionPath?: string
  ) {}

  async load(): Promise<void> {
    const candidates = await this.collectEnvCandidates();
    const ranked = candidates
      .map((c) => ({ ...c, score: this.scoreCandidate(c) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    const picked = ranked[0] ?? candidates.find((c) => this.hasApiKeyVars(this.parseContent(c.content)));
    if (picked) {
      // 성공 시에만 교체 — 로드 중 다른 요청이 빈 키를 읽는 레이스 방지
      this.vars = this.parseContent(picked.content);
      this.resolvedEnvPath = picked.path;
    }

    this.loaded = true;
  }

  private scoreCandidate(candidate: { path: string; content: string }): number {
    const parsed = this.parseContent(candidate.content);
    const key = parsed.CHATGPT_API_KEY || parsed.OPENAI_API_KEY || parsed.CHATGPT_API || '';
    if (!key.trim()) return 0;
    if (/your-openai-api-key|sk-your/i.test(key)) return 1;

    const root = this.workspace.getWorkspaceRoot();
    if (root && candidate.path === path.join(root, '.env')) return 100;
    if (root && candidate.path.startsWith(root)) return 90;
    if (this.extensionPath && candidate.path === path.join(this.extensionPath, '.env')) return 80;
    return 50;
  }

  private hasApiKeyVars(vars: Record<string, string>): boolean {
    const key = vars.CHATGPT_API_KEY || vars.OPENAI_API_KEY || vars.CHATGPT_API || '';
    return !!key.trim() && !/your-openai-api-key|sk-your/i.test(key);
  }

  private parseContent(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex <= 0) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (value) vars[key] = value;
    }
    return vars;
  }

  private async readFileAt(fsPath: string): Promise<string | null> {
    try {
      const uri = vscode.Uri.file(fsPath);
      const content = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf-8');
      if (content.trim()) return content;
    } catch {
      // fallback — Cursor 등에서 workspace.fs 가 .env 를 막을 때
    }

    try {
      const content = fs.readFileSync(fsPath, 'utf-8');
      return content.trim() ? content : null;
    } catch {
      return null;
    }
  }

  private async collectEnvCandidates(): Promise<{ path: string; content: string }[]> {
    const found: { path: string; content: string }[] = [];
    const seen = new Set<string>();

    const add = async (fsPath: string) => {
      const normalized = path.resolve(fsPath);
      if (seen.has(normalized)) return;
      seen.add(normalized);
      const content = await this.readFileAt(normalized);
      if (content) found.push({ path: normalized, content });
    };

    // 1) 기존 방식 — 워크스페이스 1번 폴더 .env (v1.7.22 이전 동작)
    const primary = await this.workspace.readFile('.env');
    const root = this.workspace.getWorkspaceRoot();
    if (primary?.trim() && root) {
      found.push({ path: path.join(root, '.env'), content: primary });
      seen.add(path.resolve(path.join(root, '.env')));
    } else if (root) {
      await add(path.join(root, '.env'));
    }

    // 2) 멀티 루트 워크스페이스
    for (const folder of vscode.workspace.workspaceFolders ?? []) {
      await add(path.join(folder.uri.fsPath, '.env'));
    }

    // 3) VSIX 번들 .env (워크스페이스 읽기 실패 시)
    if (this.extensionPath) {
      await add(path.join(this.extensionPath, '.env'));
    }

    return found;
  }

  get(key: string): string {
    return this.vars[key] ?? '';
  }

  getOpenAiKey(): string {
    return this.get('CHATGPT_API_KEY') || this.get('OPENAI_API_KEY') || this.get('CHATGPT_API');
  }

  getAnthropicKey(): string {
    return this.get('ANTHROPIC_API_KEY');
  }

  getDefaultModel(): string {
    return this.get('DEFAULT_MODEL');
  }

  isEnvLoaded(): boolean {
    return this.loaded;
  }

  hasEnvFile(): boolean {
    return this.loaded && this.resolvedEnvPath !== null;
  }

  async envFileExists(): Promise<boolean> {
    if (this.resolvedEnvPath) return true;
    const candidates = await this.collectEnvCandidates();
    return candidates.length > 0;
  }

  getEnvFilePath(): string | null {
    return this.resolvedEnvPath;
  }

  getDisplayPath(): string {
    if (!this.resolvedEnvPath) return '.env';
    const root = this.workspace.getWorkspaceRoot();
    if (root && this.resolvedEnvPath.startsWith(root)) {
      return vscode.workspace.asRelativePath(vscode.Uri.file(this.resolvedEnvPath));
    }
    if (this.extensionPath && this.resolvedEnvPath.startsWith(this.extensionPath)) {
      return 'extension/.env';
    }
    return this.resolvedEnvPath;
  }

  isKeyConfigured(): boolean {
    return this.hasApiKeyVars(this.vars);
  }

  async createEnvTemplate(): Promise<{ success: boolean; path: string; message: string }> {
    const root = this.workspace.getWorkspaceRoot();
    if (!root) {
      return { success: false, path: '', message: '워크스페이스가 열려 있지 않습니다.' };
    }

    const exists = await this.envFileExists();
    if (exists) {
      return { success: false, path: this.getDisplayPath(), message: '.env 파일이 이미 존재합니다.' };
    }

    const ok = await this.workspace.createFile('.env', ENV_TEMPLATE);
    if (!ok) {
      return { success: false, path: '.env', message: '.env 파일 생성에 실패했습니다.' };
    }

    await this.load();
    return { success: true, path: '.env', message: '.env 파일이 생성되었습니다. API Key를 입력해 주세요.' };
  }

  maskKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 7)}${'•'.repeat(8)}${key.slice(-4)}`;
  }

  async updateKey(key: string, value: string): Promise<boolean> {
    const target = this.resolvedEnvPath;
    if (!target) return false;

    const content = (await this.readFileAt(target)) ?? '';
    if (!content) return false;

    const lines = content.split('\n');
    let found = false;

    const updated = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed.includes('=')) return line;
      const k = trimmed.slice(0, trimmed.indexOf('=')).trim();
      if (k === key) {
        found = true;
        return `${key}=${value}`;
      }
      return line;
    });

    if (!found) {
      updated.push(`${key}=${value}`);
    }

    try {
      const uri = vscode.Uri.file(target);
      await vscode.workspace.fs.writeFile(uri, Buffer.from(updated.join('\n'), 'utf-8'));
      await this.load();
      return true;
    } catch {
      try {
        fs.writeFileSync(target, updated.join('\n'), 'utf-8');
        await this.load();
        return true;
      } catch {
        return false;
      }
    }
  }
}
