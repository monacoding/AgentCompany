# 박준호 — 누적 메모리

_마지막 동기화: 2026-06-10T22:52:57.314Z_

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

[KnowledgeLearned: cross-agent-file-transfer.md@dafbfcb6]
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

[KnowledgeLearned: owner-data-path.md@b77e3675]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[[박준호] 유투브 국어 영역 관련 교육 내용 만들어서 자동으로 업로드하는 업무 만들 계획 짜줘]
To create a plan for developing and uploading Korean language education content to YouTube automatically, I'll outline a structured approach that can be broken down into phases. This plan will leverage your expertise in technology and project management.

### Phase 1: Planning and Requirements Analysis

1. **Define Objectives:**
   - Decide on the target audience and the specific topics within Korean language education.
   - Set goals for engagement metrics such as views, likes, and subscriptions.

2. **Research and Content Development:**
   - Conduct research to identify popular and educational content topics.
   - Collaborate with subject matter experts to develop authentic and high-quality content.

3. **Technical Requirements:**
   - Evaluate the need for video production tools, scripts, and voiceovers.
   - Determine the technological stack for automation (e.g., video editing software, YouTube API).

4. **Compliance:**
   - Ensure content aligns with YouTube guidelines.
   - Address any copyright issues and educational standards.

### Phase 2: Content Creation

1. **Script Writing:**
   - Collaborate with educators to draft engaging and informative scripts.
   - Focus on clarity and ensuring scripts are suitable for video format.

2. **Video Production:**
   - Use video editing tools to create visually appealing content.
   - Incorporate animations or graphics to enhance understanding.

3. **Voiceover and Subtitles:**
   - Record professional voiceovers.
   - Add subtitles to increase accessibility.

### Phase 3: Automation Setup

1. **API Integration:**
   - Integrate with YouTube API for video uploads.
   - Automate metadata addition (titles, descriptions, tags) for improved SEO.

2. **Scheduling:**
   - Develop a scheduler to automate video uploads at optimal times.
   - Use analytics to determine the best upload times based on target audience behavior.

3. **Monitoring and Feedback:**
   - Implement tracking for performance analytics (engagement, views, etc.).
   - Use feedback to continuously improve content quality and relevance.

### Phase 4: Execution and Continuous Improvement

1. **Pilot Launch:**
   - Conduct a pilot run with a few initial videos.
   - Gather viewer feedback to adjust content strategy.

2. **Scale Up:**
   - Increase video production frequency based on pilot outcomes.
   - Expand content variety, incorporating new educational trends.

3. **Iterative Improvement:**
   - Regularly update content based on analytics.
   - Implement community engagement strategies (e.g., Q&A sessions, live feedback).

### Action Items

- **Project Kickoff Meeting:** Arrange a meeting with stakeholders to finalize the project plan.
- **Resource Allocation:** Identify and allocate key resources required for each phase.
- **Timeline:** Establish a detailed timeline with clear milestones and deliverables.

By adhering to this roadmap, we can efficiently deliver high-quality educational content on YouTube while leveraging automation to enhance productivity and engagement. Let's move forward by finalizing the first phase and gathering all necessary resources!

[KnowledgeLearned: cross-agent-file-transfer.md@0634504f]
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

[KnowledgeLearned: owner-data-path.md@cdb398b5]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[[박준호] 나는 자동으로 유투브 영상을 제작되어서 업로드까지 되게 만들고 싶은데 뭐가 필요할까?]
자동으로 유튜브 영상을 제작하고 업로드하는 시스템을 구축하기 위해서는 다음 요소들이 필요합니다:

1. **영상 콘텐츠 생성**:
   - 스크립트 작성: 자동화된 스크립팅 도구, 예를 들어 AI 기반 텍스트 생성 모델을 사용할 수 있습니다.
   - 오디오 변환: 텍스트를 음성으로 변환하기 위해 TTS(Text-to-Speech) API를 사용하세요.
   - 비주얼 콘텐츠: 영상이나 이미지를 자동 생성하는 AI 도구 또는 프리셋 라이브러리를 활용할 수 있습니다.

2. **영상 편집 및 합성**:
   - 영상 편집 도구: FFMPEG 같은 CLI 기반의 편집 툴을 스크립트로 실행하여 클립을 결합하거나 편집할 수 있습니다.
   - 영상 템플릿 엔진: 영상의 일관성을 유지하기 위한 템플릿을 설정하고 자동으로 빌드합니다.

3. **자동 업로드 시스템**:
   - YouTube Data API: 영상 업로드를 자동화하기 위해 사용합니다. 이를 통해 계정 인증 및 영상 업로드를 스크립팅할 수 있습니다.

4. **스케줄링 및 파이프라인 자동화**:
   - CI/CD 도구: Jenkins, GitHub Actions 같은 도구를 활용해 파이프라인을 구축하고 자동화된 작업을 주기적으로 실행하게끔 설정합니다.

5. **에러 관리 및 로깅 시스템**:
   - 로그 및 오류 추적: AWS CloudWatch나 Sentry 같은 서비스로 로그를 관리하고 문제를 초기에 파악할 수 있습니다.

다음으로 이 계획을 구체적으로 실행하기 위한 로드맵을 제안하겠습니다.

