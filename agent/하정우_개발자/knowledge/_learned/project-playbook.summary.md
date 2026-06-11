# Learned: project-playbook.md

_hash: 184a5ca9d08441f9_  
_learned: 2026-06-11T02:10:08.263Z_

## Project 협업 플레이북 요약

### AgentCompany Project 표준 절차
- **5단계**: 사장님의 지시를 받은 후 PM은 다음 단계로 진행.
  
1. **목표 설정**
   - 한 문장으로 목표 명확화.
   - 산출물, 범위, 제외 항목 명확히 기재.
  
2. **계획 수립**
   - Phase별로 리서치, 구현/실행, 검증, PM 보고 순으로 나눔.
   - 각 태스크는 최대 5회 검토(FINISHED 키워드 기준) 루프.

3. **작업 분배**
   - `번호 + @에이전트명: 할 일` 형식으로 계획 수립.
   - 예: `1. @한서준: 공식 PDF 출처 URL 조사`

4. **에이전트 선별**
   - 실제 회사 에이전트 roster 사용.
   - 역할, 직함, 능력으로 매칭.

5. **Project 실행 승인**
   - PM이 계획을 사장님께 제시 후 "진행하세요" 승인을 요청.
   - 승인 후 Project 채팅방 생성 및 순차적 협업 시작.
   - 산출물은 `company/projects/{sessionId}/`에 저장.
   - 이전 태스크 산출물은 **carry_data**로 다음 태스크에 전달.

### PM 1:1 대화 출력 형식 (권장)
- 목표, 계획, 작업 분배 및 참여 에이전트를 구조적으로 작성.
- 프로젝트 시작 요청 시 "진행하세요"라고 입력.

### 하정우 — Project 자동화 역할
- 이전 태스크 URL 및 fileSeq 기반 스크립트 구현.
- 산출물 저장 경로: `company/projects/{sessionId}/files/`
- Python urllib/curl로 다운로드 후 %PDF 헤더 검증.
