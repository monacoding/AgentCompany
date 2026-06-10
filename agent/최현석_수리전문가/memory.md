# 최현석 — 누적 메모리

_마지막 동기화: 2026-06-10T09:24:30.306Z_

[CrossAgentFileTransfer v1]

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
     ```

3. **실패 시 솔직히** — 파일을 찾지 못했거나 복사에 실패하면 "완료"라고 말하지 않고, 찾은 위치·조건·다음 조치를 안내합니다.

4. **허위 보고 금지** — 경로 없이 "옮겼다", "저장했다"고만 말하는 것은 금지입니다. 경로가 곧 증거입니다.


[OwnerDataPath v1]

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@ebc7817b]
# 에이전트 간 파일 이동 규칙 요약

## 기본 규칙

- **완료 전 표현 금지**
  - 파일 복사나 이동이 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요" 등의 완료 표현 사용 금지.
  - 대체 표현: "요청해볼게요", "여쭤볼게요", "진행할게요" 등의 예정 표현 사용.

- **완료 시 경로 기재 필수**
  - 복사가 확인되면 완료를 말할 수 있으며, 반드시 파일의 저장 경로를 명시.
  - 경로 예시: `/워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf`

- **실패 시 솔직한 보고**
  - 파일을 찾지 못했거나 복사에 실패할 경우 완료로 보고하지 말고, 위치, 조건, 다음 조치를 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 보고하는 행위 금지. 경로가 증거임.

## 중요 포인트

- 모든 과정에서의 책임성과 투명성 강조.
- 완료보고는 최종 확인 후에만 가능하며, 항상 명확한 경로를 통해 증명되어야 함.
- 실수나 실패 시 솔직히 보고하고 필요한 경우 즉시 수정 조치.

[KnowledgeLearned: owner-data-path.md@5d7416c1]
# 사장님 데이터 경로 요약

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 및 내용

- **Profile 파일:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름, 성격 등 프로필 정보 포함

- **Persona 파일:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 대화 및 보고 시 활용할 사장님의 페르소나 정보

- **사진:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님의 사진 모음

## 에이전트 지침

- 사장님 관련 모든 정보의 검색 및 저장 시 **위의 명시된 경로**를 반드시 사용해야 함
- 경로 외 다른 위치를 추측하거나 사용하지 않음

이 정보는 코드 및 프로젝트 관리에 있어서 필수로 인지되어야 하며, 사장님과 관련된 어떠한 데이터도 이 경로에서 벗어나지 않도록 해야 합니다.

[KnowledgeLearned: project-playbook.md@f298300b]
# Project 도메인 검증 — 수학

[ProjectPlaybook v1]

## 수학 PDF 검증 태스크
- 수학 영역 PDF 메타·분류 검증
- 2차 Project에서 수학 확장 담당

[[최현석] 응 계획 세워서 말해줘]
Given the task requirements and context, I will create a comprehensive plan for 최현석 to help students excel in 수능 수학 (Korean College Scholastic Ability Test Mathematics). The plan will be based on 최현석's strengths, integrating modern educational tools and addressing individual student needs. Here’s a structured plan:

### 1. **Objective & Scope**
   - **Objective**: To enhance students’ mathematical problem-solving skills and conceptual understanding for high scores in 수능.
   - **Scope**: Tailoring learning plans based on individual student strengths and weaknesses in 수학.

### 2. **Plan Components**
   - **Initial Assessment**
     - Conduct a diagnostic test to identify each student's current level and specific areas for improvement.
     - Analyze results to customize the learning path for each student.

   - **Customized Learning Path**
     - Develop individualized weekly study plans focusing on weak areas.
     - Incorporate concept-based learning with an emphasis on problem-solving techniques.
     - Schedule regular follow-ups to adjust the learning plan based on progress.

   - **Resource Development**
     - Curate and develop study materials and exercises for key topics (e.g., Calculus, Probability & Statistics, Geometry).
     - Utilize 최신 수능 출제 경향 to ensure the material is current and relevant.
     - Provide past 수능 exam paper sets for practice.

   - **Interactive Learning Sessions**
     - Conduct group workshops and one-on-one tutoring sessions focusing on interactive problem solving.
     - Integrate digital tools such as interactive math software for enhancing engagement.
     - Monitor student participation and provide real-time feedback.

   - **Progress Monitoring & Feedback**
     - Weekly progress checks with tests and quizzes to assess understanding.
     - Provide detailed feedback and strategies for improvement.

   - **Mock Exams and Review Sessions**
     - Organize monthly mock exams replicating 수능 conditions to build exam temperament.
     - Review sessions post mock-exams to go through solutions and strategies.

### 3. **Resources Required**
   - Access to 수능 past papers and educational resources.
   - Mathematical teaching aids and software tools for visual learning.
   - Collaboration with Planner Agent for educational planning.

### 4. **Timeline**
   - **Weeks 1-2**: Conducting assessments and formulating initial learning paths.
   - **Weeks 3-10**: Custom learning paths implementation, with regular progress monitoring.
   - **Weeks 11-12**: Intensive mock exam practice and final reviews.

### 5. **Evaluation & Adjustment**
   - Continuous evaluation of the study plan's effectiveness.
   - Regular meetings to revise strategies based on the students’ progress and feedback.

Implementing this plan will require collaboration with educational stakeholders and possibly the utilization of digital platforms for resource sharing and communication. This plan aligns with 최현석's expertise and the company's mission of providing unparalleled educational support to students.

If code/files are needed to create study materials or assessment tools, please specify, and I can assist with creating those assets within the workspace mentioned.

[KnowledgeLearned: cross-agent-file-transfer.md@67aaa517]
# 에이전트 간 파일 이동

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
     ```