### Phase 1: 요구사항 분석 및 설계
1. 목표 명확화 및 시스템 기능 정의
2. 필요한 API 및 도구 선택
3. 전체 시스템 아키텍처 설계

### Phase 2: 시스템 구현
1. 스크립트 자동 생성 및 변환 구현
2. 영상 편집 및 합성 모듈 구축
3. YouTube API 통합 및 업로드 기능 개발

### Phase 3: 통합 및 테스트
1. 전체 시스템 통합 테스트
2. 에러 관리 및 로깅 설정
3. 최종 튜닝 및 최적화 작업

### Phase 4: 운영 및 관리
1. 시스템 운영 매뉴얼 작성
2. 정기적인 기능 업데이트 및 유지보수 계획 수립

이 로드맵을 기반으로 구체적인 타임라인과 자원 배분을 계획하시면 될 것 같습니다. 필요한 추가 정보나 지원이 있을 경우 언제든 말씀해 주세요.

[[박준호] 지금 우리 팀 에이전트와 매칭 시켜줘]
아래와 같은 방식으로 팀 에이전트와의 매칭을 진행하겠습니다.

### 1. 에이전트의 역할과 역량 분석
- 팀 내 에이전트들이 어떤 역할을 수행 중인지, 그리고 그들의 현재 역량과 경험을 평가하겠습니다.
- 이를 통해 각 에이전트의 잠재력을 최대한 끌어낼 수 있는 조합을 구성하겠습니다.

### 2. 프로젝트 목표와 요구 사항 확인
- 현재 프로젝트의 목표와 요구 사항을 명확히 하여 에이전트의 특정 기술 및 경험이 프로젝트 성공에 기여할 부분을 찾아냅니다.

### 3. 에이전트와의 매칭 전략 수립
- 특정 태스크 및 프로젝트 단계별로 맞춤형 에이전트 매칭을 진행하겠습니다.
- 에이전트의 강점과 경험을 최대한 활용할 수 있는 방향으로 배치를 계획합니다.

### 실행 계획
- **1단계:** 내부 데이터 및 프로젝트 요구 사항 분석
- **2단계:** 각 에이전트의 프로필 및 경험 검토
- **3단계:** 프로젝트 단계별 매칭 계획 작성

이제 팀 에이전트의 프로필과 현재 프로젝트의 세부 사항을 바탕으로 매칭 계획을 세우겠습니다. 이 계획은 Project Manager인 제가 최종 검토 후 승인할 것입니다.

현재 프로젝트의 세부 사항이나 에이전트의 프로필 등을 추가로 공유해주실 수 있나요? 그러면 보다 정확한 매칭 계획을 수립하겠습니다.

[파일전달→사장님] 인터넷에서 수능 문제 pdf 로 다운 받는 작업
· README.md
  /Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/outputs/downloads/from-박준호/README.md
· cross-agent-file-transfer.summary.md
  /Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/outputs/downloads/from-박준호/cross-agent-file-transfer.summary.md
· owner-data-path.summary.md
  /Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/outputs/downloads/from-박준호/owner-data-path.summary.md
· cross-agent-file-transfer.md
  /Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/outputs/downloads/from-박준호/cross-agent-file-transfer.md
· owner-data-path.md
  /Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/outputs/downloads/from-박준호/owner-data-path.md
· role-profile.md
  /Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/outputs/downloads/from-박준호/role-profile.md

[PM 계획] 인터넷에서 수능 문제 pdf 로 다운 받는 작업 해보자
수능 문제 PDF를 다운로드하는 작업을 진행하기 위해, @한서준 (리서처) 에이전트를 활용하면 좋을 것 같습니다. 한서준 에이전트는 웹 크롤링과 데이터 수집에서 뛰어난 역량을 갖고 있으며, 정확하게 필요한 문서를 찾고 다운로드할 수 있도록 도와줄 수 있습니다.

작업 계획은 다음과 같습니다:

1. **목표 명확화**: 수능 문제 PDF 파일의 종류와 출처를 구체화하기.
2. **리서치 및 수집**: @한서준 에이전트를 통해 인터넷에서 신뢰할 수 있는 출처 확인 및 PDF 다운로드.
3. **파일 저장**: 확보한 PDF 파일을 우리의 워크스페이스에 안전하게 저장.

사장님께서 진행 준비가 되셨으면 "진행하세요"라고 말씀해 주시면, 바로 작업을 시작하겠습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@c6c6f516]
# 에이전트 간 파일 이동

## 파일 이동 규칙

- **완료 전 금지**
  - 파일 복사·이동이 실제로 완료되기 전까지 "저장했어요", "옮겼어요" 등의 완료 표현 사용 금지.
  - 대체 표현: "요청해볼게요", "진행할게요" 등 **예정**임을 나타내는 표현.

- **완료 시 경로 필수**
  - 복사 완료 후에만 완료 표현 사용 가능하며, 반드시 경로 명시.
  - 경로 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일을 찾을 수 없거나 실패 시, 조건 및 다음 조치를 솔직하게 설명.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 말하는 것 금지. 경로가 확인의 증거. 

상기 규칙은 시스템과의 신뢰 구축 및 효율적인 파일 이동을 위해 철저히 지켜져야 함.

