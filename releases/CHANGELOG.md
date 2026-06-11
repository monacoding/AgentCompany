# AgentCompany Release History

버전별 VSIX 패키지와 변경 기록 보관 폴더입니다.  
`npm run package` 실행 시 `.vsix` 파일이 이 폴더에 저장됩니다.

---

## [1.8.10] - 2026-06-11

**파일:** `agent-company-1.8.10.vsix`

### Fixed

- VSIX에 `.env`가 포함되지 않도록 `.vscodeignore` 수정

---

## [1.8.9] - 2026-06-11

**파일:** `agent-company-1.8.9.vsix`

### Added

- DART 임원·주요주주 소유보고 PDF 다운로드 (하정우 knowledge + Python 스크립트)

### Fixed

- 하정우 DART 업무 knowledge 선별·Cline 컨텍스트·Open DART `crtfc_key` 인증

---

## [1.8.8] - 2026-06-10

**파일:** `agent-company-1.8.8.vsix`

### Added

- Telegram으로 완성된 Markdown 보고서(.md) 자동 전송 (Project·리서치·Cline)

---

## [1.8.7] - 2026-06-10

**파일:** `agent-company-1.8.7.vsix`

### Fixed

- Project PM/워커 LLM 태스크 `gpt-5.x` API 파라미터 (`max_completion_tokens`)
- PM carry_data 96k·리서치 우선 전달, 보고서 원문 보존 지침, 부록 자동 병합

### Changed

- 실시간 작업 상태 스트리밍 UI, PM 비용 승인 대기 제거

---

## [1.7.85] - 2026-06-08

**파일:** `agent-company-1.7.85.vsix`

### Added

- Project Worker 실행 엔진 (Research/Kilo/스크립트 자동 실행)

---

## [1.7.84] - 2026-06-08

**파일:** `agent-company-1.7.84.vsix`

### Fixed

- PM이 수능 PDF 다운로드 지시를 로컬 파일 검색으로 오인하던 버그

---

## [1.7.83] - 2026-06-08

**파일:** `agent-company-1.7.83.vsix`

### Added

- Project 플레이북 5단계 워크플로 + 수능 PDF 템플릿
- ensureProjectPlaybookKnowledge (전 에이전트 knowledge 주입)
- download_suneung_pdfs.py 템플릿

### Changed

- PM/Project knowledge 프롬프트, DownloadKnowledge v2

---

## [1.7.82] - 2026-06-08

**파일:** `agent-company-1.7.82.vsix`

### Added

- Phase Literal 프롬프트 (Worker / Review / PM Report)
- carry_data — 이전 태스크 산출물을 다음 태스크에 전달
- WareHouse: `company/projects/{sessionId}/` 산출물 저장
- 역할별 Tooling 힌트 및 filepath 블록 자동 추출 저장
- Project 상세 팝업 산출물 목록·열기

---

## [1.7.81] - 2026-06-08

**파일:** `agent-company-1.7.81.vsix`

### Added

- ChatDev P0 SDLC: 태스크별 검토 루프 (최대 5회)
- FINISHED 키워드 완료 판정, QA/PM 검토자 자동 배정

---

## [1.7.80] - 2026-06-08

**파일:** `agent-company-1.7.80.vsix`

### Fixed

- PM 1:1 대화 시 실제 팀 에이전트 roster 주입 (가상 역할명 제거)

### Added

- `runPmPlanningTask`, `buildPmOrchestrationPromptBlock`

---

## [1.7.79] - 2026-06-08

**파일:** `agent-company-1.7.79.vsix`

### Changed

- 「팀 협업」→「Project」, `진행하세요` 승인 후에만 Project 시작

### Added

- ProjectsTab 카드 UI, 더블클릭 상세 팝업

### Fixed

- 협업 키워드만으로 Project 강제 시작되던 문제

---

## [1.7.78] - 2026-06-08

**파일:** `agent-company-1.7.78.vsix`

### Changed

- Project 순차 실행(CrewAI), phase 상태머신, 1:1 채팅 보호

---

## [1.7.54] - 2026-06-07

**파일:** `agent-company-1.7.54.vsix`

### Fixed

- **음성만 입력 후 전송** — IME 잔여글자 필터가 음성 결과까지 막던 문제 수정, value 동기화 개선

### Added

