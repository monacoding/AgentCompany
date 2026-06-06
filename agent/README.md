# AgentCompany — 에이전트 데이터 폴더

각 AI 에이전트의 **페르소나**, **학습·참고 자료**, **누적 메모리**, **작업 산출물**을 관리하는 폴더입니다.

## 위치

| 구분 | 경로 | 설명 |
|------|------|------|
| **번들 기본값** | `{확장 설치 경로}/agent/` | 페르소나·지식 템플릿 (읽기 전용) |
| **런타임 데이터** | `{globalStorage}/agent/` | 메모리·산출물·사용자 추가 자료 (쓰기) |

Cursor 명령 **`AgentCompany: Open Agent Data Folder`** 로 런타임 폴더를 탐색기에서 열 수 있습니다.

## 폴더 트리 (에이전트당)

```
agent/
├── {이름}_{직책}/              # 예: 강하늘_비서, 하정우_개발자, 원영_리서처
│   ├── persona.md             # 말투·성격·행동 원칙
│   ├── description.md         # 역할·역량 설명
│   ├── memory.md              # 누적 작업 메모리 (자동 동기화)
│   ├── knowledge/             # 학습·참고 자료 (.md)
│   │   └── *.md
│   ├── photo/                 # 프로필 사진 (profile.png 등)
│   │   └── *.png|.jpg|.webp
│   ├── references/            # 외부 참고 문서·링크 메모
│   │   └── *.md
│   └── outputs/               # 에이전트가 생성한 산출물
│       ├── reports/           # 리포트·요약
│       ├── downloads/         # PDF·파일 다운로드
│       ├── plans/             # 설계·계획서
│       └── exports/           # 기타 내보내기
├── _schema/
│   └── manifest.json          # slug ↔ 에이전트 매핑
└── _template/                 # 새 에이전트 생성 시 복사 템플릿
```

## 에이전트 slug

| 표시 이름 | slug |
|-----------|------|
| 비서 | `secretary` |
| 원영 | `wonyoung` |
| 모나 | `mona` |
| Alex PM | `alex-pm` |
| Sam Backend | `sam-backend` |
| Jordan Frontend | `jordan-frontend` |
| Casey QA | `casey-qa` |

사용자가 만든 에이전트는 이름을 kebab-case로 변환합니다 (예: `DevOps Bot` → `devops-bot`).

## 직접 편집

- `knowledge/` 에 `.md`·`.txt`·`.json` 등 텍스트 파일을 추가하면 **자동 학습**되어 에이전트 메모리·프롬프트에 반영됩니다.
- **증분 학습**: `knowledge/.learn-index.json` 에 파일 해시가 저장되어, 내용이 바뀐 파일만 재학습합니다.
- **실시간 감시**: knowledge 폴더에 파일을 추가·수정하면 약 0.6초 후 자동 sync (알림 표시).
- **웹 리서치 자동 저장**: 원영 등 리서치 에이전트가 웹서핑 중 수집한 자료는 `knowledge/web-YYYY-MM-DD-*.md` 로 저장 후 학습됩니다.
- **`photo/`** — `기본.png`는 채팅창 헤더 프로필, `기쁨.png`·`슬픔.png` 등 감정별 이미지는 말풍선 왼쪽에 표시됩니다.
- `persona.md` 를 수정하면 말투·행동이 바뀝니다.
- `outputs/` 아래 파일은 에이전트 작업 결과물입니다.

### knowledge 내부 파일 (자동 생성)

| 파일/폴더 | 설명 |
|-----------|------|
| `.learn-index.json` | 학습된 파일 해시 인덱스 (수동 편집 불필요) |
| `_learned/*.summary.md` | 긴 문서의 요약본 (LLM 또는 truncate) |
| `web-*.md` | 리서치·웹서핑 중 자동 수집된 자료 |