[KnowledgeLearned: owner-data-path.md@3b5f7b01]
# 사장님 데이터 경로 요약

## 데이터 위치

- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 경로**: `company/owner`

## 주요 파일 설명

- `profile.json`: 사장님의 프로필 정보 (이름, 성격 등)
- `persona.md`: 사장님의 페르소나, 대화 및 보고 시 참고
- `photo/`: 사장님의 사진이 저장된 디렉토리

## 주의 사항

- 에이전트는 사장님과 관련된 정보를 찾거나 저장할 때 **항상 위의 지정된 경로**를 사용해야 합니다.
- 다른 경로를 추측하여 사용하지 않습니다.

[KnowledgeLearned: project-playbook.md@778b9f31]
# Project 협업 플레이북 — PM

[ProjectPlaybook v1]

사장님 지시 시 **목표 → 계획 → 작업 분배 → 에이전트 선별 → "진행하세요" 승인** 순서로 진행합니다.

## PM 출력 형식

```
## 목표
(한 문장)

## 계획
P1 리서치 → P2 자동화 → P3 검증 → P4 PM 보고

## 작업 분배
1. @한서준: …
2. @하정우: …

확정되시면 "진행하세요"라고 말씀해 주시면 Project를 시작합니다.
```

## 수능 PDF 업무 템플릿

- @한서준: 평가원 suneung.re.kr 출처 조사
- @하정우: download_suneung_pdfs.py 스크립트
- @김윤하: 국어 PDF 검증
- @최현석: 수학 PDF 검증 (2차)

[KnowledgeLearned: cross-agent-file-transfer.md@2379d9a2]
# 에이전트 간 파일 이동 규칙

## 기본 규칙

- **완료 전 금지**  
  파일 복사·이동이 실제로 완료되기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 완료 표현 사용 금지.  
  - 진행 단계에서는 "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 필수**  
  복사가 완료된 후에만 완료를 보고하고, **저장된 파일 경로를 필수로 기재**.  
  - 예시 형식:  
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  파일 복사 실패 시 "완료"라고 보고하지 않고, 대신 파일을 찾을 수 없는 이유와 다음 조치 설명.

- **허위 보고 금지**  
  경로 없이 "옮겼다", "저장했다"고만 보고하는 것은 금지. 경로 기재가 보고의 증거가 됨.

이 규칙들은 에이전트 간의 파일 이동에 있어 정보의 정확성을 유지하고 오류를 방지하기 위한 필수 사항입니다. 에이전트는 이 가이드를 준수하여 효율적인 커뮤니케이션과 시스템 신뢰도를 확보해야 합니다.

[KnowledgeLearned: owner-data-path.md@b5f46bcf]
# 사장님 데이터 경로

## 데이터 저장 위치

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일

- **프로필 파일:** `profile.json`
  - 내용: 사장님의 이름, 성격 등 기본 정보
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`

- **페르소나 파일:** `persona.md`
  - 내용: 대화 및 보고 시 참조할 사장님 페르소나
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`

- **사진 폴더:** `photo/`
  - 내용: 사장님 사진 저장
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

## 사용 지침

- 사장님과 관련된 정보를 저장하거나 접근할 때 **반드시 지정된 경로**를 사용한다.
- 다른 경로를 추측하거나 사용하지 않는다. 

위 경로는 사장님 관련 모든 데이터의 기본 저장소이다. 필요한 경우 언제든지 지정된 파일 및 폴더에서 접근 가능하다.

[KnowledgeLearned: project-playbook.md@f0527c20]
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

[PM 계획] 인터넷에서 2000~2010년도 수능 문제 pdf 로 다운 받는 작업 계획 짜줘
## 목표
인터넷에서 2000년부터 2010년까지의 수능 문제 PDF를 수집·다운로드하고 연도별로 정리합니다.

## 계획
P1. 출처 조사 및 신뢰도 평가  
P2. 다운로드 스크립트 구현  
P3. 수집된 PDF 검증  
P4. PM 보고  

## 작업 분배
1. @한서준: 2000~2010년도 수능 문제 PDF의 공식 출처 URL 및 신뢰도 조사, 해당 URL의 접근성 검토
2. @하정우: 조사된 출처를 기반으로 PDF를 일괄 다운로드하는 Python 스크립트 구현, 회사 프로젝트 경로에 저장
3. @김윤하: 수집된 PDF의 메타데이터(연도, 문제지 여부) 검증 및 누락·중복 확인
4. @박준호: PM_REPORT.md 작성 및 사장님에게 최종 보고

## 참여 에이전트
@박준호 · @한서준 · @하정우 · @김윤하

확정되시면 "진행하세요"라고 말씀해 주시면 Project를 시작하겠습니다.

[PM 계획] 진행해줘
확인했습니다. 계획에 따라 프로젝트를 시작하겠습니다.

### 프로젝트 진행 단계
1. **출처 조사 및 신뢰도 평가** - @한서준 에이전트
   - 2000~2010년도 수능 문제 PDF의 공식 출처 URL 및 신뢰도 조사
   - 해당 URL의 접근성 검토