- **전송 단축키 Space** — 입력창에 글자가 있을 때 Space로 전송
- 마이크 단축키 기본값 `⌥+V`로 변경 (Space 전송과 충돌 방지)

---

## [1.7.53] - 2026-06-07

**파일:** `agent-company-1.7.53.vsix`

### Fixed

- **확장 초기화 실패** — `path8 is not defined` 오류 수정 (복원 과정 import 이름 오류)

---

## [1.7.52] - 2026-06-07

**파일:** `agent-company-1.7.52.vsix`

### Added

- **마이크 단축키** — Settings에서 설정, 누르고 있는 동안만 음성 입력 (마이크 버튼과 동일)
- 기본 단축키: `⌥+Space` (Option+스페이스)

---

## [1.7.51] - 2026-06-07

**파일:** `agent-company-1.7.51.vsix`

### Fixed

- **마이크 목록** — ffmpeg 장치 목록 파싱 수정 (Razer 등 실제 마이크 표시)
- **실시간 입력** — 말하는 동안 명령 입력창에 인식 문구 즉시 표시
- **푸시투토크** — 마이크 버튼을 누르고 있는 동안만 녹음, 떼면 종료

---

## [1.7.50] - 2026-06-07

**파일:** `agent-company-1.7.50.vsix`

### Fixed

- **Cursor 마이크** — 웹뷰 차단 우회: 확장(extension) + ffmpeg로 녹음
- **마이크 권한 안내** — Settings에 시스템 설정 바로가기 버튼 추가

---

## [1.7.49] - 2026-06-07

**파일:** `agent-company-1.7.49.vsix`

### Changed

- **마이크 버튼** — 전송 버튼 옆으로 복원
- **음성 시각화** — 화면 중앙 하단 팝업으로 표시
- **마이크 설정** — 입력 장치·입력 방식·인식 방식을 Settings 탭으로 이동

---

## [1.7.48] - 2026-06-07

**파일:** `agent-company-1.7.48.vsix`

### Added

- **마이크 시각화 패널** — 녹음 시 데시벨·웨이브폼·실시간 인식 문구 표시
- **마이크 입력 모드** — 지시 입력 / 바로 전송 / 파일 전달 / 후속 말하기 드롭다운
- **인식 방식 선택** — 자동 / 브라우저 / Whisper

---

## [1.7.47] - 2026-06-07

**파일:** `agent-company-1.7.47.vsix`

### Added

- **마이크 음성 지시** — CEO 명령 입력·에이전트 채팅창에 🎤 버튼, 말한 내용을 입력창에 자동 입력 (브라우저 음성 인식 + OpenAI Whisper 폴백)

---

## [1.7.46] - 2026-06-07

**파일:** `agent-company-1.7.46.vsix`

### Fixed

- **파일 전달 완료 안내** — 사장님 확인 후 별도 말풍선으로 "파일 전달 완료했어요" + 저장 경로 표시

---

## [1.7.45] - 2026-06-07

**파일:** `agent-company-1.7.45.vsix`

### Added

- **사장님 폴더 중복 파일 검사** — 전달 전 `company/owner`에 동일 파일(이름+내용) 있으면 안내 후 스킵, 없을 때만 복사

---

## [1.7.44] - 2026-06-07

**파일:** `agent-company-1.7.44.vsix`

### Added

- **대화 맥락 이해(전 에이전트 공통)** — "전달해 줄래?" 등 주어 없는 후속 지시 시 최근 대화와 합쳐 의도 파악·파일 전달 등 후속 작업 실행

---

## [1.7.43] - 2026-06-07

**파일:** `agent-company-1.7.43.vsix`

### Fixed

- **파일 전달 완료 메시지** — 확인 후 "파일 전달 완료" 말풍선·저장 경로 표시
- **오류 발생 배지 잔류** — 전달 성공 시 에이전트 상태 `idle` 복구, 작업 중 표시 해제
- 확인 버튼 말풍선 완료 처리 및 채팅 메시지 갱신(upsert) 수정

---

## [1.7.42] - 2026-06-07

**파일:** `agent-company-1.7.42.vsix`

### Added

- **본인 폴더 → 사장님 파일 전달** — "너 폴더 파일 전달해" 등 자기 DB 검색 → 사장님 확인 → `company/owner/outputs/downloads/from-{이름}/` 복사
- 파일 전달 요청 시 LLM 호출 생략 (Rate limit 방지)
- OpenAI 429 Rate limit 자동 재시도 (최대 3회)

