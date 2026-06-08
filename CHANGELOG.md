# Changelog

버전을 올릴 때마다 **이 파일 최상단**에 해당 버전의 변경 내용을 기록합니다.

- 상세 릴리스·VSIX: [releases/CHANGELOG.md](./releases/CHANGELOG.md)
- VSIX 설치: [releases/README.md](./releases/README.md)

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