2. **다운로드 스크립트 구현** - @하정우 에이전트
   - 조사된 출처를 기반으로 PDF를 일괄 다운로드하는 Python 스크립트 구현
   - 회사 프로젝트 경로에 저장

3. **수집된 PDF 검증** - @김윤하 에이전트
   - 수집된 PDF의 메타데이터(연도, 문제지 여부) 검증
   - 누락·중복 확인

4. **PM 보고** - @박준호 에이전트
   - PM_REPORT.md 작성 및 사장님에게 최종 보고

각 에이전트가 자신의 역할을 완료하면 다음 단계로 넘어가겠습니다. 프로젝트가 완료되면 결과를 보고드리겠습니다.

[PM 계획] 인터넷에서 2000~2010년도 수능 문제 pdf 로 다운 받는 작업 계획 짜줘
### 목표
2000년부터 2010년까지의 수능 기출문제 PDF를 신뢰할 수 있는 출처에서 수집하여 다운로드합니다.

### 계획
P1. 출처 조사
P2. 다운로드 자동화 스크립트 구현
P3. 파일 검증 및 분류
P4. 프로젝트 결과 PM 보고

### 작업 분배
1. @한서준: 2000~2010년 수능 문제의 신뢰할 수 있는 출처 URL 및 다운로드 가능한 파일 정보 조사
2. @하정우: @한서준이 조사한 출처를 바탕으로 PDF를 일괄 다운로드하는 Python 스크립트 구현. 파일은 `company/projects/{sessionId}/files/pdfs/`에 저장
3. @김윤하: 다운로드한 PDF 파일의 메타 데이터 검토 및 누락이나 중복 여부 검증
4. @박준호: 프로젝트 결과를 PM_REPORT.md에 작성하고 사장님께 보고

### 참여 에이전트
@박준호, @한서준, @하정우, @김윤하

사장님, 이대로 진행할까요?

[PM 계획] 인터넷에서 2000~2010년도 수능 문제 pdf 로 다운 받는 작업 계획 짜줘
## 목표
2000년부터 2010년까지의 수능 문제 PDF를 인터넷에서 다운로드하여 정리하기.

## 계획
P1: 출처 조사 / P2: 다운로드 자동화 구현 / P3: 결과 검증 및 정리 / P4: PM 보고

## 작업 분배
1. @한서준: 2000~2010년도 수능 문제를 제공하는 공식 웹사이트 및 신뢰할 수 있는 출처 URL 조사
2. @하정우: 한서준 에이전트의 조사 결과를 바탕으로 PDF 파일을 일괄 다운로드하는 Python 스크립트 구현, 회사 프로젝트 폴더에 저장
3. @최현석: 수학 문제 PDF의 메타 정보(학년도·영역) 검증 및 누락·중복 확인
4. @김윤하: 국어 문제 PDF의 메타 정보(학년도·영역) 검증 및 누락·중복 확인
5. @박준호: PM_REPORT.md 작성 및 사장님께 최종 보고

## 참여 에이전트
@박준호 · @한서준 · @하정우 · @최현석 · @김윤하

사장님, 이대로 진행할까요?

[PM 계획] 인터넷에서 2000~2010년도 수능 문제 pdf 로 다운 받는 작업 계획 짜줘
## 목표
2000~2010년도 수능 문제 PDF를 정확한 공식 출처에서 수집하고 다운로드하여 과목별, 학년도별로 정리하는 것.

## 계획
P1. 출처 조사: 신뢰할 수 있는 공식 출처를 찾아 URL 및 다운로드 방법 확인
P2. 자동화: PDF 파일을 일괄 다운로드할 수 있는 Python 스크립트 작성
P3. 검증: 다운로드된 파일의 메타데이터(학년도 및 과목) 검토 및 누락·중복 확인
P4. PM 보고: 프로젝트 결과와 보고서를 작성하여 제출

## 작업 분배
1. @한서준: 2000~2010년도 수능 문제 PDF를 제공하는 공식 출처 조사 및 URL 수집
2. @하정우: 수집된 URL을 기반으로 PDF 파일 다운로드 스크립트 작성 및 실행
3. @김윤하: 다운로드된 PDF 파일의 메타데이터 검토 및 오류 확인
4. @박준호: 프로젝트 결과 검토, PM_REPORT.md 작성 및 사장님께 보고

## 참여 에이전트
@박준호 · @한서준 · @하정우 · @김윤하

사장님, 이대로

[PM 계획] 유투브 대본 짜는 계획 짜줄래? 주제는 이재명 탄핵 
지금 이재명 관련 기사 조사하고, 
1분짜리 유투브 쇼츠 대본짜줘
## 목표  
사장님, **이재명 탄핵 관련 최신 기사 흐름을 조사한 뒤, 사실관계 기반의 1분 유튜브 쇼츠 대본**을 작성하겠습니다.  
산출물은 **① 기사 조사 요약 ② 핵심 쟁점 정리 ③ 1분 쇼츠 대본 ④ 영상 구성안**입니다.  
단, 확인되지 않은 의혹을 단정하거나 특정 정치 입장을 선동하는 표현은 제외하고, **중립적·팩트 기반 톤**으로 설계하겠습니다.

## 계획  