---

## [1.7.41] - 2026-06-07

**파일:** `agent-company-1.7.41.vsix`

### Added

- **파일 전달 확인 흐름** — 소유 에이전트 DB 검색 후 사장님께 "이 파일이 맞을까요?" 확인 → 예: 전달 / 아니오: 재검색(이전 후보 제외·검색 범위 확대)

---

## [1.7.40] - 2026-06-07

**파일:** `agent-company-1.7.40.vsix`

### Added

- **사장님 데이터 경로 학습** — `company/owner` 절대·상대 경로를 모든 에이전트 knowledge·memory·LLM 프롬프트에 주입

---

## [1.7.39] - 2026-06-07

(1.7.40과 동일)

### Added

- **사장님 데이터 경로 학습** — `company/owner` 절대·상대 경로를 모든 에이전트 knowledge·memory·LLM 프롬프트에 주입

---

## [1.7.38] - 2026-06-07

**파일:** `agent-company-1.7.38.vsix`

### Fixed

- **파일 이동 허위 완료** — 복사 전 "옮겼다" 응답 차단, 실패 시 성공 메시지 제거
- **경로 필수 표기** — 실제 복사 성공 시 워크스페이스 절대 경로 전부 표시
- **전 에이전트 학습** — 파일 이동 규칙 knowledge·memory 주입

---

## [1.7.37] - 2026-06-07

(1.7.38과 동일)

### Fixed

- **파일 이동 허위 완료** — 복사 전 "옮겼다" 응답 차단, 실패 시 성공 메시지 제거
- **경로 필수 표기** — 실제 복사 성공 시 워크스페이스 절대 경로 전부 표시
- **전 에이전트 학습** — 파일 이동 규칙 knowledge·memory 주입

---

## [1.7.36] - 2026-06-07

**파일:** `agent-company-1.7.36.vsix`

### Changed

- **사장 지시 처리 공통화** — 모든 에이전트가 사장님 요청을 페르소나·지식 기반 LLM으로 먼저 인지하고 응답한 뒤 후속 작업(파일 교환·업무 실행) 진행

---

## [1.7.35] - 2026-06-07

(1.7.36과 동일)

### Changed

- **사장 지시 처리 공통화** — 모든 에이전트가 사장님 요청을 페르소나·지식 기반 LLM으로 먼저 인지하고 응답한 뒤 후속 작업(파일 교환·업무 실행) 진행

---

## [1.7.34] - 2026-06-07

**파일:** `agent-company-1.7.34.vsix`

### Changed

- **에이전트 간 파일 요청 대화** — 사장 지시를 LLM이 해석해 자연스러운 허락 요청·협업 메시지로 재작성 (기계적 요약 문자열 제거)

---

## [1.7.33] - 2026-06-07

(1.7.34와 동일)

### Changed

- **에이전트 간 파일 요청 대화** — 사장 지시를 LLM이 해석해 자연스러운 허락 요청·협업 메시지로 재작성 (기계적 요약 문자열 제거)

---

## [1.7.32] - 2026-06-07

**파일:** `agent-company-1.7.32.vsix`

### Fixed

- **에이전트 간 파일 교환** — `서준이`·`서준` 등 부분 이름으로 한서준 인식, `수리`→수학 PDF 필터
- **불필요한 LLM 응답 차단** — Python/PyPDF2·단계별 계획 말풍선 완전 억제, 파일 교환 허락 흐름으로 전환
- **워크스페이스 파일 생성 방지** — 파일 교환 명령 시 LLM·`Files modified` 실행 생략

---

## [1.7.31] - 2026-06-07

(1.7.32와 동일)

### Fixed

- **에이전트 간 파일 교환** — `서준이`·`서준` 등 부분 이름으로 한서준 인식, `수리`→수학 PDF 필터
- **불필요한 LLM 응답 차단** — Python/PyPDF2·단계별 계획 말풍선 완전 억제, 파일 교환 허락 흐름으로 전환
- **워크스페이스 파일 생성 방지** — 파일 교환 명령 시 LLM·`Files modified` 실행 생략

---

## [1.7.30] - 2026-06-07

**파일:** `agent-company-1.7.30.vsix`

### Fixed

