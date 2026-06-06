import * as vscode from 'vscode';
import { WorkspaceEngine } from '../../workspace';

export interface DockerEnsureResult {
  success: boolean;
  message: string;
  alreadyRunning: boolean;
}

export class Crawl4AiDockerService {
  private starting: Promise<DockerEnsureResult> | null = null;

  constructor(private workspace: WorkspaceEngine) {}

  getContainerName(): string {
    return (
      vscode.workspace.getConfiguration('agentCompany').get<string>('crawl4aiContainerName') ||
      'crawl4ai'
    );
  }

  getImage(): string {
    return (
      vscode.workspace.getConfiguration('agentCompany').get<string>('crawl4aiImage') ||
      'unclecode/crawl4ai:latest'
    );
  }

  getPort(): number {
    return vscode.workspace.getConfiguration('agentCompany').get<number>('crawl4aiPort') || 11235;
  }

  isAutoStartEnabled(): boolean {
    return vscode.workspace.getConfiguration('agentCompany').get<boolean>('crawl4aiAutoStart', true);
  }

  async ensureRunning(): Promise<DockerEnsureResult> {
    if (!this.isAutoStartEnabled()) {
      return { success: true, message: 'Crawl4AI auto-start disabled', alreadyRunning: false };
    }

    if (this.starting) {
      return this.starting;
    }

    this.starting = this.doEnsureRunning();
    try {
      return await this.starting;
    } finally {
      this.starting = null;
    }
  }

  private async doEnsureRunning(): Promise<DockerEnsureResult> {
    const dockerOk = await this.isDockerAvailable();
    if (!dockerOk) {
      return {
        success: false,
        message: 'Docker가 설치되어 있지 않거나 실행 중이 아닙니다.',
        alreadyRunning: false,
      };
    }

    const running = await this.isContainerRunning();
    if (running) {
      const healthy = await this.waitForHealth(5000);
      return {
        success: healthy,
        message: healthy ? 'Crawl4AI Docker 이미 실행 중' : 'Crawl4AI 컨테이너는 실행 중이나 API 응답 없음',
        alreadyRunning: true,
      };
    }

    const exists = await this.containerExists();
    if (exists) {
      const started = await this.startContainer();
      if (!started.success) return started;

      const healthy = await this.waitForHealth(90000);
      return {
        success: healthy,
        message: healthy
          ? 'Crawl4AI Docker 컨테이너 시작됨'
          : 'Crawl4AI 컨테이너 시작했으나 API 준비 시간 초과',
        alreadyRunning: false,
      };
    }

    const created = await this.createContainer();
    if (!created.success) return created;

    const healthy = await this.waitForHealth(120000);
    return {
      success: healthy,
      message: healthy
        ? 'Crawl4AI Docker 이미지 pull 및 컨테이너 생성 완료'
        : 'Crawl4AI 컨테이너 생성했으나 API 준비 시간 초과 (이미지 pull 중일 수 있음)',
      alreadyRunning: false,
    };
  }

  private async isDockerAvailable(): Promise<boolean> {
    const result = await this.workspace.executeTerminal('docker info --format "{{.ServerVersion}}"');
    return result.exitCode === 0 && !!result.stdout.trim();
  }

  private async isContainerRunning(): Promise<boolean> {
    const name = this.getContainerName();
    const result = await this.workspace.executeTerminal(
      `docker ps --filter name=^/${name}$ --filter status=running --format "{{.Names}}"`
    );
    return result.stdout.trim() === name;
  }

  private async containerExists(): Promise<boolean> {
    const name = this.getContainerName();
    const result = await this.workspace.executeTerminal(
      `docker ps -a --filter name=^/${name}$ --format "{{.Names}}"`
    );
    return result.stdout.trim() === name;
  }

  private async startContainer(): Promise<DockerEnsureResult> {
    const name = this.getContainerName();
    const result = await this.workspace.executeTerminal(`docker start ${name}`);
    if (result.exitCode !== 0) {
      return {
        success: false,
        message: `docker start 실패: ${result.stderr || result.stdout}`,
        alreadyRunning: false,
      };
    }
    return { success: true, message: 'Container started', alreadyRunning: false };
  }

  private async createContainer(): Promise<DockerEnsureResult> {
    const name = this.getContainerName();
    const image = this.getImage();
    const port = this.getPort();

    const result = await this.workspace.executeTerminal(
      `docker run -d -p ${port}:11235 --name ${name} --shm-size=1g --restart unless-stopped ${image}`,
      300000
    );

    if (result.exitCode !== 0) {
      return {
        success: false,
        message: `docker run 실패: ${result.stderr || result.stdout}`,
        alreadyRunning: false,
      };
    }

    return { success: true, message: 'Container created', alreadyRunning: false };
  }

  private async waitForHealth(timeoutMs: number): Promise<boolean> {
    const baseUrl =
      vscode.workspace.getConfiguration('agentCompany').get<string>('crawl4aiBaseUrl') ||
      `http://localhost:${this.getPort()}`;

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const response = await fetch(baseUrl, { signal: AbortSignal.timeout(3000) });
        if (response.ok) return true;
      } catch {
        // retry
      }
      await sleep(2000);
    }
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