### P1. 기사 조사  
- 최근 이재명 관련 기사 중 “탄핵”, “위헌”, “정치권 반응”, “법적 쟁점”과 연결되는 내용을 조사합니다.  
- 최소 3개 이상 출처를 비교해 사실관계를 확인합니다.  
- 기사 제목, 매체, 날짜, 핵심 주장, 반론 여부를 정리합니다.

### P2. 쟁점 구조화  
- 1분 쇼츠에 맞게 내용을 압축합니다.  
- 구조는 다음처럼 잡겠습니다.  
  1. 첫 3초 후킹  
  2. 현재 이슈 요약  
  3. 탄핵 논의가 나오는 이유  
  4. 실제 가능성과 

[PM 계획] 강남집값 관련 추이를 분석하고 유투브 쇼츠용 1분짜리 대본을 만드는 계획을 짜주세요
## 목표  
사장님, **강남 집값 추이를 데이터·기사 기반으로 분석한 뒤, 1분 유튜브 쇼츠용 대본과 영상 구성안**을 만드는 프로젝트로 잡겠습니다.  

산출물은 다음 4가지입니다.  
1. 강남 집값 추이 요약  
2. 상승·하락 요인 정리  
3. 1분 유튜브 쇼츠 대본  
4. 자막·장면 구성안  

범위는 **강남구 중심 아파트 매매가 추이**로 잡고, 필요하면 서초·송파와 비교해 강남의 흐름을 더 명확히 보겠습니다.  
제외 항목은 **투자 권유, 매수·매도 추천, 확인되지 않은 전망 단정**입니다.

## 계획  

### P1. 자료 조사  
- 강남구 아파트 매매가 추이 관련 최신 기사와 공공 데이터 흐름을 조사합니다.  
- 주요 키워드는 다음으로 잡겠습니다.  
  - 강남 집값  
  - 강남구 아파트 매매가  
  - 서울 아파트 가격지수  
  - 강남 3구 집값  
  - 재건축·금리·대출 규제·공급 이슈  
- 최소 3개 이상 출처를 비교해 사실관계를

[PM 계획] 삼성전자 제품에서 블로그 홍보 했을 때 가장 많이 팔릴 제품 조사하고 블로그 홍보글 작성 요청
## 목표  
삼성전자 제품 중 **블로그 홍보 시 판매 전환 가능성이 가장 높을 제품을 조사·선정**하고, 해당 제품에 대한 **검색 유입형 블로그 홍보글 초안**을 작성합니다.

## 계획  

### P1. 제품 후보 조사  
- 삼성전자 주요 제품군 후보를 정리합니다.  
  - 예: 갤럭시 스마트폰, 갤럭시 버즈, 갤럭시 워치, 갤럭시탭, 삼성 모니터, TV, 냉장고, 세탁기, 건조기, 공기청정기, 로봇청소기 등  
- 블로그 홍보 적합도를 기준으로 비교합니다.  
  - 검색량 가능성  
  - 구매 전환 가능성  
  - 가격대  
  - 계절성  
  - 리뷰 콘텐츠 적합성  
  - 소비자 관심도  
  - 제휴/쿠팡파트너스 등 링크 전환 가능성  

### P2. 판매 가능성 높은 제품 선정  
- 후보 제품을 비교해 **1순위 제품 1개**와 **대안 제품 2~3개**를 선정합니다.  
- 선정 이유를 데이터 중심으로 정리합니다.  
- 블로그 홍보 관점에서 핵심

[PM 계획] 선박에 적용 되는 에어 컴프레서 타입 조사 및 보고서 작성 계획
## 목표  
사장님, **선박에 적용되는 에어 컴프레서 타입을 조사하여, 타입별 구조·용도·장단점·선박 적용 사례·선정 기준을 정리한 실무형 보고서**를 작성하는 것을 목표로 하겠습니다.

## 계획  

### P1. 조사 범위 확정  
- 선박 내 에어 컴프레서 사용 목적 분류  
  - 주기관 시동용 Starting Air Compressor  
  - 제어 공기용 Control Air Compressor  
  - 계장 공기용 Instrument Air Compressor  
  - 서비스/작업 공기용 Service Air Compressor  
  - 비상용 Emergency Air Compressor  
- 적용 선박 범위 정리  
  - 일반 상선  
  - LNG/LPG 운반선  
  - 컨테이너선  
  - 탱커  
  - 특수선 및 해양 설비는 필요 시 참고 수준으로 포함  

### P2. 에어 컴프레서 타입 조사  
- 구조 방식별 조사  
  - 왕복동식,

[PM 계획] 선박에 적용되는 에어 컴프레서 종류와 내용 관련하여 정리해서 보고서 작성해줘
## 목표
사장님 지시에 따라 **선박에 적용되는 에어 컴프레서의 종류, 용도, 작동 원리, 선박 내 적용 위치, 운용·정비 포인트를 정리한 실무형 보고서**를 작성하겠습니다.

## 계획
**P1. 자료 조사**
- 선박용 에어 컴프레서의 주요 분류 조사  
  - Starting Air Compressor  
  - Service Air Compressor  
  - Control Air Compressor  
  - Emergency Air Compressor  
  - Deck / Utility Air Compressor 등