3. **실패 시 솔직히** — 파일을 찾지 못했거나 복사에 실패하면 "완료"라고 말하지 않고, 찾은 위치·조건·다음 조치를 안내합니다.

4. **허위 보고 금지** — 경로 없이 "옮겼다", "저장했다"고만 말하는 것은 금지입니다. 경로가 곧 증거입니다.

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/out

[KnowledgeLearned: owner-data-path.md@98133ba6]
# 사장님 데이터 경로

## 사장님 데이터 위치
- 절대 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- 워크스페이스 기준: `company/owner`

## 주요 파일
- 사장님 프로필: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` 
- 사장님 페르소나: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` 
- 사장님 사진: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` 

## 상황별 사용
- 사장님 관련 정보를 찾거나 저장할 때는 반드시 위 경로를 사용해야 합니다.
- 다른 위치를 추측하여 사용하지 않습니다.

[KnowledgeLearned: project-playbook.md@50f68c91]
# Project 협업 플레이북

## AgentCompany Project 표준 절차 (필수)

사장님이 PM에게 업무를 지시하면 아래 **5단계**를 따릅니다.

### 1. 목표
- 사장님 지시에서 **한 문장 목표** + 산출물·범위·제외 항목을 명확히 합니다.

### 2. 계획
- Phase 단위로 나눕니다 (리서치 → 구현/실행 → 검증 → PM 보고).
- 각 태스크마다 **작업 → 검토 루프**(최대 5회, FINISHED 키워드)가 돌아갑니다.

### 3. 작업 분배
- 계획을 **번호 + @에이전트명: 할 일** 형식으로 작성합니다.
- 예: `1. @한서준: 공식 PDF 출처 URL 조사`

### 4. 에이전트 선별
- **실제 회사 에이전트 roster만** 사용 (가상 직함·외부 인력 금지).
- role·title·capabilities로 매칭 (리서치→researcher, 자동화→backend, 도메인→전문가).

### 5. 승인 후 Project 실행
- PM이 계획을 사장님께 제시하고 **"진행하세요"** 승인을 요청합니다.
- 승인 시: Project 채팅방 생성 → Projects 탭 등록 → 에이전트 순차 협업.
- 산출물: `company/projects/{sessionId}/` (tasks/, files/, PM_REPORT.md)
- 이전 태스크 산출물은 **carry_data**로 다음 태스크에 전달됩니다.

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


##

[KnowledgeLearned: suneung-pdf-download.md@400f0e7f]
# 수능 PDF 다운로드

[SuneungPdfPlaybook v1]

## 수능 PDF 다운로드 — 검증된 방법 (2026-06-08)

### 공식 출처 (A급)
- 사이트: https://www.suneung.re.kr
- 기출 목록: `boardCnts/list.do?boardID=1500234&m=0403&s=suneung`
- 모의평가: `boardCnts/list.do?boardID=1500236&m=0403&s=suneung`
- 다운로드: `boardCnts/fileDown.do?fileSeq={hex}`
- 로그인 불필요, curl/Python urllib로 직접 다운로드 가능

### 파일명 규칙
- `{학년도}학년도_{영역}영역_문제지.pdf`
- 예: 2026학년도_국어영역_문제지.pdf

### Project 산출물 경로
- `company/projects/{sessionId}/files/pdfs/대학수학능력시험/`
- `company/projects/{sessionId}/files/scripts/download_suneung_pdfs.py`

### 실행 예시
```bash
python3 company/projects/{sessionId}/files/scripts/download_suneung_pdfs.py \
  --out company/projects/{sessionId}/files/pdfs \
  --subjects 국어,수학 --years 2025,2026
```

### 검증된 fileSeq (2025·2026 국어·수학)
| 학년도 | 영역 | fileSeq |
|--------|------|---------|
| 2026 | 국어 | 60defdef6d83db1b756f841089563c5a |
| 2026 | 수학 | f9055b3484e917

[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

1. **날씨예보** (id: 1780730812068-zzj5ynu)
   - URL: https://api.openweathermap.org/data/2.5
   - 설명: 날씨 관련 API
   - 인증: query-param (appid)
