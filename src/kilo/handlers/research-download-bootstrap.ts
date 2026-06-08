import * as fs from 'fs';
import * as path from 'path';
import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../../agent-folders';
import { KnowledgeLearner } from '../../agent-folders/knowledge-learner';
import { Agent } from '../../types';
import { WorkspaceEngine } from '../../workspace';
import { KiloExecutionResult } from '../types';

const KNOWLEDGE_FILE = 'research-auto-download.md';
const SCRIPT_NAME = 'download_research_assets.py';

export function isResearchDownloadBootstrapTask(task: string): boolean {
  const text = task.trim();
  if (!text) return false;
  const wantsCode = /코드|스크립트|자동|구현|만들|짜/i.test(text);
  const wantsDownload = /다운|download|받|수집|pdf/i.test(text);
  const wantsLearn = /학습|지식|knowledge|가르쳐|시켜/i.test(text);
  const researchContext = /한서준|리서치|research|출처|평가원|suneung/i.test(text);
  return wantsCode && wantsDownload && (wantsLearn || researchContext);
}

function resolveTemplatePath(workspace: WorkspaceEngine, extensionTemplatePath?: string): string | null {
  if (extensionTemplatePath && fs.existsSync(extensionTemplatePath)) {
    return extensionTemplatePath;
  }
  const root = workspace.getWorkspaceRoot();
  if (root) {
    const wsTemplate = path.join(root, 'src/team/templates/download_suneung_pdfs.py');
    if (fs.existsSync(wsTemplate)) return wsTemplate;
  }
  return null;
}

export async function tryResearchDownloadBootstrap(
  task: string,
  agent: Agent,
  workspace: WorkspaceEngine,
  agentFolders?: AgentFolderEngine,
  knowledgeLearner?: KnowledgeLearner,
  extensionTemplatePath?: string
): Promise<KiloExecutionResult | null> {
  if (!isResearchDownloadBootstrapTask(task)) return null;
  if (!agentFolders) return null;

  const slug = agentFolders.resolveSlug(agent);
  await agentFolders.provisionAgent(agent);

  const templatePath = resolveTemplatePath(workspace, extensionTemplatePath);
  const scriptRel = `outputs/scripts/${SCRIPT_NAME}`;
  let scriptSaved: string | null = null;

  if (templatePath) {
    const scriptBody = fs.readFileSync(templatePath, 'utf-8');
    scriptSaved = await agentFolders.writeText(slug, scriptRel, scriptBody);
  }

  const knowledgeBody = `# 리서치 자료 자동 다운로드 (하정우)

## 역할
@한서준(리서처)이 조사한 **fileSeq·URL·출처**를 바탕으로 PDF를 일괄 다운로드합니다.

## 스크립트
- 경로: \`agent/${slug}/${scriptRel}\`
- 원본 템플릿: \`src/team/templates/download_suneung_pdfs.py\`

## 수능 PDF (평가원 공식)
\`\`\`bash
python3 agent/${slug}/${SCRIPT_NAME} \\
  --out company/projects/{프로젝트폴더}/files/pdfs \\
  --subjects 국어,수학 \\
  --years 2005,2006,2010
\`\`\`

- 공식 게시판: https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234
- 구 영역명: **언어=국어**, **수리=수학** (2006년 이전)
- page 18까지 (2005년~)

## Project 연동
1. @한서준 — 출처·fileSeq 조사 (Research Planner)
2. @하정우 — 이 스크립트 실행·경로 저장
3. @박준호 — PDF 검증·PM 보고

## 검증
- 다운로드 파일은 %PDF 헤더 확인
- 완료 보고 시 **저장 경로 전체** 필수
`;

  const knowledgeRel = `${AGENT_FOLDER_LAYOUT.knowledge}/${KNOWLEDGE_FILE}`;
  const knowledgeSaved = await agentFolders.writeText(slug, knowledgeRel, knowledgeBody);

  if (knowledgeLearner) {
    await knowledgeLearner.syncAgent(agent, { force: true });
  }

  const filesModified = [knowledgeSaved, scriptSaved].filter((p): p is string => !!p);

  const output = [
    '✅ 리서치 자료 자동 다운로드 스크립트·지식을 등록했습니다.',
    '',
    knowledgeSaved ? `📚 Knowledge: ${knowledgeSaved}` : '',
    scriptSaved ? `🐍 Script: ${scriptSaved}` : '⚠️ 템플릿 스크립트를 찾지 못했습니다.',
    '',
    '한서준이 찾은 fileSeq/URL을 `--years`, `--subjects`에 맞춰 실행하면 됩니다.',
    '',
    'FINISHED',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    mode: 'coder',
    plan: {
      mode: 'coder',
      objective: task,
      steps: ['템플릿 스크립트 복사', 'knowledge 등록', '학습 동기화'],
      filesToModify: filesModified,
    },
    output,
    filesModified,
    selfCheckPassed: filesModified.length > 0,
    usedCli: false,
  };
}