- 선박 기관실, 갑판 설비, 제어 시스템에서의 실제 사용 목적 정리
- 국제 해사·선급 기준과 일반 선박 운용 관점 확인

**P2. 내용 구조화**
- 에어 컴프레서의 기본 역할
- 선박에서 압축공기가 필요한 이유
- 종류별 특징, 사용처, 압력 범위, 장단점 정리
- 왕복동식, 스크류식, 원심식 등 구조별 비교
- 선박 운용 시 주의사항 및 정비 체

[PM 계획] 선박용 에어 컴프레서 실무 보고서 작성
## 목표  
사장님, **선박용 에어 컴프레서의 구조·운전·정비·고장 대응·안전관리까지 포함한 실무형 보고서**를 작성하겠습니다.  

- **산출물:** 선박용 에어 컴프레서 실무 보고서 `.md` 문서  
- **범위:**  
  - 선박용 에어 컴프레서 개요  
  - 선박 내 사용 목적  
  - 주요 구성품  
  - 작동 원리  
  - 운전 절차  
  - 정비·점검 항목  
  - 주요 고장 사례 및 대응  
  - 안전관리  
  - 실무 체크리스트  
- **제외 항목:**  
  - 특정 제조사 매뉴얼의 무단 복제  
  - 선급 규정 원문 전체 번역  
  - 실제 선박별 장비 도면 기반 상세 설계  

## 계획  

### P1. 자료 조사 및 구조화  
선박용 에어 컴프레서의 실무 정보를 신뢰 가능한 기준으로 조사하고, 보고서 목차를 확정합니다.  
- 선박에서의 사용처  
- 시동 공기 시스템  
- 제어 공기·서비스 공기  
- 왕복동식/스크류식 컴프

[PM 계획] 선박에 적용 되는 에어컴프레서 종류 조사 보고서
## 목표  
사장님, **선박에 적용되는 에어컴프레서의 주요 종류, 작동 방식, 선박 내 적용 용도, 장단점, 선정 기준을 정리한 조사 보고서**를 작성하겠습니다.

- **산출물:** 선박용 에어컴프레서 종류 조사 보고서  
- **포함 범위:**  
  - 선박 내 압축공기 사용처  
  - 선박용 에어컴프레서 종류  
  - 왕복동식, 스크류식, 원심식 등 주요 형식 비교  
  - 시동공기용, 제어공기용, 서비스공기용 등 용도별 적용  
  - 장단점 및 선정 기준  
  - 표 형식 요약  
- **제외 항목:**  
  - 특정 제조사 견적 비교  
  - 실제 구매 사양서 작성  
  - 선급 규정 상세 해석  

## 계획  

### P1. 기본 리서치  
선박에서 에어컴프레서가 사용되는 주요 계통을 정리합니다.  
예: 주기관 시동공기, 제어공기, 서비스공기, 청소·공구용 공기 등

### P2. 종류별 조사  
선박에 적용되는 에어컴프레서를 형식별로 분류합니다.

[PM 계획] 선박 에어 컴프레서 종류 검토 및 보고서 작성
네, 사장님. 선박에 적용되는 에어컴프레서의 종류에 대한 검토 및 보고서 작성을 진행하겠습니다. 목표, 계획, 작업 분배, 참여 에이전트를 아래와 같이 설정하겠습니다.

## 목표
선박에 사용되는 에어컴프레서의 주요 종류를 조사하고, 각 종류에 대해 작동 방식, 장단점, 적용 분야를 분석하여 보고서를 작성합니다.

## 계획
P1. 기본 정보 조사: 선박용 에어컴프레서의 일반적인 용도 및 요구 사항 파악  
P2. 종류별 세부 조사: 각 에어컴프레서의 주요 특징 및 작동 방식 조사  
P3. 비교 및 분석: 각 종류의 장단점 및 적용 분야 분석  
P4. 최종 보고서 작성: 조사 내용을 기반으로 보고서 작성 및 검토  

## 작업 분배
1. @한서준: 선박용 에어컴프레서의 일반적인 용도 및 요구 사항 조사
2. @박준호: 각 종류별 에어컴프레서 특징 및 작동 방식 조사
3. @최현석: 각 종류의 장단점 및 적용 분야 비교 분석
4. @박준호: 최종 보고서 통합 작성 및 검토

##

[PM 계획] 선박에 적용 되는 에어 컴프레서 조사해줘 (한서준이랑 둘이해)
알겠습니다, 사장님. 선박에 적용되는 에어 컴프레서에 대한 조사를 진행하겠습니다. 아래와 같은 방식으로 진행하겠습니다.

## 목표
선박에 적용되는 에어 컴프레서에 대한 정보를 수집하고 분석하는 것.

## 계획
P1. 관련 자료 리서치 
P2. 데이터 분석 및 요약 
P3. 결과 보고 

## 작업 분배
1. @한서준: 선박에 사용되는 에어 컴프레서에 대한 자료 수집 및 출처 확인
2. @박준호: 수집된 정보를 토대로 데이터 분석 및 요약

## 참여 에이전트
@박준호 · @한서준

사장님, 이대로 진행할까요?

[PM 계획] 선박 에어 컴프레서 관련해서 조사해줘
선박 에어 컴프레서 관련 조사를 진행하기 위해 프로젝트 계획을 제안드립니다.

