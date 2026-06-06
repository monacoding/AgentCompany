# Releases

AgentCompany 확장 프로그램 **버전별 VSIX 패키지**와 **변경 기록** 보관 폴더입니다.

## 설치

```bash
cursor --install-extension releases/agent-company-<version>.vsix
# 또는
code --install-extension releases/agent-company-<version>.vsix
```

설치 후 **Reload Window**가 필요합니다.

## 패키징 · 자동 설치 (권장)

프로젝트 루트에서:

```bash
npm run release              # 패치 +1 → 빌드 → VSIX → Cursor 설치
./scripts/release.sh 1.7.9   # 버전 지정
```

또는 VSIX만:

```bash
npm run package
```

→ `releases/agent-company-<version>.vsix` 생성

## 보관 목록

| 버전 | 파일 | 요약 |
|------|------|------|
| 1.5.0 | `agent-company-1.5.0.vsix` | CEO Command 채팅 UI + 비서 Agent |
| 1.4.1 | `agent-company-1.4.1.vsix` | `@` 에이전트 자동완성 + 직접 명령 |
| 1.4.0 | `agent-company-1.4.0.vsix` | 모나 Kilo Code Agent |
| 1.3.1 | `agent-company-1.3.1.vsix` | Crawl4AI 안정화 |
| 1.3.0 | `agent-company-1.3.0.vsix` | 원영 Research / Crawl4AI |
| 1.2.0 | `agent-company-1.2.0.vsix` | LLM 상태 바, 모델 선택 |
| 1.1.0 | `agent-company-1.1.0.vsix` | .env LLM 연동 |
| 1.0.0 | `agent-company-1.0.0.vsix` | MVP |

상세 변경 내역은 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.
