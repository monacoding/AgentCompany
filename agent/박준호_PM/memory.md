# 박준호 — 누적 메모리

_마지막 동기화: 2026-06-08T13:01:21.525Z_

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

[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

1. **날씨예보** (id: 1780730812068-zzj5ynu)
   - URL: https://api.openweathermap.org/data/2.5
   - 설명: 날씨 관련 API
   - 인증: query-param (appid)