- **에이전트 간 파일 교환** — "한서준에게 요청하고 저장" 등 표현 감지 보강, 국어 PDF 등 과목별 필터·실제 `fs.copyFile` 복사 검증
- **불필요한 채팅 출력** — Python 코드·구현 계획 말풍선 차단, 파일 교환 시 허락 요청만 표시

---

## [1.7.29] - 2026-06-07

(1.7.30과 동일)

### Fixed

- **에이전트 간 파일 교환** — "한서준에게 요청하고 저장" 등 표현 감지 보강, 국어 PDF 등 과목별 필터·실제 `fs.copyFile` 복사 검증
- **불필요한 채팅 출력** — Python 코드·구현 계획 말풍선 차단, 파일 교환 시 허락 요청만 표시

---

## [1.7.28] - 2026-06-06

**파일:** `agent-company-1.7.28.vsix`

### Added

- **에이전트 간 파일 교환** — 다른 에이전트 폴더/파일 가져오기 지시 시 LLM 대신 사장님 허락 → 에이전트 협업 대화 → 실제 파일 복사 흐름

---

## [1.7.27] - 2026-06-06

(1.7.28과 동일 — 릴리스 스크립트 버전 증가)

---

## [1.7.26] - 2026-06-06

**파일:** `agent-company-1.7.26.vsix`

### Changed

- **채팅창 상태 배지** — WORKING/REVIEW 영문 대신 한글 표기 복원 (일하고 있는 중.., 업무 중.., 업무 완료!, 대기중 등)

---

## [1.7.25] - 2026-06-06

**파일:** `agent-company-1.7.25.vsix`

### Fixed

- **대시보드 연결됨 vs 채팅 API Key 없음** — `.env` 재로드 중 키가 잠깐 비워지던 레이스 컨디션 수정
- **CEO/에이전트 명령** — LLM 호출 전 `.env` 동기화(`ensureEnvForLlm`) 추가

---

## [1.7.24] - 2026-06-06

**파일:** `agent-company-1.7.24.vsix`

### Fixed

- **API Key 연결 회귀 버그** — v1.7.23 `.env` 탐색 로직이 키를 못 읽던 문제 수정
- **.env 로드 복원** — 워크스페이스 루트 우선 + Node fs 폴백 + VSIX 번들 `.env` 폴백
- **연결 확인** — `reloadEnv` 시 캐시가 아닌 실제 API 재검사

---

## [1.7.23] - 2026-06-06

**파일:** `agent-company-1.7.23.vsix`

### Fixed

- **.env 탐색** — 워크스페이스 최상위뿐 아니라 모든 폴더·하위 경로에서 `.env` 자동 탐색 (API Key 미인식 방지)
- **연결 상태 메시지** — 실제 로드된 `.env` 경로 표시

---

## [1.7.22] - 2026-06-06

**파일:** `agent-company-1.7.22.vsix`

### Fixed

- **WORKING 오표시** — 태스크 내부 `working` 상태(Kilo CLI·라우터 등 LLM 미사용 단계)가 UI에서 WORKING으로 보이던 문제 → PROGRESS 로 표시
- **채팅 상태 배지** — 작업 말풍선이 떠 있어도 LLM 미사용 시 PROGRESS 로 표시

---

## [1.7.21] - 2026-06-06

**파일:** `agent-company-1.7.21.vsix`

### Changed

- **에이전트 상태 체계** — WORKING(LLM 사용) / PROGRESS(미완료·LLM 미사용) / REVIEW(최종 결과물 검토)로 구분
- **REVIEW 인식** — 결과물(`result`)이 있는 태스크만 REVIEW 로 표시 (첫 메시지·진행 중 오인식 방지)
- **OFFLINE 표시 제거** — UI 에서 offline 상태 숨김 (비활성화는 Activate/Deactivate 로 유지)

---

## [1.7.20] - 2026-06-06

**파일:** `agent-company-1.7.20.vsix`

### Added

- **대시보드 헤더 상태 표시** — 회사 정보 행 우측에 운영일(+N), 오늘 날짜, 현재 시간(실시간) 표시
- **회사 정보 창립일** — 회사 정보 모달에서 창립일 입력·저장, 운영일 자동 계산

---

## [1.7.19] - 2026-06-06

**파일:** `agent-company-1.7.19.vsix`

### Changed

- **WORKING 표시** — API 연결 여부가 아니라 LLM API 실제 호출(과금) 중일 때만 WORKING 으로 표시

---

## [1.7.18] - 2026-06-06

