/**
 * Kilo Adapter — AgentCompany ↔ Kilo Code bridge
 *
 * Flow:
 *   AgentCompany → Orchestrator → Kilo Agent → Kilo CLI / Internal Engine
 */

import { WorkspaceEngine } from '../workspace';
import { KiloCliAdapter } from '../kilo/adapters/kilo-cli';

export interface KiloTaskRequest {
  agentId: string;
  taskId: string;
  prompt: string;
  workspaceRoot: string;
}

export interface KiloTaskResult {
  success: boolean;
  filesModified: string[];
  output: string;
  usedCli: boolean;
}

export class KiloAdapter {
  private cli: KiloCliAdapter;

  constructor(workspace: WorkspaceEngine) {
    this.cli = new KiloCliAdapter(workspace);
  }

  async isAvailable(): Promise<boolean> {
    return this.cli.isAvailable();
  }

  async execute(request: KiloTaskRequest): Promise<KiloTaskResult> {
    const result = await this.cli.execute(request.prompt);
    if (result) {
      return {
        success: true,
        filesModified: result.filesModified,
        output: result.output,
        usedCli: true,
      };
    }

    return {
      success: false,
      filesModified: [],
      output: 'Kilo CLI unavailable — use internal Kilo Agent pipeline via Orchestrator',
      usedCli: false,
    };
  }
}
