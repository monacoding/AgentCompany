# Learned: project-playbook.md

_hash: 4f1ca9e054745aad_  
_learned: 2026-06-10T22:37:20.910Z_

# Project 협업 플레이북 요약

## AgentCompany Project 표준 절차

- Project는 사장님 지시로 시작, **5단계** 절차 따름.

### 1. 목표 설정
- 한 문장으로 목표 정의.
- 산출물, 범위, 제외 항목 명시.

### 2. 계획 수립
- Phase: 리서치 → 구현/실행 → 검증 → PM 보고.
- 최대 5회까지 가능한 작업→검토 루프 사용.

### 3. 작업 분배
- **번호 @에이전트명: 할 일** 형식.
- 예: `1. @한서준: 공식 PDF 출처 URL 조사`.

### 4. 에이전트 선별
- 회사 에이전트 roster 사용.
- role, title, capabilities로 매칭.

### 5. 승인 후 실행
- PM이 계획을 사장에게 제출, "진행하세요" 요청.
- 승인 시: Project 채팅방 생성, Projects 탭 등록, 순차 협업.
- 산출물 저장: `company/projects/{sessionId}/`.
- 이전 태스크 산출물은 **carry_data**로 전달.

## PM 1:1 대화 출력 형식
- 목표, 계획, 작업 분배, 참여 에이전트 정보 명시.
- 최종 확정 시 "진행하세요" 응답 요청.

## 하정우 — Project 자동화 역할
- 이전 태스크의 URL·fileSeq 기반 스크립트 구현.
- 산출물 저장: `company/projects/{sessionId}/files/`.
- Python urllib/curl 활용하여 PDF 다운로드 및 검증.
