# Learned: project-playbook.md

_hash: 7c4ef7bd9d41c4e3_  
_learned: 2026-06-09T01:27:02.818Z_

# `project-playbook.md` 요약 — @하정우 backend

- 문서는 **AgentCompany Project 협업 표준 절차**와 **@하정우의 자동화 역할**을 정의한다.
- 동일한 내용이 여러 번 반복되어 있으나 핵심 규칙은 동일하다.

## Project 표준 절차

- 사장님이 PM에게 업무를 지시하면 PM은 반드시 아래 5단계를 따른다.

1. **목표 정의**
   - 사장님 지시를 바탕으로 **한 문장 목표**를 작성한다.
   - 산출물, 작업 범위, 제외 항목을 명확히 한다.

2. **계획 수립**
   - 작업을 Phase 단위로 나눈다.
   - 기본 흐름:
     - 리서치
     - 구현/실행
     - 검증
     - PM 보고
   - 각 태스크는 **작업 → 검토 루프**를 가진다.
   - 검토 루프는 최대 5회이며, 완료 시 `FINISHED` 키워드를 사용한다.

3. **작업 분배**
   - 계획은 반드시 다음 형식을 사용한다.
   - `번호. @에이전트명: 할 일`
   - 예:
     - `1. @한서준: 공식 PDF 출처 URL 조사`

4. **에이전트 선별**
   - 실제 회사 agent roster에 있는 에이전트만 사용한다.
   - 가상 직함이나 외부 인력은 금지된다.
   - role, title, capabilities 기준으로 매칭한다.
   - 예:
     - 리서치 → researcher
     - 자동화 → backend
     - 도메인 지식 → 전문가

5. **승인 후 Project 실행**
   - PM은 계획을 사장님께 제시하고 `"진행하세요"` 승인을 요청한다.
   - 승인 후:
     - Project 채팅방 생성
     - Projects 탭 등록
     - 에이전트 순차 협업 진행
   - 산출물 위치:
     - `company/projects/{sessionId}/`
     - 하위 항목: `tasks/`, `files/`, `PM_REPORT.md`
   - 이전 태스크 산출물은 `carry_data`로 다음 태스크에 전달한다.

## PM 1:1 권장 출력 형식

- 포함 항목:
  - `## 목표`
  - `## 계획`
  - `## 작업 분배`
  - `## 참여 에이전트`
  - 마지막에 `"진행하세요"` 요청 문구 포함

## @하정우 역할

- backend / 자동화 담당.
- 이전 태스크의 `carry_data`에서 URL, `fileSeq` 등을 받아 스크립트를 구현한다.
- 산출물은 `filepath` 블록으로 저장한다.
- 저장 경로:
  - `company/projects/{sessionId}/files/`
- Python `urllib`, `curl` 등을 사용해 실제 파일을 다운로드한다.
- PDF 다운로드 시 `%PDF` 헤더 검증을 수행한다.
