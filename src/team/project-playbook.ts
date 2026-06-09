import { Agent, AgentRole } from '../types';

export const PROJECT_PLAYBOOK_MARKER = '[ProjectPlaybook v1]';
export const PROJECT_PLAYBOOK_FILENAME = 'project-playbook.md';
export const SUNEUNG_PDF_PLAYBOOK_FILENAME = 'suneung-pdf-download.md';

/** 사장님 → PM → Project 표준 5단계 (검증된 워크플로) */
export function getProjectPlaybookSummary(): string {
  return `${PROJECT_PLAYBOOK_MARKER}

## AgentCompany Project 표준 절차 (필수)

사장님이 PM에게 업무를 지시하면 아래 **5단계**를 따릅니다.

### 1. 목표
- 사장님 지시에서 **한 문장 목표** + 산출물·범위·제외 항목을 명확히 합니다.

### 2. 계획
- Phase 단위로 나눕니다 (리서치 → 구현/실행 → 검증 → PM 보고).
- 각 태스크마다 **작업 → 검토 루프**(최대 5회, FINISHED 키워드)가 돌아갑니다.

### 3. 작업 분배
- 계획을 **번호 + @에이전트명: 할 일** 형식으로 작성합니다.
- 예: \`1. @한서준: 공식 PDF 출처 URL 조사\`

### 4. 에이전트 선별
- **실제 회사 에이전트 roster만** 사용 (가상 직함·외부 인력 금지).
- role·title·capabilities로 매칭 (리서치→researcher, 자동화→backend, 도메인→전문가).

### 5. 승인 후 Project 실행
- PM이 계획을 사장님께 제시하고 **"진행하세요"** 승인을 요청합니다.
- 승인 시: Project 채팅방 생성 → Projects 탭 등록 → 에이전트 순차 협업.
- 산출물: \`company/projects/{프로젝트폴더}/\` (tasks/, files/, \`{프로젝트명}_{날짜}_{작성자}.md\` 최종 보고)
- 이전 태스크 산출물은 **carry_data**로 다음 태스크에 전달됩니다.

## PM 1:1 대화 출력 형식 (권장)

\`\`\`
## 목표
(한 문장)

## 계획
P1 … / P2 … / P3 …

## 작업 분배
1. @에이전트명: 할 일
2. @에이전트명: 할 일

## 참여 에이전트
@박준호 · @한서준 · …

확정되시면 "진행하세요"라고 말씀해 주시면 Project를 시작합니다.
\`\`\`
`;
}

export function getPmProjectPlaybookExtension(): string {
  return `## PM 전용 — Project 오케스트레이션

- 사장님 지시 수신 → **목표·계획·분배·에이전트** 4블록을 먼저 제시
- **인터넷·웹 PDF 다운로드** 요청 시 knowledge/·로컬 폴더 파일 검색 **절대 금지** — 외부 수집 Project로 계획
- @한서준 → 리서치 파이프라인 **실제 실행** / @하정우 → **Cline** 스크립트·코드 **실제 실행**
- roster에 없는 인물·역할을 만들지 말 것
- PDF/수집 업무: @한서준(출처) → @하정우(스크립트) → 도메인 전문가(검증) 순
- 영상/콘텐츠: @서윤아델린 + @하정우 조합 검토
- 계획 확정 전에는 Project 채팅방을 열지 않음
- 승인 키워드: "진행하세요", "시작하세요", "프로젝트 진행"`;
}

export function getRoleProjectPlaybookSnippet(role: AgentRole, agent: Agent): string {
  const name = agent.name;
  switch (role) {
    case 'pm':
      return getPmProjectPlaybookExtension();
    case 'researcher':
      return `## @${name} — Project 리서치 역할
- 공식 출처(A급) 우선, URL·fileSeq·파일명 규칙을 표로 정리
- PDF는 원문 확보 우선, 출처 없는 정보는 "불확실" 표기
- 수능 PDF: suneung.re.kr boardCnts/fileDown.do (검증됨)`;
    case 'backend':
    case 'frontend':
    case 'devops':
      if (/하정우/.test(name)) {
        return `## @${name} — Project Cline 자동화 역할
- **Cline 엔진**으로 코드·스크립트 구현 (CLI → Internal 폴백)
- 이전 태스크(carry_data)의 URL·fileSeq를 스크립트에 반영
- 산출물: \`company/projects/{sessionId}/files/\` 또는 \`agent/하정우_개발자/outputs/scripts/\`
- Python urllib/curl 등으로 실제 다운로드 후 %PDF 헤더 검증`;
      }
      return `## @${name} — Project 자동화 역할
- 이전 태스크(carry_data)의 URL·fileSeq를 기반으로 스크립트 구현
- 산출물은 filepath 블록으로 \`company/projects/{sessionId}/files/\` 에 저장
- Python urllib/curl 등으로 실제 다운로드 후 %PDF 헤더 검증`;
    default:
      if (/국어|수능|교육/i.test(agent.title ?? '')) {
        return `## @${name} — Project 도메인 검증
- 다운로드된 PDF 메타(학년도·영역·회차) 검증, 누락·중복 체크
- 승인 시 마지막 줄에 FINISHED 포함`;
      }
      if (/수리|수학/i.test(agent.title ?? '')) {
        return `## @${name} — 수학 PDF 검증
- 수학 영역 PDF 메타·분류 검증, 2차 확장 시 담당`;
      }
      return `## @${name} — Project 참여
- 배정된 태스크만 수행, carry_data 참고, 완료 시 FINISHED`;
  }
}

