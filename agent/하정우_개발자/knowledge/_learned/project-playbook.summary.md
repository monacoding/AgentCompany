# Learned: project-playbook.md

_hash: 1f9ced15b51aa818_  
_learned: 2026-06-11T02:12:29.136Z_

# Project 협업 플레이북 요약

## AgentCompany Project 표준 절차

### 1. 목표 설정
- 한 문장으로 명확한 목표 설정 및 산출물, 범위, 제외 항목 정의.

### 2. 계획 수립
- Phase: 리서치 → 구현/실행 → 검증 → PM 보고.
- 각 태스크마다 **작업 → 검토 루프**(최대 5회) 진행.

### 3. 작업 분배
- 형식: 번호 + @에이전트명: 할 일.
- 예시: `1. @한서준: 공식 PDF 출처 URL 조사`

### 4. 에이전트 선별
- 실제 회사 에이전트 roster만 사용.
- 역할·직책·능력으로 매칭 (e.g., 리서치→researcher, 자동화→backend).

### 5. 승인 후 Project 실행
- PM의 계획을 사장님 승인 후 실행.
- 승인 시: 채팅방 생성 → Projects 탭 등록 → 에이전트 순차 협업.
- 산출물 경로: `company/projects/{sessionId}/`

## PM 1:1 대화 출력 형식 (권장)

```
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
```

## @하정우 — 프로젝트 자동화 역할
- 이전 태스크 데이터(carry_data) 사용해 스크립트 구현.
- 산출물 저장 경로: `company/projects/{sessionId}/files/`
- Python urllib/curl로 다운로드 및 %PDF 헤더 검증 수행.
