# Learned: project-playbook.md

_hash: 2e7288d347642313_  
_learned: 2026-06-10T22:50:35.785Z_

# Project 협업 플레이북 요약

## AgentCompany Project 표준 절차

- **단계 1: 목표 설정**
  - 사장님의 지시를 통해 한 문장으로 목표 정의
  - 산출물, 범위, 제외 항목 명확히 구분

- **단계 2: 계획 수립**
  - 프로젝트를 여러 Phase로 나눔 (리서치 → 구현/실행 → 검증 → PM 보고)
  - 각 태스크에 대해 최대 5회의 작업 → 검토 루프 사용

- **단계 3: 작업 분배**
  - "번호 + @에이전트명: 할 일" 형식으로 계획 작성
  - 예시: `1. @한서준: 공식 PDF 출처 URL 조사`

- **단계 4: 에이전트 선별**
  - 실제 회사 에이전트 roster만 활용
  - role, title, capabilities에 맞추어 매칭 (리서치 → researcher, 자동화 → backend 등)

- **단계 5: 프로젝트 승인 및 실행**
  - PM이 사장님께 계획 제시 후 승인 요청
  - 승인 시 채팅방 생성, Projects 탭 등록 후 진행
  - 산출물 저장 위치: `company/projects/{sessionId}/`
  - 이전 태스크 산출물은 carry_data로 전달

## PM 1:1 대화 형식 (권장)

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

## 하정우 — Project 자동화 역할

- 이전 태스크(carry_data)의 URL, fileSeq를 바탕으로 스크립트 구현
- 산출물 파일은 `company/projects/{sessionId}/files/`에 저장
- Python urllib/curl 등으로 다운로드 및 %PDF 헤더 검증 수행

이 가이드라인을 통해 체계적인 프로젝트 진행 및 효율적인 협업이 가능하도록 제안합니다.
