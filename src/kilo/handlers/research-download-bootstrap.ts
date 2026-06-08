import * as fs from 'fs';
import * as path from 'path';
import { AgentFolderEngine, AGENT_FOLDER_LAYOUT } from '../../agent-folders';
import { KnowledgeLearner } from '../../agent-folders/knowledge-learner';
import { Agent } from '../../types';
import { WorkspaceEngine } from '../../workspace';

const KNOWLEDGE_FILE = 'research-auto-download.md';
const SCRIPT_NAME = 'download_research_assets.py';

export interface ResearchDownloadPrep {
  files: string[];
  knowledgePath: string | null;
  scriptPath: string | null;
  learnedFiles: string[];
  contextBlock: string;
}

export function isResearchDownloadBootstrapTask(task: string): boolean {
  const text = task.trim();
  if (!text) return false;
  const wantsCode = /코드|스크립트|자동|구현|만들|짜/i.test(text);
  const wantsDownload = /다운|download|받|수집|pdf/i.test(text);
  const wantsLearn = /학습|지식|knowledge|가르쳐|시켜/i.test(text);
  const researchContext = /한서준|리서치|research|출처|평가원|suneung|인터넷/i.test(text);
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

function readLearnedSummary(agentFolders: AgentFolderEngine, slug: string): string {
  const summaryPath = path.join(
    agentFolders.getAgentDir(slug),
    AGENT_FOLDER_LAYOUT.knowledge,
    '_learned',
    `${KNOWLEDGE_FILE.replace(/\.md$/, '')}.summary.md`
  );
  try {
    return fs.readFileSync(summaryPath, 'utf-8').slice(0, 1200);
  } catch {
    return '';
  }
}

/** 템플릿·knowledge 준비만 — 이후 Kilo FileEditor가 실제 커스터마이징 */
export async function prepareResearchDownloadAssets(
  task: string,
  agent: Agent,
  workspace: WorkspaceEngine,
  agentFolders?: AgentFolderEngine,
  knowledgeLearner?: KnowledgeLearner,
  extensionTemplatePath?: string
): Promise<ResearchDownloadPrep | null> {
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
- 엔진: Python urllib — 평가원 \`fileDown.do?fileSeq=\` 직접 호출

## 수능 PDF (평가원 공식)
\`\`\`bash
python3 agent/${slug}/${scriptRel} \\
  --out company/projects/{프로젝트폴더}/files/pdfs \\
  --subjects 국어,수학 \\
  --years 2005,2006,2010
\`\`\`

- 공식 게시판: https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234
- 구 영역명: **언어=국어**, **수리=수학** (2006년 이전)
- page 20까지 크롤 (2005년~)

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

  let learnedFiles: string[] = [];
  if (knowledgeLearner) {
    const sync = await knowledgeLearner.syncAgent(agent, { force: true });
    learnedFiles = sync.learned;
  }

  const learnedSummary = readLearnedSummary(agentFolders, slug);
  const files = [knowledgeSaved, scriptSaved].filter((p): p is string => !!p);

  const contextBlock = [
    '[리서치 다운로드 자산 준비 완료]',
    scriptSaved ? `스크립트: ${scriptSaved} (평가원 PDF 템플릿 기반)` : '',
    knowledgeSaved ? `knowledge: ${knowledgeSaved}` : '',
    learnedFiles.length ? `학습 반영: ${learnedFiles.join(', ')}` : '',
    learnedSummary ? `학습 요약:\n${learnedSummary}` : '',
    '요청: 한서준 조사 URL/fileSeq 기반 범용 다운로드 로직을 스크립트에 반영·보완하세요.',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    files,
    knowledgePath: knowledgeSaved,
    scriptPath: scriptSaved,
    learnedFiles,
    contextBlock,
  };
}

export function buildResearchDownloadDeliverableReport(
  prep: ResearchDownloadPrep,
  extras: {
    editorSummary?: string;
    allFiles: string[];
    reportPath?: string;
    selfCheckPassed: boolean;
  }
): string {
  const lines = [
    '사장님, 리서치 자료 다운로드 자동화 작업을 마쳤습니다.',
    '',
    '## 학습한 내용',
  ];

  if (prep.learnedFiles.length > 0) {
    lines.push(`- knowledge 학습 반영: ${prep.learnedFiles.join(', ')}`);
  }
  if (prep.knowledgePath) {
    lines.push(`- \`${prep.knowledgePath}\` — 평가원 fileSeq, 구 영역명(언어/수리), 실행법`);
  } else {
    lines.push('- (knowledge 파일 없음)');
  }

  lines.push('', '## 작성·준비한 코드');
  if (prep.scriptPath) {
    lines.push(
      `- \`${prep.scriptPath}\``,
      '  - 평가원 기출 게시판 크롤 → `fileDown.do` PDF 저장',
      '  - 함수: `fetch_html`, `parse_entries`, `download_pdf`, `main`',
      '  - 템플릿: `src/team/templates/download_suneung_pdfs.py`'
    );
  }

  if (extras.editorSummary?.trim()) {
    lines.push('', '## 추가 구현 (Kilo File Editor)', extras.editorSummary.trim().slice(0, 800));
  }

  if (extras.allFiles.length > 0) {
    lines.push('', '## 산출물 경로');
    for (const f of extras.allFiles) {
      lines.push(`- \`${f}\``);
    }
  }

  lines.push(
    '',
    '## 실행 예시',
    '```bash',
    `python3 ${prep.scriptPath ?? `agent/하정우_개발자/outputs/scripts/${SCRIPT_NAME}`} \\`,
    '  --out company/projects/{프로젝트}/files/pdfs \\',
    '  --subjects 국어,수학 --years 2005,2006',
    '```'
  );

  if (extras.reportPath) {
    lines.push('', `📄 상세 리포트: \`${extras.reportPath}\``);
  }

  lines.push('', extras.selfCheckPassed ? '✅ 자체 검증 통과' : '⚠️ 자체 검증 이슈 — 리포트 확인 필요');
  lines.push('', 'FINISHED');

  return lines.join('\n');
}
