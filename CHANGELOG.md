# Changelog

버전을 올릴 때마다 **이 파일 최상단**에 해당 버전의 변경 내용을 기록합니다.

- 상세 릴리스·VSIX: [releases/CHANGELOG.md](./releases/CHANGELOG.md)
- VSIX 설치: [releases/README.md](./releases/README.md)

---

## [1.7.92] - 2026-06-08

### Fixed

- **하정우 완료 보고 누락** — `Files modified:` 포함 시 `isImplementationPlanReply`가 채팅 답변 전체를 차단하던 문제
- **Bootstrap 조기 종료** — 템플릿 복사만 하고 Kilo File Editor 없이 FINISHED 처리하던 문제 → 준비 후 File Editor·자체검증 계속 실행

### Changed

- 리서치 다운로드 작업 완료 시 **학습 내용·코드·산출물 경로·실행 예시** 구조화 보고

---

## [1.7.91] - 2026-06-08

### Added

- **대시보드 ↻ 버튼** — 클릭 시 워크스페이스에서 `npm run release` (빌드·VSIX·설치·GitHub 푸시) 후 **Reload Window** 자동 실행

---

## [1.7.90] - 2026-06-08

### Fixed

- **하정우 Kilo 멈춤** — `kilo --version` / `npx @kilocode/cli` 확인이 45초+ 걸려 `working` 상태로 고착되던 문제
  - CLI 확인: `command -v` + 5초 타임아웃, `npx`는 `isAvailable`에서 제거
  - 전체 CLI 체크 8초 상한 (`Promise.race`)
  - `kiloCliAutoCheck: false` 설정 시 즉시 내부 엔진 사용

### Added

- **Research Download Bootstrap** — 「한서준 자료 자동 다운로드 코드 + 학습」 요청 시 Kilo CLI 없이
  - `outputs/scripts/download_research_assets.py` 복사
  - `knowledge/research-auto-download.md` 등록 + 학습 동기화

---

## [1.7.89] - 2026-06-08

### Added

- **Research Planner** — LLM + agent knowledge로 검색어·공식 URL·전략 자동 생성
- **Multi-Search** — 다중 쿼리 병렬 검색, 공식 도메인 우선 정렬, 쿼리 변형 폴백
- **Known Source Registry** — 수능(평가원 공식 → 호랭이 미러) 등 도메인 커넥터 패턴
- **교차검증 요약** — A/B/C 신뢰도·출처 대조·불확실 표시 리포트

### Changed

- 리서치 파이프라인: Planner → Search → Known Sources → Crawl(8페이지) → Verify → Report
- 다운로드 연도 범위 시 `getMaxDownloads` 자동 확대
- 한서준 knowledge: `research-pipeline.md` 추가

---

## [1.7.88] - 2026-06-08

### Changed

- **Project 채팅 헤더** — 상단에 프로젝트명, 아래에 참여 에이전트 얼굴·이름 표시 (PM 배지)
- **산출물 폴더** — `company/projects/{프로젝트명_YYYYMMDD}/` 형식으로 저장

### Fixed

- Project 채팅에서 에이전트 프로필 사진이 로드되지 않던 문제 (`buildThreadConfig` 조기 반환)
- 수능 PDF — 호랭이닷컴 대신 **평가원 공식 스크립트 우선 실행** (Research 실패 전에 다운로드)

---

## [1.7.87] - 2026-06-08

### Changed

- **Project 채팅방 제목** — `에이전트 A ↔ 박준호` 대신 **프로젝트 목표/지시 제목** 표시
- **Project 채팅방 부제** — `PM: 박준호 · 팀원: 한서준, 하정우, …` 참여 에이전트 표시
- Project 탭 카드 제목도 동일 규칙으로 짧게 정리

---

## [1.7.86] - 2026-06-08

### Fixed

- **`providers.chat` 인자 순서** — Project PM 계획·검토·Worker LLM 호출 시 `messages is not iterable` 오류 수정
- **`진행해줘` / `시작해줘`** — Project 승인 트리거에 `~줘` 표현 추가

### Added

- **PM 계획 승인 UI** — 박준호가 계획 제시 후 **「진행하세요」** 버튼 표시
- **계획 수정 요청** — 「수정 요청」 버튼 또는 "아니 ~ 바꿔줘" 말로 재계획 가능

---

## [1.7.85] - 2026-06-08

### Added

- **Project Worker 실행 엔진** — Cursor처럼 프로그램 작성·실행
  - @한서준 → Research 파이프라인 실제 실행 (검색·크롤·PDF 다운로드)
  - @하정우 → Kilo 파이프라인 실제 실행 (코드·터미널)
  - `.py` / `.sh` 스크립트 저장 후 **자동 터미널 실행**
  - 수능 PDF → 번들 `download_suneung_pdfs.py` 자동 실행