**파일:** `agent-company-1.7.18.vsix`

### Changed

- **에이전트 WORKING 표시** — 해당 에이전트 provider AI API가 실제 연결·가동 중일 때만 WORKING 으로 표시
- API 미연결 시 working 상태는 idle 로 보이고, 작업 시작도 차단

---

## [1.7.17] - 2026-06-06

**파일:** `agent-company-1.7.17.vsix`

### Changed

- **Agents 탭** — 처음에는 업무 현황 카드만 표시, 카드 클릭 시 페르소나·Edit·활성화 등 상세 팝업

---

## [1.7.16] - 2026-06-06

**파일:** `agent-company-1.7.16.vsix`

### Fixed

- **조직도 노드 연결 방해** — 연결선 히트 레이어가 포트 위를 덮어 선이 먼저 선택되던 문제 수정 (노드 우선·연결 모드 시 선 비활성)

---

## [1.7.15] - 2026-06-06

**파일:** `agent-company-1.7.15.vsix`

### Fixed

- **사장 카드 위 화살표** — 사장으로 들어오는 선은 카드 상단에서 끝나고 화살표 제거
- **사장 아래 다중 연결** — 여러 에이전트가 동시에 사장에게 보고선 연결 가능 (동일 연결만 중복 차단)
- **줌 아웃 그리드** — 축소 시에도 뷰포트 전체에 그리드가 채워지도록 캔버스 영역 확장

### Changed

- 조직도 안내 문구: `부하가 작성한 모든 것에 상사가 관여하게 됩니다`

---

## [1.7.14] - 2026-06-06

**파일:** `agent-company-1.7.14.vsix`

### Improved

- **조직도 연결 방향** — 하단·상단 노드 클릭 순서와 무관하게 항상 부하(하단) → 상사(상단)로 자동 설정
- 사장 하단 포트를 먼저 눌러도 상대 상단과 연결 시 부하→사장으로 정규화
- 연결 대기 중 짝이 맞는 반대쪽 노드에 미리 하이라이트 표시

---

## [1.7.13] - 2026-06-06

**파일:** `agent-company-1.7.13.vsix`

### Improved

- **사장(CEO) 카드** — 최상단이므로 상단 연결 노드 제거, 부하 연결 시 사장 카드 클릭으로 보고선 연결
- **조직도 툴바** — 활성화 토글·저장 버튼 1행, 안내·상태 2행으로 정리, 줌 컨트롤은 캔버스 우하단으로 이동

---

## [1.7.12] - 2026-06-06

**파일:** `agent-company-1.7.12.vsix`

### Improved

- **조직도 연결선** — 상·하단 포트(노드)끼리 직각 연결, 화살표로 부하 → 상사 방향 표시
- **연결선 끊기** — 선에 마우스를 올리면 색상 하이라이트, 클릭 선택 후 더블클릭·Delete·「연결 끊기」로 삭제

---

## [1.7.10] - 2026-06-06

**파일:** `agent-company-1.7.10.vsix`

### Fixed

- **협업 대화창 빈 화면** — `collabParticipants` 미로드 시 `.map()` 크래시로 UI 전체가 렌더 실패하던 문제 수정
- 협업창 열기 전 첫 메시지를 먼저 push해 초기 동기화 시 대화가 바로 보이도록 순서 조정

---

## [1.7.9] - 2026-06-06

**파일:** `agent-company-1.7.9.vsix`

### Fixed

- **협업 대화창 좌우 정렬** — 대상 에이전트(하정우) 말풍선·작업 중 표시가 화면 **오른쪽 끝**으로 배치 (사장님 채팅과 동일 구조)
- `targetAgentId` / `collabPeerId` 기준 정렬로 참석자 목록 없이도 올바른 좌우 배치

---

## [1.7.8] - 2026-06-06

**파일:** `agent-company-1.7.8.vsix`

### Added

- **에이전트 간 위임 허락** — 다른 에이전트에게 부탁 전 사장님 예/아니오 확인
- **협업 대화창** — 에이전트 1:1·다자간 대화 관전, 참석자 아바타
- **자연스러운 에이전트 대화** — `○○씨! ~~ 도와줄래요?` 말투
- **영상 제작 파이프라인** — 서윤 에이전트 brief/script/scenes 실제 산출
- **작업 중 스트리밍 로그** — Cursor처럼 단계가 말풍선에 줄줄이 쌓임
- **릴리스 자동화** — `npm run release` / `scripts/release.sh` (빌드·VSIX·설치)

