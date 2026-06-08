import * as path from 'path';
import { Agent } from '../types';
import type { AgentFolderEngine } from '../agent-folders';

export const PLATFORM_STRUCTURE_MARKER = '[PlatformStructure v1]';
export const PLATFORM_STRUCTURE_FILENAME = 'platform-structure.md';

export type PlatformInquiryKind = 'agent_path' | 'owner_path' | 'database' | 'structure' | 'full';

const PLATFORM_INQUIRY_SIGNAL =
  /(?:플랫폼|프로그램|구조|아키텍처|소스\s*코드|extension|확장|agentcompany)/i;

const AGENT_PATH_SIGNAL =
  /(?:너(?:의)?|니(?:가)?|네|당신(?:의)?)\s*(?:경로|폴더|디렉터리|directory)|경로(?:는|이)?\s*(?:뭐|어디|어떻)/i;

const DB_INQUIRY_SIGNAL =
  /(?:데이터\s*베이스|database|db|agentcompany\.db).{0,20}(?:어디|경로|못\s*찾|찾아|위치|알려)|(?:db|데이터\s*베이스)\s*(?:경로|위치)/i;

/** 개발자 에이전트 — 플랫폼·경로·DB 질문 (코드 작업 아님) */
export function detectPlatformInquiry(command: string): PlatformInquiryKind | null {
  const text = command.trim();
  if (!text) return null;

  const wantsDb = DB_INQUIRY_SIGNAL.test(text);
  const wantsAgentPath = AGENT_PATH_SIGNAL.test(text);
  const wantsStructure = PLATFORM_INQUIRY_SIGNAL.test(text);

  const signalCount = [wantsDb, wantsAgentPath, wantsStructure].filter(Boolean).length;
  if (signalCount >= 2) return 'full';
  if (wantsDb) return 'database';
  if (wantsAgentPath) return 'agent_path';
  if (wantsStructure) return 'structure';

  return null;
}

export function isDeveloperAgent(agent: Agent): boolean {
  return (
    agent.capabilities?.includes('cline-code') === true ||
    agent.role === 'backend' ||
    agent.role === 'frontend' ||
    agent.role === 'devops' ||
    (agent.title?.includes('개발') ?? false) ||
    agent.name.includes('하정우')
  );
}

export interface PlatformPaths {
  workspaceRoot: string;
  agentRoot: string;
  companyDir: string;
  ownerDir: string;
  dbPath: string;
  extensionSrc: string;
  agentSlug: string;
  agentDir: string;
}

export function resolvePlatformPaths(agentFolders: AgentFolderEngine, agent: Agent): PlatformPaths {
  const workspaceRoot = agentFolders.getWorkspaceRoot();
  const storagePath = agentFolders.getGlobalStoragePath();
  const slug = agentFolders.resolveSlug(agent);
  return {
    workspaceRoot,
    agentRoot: agentFolders.runtimeRoot,
    companyDir: agentFolders.getCompanyDir(),
    ownerDir: agentFolders.getOwnerDir(),
    dbPath: path.join(storagePath, 'agentcompany.db'),
    extensionSrc: path.join(workspaceRoot, 'src'),
    agentSlug: slug,
    agentDir: agentFolders.getAgentDir(slug),
  };
}