### Changed

- `isDevTaskQuery` — 다운로드·저장·수집 키워드 시 개발자 에이전트 Kilo 경로
- Project Tooling 힌트 — 「작성하면 자동 실행」 명시

---

## [1.7.84] - 2026-06-08

### Fixed

- **PM PDF 다운로드 오인** — "인터넷에서 다운받아 저장"을 로컬 폴더 파일 검색으로 잘못 처리하던 문제 수정
- `isExternalResourceFetchTask` — 외부 수집 업무는 파일 전달 대신 PM 계획·Project 경로로 라우팅
- PM 프롬프트 — 인터넷 PDF 요청 시 knowledge/ 폴더 검색 금지 명시

---

## [1.7.83] - 2026-06-08

### Added

- **Project 플레이북** — 목표→계획→작업분배→에이전트선별→승인 5단계 워크플로 시스템화
- **수능 PDF Project 템플릿** — 키워드 감지 시 PM에게 검증된 계획·에이전트 조합 자동 제안
- **`ensureProjectPlaybookKnowledge`** — 모든 에이전트 knowledge/·memory에 플레이북 자동 주입
- **수능 PDF 다운로드 스크립트 템플릿** — `src/team/templates/download_suneung_pdfs.py`

### Changed

- PM 1:1·Project 실행 시 **knowledge 포함** 프롬프트 (`buildPromptContext`)
- 다운로드 지식 v2 — 평가원 `suneung.re.kr fileDown.do` 1순위 공식 출처
- `member-picker` — 수능+PDF 업무 시 @한서준·@하정우·도메인 전문가 우선 매칭

---

## [1.7.82] - 2026-06-08

### Added (P1 — ChatDev 참고)

- **Phase Literal 프롬프트** — Worker / Review / PM Report 단계별 고정 프롬프트
- **carry_data** — 이전 태스크 산출물을 다음 태스크 컨텍스트로 전달
- **WareHouse 산출물 저장** — `company/projects/{sessionId}/` (tasks, files, PM_REPORT.md)
- **역할별 Tooling 힌트** — 개발·리서치·영상 역할에 filepath 블록 안내
- **Project 상세 팝업** — 산출물 WareHouse 목록 및 클릭 시 파일 열기

---

## [1.7.81] - 2026-06-08

### Added (P0 — ChatDev SDLC 루프)

- **검토 루프** — 태스크마다 작업 → 검토 → 수정 (최대 5회)
- **키워드 완료 판정** — `FINISHED`, `검토 통과` 등으로 승인
- **검토자 자동 배정** — QA 우선, 없으면 PM

---

## [1.7.80] - 2026-06-08

### Fixed

- **PM 팀 에이전트 인식** — 1:1 대화·업무 실행 시 실제 에이전트 roster 주입
- 박준호 PM이 가상 역할 대신 `@서윤아델린`, `@하정우` 등 실명으로 매칭

### Added

- `buildPmOrchestrationPromptBlock`, `runPmPlanningTask` (PM 전용 계획 경로)
- 유튜브/영상 키워드 기반 `proposeTeamMembers` 휴리스틱 보강

---

## [1.7.79] - 2026-06-08

### Changed

- **「팀 협업」→「Project」** — 탭·UI·메시지 전면 변경
- **Project 시작 조건** — `협업` 단어만으로 자동 시작 제거
- PM 1:1 계획 확정 후 **`진행하세요`** 시에만 Project 채팅방 생성

### Added

- **ProjectsTab** — 프로젝트 카드 UI, PM/팀원 표기, 더블클릭 상세 팝업
- Overview **Project** StatCard 맨 앞 배치·라벨 높이 통일

### Fixed

- 1:1 채팅이 이전 Project로 튀던 문제 (미러링·탭 강제 전환 제거)
- CrewAI **순차 태스크 실행** (`project-runner`)로 Project 진행 개선

---

## [1.7.78] - 2026-06-08

### Changed

- Project 아키텍처 리팩터 — `shouldOrchestrateWithPm` 제거, 명시적 트리거만
- LangGraph 스타일 **phase** 상태 (planning → executing → reviewing → done)
- Project 패널 `preserveFocus` + ViewColumn.Two

---

## 이전 버전

1.7.77 이하 변경 내역은 [releases/CHANGELOG.md](./releases/CHANGELOG.md)를 참고하세요.

```bash
npm run release   # 빌드·설치·커밋·푸시
```