### Changed

- 사장 호칭 **항상 "사장님"**
- Production·작업 결과를 AI 산출물 형식 대신 **사장님께 보고하는 말투**로 표시
- 협업창 말풍선 **좌/우 끝 정렬** (1:1 채팅과 동일한 균형)

### Fixed

- 위임 허락 말풍선 `시스템` 표시 → 요청 에이전트 이름·직책
- `agentFolderEngine` 오류로 위임 확인 UI 미표시
- 조직 보고 요약 시 위임 제안 문구 누락 → 원본 결과 기준 감지
- 협업창 조기 "업무 완료" · 하정우 Kilo 파이프라인 미실행

---

## [1.7.0] - 2026-06-06

**파일:** `agent-company-1.7.0.vsix`

### Added

- **Knowledge 자동 학습** — `agent/{slug}/knowledge/` 에 `.md`·`.txt` 등 자료 추가 시 에이전트 메모리에 즉시 반영
- **증분 학습** — `.learn-index.json` 해시로 변경된 파일만 재학습 (매번 전체 학습 방지)
- **파일 감시** — knowledge 폴더 생성·수정·삭제 시 600ms debounce 후 자동 sync
- **웹 리서치 자동 저장** — 원영 리서치 중 수집한 페이지·요약을 `web-YYYY-MM-DD-*.md` 로 knowledge에 저장 후 학습
- 업무 시작 전(`runAgentTask`) knowledge 선행 sync

---

## [1.6.9] - 2026-06-06

**파일:** `agent-company-1.6.9.vsix`

### Fixed

- **Dashboard 빈 화면** — `agentWorkLog` state 누락으로 React 크래시 (ReferenceError) 수정
- extension activate 실패 시 오류 메시지 표시

---

## [1.6.8] - 2026-06-06

**파일:** `agent-company-1.6.8.vsix`

### Fixed

- **에이전트 폴더 미표시** — 워크스페이스 열림 시 `{프로젝트}/agent/{slug}/` 에 생성·탐색기 자동 열기
- **이름 중복** — 동일 이름(대소문자 무시) 생성 차단 + UI/알림 메시지

### Added

- **description 기반 프로필 자동 생성** — persona.md, knowledge/role-profile.md, 역할 auto 감지
- Dashboard description 필수 textarea, role `auto` 옵션

---

## [1.6.7] - 2026-06-06

**파일:** `agent-company-1.6.7.vsix`

### Fixed

- **사용자 생성 에이전트** — 생성 즉시 `agent/{slug}/` 폴더 자동 생성
- `_template` 기반 persona·description·knowledge·references 초기화
- Dashboard·명령 팔레트 생성 시 폴더 경로 알림

---

## [1.6.6] - 2026-06-06

**파일:** `agent-company-1.6.6.vsix`

### Added

- **`agent/` 폴더 트리** — 에이전트별 persona, knowledge, references, outputs 관리
- `AgentFolderEngine` — 런타임 데이터 `{globalStorage}/agent/{slug}/` 에 저장·동기화
- 원영 PDF → `agent/wonyoung/outputs/downloads/`, 리포트 → `outputs/reports/`
- 모나 플랜·리포트 → `agent/mona/outputs/plans|reports/`
- 메모리 자동 동기화 → `memory.md`
- 명령: **AgentCompany: Open Agent Data Folder** / **Open Agent Folder**

---

## [1.6.5] - 2026-06-06

**파일:** `agent-company-1.6.5.vsix`

### Added

- **에이전트별 별도 채팅창** — `@모나`, `@원영` 등 명령 시 해당 에이전트 전용 탭이 열림
- 비서 경유 위임 시 대상 에이전트 채팅창 자동 포커스
- 에이전트 채팅창에서 `@` 없이 입력하면 해당 에이전트에게 직접 전달

---

## [1.6.4] - 2026-06-06

**파일:** `agent-company-1.6.4.vsix`

### Fixed

- **모나/Kilo 실패** — 폴더 생성 등 워크스페이스 작업이 OpenWeather API로 잘못 라우팅되던 버그
- Kilo·Research 파이프라인을 External API보다 우선 실행
- API 1개 등록 시 모든 명령에 API 적용되던 규칙 제거

---