## 목표
선박 에어 컴프레서에 대한 기술적 사양과 최신 동향을 조사하여 보고서를 작성합니다.

## 계획
P1: 에어 컴프레서의 기본 원리 및 기술적 사양 리서치
P2: 최신 동향 분석 및 관련 기술 발전 사례 조사
P3: 조사 결과를 기반으로 종합 보고서 작성

## 작업 분배
1. @한서준: 에어 컴프레서의 기술적 사양과 기본 원리 조사
2. @한서준: 관련 최신 동향 및 기술 발전 사례 리서치
3. @박준호: 조사된 정보를 바탕으로 종합 보고서 작성

## 참여 에이전트
@박준호 · @한서준

사장님, 이대로 진행할까요?

[PM 계획] 선박 에어 컴프레서 적용 관련하여 검토해주세요
선박 에어 컴프레서 적용에 대한 검토를 시작하겠습니다. 
우선 이 프로젝트의 목표와 세부 계획을 세우고 작업을 분배해보겠습니다.

## 목표
선박에 적용할 에어 컴프레서의 효율성 및 적합성 검토

## 계획
1. **Phase 1: 리서치**
   - 선박용 에어 컴프레서의 주요 기술 사양 및 시장 동향 조사

2. **Phase 2: 분석**
   - 특정 모델의 장단점, 비용 대비 효율성 분석
   - 선박 구조 및 운항 조건에 따른 적합성 평가

3. **Phase 3: 보고**
   - 종합 검토 결과를 토대로 최적의 에어 컴프레서 모델 추천 및 보고서 작성

## 작업 분배
1. @한서준: 선박용 에어 컴프레서의 기술 사양 및 시장 동향 조사
2. @최현석: 에어 컴프레서 모델별 성능 및 효율성 분석
3. @김윤하: 선박 구조 및 운항 조건에 따른 적합성 평가
4. @박준호: 최적 모델 추천 및 종합 보고서 작성

## 참여 에이전트
@박준호 · @한서준 · @최현석 · @

[PM 계획] Inert gas gerator 에 의한 화물 탱크 내 염분 유입 가능성 검토 보고서 작성
## 목표
Inert Gas Generator(IGG) 운전 과정에서 **화물 탱크 내 염분이 유입될 수 있는 경로·조건·가능성·저감 대책**을 검토하여, 사장님께 제출 가능한 기술 검토 보고서를 작성합니다.

## 계획
**P1. 자료 조사 및 조건 정의**  
- IGG의 일반 구성, 연소가스 세정 방식, 해수 스크러버 사용 여부, 데미스터/드레인 구조 조사  
- 화물 탱크로 유입 가능한 물질 경로 정리  
- 검토 범위: 선박 화물 탱크, IGG 배관, 스크러버, 데미스터, 드레인, 블로워, deck water seal 등  
- 제외 항목: 특정 선박 도면 기반 상세 설계 검증, 실제 염분 농도 실측 분석

**P2. 염분 유입 메커니즘 분석**  
- 해수 스크러버 사용 시 염분 미스트 동반 가능성  
- 데미스터 성능 저하, 과부하 운전, 드레인 불량, 배관 응축수 역류 가능성 검토  
- IGG가 연소식인지, 질소 발생기 방식인지에 따른 차이 구분

**P3. 가능성

[KnowledgeLearned: cross-agent-file-transfer.md@2823849e]
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

[KnowledgeLearned: owner-data-path.md@bcb3c82b]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

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

[KnowledgeLearned: cross-agent-file-transfer.md@c85169e9]
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

[KnowledgeLearned: owner-data-path.md@145d596c]
# 사장님 데이터 경로 요약

- "사장님(Owner)"에 관련된 파일들은 `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner` 경로에서 찾을 수 있습니다.

## 주요 파일
1. `/profile.json` 
  - 사장님의 프로필 정보(이름, 성격 등)을 담은 파일

2. `/persona.md` 
  - 사장님의 페르소나, 즉 대화 스타일이나 보고 의도 등을 참고할 수 있는 파일

3. `/photo/`
  - 사장님의 사진이 저장된 폴더

- AI 에이전트는 사장님의 정보를 찾거나 저장할 때, 위에서 정의된 경로를 반드시 사용해야 합니다.

[KnowledgeLearned: project-playbook.md@1efd12e4]
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

[KnowledgeLearned: cross-agent-file-transfer.md@2ba067e9]
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

[KnowledgeLearned: owner-data-path.md@dbc5abc9]
# 사장님 데이터 경로 요약

- 사장님의 프로필, 페르소나, 사진 데이터는 이 경로에 저장: `company/owner`
- 절대 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- 주요 파일:
  - `profile.json` : 사장님 프로필 (이름, 성격 등)
  - `persona.md` : 사장님 페르소나 (대화, 보고 시 참고)
  - `photo/` : 사장님 사진
- 에이전트는 이 경로를 사용하여 사장님 관련 정보를 찾거나 저장. 다른 위치는 추측하지 않음.

[KnowledgeLearned: project-playbook.md@5ab36474]
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

