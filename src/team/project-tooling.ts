import { Agent } from '../types';
import { isKiloAgent } from '../kilo';
import { isProductionAgent } from '../production';
import { isResearchAgent } from '../research';
import { buildWorkspacePrompt, parseAgentOutput } from '../workspace/action-parser';
import { saveProjectExtractedFile } from './project-artifacts';

/** 역할별 도구 힌트 — ChatDev agent tooling 블록 유사 */
export function buildWorkerToolingHint(agent: Agent): string {
  const lines: string[] = ['## Tooling'];

  if (isKiloAgent(agent) || agent.role === 'backend' || agent.role === 'frontend' || agent.role === 'devops') {
    lines.push('- 코드·설정 파일이 필요하면 filepath 블록으로 출력 (워크스페이스에 저장됨)');
    lines.push(buildWorkspacePrompt(agent.role).trim());
  } else if (isResearchAgent(agent) || agent.role === 'researcher') {
    lines.push('- 조사 결과는 출처·핵심 요약·다음 단계 권장을 포함');
    lines.push('- 필요 시 markdown 표·목록으로 구조화');
  } else if (isProductionAgent(agent) || agent.role === 'writer' || agent.role === 'designer') {
    lines.push('- 대본·기획·콘텐츠 산출물은 섹션별 markdown으로 작성');
    lines.push('- 파일 저장이 필요하면 ```filepath:outputs/plans/파일명.md` 형식 사용');
  } else {
    lines.push('- 산출물은 실행 가능한 형태(목록·표·초안)로 작성');
  }

  return lines.join('\n');
}

export function extractAndSaveProjectFiles(
  companyDir: string,
  sessionId: string,
  output: string
): string[] {
  const parsed = parseAgentOutput(output);
  const saved: string[] = [];
  for (const file of parsed.files) {
    if (!file.content?.trim() || !file.path) continue;
    const rel = saveProjectExtractedFile(companyDir, sessionId, file.path, file.content);
    saved.push(rel);
  }
  return saved;
}