## [1.6.3] - 2026-06-06

**파일:** `agent-company-1.6.3.vsix`

### Fixed

- **OpenWeather URL 자동 보정** — `home.openweathermap.org` → `api.openweathermap.org/data/2.5`
- **연결 테스트** — 실제 `/weather` 경로로 검증 (401·404 조기 발견)
- **API 오류 메시지** — 401 Invalid key, 404 HTML 등 한국어 안내

---

## [1.6.2] - 2026-06-06

**파일:** `agent-company-1.6.2.vsix`

### Added

- **External API 자동 연동** — API 탭 등록 시 인증 자동 감지 + 에이전트 메모리 동기화
- LLM API 선택·경로 생성 (다중 API), 조회 명령 자동 라우팅
- 코딩/리서치 업무와 API 조회 업무 자동 구분

---

## [1.6.1] - 2026-06-06

**파일:** `agent-company-1.6.1.vsix`

### Fixed

- **External API 에이전트 연동** — API 탭 등록 API를 비서/에이전트가 실제 호출
- 날씨 조회(OpenWeatherMap) 자동 경로 생성 + query-param(appid) 인증 지원
- `@비서 오늘 서울 날씨` 등 명령 시 LLM 안내 대신 API 호출 후 결과 보고

---

## [1.6.0] - 2026-06-06

**파일:** `agent-company-1.6.0.vsix`

### Added

- **API 탭** — Settings 앞에 External API 관리 탭 추가
- REST API 등록/수정/삭제, Bearer·API Key·Basic 인증
- 연결 테스트, 활성화 토글, `ExternalApiService.request()` 에이전트 연동 준비

---

## [1.5.7] - 2026-06-06

**파일:** `agent-company-1.5.7.vsix`

### Added

- **비서 페르소나 학습** — 애교 있고 상냥한 여성 비서 말투 전면 적용
- Executive Assistant 이론(Eisenhower·GTD·RACI) 메모리 주입
- PDF/다운로드 명령 → 원영 자동 라우팅

---

## [1.5.6] - 2026-06-06

**파일:** `agent-company-1.5.6.vsix`

### Fixed

- **CEO Command IME 버그** — 한글 입력 후 Enter 시 "아" 등 잔여 글자가 별도 명령으로 전송되던 문제 수정
- 조합 중 Enter 무시, 전송 직후 IME 잔여 문자 폐기, 3자 미만 명령 서버 필터

---

## [1.5.5] - 2026-06-06

**파일:** `agent-company-1.5.5.vsix`

### Added

- **원영 Download Knowledge** — 2024 수능 PDF 성공 사례(호랭이닷컴 직링크) 학습
- `download-knowledge.ts`: URL 패턴·과목 파싱·목록 페이지 크롤 우선순위
- 수능 전체 요청 시 국/수/영/한 4과목 다중 다운로드
- 원영 에이전트 메모리에 Download Knowledge v1 자동 주입

---

## [1.5.4] - 2026-06-06

**파일:** `agent-company-1.5.4.vsix`

### Added

- **원영 PDF 다운로드** — "다운로드", "PDF 받아" 등 키워드 감지 시 File Downloader 파이프라인 실행
- 검색 → PDF 링크 수집 → fetch/curl 다운로드 → `%PDF` 검증 → `research/downloads/` 저장
- 실패 시 기존 리서치 파이프라인으로 fallback + 실패 원인 표시

---

## [1.5.2] - 2026-06-06

**파일:** `agent-company-1.5.2.vsix`

### Fixed

- **Dashboard 빈 화면** — Vite ES module 빌드 후 `type="module"` 및 `styles.js` 청크 미로드 수정

---

## [1.5.1] - 2026-06-06

**파일:** `agent-company-1.5.1.vsix`

### Changed

- **CEO Command 별도 창** — 대화창을 에디터 탭(CEO Command)으로 분리, Dashboard는 입력만
- Agents 탭 에이전트별 업무 현황판

---

## [1.5.0] - 2026-06-06

**파일:** `agent-company-1.5.0.vsix`

### Added

- **CEO Command 채팅 UI** — 명령 전송 시 대화창 표시, 진행 상황 실시간 표시
- **전송 아이콘** — Execute → 입력(전송) 아이콘 버튼
- **비서 Agent** — `@` 없이 명령 시 비서가 적합한 에이전트 선정·위임
- **CEO 확인 요청** — 업무 유형 불명확 시 "○○ 에이전트에게 업무를 시킬까요?" 확인