[KnowledgeLearned: cross-agent-file-transfer.md@71fe6186]
- **완료 전 금지**  
  - 파일 복사·이동이 시스템에서 완전히 끝나기 전에는 완료 표현 금지.
  - 사장 지시 후 "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 필수**  
  - 실제 복사 완료 시에만 완료 언급 가능.
  - 반드시 전체 파일 경로 작성 필요.  
  - 예: `/워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf`

- **실패 시 솔직히**  
  - 파일 찾기 실패 시 "완료"라고 언급 금지.
  - 찾은 위치, 조건, 다음 조치 명확히 안내.

- **허위 보고 금지**  
  - 경로 없이 "옮겼다", "저장했다"라고만 언급하는 것 금지.
  - 경로는 작업 증거로 필수.

[KnowledgeLearned: owner-data-path.md@ad0b0f8f]
# 사장님 데이터 경로

## 데이터 위치 요약

- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로**: `company/owner`

## 주요 파일 설명

- **프로필 파일**: `profile.json`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름, 성격 등 기본 정보 포함
- **페르소나 파일**: `persona.md`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 사장님과의 대화나 보고 시 참고할 페르소나 정보
- **사진 폴더**: `/photo/`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님의 사진 파일 모음

## 데이터 접근 지침

- 에이전트는 사장님 관련 정보를 **반드시 지정된 경로**를 통해 접근 및 저장해야 합니다.
- 사장님 데이터의 접근 및 수정에는 다른 경로를 사용하지 않도록 주의해야 합니다.

## 경로 사용의 중요성

- 잘못된 경로 사용은 데이터 손실 및 접근 오류를 유발할 수 있으므로 지정된 경로를 활용하는 것을 엄격히 따릅니다. 

이 파일은 사장님 관련 정보를 효율적이고 정확하게 관리하는 데 필수적인 안내서로, 지정된 형태와 방법에 따라 데이터 작업을 수행해야 함을 명시합니다.

[KnowledgeLearned: project-playbook.md@2ca59749]
# Project 협업 플레이북 요약

## AgentCompany Project 표준 절차

### 1. 목표 설정
- 사장님 지시에서 **한 문장 목표** 정의
- 산출물, 범위, 제외 항목 명확히

### 2. 계획 수립
- Phase 단위로 진행 (리서치 → 구현/실행 → 검증 → PM 보고)
- 각 태스크에서 **작업→검토 루프** 최대 5회, `FINISHED` 키워드 사용

### 3. 작업 분배
- 번호와 @에이전트명 형식으로 할 일 지정
- 예: `1. @한서준: 공식 PDF 출처 URL 조사`

### 4. 에이전트 선별
- 실제 회사 에이전트만 사용, 가상 직함 금지
- 역할과 능력에 따라 매칭 (리서치→연구원, 자동화→백엔드, 도메인→전문가)

### 5. 승인 후 Project 실행
- PM이 계획 제시, 사장님 승인 요청
- 승인 시 Project 채팅방 생성, Projects 탭 등록, 순차 협업 진행
- 산출물: `company/projects/{sessionId}/` (tasks/, files/, PM_REPORT.md)
- **carry_data**로 태스크 데이터 전달

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

"진행하세요"라고 말씀해 주시면 Project를 시작합니다.
```

## PM 전용 — Project 오케스트레이션

- 사장님 지시 수신 후 **목표·계획·분배·에이전트** 블록 제시
- roster 외 인물·역할 금지
- PDF/수집 업무: @한서준(출처) → @하정우(스크립트) → 도메인 전문가(검증)
- 영상/콘텐츠: @서윤아델린 +

[PM 계획] CPI 관련해서도 동향 조사해줘
사장님, CPI(소비자물가지수) 관련 동향을 조사하기 위한 Project를 준비하겠습니다.

## 목표
2026년 6월 현재 CPI(소비자물가지수) 관련한 최신 동향을 조사하여 보고합니다.

## 계획
P1. 한서준 리서처가 최신 CPI 데이터를 수집합니다.
P2. 수집된 데이터를 분석하여 경제적 영향을 파악합니다.
P3. PM 보고서를 통해 결과를 전달합니다.

## 작업 분배
1. @한서준: 최신 CPI 데이터 수집 및 정리
2. @박준호: 데이터 분석 및 보고서 작성

## 참여 에이전트
@박준호 · @한서준

사장님, 이대로 진행할까요?

[PM 계획] 스페이스X 상장 관련 뉴스 조사
스페이스X의 상장 관련 뉴스를 조사하기 위한 계획을 세워보겠습니다.

## 목표
스페이스X의 상장 관련 최신 뉴스를 수집하여 보고합니다.

## 계획
P1. 관련 뉴스 출처를 탐색하고 수집하기
P2. 수집된 뉴스의 내용을 정리하고 핵심 정보 추출하기
P3. 최종 보고서 작성 및 제출

## 작업 분배
1. @한서준: 스페이스X 상장 관련 공식 뉴스 출처 URL 조사
2. @하정우: 조사된 URL에서 뉴스 스크립트 수집 및 정리

## 참여 에이전트
@박준호 · @한서준 · @하정우

사장님, 이대로 진행할까요?

[ExternalApiRegistry] 등록된 External API 없음
