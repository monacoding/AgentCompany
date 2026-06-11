# Learned: project-playbook.md

_hash: 0c98005865e2a471_  
_learned: 2026-06-11T03:12:03.130Z_

# Project 협업 플레이북 요약

## AgentCompany Project 표준 절차

### 1. 목표 설정
- 사장님 지시에서 **한 문장 목표** 명시
- 산출물, 범위, 제외 항목 명확화

### 2. 계획 수립
- Phase(리서치, 구현·실행, 검증, PM 보고)로 나누기
- 각 태스크는 **작업→검토 루프** 운영 (최대 5회, FINISHED 키워드)

### 3. 작업 분배
- **번호 + @에이전트명: 할 일** 형식으로 계획 작성
- 예: `1. @한서준: 공식 PDF 출처 URL 조사`

### 4. 에이전트 선별
- **실제 회사 에이전트 roster만** 사용 (가상 직함·외부 인력 금지)
- 역할에 따라 매칭 (리서치→researcher, 자동화→backend 등)

### 5. 승인 후 Project 실행
- PM이 계획을 사장님께 제시 후 **"진행하세요"** 승인 요청
- 승인 시: Project 채팅방 생성, Projects 탭 등록, 에이전트 순차 협업
- 산출물 저장 위치: `company/projects/{sessionId}/` (tasks/, files/, PM_REPORT.md)
- 이전 태스크 산출물은 **carry_data**로 다음 태스크에 전파

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

## @하정우 — Project 자동화 역할
- carry_data의 URL·fileSeq 기반 스크립트 구현
- 산출물 `company/projects/{sessionId}/files/`에 저장
- Python urllib/curl로 다운로드 및 %PDF 헤더 검증

이번 요약에서는 **에이전트간 협업 절차, 프로젝트 승인 및 실행, 자동화 역할** 등에 대한 표준 절차를 강조했습니다. 하정우 에이전트는 특히 자동화와 관련된 스크립트 구현 및 PDF 검증에 중점을 둡니다.
