# AgentCompany

Cursor/VS Code 내부에서 동작하는 AI 회사 운영 플랫폼.

사용자는 CEO 역할을 수행하며, AI 직원(Agent)을 생성·관리하고 프로젝트 업무를 위임합니다.

## Architecture (Phase 1 MVP)

```
AgentCompany
├── Dashboard          — WebView React UI
├── Agent Manager      — Agent 생명주기 관리
├── Task Engine        — 업무 생성 및 상태 관리
├── Orchestrator       — CEO 명령 → Task 분해 → Agent 할당
├── Workspace Engine   — VS Code API (파일/터미널/Git)
├── Memory Engine      — SQLite 기반 Activity/Agent Memory
├── Notification Engine — VS Code Notification
└── Provider Engine    — OpenAI, Anthropic, Ollama 등
```

## MVP Features

- Agent 생성 / 삭제 / **수정 / 활성화·비활성화**
- Dashboard (Overview, Agents, Tasks, Activity)
- Task 생성 / 관리 (Kanban Board)
- **Task 상태 전이** (pending → assigned → working → review → completed)
- **CEO Review 플로우** (Approve / Reject)
- CEO Command → Orchestrator 자동 분해
- **Workspace 연동** — Agent 응답에서 파일 자동 생성/수정
- Workspace Engine (파일 CRUD, 검색, 터미널, Git)
- Activity Log

## Getting Started

### Prerequisites

- Node.js 18+
- VS Code or Cursor 1.85+

### Install & Build

```bash
npm install
npm run build
```

### Run Extension

1. Open this folder in VS Code/Cursor
2. Press `F5` to launch Extension Development Host
3. Click the **AgentCompany** icon in the Activity Bar
4. Dashboard opens in the sidebar

### Configure Provider

Set your API key in VS Code settings:

```json
{
  "agentCompany.openaiApiKey": "sk-...",
  "agentCompany.defaultProvider": "openai",
  "agentCompany.defaultModel": "gpt-4o"
}
```

Without an API key, agents return mock responses for testing.

### Workspace File Output

Agents can create/modify files by including them in their response:

````
```filepath:src/example.ts
// file content
```
````

Or via JSON block with `"files": [{ "action": "create", "path": "...", "content": "..." }]`.

## Project Structure

```
src/
├── agents/          Agent Manager
├── tasks/           Task Engine
├── orchestrator/    Command orchestration
├── workspace/       VS Code workspace operations
├── memory/          Memory & Activity logging
├── notifications/   VS Code notifications
├── providers/       LLM provider abstraction
├── database/        SQLite (sql.js)
├── services/        Service composition
├── webview/         Dashboard WebView provider
├── utils/
└── types/
webview/
└── src/             React Dashboard UI
```

## Commands

| Command | Description |
|---------|-------------|
| `AgentCompany: Open Dashboard` | Focus dashboard view |
| `AgentCompany: Open Settings` | Open settings tab |
| `AgentCompany: Create Agent` | Quick agent creation |
| `AgentCompany: Create Task` | Quick task creation |

## Package & Install

Build and create a `.vsix` install package (saved to `releases/`):

```bash
npm run package
# → releases/agent-company-<version>.vsix
```

Install in VS Code/Cursor:

```bash
cursor --install-extension releases/agent-company-1.4.0.vsix
```

Version history and archived packages: see [releases/](./releases/).

Or: **Extensions → ... → Install from VSIX**

## Telegram Setup

1. Open **Settings** tab in Dashboard
2. Create a bot via [@BotFather](https://t.me/BotFather)
3. Enter Bot Token and Chat ID
4. Enable Telegram and click **Test Connection**

## Roadmap

- **Phase 2 (Week 7+)**: Kilo Adapter, Vector Memory, Multi-Agent Collaboration, Slack/Discord

## License

MIT