---

## [1.4.1] - 2026-06-06

**파일:** `agent-company-1.4.1.vsix`

### Added / Fixed

- **CEO Command `@` 자동완성** — `@` 입력 시 입력창 아래 에이전트 드롭다운
- **`@에이전트명` 직접 명령** — 특정 에이전트에게만 태스크 전달
- 멘션 파싱 안정화 (커서 상태 의존 제거)

---

## [1.4.0] - 2026-06-06

**파일:** `agent-company-1.4.0.vsix`

### Added

- **모나 Kilo Code Agent** — Kilo Code 아키텍처 기반 코딩 에이전트
- **Kilo Engine** — Mode Router (Architect / Coder / Debugger)
- **Code Planner, File Editor, Terminal Runner, Self-Checker** 파이프라인
- **Kilo CLI Adapter** — `kilo run --auto` 연동 (미설치 시 내부 엔진 fallback)
- Activate 시 Kilo CLI 자동 확인
- Agents 탭 `⚡ Kilo Code · Agentic Engineering` 배지
- Settings: `kiloCliCommand`, `kiloAutoMode`, `kiloCliAutoCheck`
- 리포트 저장: `kilo/reports/*.md`, Architect 계획: `kilo/plans/*.md`

---

## [1.3.1] - 2026-06-06

**파일:** `agent-company-1.3.1.vsix`

### Fixed / Improved

- Crawl4AI Docker 자동 시작 안정화
- 원영 Research Agent 세부 개선

---

## [1.3.0] - 2026-06-06

**파일:** `agent-company-1.3.0.vsix`

### Added

- **원영 Research Agent** — Crawl4AI 기반 WebCrawler 파이프라인
- Search → Browser (Crawl4AI Docker → Jina → Fetch) → Extract → Summarize → Report
- Activate 시 Crawl4AI Docker 자동 실행
- Agents 탭 `🌐 WebCrawler · Crawl4AI` 배지
- Settings: `crawl4aiBaseUrl`, `crawl4aiAutoStart`, `crawl4aiContainerName`, `crawl4aiImage`, `crawl4aiPort`
- 리포트 저장: `research/reports/*.md`

---

## [1.2.0] - 2026-06-06

**파일:** `agent-company-1.2.0.vsix`

### Added

- CEO Command 위 **LLM 상태 바** (Provider, 모델 선택, 연결 확인)
- OpenAI `/v1/models`에서 ChatGPT 모델 목록 자동 로드
- `.env` 생성/열기 UI
- 헤더 **v1.2.0** 버전 배지

---

## [1.1.0] - 2026-06-06

**파일:** `agent-company-1.1.0.vsix`

### Added

- `.env`에서 `CHATGPT_API_KEY` / `OPENAI_API_KEY` 읽기 (Settings보다 우선)
- LLM 연결 상태 확인 서비스
- `DEFAULT_MODEL` .env 연동

---

## [1.0.0] - 2026-06-06

**파일:** `agent-company-1.0.0.vsix`

### MVP Release

Phase 1 MVP — KiloCode 의존성 없이 AgentCompany 핵심 기능 완성.

#### Added

- **Dashboard** — Overview, Agents, Tasks, Activity, Settings 탭
- **Agent Manager** — 생성, 수정, 삭제, 활성화/비활성화
- **Task Engine** — Kanban Board, 상태 전이, CEO Review (Approve/Reject)
- **Orchestrator** — CEO Command → Task 분해 → Agent 할당 → 결과 수집
- **Workspace Engine** — 파일 CRUD, 프로젝트 검색, 터미널, Git
- **Workspace 연동** — Agent 응답에서 파일 자동 생성/수정
- **Memory Engine** — SQLite 기반 Agent Profile, Tasks, Activity
- **Provider Engine** — OpenAI, Anthropic, Ollama (+ Mock fallback)
- **Notification Engine** — VS Code Notification + Telegram stub
- **Settings UI** — Provider, API Key, Telegram 설정
- **VSIX Packaging** — `npm run package`로 배포 패키지 생성

#### Excluded (Phase 2+)

- KiloCode Integration (→ 1.4.0에서 모나 에이전트로 부분 통합)
- Vector Memory (Qdrant/Chroma)
- Multi-Agent Collaboration
- Slack/Discord