export function getPlatformStructureBody(paths: PlatformPaths, agent: Agent): string {
  const agentRel = agentFoldersRelative(paths);
  return `${PLATFORM_STRUCTURE_MARKER}

# AgentCompany 플랫폼 구조 (개발자 필수)

당신은 **${agent.name}(${agent.title ?? agent.role})** — 이 VS Code/Cursor 확장의 **개발 담당**입니다.
아래 경로·모듈을 **항상 정확히** 알고 있으며, 사장님 질문에 즉답하고 **src/ 코드 수정**으로 구조를 변경할 수 있습니다.

## 1. 런타임 폴더 (워크스페이스)

| 용도 | 상대 경로 | 절대 경로 |
|------|-----------|-----------|
| 에이전트 루트 | \`agent/\` | \`${paths.agentRoot}\` |
| **내 작업 폴더** | \`${agentRel.agent}\` | \`${paths.agentDir}\` |
| 내 산출물 | \`${agentRel.outputs}/\` | \`${path.join(paths.agentDir, 'outputs')}\` |
| 회사 데이터 | \`company/\` | \`${paths.companyDir}\` |
| 사장님(Owner) | \`company/owner/\` | \`${paths.ownerDir}\` |
| Project 산출물 | \`company/projects/{세션}/\` | \`${path.join(paths.companyDir, 'projects')}/\` |

## 2. 데이터베이스 (sql.js)

- **파일:** \`agentcompany.db\`
- **절대 경로:** \`${paths.dbPath}\`
- **엔진:** sql.js (SQLite WASM) — \`src/database/index.ts\`
- **주요 테이블:** agents, tasks, team_sessions, activities, ideas

## 3. 확장 소스 코드 (수정 가능)

- **루트:** \`${paths.workspaceRoot}\`
- **소스:** \`${paths.extensionSrc}/\`
- **진입점:** \`src/extension.ts\` → \`dist/extension.js\`
- **오케스트레이터:** \`src/orchestrator/index.ts\` (CEO 명령·에이전트 실행)
- **Cline(코드):** \`src/cline/\` — 하정우 개발 파이프라인
- **리서치:** \`src/research/\` — 한서준 Crawl4AI 파이프라인
- **Project:** \`src/team/\` — PM 협업·순차 실행
- **채팅/명령 해석:** \`src/chat/\`
- **에이전트 폴더:** \`src/agent-folders/\`
- **UI:** \`webview/src/\` → \`dist/\`

## 4. 빌드·릴리스

\`\`\`bash
npm run build      # extension + webview
npm run release    # 빌드 + GitHub 푸시 + VSIX
\`\`\`

## 5. 행동 규칙

- 사장님이 **「너 경로」「DB 어디」** 를 물으면 위 표의 **실제 경로**를 답한다. "경로가 없다"고 하지 않는다.
- 구조 변경·버그 수정은 **src/ 코드**를 수정하고 \`npm run build\`로 검증한다.
- 산출 스크립트는 \`agent/${paths.agentSlug}/outputs/scripts/\` 또는 Project \`files/scripts/\`에 둔다.
`;
}

function agentFoldersRelative(paths: PlatformPaths): { agent: string; outputs: string } {
  return {
    agent: `agent/${paths.agentSlug}`,
    outputs: `agent/${paths.agentSlug}/outputs`,
  };
}

export function buildPlatformStructurePromptBlock(
  agentFolders: AgentFolderEngine,
  agent: Agent
): string {
  const paths = resolvePlatformPaths(agentFolders, agent);
  return getPlatformStructureBody(paths, agent);
}

export function buildPlatformInquiryReply(
  agentFolders: AgentFolderEngine,
  agent: Agent,
  kind: PlatformInquiryKind
): string {
  const paths = resolvePlatformPaths(agentFolders, agent);
  const rel = agentFoldersRelative(paths);
  const lines: string[] = [`사장님, AgentCompany 구조 기준으로 정리해 드릴게요.`];

  if (kind === 'agent_path' || kind === 'full' || kind === 'structure') {
    lines.push(
      '',
      `📁 ${agent.name} 작업 폴더`,
      `· 워크스페이스: \`${rel.agent}\``,
      `· 절대 경로: \`${paths.agentDir}\``,
      `· 스크립트: \`${rel.outputs}/scripts/\``,
      `· 리포트: \`${rel.outputs}/reports/\``
    );
  }

  if (kind === 'owner_path' || kind === 'full') {
    lines.push(
      '',
      '📁 사장님(Owner) 폴더',
      '· `company/owner`',
      `· 절대: \`${paths.ownerDir}\``
    );
  }

  if (kind === 'database' || kind === 'full' || kind === 'structure') {
    lines.push(
      '',
      '🗄️ 데이터베이스',
      '· 파일: `agentcompany.db` (sql.js)',
      `· 절대 경로: \`${paths.dbPath}\``,
      '· 코드: `src/database/index.ts`',
      '· 테이블: agents, tasks, team_sessions, activities …'
    );
  }

  if (kind === 'structure' || kind === 'full') {
    lines.push(
      '',
      '🏗️ 확장 소스 (수정 가능)',
      `· \`${paths.extensionSrc}/orchestrator/\` — 명령 실행`,
      `· \`${paths.extensionSrc}/cline/\` — 하정우 Cline 파이프라인`,
      `· \`${paths.extensionSrc}/research/\` — 리서치`,
      `· \`${paths.extensionSrc}/team/\` — Project`,
      `· \`webview/src/\` — 대시보드 UI`,
      '',
      '구조 변경이 필요하면 말씀해 주세요. src/ 수정 후 `npm run build`로 반영합니다.'
    );
  }

  return lines.join('\n');
}
