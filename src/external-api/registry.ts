import { AgentManager } from '../agents';
import { MemoryEngine } from '../memory';
import { ExternalApiService } from '../services/external-api';
import { buildRegistrySummary, EXTERNAL_API_REGISTRY_MARKER } from './auto-detect';

/** API 등록/변경 시 모든 에이전트에 레지스트리 자동 동기화 */
export class ExternalApiRegistrySync {
  constructor(
    private externalApis: ExternalApiService,
    private agents: AgentManager,
    private memory: MemoryEngine
  ) {}

  sync(): void {
    const summary = buildRegistrySummary(this.externalApis.getAll());

    for (const agent of this.agents.getAll()) {
      const memory = this.memory.getAgentMemory(agent.id);
      const stripped = stripRegistryBlock(memory);
      this.memory.clearAgentMemory(agent.id);
      if (stripped.trim()) {
        this.memory.appendAgentMemory(agent.id, stripped.trim());
      }
      this.memory.appendAgentMemory(agent.id, summary);
    }
  }
}

function stripRegistryBlock(memory: string): string {
  if (!memory.includes(EXTERNAL_API_REGISTRY_MARKER)) return memory;

  const lines = memory.split('\n');
  const result: string[] = [];
  let skipping = false;

  for (const line of lines) {
    if (line.includes(EXTERNAL_API_REGISTRY_MARKER)) {
      skipping = true;
      continue;
    }
    if (skipping && line.startsWith('[') && !line.includes('ExternalApiRegistry')) {
      skipping = false;
    }
    if (!skipping) result.push(line);
  }

  return result.join('\n').trim();
}