export interface ProjectTemplateHint {
  id: string;
  title: string;
  goal: string;
  planOutline: string;
  suggestedPlan: string;
}

const SUNEUNG_PDF_TEMPLATE: ProjectTemplateHint = {
  id: 'suneung_pdf_download',
  title: '수능 기출 PDF 다운로드',
  goal: '평가원 공식 출처에서 수능 기출·모의고사 PDF를 수집·다운로드하고 과목·학년도별로 정리',
  planOutline: 'P1 출처조사(@한서준) → P2 자동화(@하정우) → P3 도메인검증(@김윤하/최현석) → P4 PM보고(@박준호)',
  suggestedPlan: `1. @한서준: 평가원 suneung.re.kr 기출 게시판 URL·fileSeq 조사, 출처 신뢰도 표 작성
2. @하정우: 조사 결과 기반 PDF 일괄 다운로드 Python 스크립트 구현, company/projects/{sessionId}/files/pdfs/ 저장
3. @김윤하: 국어 PDF 메타(학년도·영역) 검증, 누락·중복 체크
4. @박준호: 최종 보고서(\`{프로젝트명}_{날짜}_박준호.md\`) 작성 및 사장님 보고`,
};

/** 업무 키워드 → 검증된 Project 템플릿 */
export function detectProjectTemplate(command: string): ProjectTemplateHint | null {
  const text = command.trim();
  if (!text) return null;

  const isSuneung = /수능|기출|csat|suneung|평가원/i.test(text);
  const isPdf = /pdf|다운|수집|받아|저장/i.test(text);

  if (isSuneung && isPdf) {
    return SUNEUNG_PDF_TEMPLATE;
  }

  if (isPdf && /문제|시험|교육/i.test(text)) {
    return SUNEUNG_PDF_TEMPLATE;
  }

  return null;
}

export function formatProjectTemplateHint(template: ProjectTemplateHint): string {
  return `## 참고: 검증된 Project 템플릿 — ${template.title}
- 목표: ${template.goal}
- Phase: ${template.planOutline}
- 권장 분배:
${template.suggestedPlan}`;
}

export function getSuneungPdfPlaybook(): string {
  return `[SuneungPdfPlaybook v1]

## 수능 PDF 다운로드 — 검증된 방법 (2026-06-08)

### 공식 출처 (A급)
- 사이트: https://www.suneung.re.kr
- 기출 목록: \`boardCnts/list.do?boardID=1500234&m=0403&s=suneung\`
- 모의평가: \`boardCnts/list.do?boardID=1500236&m=0403&s=suneung\`
- 다운로드: \`boardCnts/fileDown.do?fileSeq={hex}\`
- 로그인 불필요, curl/Python urllib로 직접 다운로드 가능

### 파일명 규칙
- \`{학년도}학년도_{영역}영역_문제지.pdf\`
- 예: 2026학년도_국어영역_문제지.pdf

### Project 산출물 경로
- \`company/projects/{sessionId}/files/pdfs/대학수학능력시험/\`
- \`company/projects/{sessionId}/files/scripts/download_suneung_pdfs.py\`

### 실행 예시
\`\`\`bash
python3 company/projects/{sessionId}/files/scripts/download_suneung_pdfs.py \\
  --out company/projects/{sessionId}/files/pdfs \\
  --subjects 국어,수학 --years 2025,2026
\`\`\`

### 검증된 fileSeq (2025·2026 국어·수학)
| 학년도 | 영역 | fileSeq |
|--------|------|---------|
| 2026 | 국어 | 60defdef6d83db1b756f841089563c5a |
| 2026 | 수학 | f9055b3484e9176cea7c74b9819a7d2c |
| 2025 | 국어 | f69d814736f441f73178e9fadbdbd309 |
| 2025 | 수학 | 20b8f2daf89db9ff668b257f6b51ea75 |
`;
}
