import * as vscode from 'vscode';
import { spawn } from 'child_process';

export interface FileOperation {
  path: string;
  content?: string;
}

export class WorkspaceEngine {
  constructor(private context: vscode.ExtensionContext) {}

  async readFile(relativePath: string): Promise<string | null> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return null;

    try {
      const content = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(content).toString('utf-8');
    } catch {
      return null;
    }
  }

  async createFile(relativePath: string, content: string): Promise<boolean> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return false;

    try {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
      return true;
    } catch {
      return false;
    }
  }

  async updateFile(relativePath: string, content: string): Promise<boolean> {
    return this.createFile(relativePath, content);
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return false;

    try {
      await vscode.workspace.fs.delete(uri);
      return true;
    } catch {
      return false;
    }
  }

  async searchProject(query: string, maxResults = 50): Promise<{ file: string; line: number; text: string }[]> {
    const results: { file: string; line: number; text: string }[] = [];
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return results;

    const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', maxResults * 2);

    for (const file of files) {
      if (results.length >= maxResults) break;

      try {
        const content = Buffer.from(await vscode.workspace.fs.readFile(file)).toString('utf-8');
        const lines = content.split('\n');
        const relativePath = vscode.workspace.asRelativePath(file);

        lines.forEach((line, index) => {
          if (results.length >= maxResults) return;
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({ file: relativePath, line: index + 1, text: line.trim() });
          }
        });
      } catch {
        // skip unreadable files
      }
    }

    return results;
  }

  async executeTerminal(
    command: string,
    timeoutMs = 60000
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const cwd = workspaceFolder?.uri.fsPath ?? process.cwd();

    return new Promise((resolve) => {
      const shell = process.env.SHELL || '/bin/zsh';
      const child = spawn(shell, ['-lc', command], {
        cwd,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let settled = false;

      const finish = (exitCode: number) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ stdout, stderr, exitCode });
      };

      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        finish(124);
      }, timeoutMs);

      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      child.on('error', () => finish(1));
      child.on('close', (code) => finish(code ?? 1));
    });
  }

  async executeGit(args: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return this.executeTerminal(`git ${args}`);
  }

  getWorkspaceRoot(): string | null {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
  }

  async ensureDirectory(relativePath: string): Promise<boolean> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return false;
    try {
      await vscode.workspace.fs.createDirectory(uri);
      return true;
    } catch {
      return false;
    }
  }

  async writeBinaryFile(relativePath: string, data: Uint8Array): Promise<boolean> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return false;
    try {
      await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(uri, '..'));
      await vscode.workspace.fs.writeFile(uri, data);
      return true;
    } catch {
      return false;
    }
  }

  async readBinaryHead(relativePath: string, bytes: number): Promise<Buffer | null> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return null;
    try {
      const content = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(content.slice(0, bytes));
    } catch {
      return null;
    }
  }

  async getFileSize(relativePath: string): Promise<number | null> {
    const uri = this.resolveUri(relativePath);
    if (!uri) return null;
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      return stat.size;
    } catch {
      return null;
    }
  }

  private resolveUri(relativePath: string): vscode.Uri | null {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return null;
    return vscode.Uri.joinPath(workspaceFolder.uri, relativePath);
  }
}
