# 서윤 아델린 — 누적 메모리

_마지막 동기화: 2026-06-11T02:12:27.470Z_

[KnowledgeLearned: ai-video-production-stack.md@0f62fa1a]
# AI 영상 제작 스택 가이드

## 전체 파이프라인(10단계)
- **1단계:** 트렌드·시장 분석 (트렌드 분석)
- **2단계:** 콘텐츠 기획 (기획)
- **3단계:** 대본·스토리보드 (대본)
- **4단계:** 캐릭터·비주얼 톤 (캐릭터)
- **5단계:** 이미지 생성 (이미지 생성)
- **6단계:** 영상 클립 생성 (영상 생성)
- **7단계:** 음성·BGM (음성 생성)
- **8단계:** 편집·합성 (편집)
- **9단계:** 배포 (업로드)
- **10단계:** 성과 분석 (분석)

## 레이어별 필수 스택
### 오케스트레이션
- **워크플로 자동화:** AgentCompany + 수동 트리거 / n8n 등
- **에이전트 LLM:** OpenAI GPT-4o 등
- **상태·작업 추적:** Task Board

### 트렌드·리서치
- 유튜브 트렌드 도구: YouTube Data API v3 등
- 숏폼 트렌드 도구: TikTok Creative Center 등
- 키워드 도구: Google Trends 등
- 경쟁 분석: 수동 리서치 에이전트

### 기획·대본
- **대본 초안:** GPT-4o
- **스토리보드:** Notion, Figma
- **씬 분할 JSON** 권장

### 이미지 생성
- **MVP 도구:** DALL·E 3 등
- **프로덕션 도구:** Flux Pro 등

### 영상 생성(AI 클립)
- 텍스트→영상, 이미지→영상 도구: Runway Gen-3 Alpha 등
- **권장전략:** AI 클립과 다양한 콘텐츠 혼합

### 음성·오디오
- TTS, 보이스 클론, BGM 도구: ElevenLabs, Suno, 등
- **필수사항:** 타임코드 자막(SRT) 포함 나레이션

### 편집·합성
- 자동화 도구: FFmpeg,

[KnowledgeLearned: ai-video-production-stack.md@8f549911]
# AI 영상 제작 스택 가이드

## 1. 전체 파이프라인 (10단계)
- 트렌드 분석, 콘텐츠 기획, 대본 작성 등의 **10단계**로 구성
- 단계별 **입력·출력 포맷** 고정하여 작업 분할

## 2. 레이어별 필수 스택

### 2-1. 오케스트레이션
- **MVP:** AgentCompany + 수동 트리거
- **프로덕션:** n8n 사용, 멀티 모델 라우팅 적용

### 2-2. 트렌드·리서치
- **트렌드 도구:** YouTube Data API, Google Trends
- **산출물:** `brief.md` 파일로 생성

### 2-3. 기획·대본
- **초안 도구:** GPT-4o, Claude 3.5 Sonnet
- **씬 JSON:** 편집·생성 에이전트와 공용

### 2-4. 이미지 생성
- **MVP:** DALL·E 3, Ideogram
- **프로덕션:** Flux Pro, Midjourney API 이용

### 2-5. 영상 생성 (AI 클립)
- **텍스트→영상 도구:** Runway, Kling 활용
- **전략:** AI 클립과 빠른 컷 편집 혼합

### 2-6. 음성·오디오
- **TTS 도구:** ElevenLabs, OpenAI TTS
- **나레이션:** mp3/wav 형식 사용

### 2-7. 편집·합성
- **편집 도구:** CapCut, DaVinci Resolve
- **FFmpeg 사용:** 자막 번인 등 자동화 지원

### 2-8. 저장·에셋 관리
- 프로젝트 폴더 구조화
- **클라우드:** S3 / GCS 사용

### 2-9. 업로드·배포
- **플랫폼 도구:** YouTube Data API, TikTok API
- **메타데이터 템플릿 활용**

### 2-10. 분석·피드백 루프
- **지표 도구:** Yo

[Production: 테스트 영상 제작 해보자 주제 무관, 유투브 올릴 숏츠 영상 5초 짜리]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-테스트-영상-제작-해보자-주제-무관-유투브-올릴-숏츠-영상-5초-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-테스트-영상-제작-해보자-주제-무관-유투브-올릴-숏츠-영상-5초-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-테스트-영상-제작-해보자-주제-무관-유투브-올릴-숏츠-영상-5초-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 너가 직접 하정우에게 만들어 달라고 해줘]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-너가-직접-하정우에게-만들어-달라고-해줘-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-너가-직접-하정우에게-만들어-달라고-해줘-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-너가-직접-하정우에게-만들어-달라고-해줘-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트용 영상 하나 제작하자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트용-영상-하나-제작하자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트용-영상-하나-제작하자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트용-영상-하나-제작하자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트용 영상 하나 제작하자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트용-영상-하나-제작하자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트용-영상-하나-제작하자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트용-영상-하나-제작하자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트 영상 하나 제작하자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-제작하자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-제작하자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-제작하자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트 영상 하나 제작하자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-제작하자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-제작하자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-제작하자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트 영상 하나 만들자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-만들자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-만들자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-만들자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트 영상 하나 만들자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-만들자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-만들자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상-하나-만들자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

[Production: 서윤아 테스트 영상하나 제작하자]
✅ 영상 제작 기획 산출물이 생성되었습니다.
📋 브리프: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상하나-제작하자-brief.md
📝 대본: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상하나-제작하자-script.md
🎬 씬: agent/서윤아델린_영상제작자/outputs/plans/2026-06-06-서윤아-테스트-영상하나-제작하자-scenes.json
다음 단계: 이미지·영상·음성 API 연동 또는 @하정우 에게 자동화 스크립트 구현을 요청하세요.

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


[KnowledgeLearned: cross-agent-file-transfer.md@823c1ada]
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


[KnowledgeLearned: cross-agent-file-transfer.md@3c43f0cf]
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

[KnowledgeLearned: owner-data-path.md@6db9dcb4]
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

[KnowledgeLearned: owner-data-path.md@522c4f1b]
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

[KnowledgeLearned: cross-agent-file-transfer.md@e1a34a2c]
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

[KnowledgeLearned: owner-data-path.md@3ed95fb0]
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

[KnowledgeLearned: cross-agent-file-transfer.md@e9b75e05]
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

[KnowledgeLearned: cross-agent-file-transfer.md@ebc7817b]
# 에이전트 간 파일 이동

## 파일 이동 규칙

- ### 완료 전 금지
  - 파일 복사·이동이 끝나기 전에는 "저장했어요", "옮겼어요" 등의 완료 표현 사용 금지.
  - 지시 직후에는 "요청해볼게요", "진행할게요" 등의 예정 표현 사용.

- ### 완료 시 경로 필수
  - 복사 완료 확인 후에만 완료 사실을 보고하며, 저장된 파일 경로 반드시 명시.
  - 경로 출력 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
    /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- ### 실패 시 솔직히
  - 파일 찾기 실패 또는 복사 실패 시 완료했다는 표현은 사용하지 않으며, 상황과 후속 조치 안내 필수.

- ### 허위 보고 금지
  - 경로 없이 "옮겼다", "저장했다"라는 보고 금지. 경로 명시는 필수.  

이 규칙들은 파일 이동의 정확성을 보장하고, 오해를 방지하기 위함입니다. 규칙을 준수하여 파일 이동 절차에서 불필요한 오류를 피하세요.

[KnowledgeLearned: owner-data-path.md@d8a1f4e5]
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

[KnowledgeLearned: cross-agent-file-transfer.md@c6c6f516]
# 에이전트 간 파일 이동 규칙

- **완료 전 금지**
  - 파일 복사 및 이동이 시스템에서 완전히 끝나기 전에는 "저장했어요", "옮겼어요" 등의 완료 표현 금지.
  - "요청해볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 필수**
  - 파일이 성공적으로 복사되었을 때만 완료 선언.
  - 반드시 파일 경로 명시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일이 없거나 복사 실패 시 "완료"라 하지 않음.
  - 발견 위치, 실패 조건 및 다음 조치 명시.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 하는 보고는 금지.
  - 경로는 보고의 필수 증거. 

위의 규칙들은 에이전트 간의 파일 이동 작업에서 필수적으로 지켜져야 합니다. 각각의 루프는 기존 규칙의 반복이며, 잘못된 행동을 방지하기 위한 엄격한 지침을 제공합니다.

[KnowledgeLearned: owner-data-path.md@5d7416c1]
# 사장님 데이터 경로 요약

## 사장님 데이터 위치

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일

- **프로필:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름, 성격 등 기본 정보

- **페르소나:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 사장님과의 대화 및 보고 시 참고할 사항

- **사진:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님의 사진 파일들

## 중요 안내

- 에이전트는 사장님 관련 정보를 검색하거나 저장할 때 반드시 지정된 경로를 사용해야 합니다.
- 다른 경로를 사용하거나 추측하여 저장하지 않도록 합니다. 

이 정보를 바탕으로 사장님과 관련된 모든 데이터는 지정된 폴더 내에서 관리됩니다.

[KnowledgeLearned: cross-agent-file-transfer.md@2379d9a2]
# 에이전트 간 파일 이동 규칙

## 기본 원칙

- **완료 전 금지**
  - 파일 복사·이동이 시스템에서 끝나기 전, "저장했어요", "옮겼어요" 등 완료 표현 사용 금지.
  - "요청해볼게요", "진행할게요" 등 예정 표현만 허용.

- **완료 시 경로 필수**
  - 실제 복사가 확인되면 완료 보고 가능, 반드시 저장된 파일 경로 명시.
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 찾기 실패 시, 상황과 다음 조치 설명. "완료"라는 표현 사용 금지.

- **허위 보고 금지**
  - 경로 없이 간단히 "옮겼다", "저장했다"는 보고 금지. 경로명은 증거로 필수.

[KnowledgeLearned: owner-data-path.md@3b5f7b01]
# 사장님 데이터 경로 요약

## 핵심 경로 정보
- 사장님의 프로필, 페르소나, 사진 등 관련 데이터는 특정 경로에 저장되어 있습니다.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json` (이름·성격 등 세부 정보 포함)
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  
- **페르소나 파일:** `persona.md` (대화·보고 시 참고할 성향 정보)
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  
- **사진 디렉터리:** `photo/` (사장님 사진 저장)
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

## 데이터 경로 사용 지침
- 에이전트는 사장님과 관련된 정보를 검색하거나 저장할 때 반드시 위에 명시된 경로를 사용해야 합니다.
- 다른 경로를 사용할 경우 데이터 손실 및 정보 오류가 발생할 수 있습니다. 

## 주의사항
- 경로를 변경하지 않으며, 반드시 지침에 따라 사용해야 합니다.
- 반복적으로 경로 정보를 제공하여 혼란을 방지하고 데이터 일관성을 유지합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@f33bd8ed]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 표현 금지:**
  - 에이전트 간 파일 복사나 이동이 실제로 완료되기 전에는 "저장했어요", "옮겼어요" 등의 완료 표현 금지.
  - 대체 표현: "요청해볼게요", "진행할게요" 등의 예정 표현 사용.

- **완료 시 경로 명시:**
  - 파일 복사 완료 후에만 "완료" 표현 사용 가능.
  - 반드시 파일이 저장된 경로를 명확히 제시.
  - 경로 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직한 보고:**
  - 파일을 찾지 못했거나 복사 실패 시 "완료"라 하지 말고, 위치 수정 및 후속 조치 안내.

- **허위 보고 금지:**
  - 경로 없이 "옮겼다", "저장했다"고만 보고하는 행위 금지.
  - 경로 제공이 곧 작업 완료 증명.

이 규칙은 에이전트 간의 명확한 의사소통과 업무 진행의 신뢰성을 보장하기 위해 반드시 준수해야 하며, 반복적인 강조를 통해 중요성을 나타냅니다.

[KnowledgeLearned: owner-data-path.md@b5f46bcf]
# 사장님 데이터 경로

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일
- **Profile 파일:** `profile.json` — 사장님의 기본 프로필 정보 (이름, 성격 등)
- **Persona 파일:** `persona.md` — 사장님의 페르소나 정보 (대화 및 보고서 작성 시 참고)
- **Photo 폴더:** `photo/` — 사장님의 사진 저장

## 주의사항
- 에이전트는 사장님과 관련된 정보를 찾거나 저장할 때 반드시 위 경로를 사용해야 합니다.
- 다른 경로를 추측하여 데이터에 접근하지 않도록 유의합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@9fcefa28]
# 에이전트 간 파일 이동 규칙 요약

- **완료 표현 금지**
  - 파일 이동 완료 전, "저장했어요", "옮겼어요" 등 사용 금지.
  - 대신 "요청해볼게요", "진행할게요" 등의 예정 표현 사용.
  
- **완료 시 경로 명시**
  - 이동 완료 후에만 완료 보고 가능. 파일 경로를 반드시 제공.
  - 경로 예시 제공:  
    ```
    📁 저장 경로:
    · 파일명.pdf  
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```
  
- **실패 시 명확한 보고**
  - 파일 이동 실패 시 실패 사실을 알리고, 위치, 조건 및 해결 방안 설명.
  
- **허위 보고 금지**
  - 경로 없이 이동 완료 보고 불가. 경로가 이동 완료의 증거임.

[KnowledgeLearned: owner-data-path.md@f3323a51]
# 사장님 데이터 경로 요약

## 데이터 경로 정보
- 사장님의 프로필, 페르소나, 사진이 저장된 위치입니다.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일
- **프로필 파일:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 사장님의 이름과 성격 등 기본 정보 포함.
- **페르소나 파일:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 대화와 보고 시 참고할 사장님의 페르소나 정보 포함.
- **사진 폴더:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 사장님의 사진이 저장된 디렉토리.

## 접근 권고 사항
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 지정된 경로**를 이용합니다.
- 다른 위치를 추측하거나 사용하지 말 것. 

이 파일들은 사장님의 개인적이고 중요한 정보를 포함하고 있으므로, 경로를 정확하게 사용하고, 보안에 유의해야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@6e0d721a]
# 에이전트 간 파일 이동

## 규칙 요약

- **완료 전 표현 금지**
  - 파일 복사나 이동이 실제로 완료되기 전까지는 "저장했어요", "옮겼어요", "받았어요", "전달했어요"와 같은 완료 표현 금지
  - 진행 중인 경우 "요청해볼게요", "여쭤볼게요", "진행할게요" 등의 예정 표현 사용

- **완료 후 경로 제공 필수**
  - 복사나 이동이 확인된 후에만 완료를 언급 가능
  - 반드시 저장된 파일 경로를 명시해야 함
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직한 보고**
  - 파일을 찾지 못하거나 복사 실패 시 "완료"라는 표현을 사용하지 않음
  - 문제의 위치, 조건, 다음 단계의 조치에 대해 명확히 안내

- **허위 보고 방지**
  - 경로 없이 "옮겼다", "저장했다"라고 말하는 것은 금지
  - 경로는 파일 이동 완료의 증거로 필수

이 규칙들은 에이전트 간의 명확한 커뮤니케이션과 시스템의 정확한 관리에 기여합니다. 각 단계에서 적절한 표현과 절차를 준수함으로써 업무의 투명성과 효율성을 높일 수 있습니다.

[KnowledgeLearned: owner-data-path.md@d39bbd8e]
# 사장님 데이터 경로 요약

## 기본 경로 정보
- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로**: `company/owner`

## 주요 파일
- **프로필**: `profile.json` 
  - 내용: 사장님의 이름, 성격 등의 정보
- **페르소나**: `persona.md`
  - 내용: 대화 및 보고 시 참고하는 사장님의 페르소나 정보
- **사진 폴더**: `photo/`
  - 내용: 사장님 사진

## 사용 시 주의사항
- 에이전트는 사장님 관련 정보를 처리할 때 반드시 위의 경로를 사용해야 함
- 다른 위치를 추측하거나 임의로 설정하지 않음

## 중복 정보
- 문서가 반복되어 있으나, 정보는 위의 항목들로 요약 가능

이 경로 및 파일들이 정확하게 설정되어 있음으로써 사장님 관련된 모든 데이터 관리와 접근이 효율적으로 이루어질 수 있습니다. 에이전트는 이 규칙을 준수하여 작업해야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@7b290ecd]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 금지**  
  - 파일 복사나 이동이 완료되지 않은 상태에서는 "저장했어요", "옮겼어요" 같은 완료 표현 사용 금지.
  - 요청을 받은 직후에는 "요청해볼게요", "진행할게요" 등의 예정 표현 사용.

- **완료 시 경로 필수**  
  - 파일 이동이 실제로 완료되었을 때만 이를 알리며, 반드시 저장된 파일의 경로를 명확히 적시.
  - 경로는 복사가 완료되었음을 증명하는 필수 요소.
  - 예시 형식:  
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  - 파일을 찾지 못했거나 복사에 실패했을 경우 "완료"라고 하지 않고, 발견된 위치, 조건, 다음 조치를 솔직하게 설명.

- **허위 보고 금지**  
  - 파일 이동의 완료를 경로 없이 단순히 "옮겼다", "저장했다"고만 보고하는 행위 금지.
  - 경로는 이동 여부에 대한 증거이다.

이러한 규칙은 에이전트 간의 파일 이동의 정확성과 신뢰성을 보장하기 위한 필수 사항입니다.

[KnowledgeLearned: owner-data-path.md@23d0589c]
# 사장님 데이터 경로 요약

## 데이터 경로 정보
- 사장님 관련된 모든 데이터는 특정 경로에 집중적으로 보관.
- **절대 경로:** 
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** 
  - `company/owner`

## 주요 파일 목록
- **프로필 정보:** 
  - `profile.json` 파일에는 사장님의 이름과 성격 등의 정보 포함.
- **페르소나 문서:** 
  - `persona.md` 파일은 사장님과의 대화나 보고 시 참고 가능.
- **사진:** 
  - `photo` 폴더에 사장님의 사진 저장.

## 에이전트 사용 지침
- 에이전트는 사장님과 관련된 정보를 검색하거나 저장할 때 반드시 위의 경로를 사용.
- 다른 위치에 대한 추측은 불필요.

이 경로는 사장님 관련 데이터에 대해 필수적으로 인식해야 하는 경로입니다. 파일을 찾거나 변경할 때 항상 이 경로를 참조해야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@8d86abe1]
# 에이전트 간 파일 이동

## 필수 규칙

- **완료 전 금지**  
  - 파일 전송 완료 전에는 "저장했어요", "옮겼어요" 등의 완료 표현 금지.
  - 진행 표현 사용: "요청해볼게요", "여쭤볼게요", "진행할게요".

- **완료 시 경로 필수**  
  - 전송 완료 후에만 완료 표현 사용. 반드시 경로 명시.
  - 형식 예시:  
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  - 실패 시 "완료"라고 하지 않음. 찾은 장소, 조건, 조치 안내.

- **허위 보고 금지**  
  - 경로 없이 단순히 "옮겼다", "저장했다"고만 말하는 것은 금지.  
  - 경로가 증거로 작용.  

*이 규칙들은 반복적으로 강조되며 모든 에이전트 간 파일 이동 과정에서 일관되게 적용해야 함.*

[KnowledgeLearned: owner-data-path.md@c5fba880]
# 사장님 데이터 경로

## 사장님 데이터 위치

- ### 절대 경로
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
  
- ### 워크스페이스 기준
  - `company/owner`

## 주요 파일

- **프로필 파일**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 사장님 이름 및 성격 정보 포함

- **페르소나 파일**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 대화 및 보고 시 참고 사항 포함

- **사진 저장소**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 사장님 사진 저장

## 중요 사항

- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 위 경로를 사용해야 하며, 다른 위치는 추측하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@a0e57e35]
# 에이전트 간 파일 이동

## 파일 이동 규칙

- **완료 전 금지**
  - 파일 이동이 완료되지 않은 상태에서 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 같은 완료 표현 금지.
  - 지시 직후엔 "요청해볼게요", "여쭤볼게요", "진행할게요" 같은 **예정** 표현 사용.

- **완료 시 경로 제공 필수**
  - 파일 이동 완료 후에만 성과 보고.
  - 반드시 파일이 저장된 전체 경로를 제공.
  - 경로 제공 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직하게 알리기**
  - 파일을 찾지 못하거나 복사 실패 시 "완료"라 하지 않고, 찾은 위치나 조건, 다음 조치에 대해 안내.

- **허위 보고 금지**
  - 경로 제시 없이 "옮겼다", "저장했다"는 표현 금지.
  - 경로는 작업 완료를 증명하는 요소.

이 규칙들은 파일 이동 과정에서 정확한 정보 전달과 책임감을 높이기 위해 필수적으로 지켜져야 합니다.

[KnowledgeLearned: owner-data-path.md@5f75552d]
# 사장님 데이터 경로 요약

## 데이터 경로 정보
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일
- **사장님 프로필:** `profile.json`
  - 프로필 정보: 이름, 성격 등
- **사장님 페르소나:** `persona.md`
  - 참고 사용: 대화, 보고 시
- **사장님 사진 경로:** `photo/`

## 주의 사항
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 지정된 경로를 사용해야 함.
- 다른 경로를 추측하거나 사용하지 않음.

[KnowledgeLearned: cross-agent-file-transfer.md@adba4bae]
# 에이전트 간 파일 이동

## 기본 규칙

- **완료 전 표현 금지**  
  - 파일 복사·이동 완료 전에는 완료 표현 사용 불가: "저장했어요", "옮겼어요" 등.  
  - 대체 표현: "요청해볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 명시 필수**  
  - 파일 복사 완료 후 저장 경로를 반드시 표기.  
  - 예시:  
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직한 보고**  
  - 파일 복사 실패 시 "완료" 대신, 찾은 위치 및 추가 조치 안내.

- **허위 보고 금지**  
  - 경로 없이 "옮겼다", "저장했다"는 표현 금지. 경로 표기가 필수.

## 중요 포인트
- 표현의 정확성과 투명성 강조.
- 파일 복사·이동 상태에 대한 명확한 커뮤니케이션 필요.
- 대체 표현 사용으로 오해 방지.

위 규칙은 파일 이동의 신뢰성과 효율성을 위한 필수 절차입니다. 모든 에이전트는 이 지침을 준수해야 합니다.

[KnowledgeLearned: owner-data-path.md@6eeaff1f]
# 사장님 데이터 경로

## 데이터 저장 위치

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 설명

- **프로필 파일**
  - `profile.json`: 사장님의 이름, 성격 등이 포함된 프로필 정보가 저장되어 있습니다.
  
- **페르소나 문서**
  - `persona.md`: 사장님과의 대화 및 보고 시에 참고할 페르소나 정보가 기록되어 있습니다.
  
- **사진 폴더**
  - `photo/`: 사장님의 사진이 저장된 디렉터리입니다.

## 에이전트의 접근 규칙

- 사장님에 관한 정보를 찾거나 저장할 때는 **반드시 지정된 경로**를 따라야 합니다.
- 지정된 경로 이외의 위치를 사용하여 정보를 탐색하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@da10ebd1]
# 에이전트 간 파일 이동 규칙

## 기본 규칙

- **완료 전 표현 금지**
  - 파일 이동이나 복사가 시스템에서 완료되기 전까지 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등의 완료 표현 사용 금지.
  - 명령 수신 즉시 "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현만 사용.

- **완료 시 경로 첨부 필수**
  - 파일 이동이 완료되면 실제 경로를 정확히 적어야 함.
  - 예시 포맷:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히 보고**
  - 파일 이동 실패나 파일 못 찾을 시에는 "완료"라는 표현 대신 위치, 오류 조건, 다음 조치를 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고 표현하는 것은 금지됨. 경로 제공이 증거 역할을 함.

재확인 및 후속 조치 규칙을 준수하여 보다 효율적이고 투명한 파일 관리에 기여하세요.

[KnowledgeLearned: owner-data-path.md@a622c9ba]
# 사장님 데이터 경로

## 데이터 위치 및 경로
- 사장님의 프로필, 페르소나, 사진은 아래 경로에 저장되어 있습니다.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 포함 정보: 사장님의 이름, 성격 등
- **페르소나 파일:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 포함 정보: 대화나 보고 시 사용하는 참고 자료
- **사진 폴더:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 포함 정보: 사장님 사진

## 경로 사용 지침
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 위 경로를 사용해야 합니다.
- 다른 위치를 추측하거나 사용해서는 안됩니다.

각 문서마다 동일한 지침이 반복되므로 간결성을 유지하는 것이 중요합니다. 경로와 파일들 간의 연관성을 확실히 이해하고 적절히 사용하는 것이 핵심입니다.

[KnowledgeLearned: cross-agent-file-transfer.md@2df0df40]
# 에이전트 간 파일 이동 규칙 요약

## 주요 규칙

- **완료 전 금지**
  - 파일 복사나 이동이 시스템에서 실제로 완료되기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등의 완료 표현 사용 금지.
  - 사장님 지시 직후에는 "요청해볼게요", "여쭤볼게요", "진행할게요" 등의 예정 표현 사용.

- **완료 시 경로 필수**
  - 복사가 실제로 완료된 경우에만 완료를 보고해야 하며, 반드시 모든 저장 경로를 적시해야 함.
  - 경로 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 찾기나 복사 실패 시 완료라고 말하지 않으며, 발견된 파일의 위치, 조건, 다음 조치를 설명해야 함.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"는 표현만 사용하는 것은 금지. 정확한 경로가 증거로써 필수.

이 규칙을 통해 에이전트 간의 파일 이동 과정에서의 일관성, 투명성, 정확성을 보장하고자 함. 모든 작업 진행 상태 및 결과에 대해 명확하게 보고하여 불필요한 혼란을 방지하고, 책임성을 강화합니다.

[KnowledgeLearned: owner-data-path.md@3befc2f4]
# 사장님 데이터 경로

## 사장님 데이터 위치

- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준**: `company/owner`

## 주요 파일

- **사장님 프로필**: 
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 이름, 성격 등
- **사장님 페르소나**:
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 대화, 보고 시 참고
- **사장님 사진 저장 폴더**:
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

## 사용 지침
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 지정된 경로**를 사용해야 합니다.
- 다른 위치로의 이동이나 추측은 금지됩니다.

[KnowledgeLearned: cross-agent-file-transfer.md@4d2f1cda]
# 에이전트 간 파일 이동 규칙

## 기본 규칙

- **완료 전 표현 금지**
  - 파일 이동이 시스템에서 실제로 끝나기 전에는 완료 표현을 사용하는 것이 금지됩니다.
  - "요청해볼게요", "진행할게요" 등의 예정 표현만 허용됩니다.

- **완료 시 경로 명시**
  - 파일 복사가 확인된 후에만 완료를 알리며, 반드시 저장된 파일 경로를 명시해야 합니다.
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 정직한 보고**
  - 파일을 찾지 못했거나 복사에 실패한 경우, 상황을 명확히 설명하고 다음 단계를 안내해야 합니다.

- **허위 보고 금지**
  - 경로 없이 '옮겼다', '저장했다'고 보고하는 것은 금지됩니다.
  - 경로 제공이 증거로 간주됩니다. 

**이 규칙은 모든 에이전트 간 파일 이동 시 필수적으로 준수해야 하며 의도적이든 비의도적이든 규칙 위반은 문제로 간주됩니다.**

[KnowledgeLearned: owner-data-path.md@761daaac]
# 사장님 데이터 경로 파일 요약

## 데이터 경로 정보
- 사장님의 프로필, 페르소나, 사진은 아래 폴더에 저장되어 있습니다.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 데이터 파일
- **프로필:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 사장님의 이름, 성격 등 기본 정보 포함
- **페르소나:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 사장님과의 대화 또는 보고 시 참고할 정보 포함
- **사진:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 사장님의 사진 저장

## 에이전트 사용 지침
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 위의 경로를 사용해야 합니다.
- 다른 경로를 추측하거나 사용하지 않아야 합니다.

> 파일 위치 정보가 반복되어 있으므로 중복을 피하고 동일 내용임을 요약하였습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@5436ba43]
# 에이전트 간 파일 이동 규칙

- **완료 전 표현 금지**
  - 파일 복사·이동이 실제로 끝나기 전까지는 "저장했어요", "옮겼어요" 등의 완료 표현 불가
  - 임무 시작 시 계획 표현만 가능: "요청해볼게요", "진행할게요"

- **완료 시 경로 명시**
  - 실제 복사 완료 시에만 완료 보고 가능하며 모든 파일 저장 경로 명시 필수
  - 저장 경로 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직한 보고**
  - 파일 복사 실패 시 완료 보고 금지, 문제 발생 위치 및 조건, 다음 조치에 대한 안내 필수

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"는 표현 사용 금지, 경로는 보고의 증거로 사용

> 해당 규칙은 모든 에이전트가 파일 관리 시 필수적으로 준수해야 하며, 반복적인 규칙 위반 시 제재가 따를 수 있습니다.

[KnowledgeLearned: owner-data-path.md@465f529d]
# 사장님 데이터 경로 요약

## 데이터 경로 정보
- 사장님의 프로필, 페르소나, 사진은 특정 폴더에 저장되어 있음.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json`
  - 내용: 사장님의 이름, 성격 등 기본 정보 포함
- **페르소나 파일:** `persona.md`
  - 내용: 사장님과의 대화 및 보고 시 참고할 페르소나 정보
- **사진 폴더:** `photo/`
  - 사장님의 사진 저장 경로

## 경로 사용 지침
- 에이전트는 사장님 관련 데이터를 찾거나 저장할 때 **반드시 지정된 경로**를 사용해야 함.
- 지정된 경로 외 다른 위치를 사용하거나 추측하지 않음. 

이 파일은 사장님의 정보를 체계적으로 관리하고 접근하기 위한 필수 정보입니다. 각 파일은 해당하는 데이터를 체계적으로 담고 있어, 사장님과의 원활한 상호작용을 돕습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@134a68aa]
# 에이전트 간 파일 이동 규칙 요약

## 기본 규칙

- **완료 전 금지**: 파일 이동 또는 복사가 완료되기 전에는 "완료" 표현 금지.
  - **사용 가능한 표현**: "요청해볼게요", "진행할게요" 등.

- **완료 시 경로 필수**: 파일 이동이 확인되면 반드시 **저장 경로**를 명시.
  - **형식 예시**:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**: 복사 실패 시, "완료"라고 하지 말고 **상황 및 다음 조치 설명**.

- **허위 보고 금지**: 경로 없이 "완료"라고 하는 보고는 안 됨. 경로가 확인의 증거.

## 코어 원칙

- 모든 과정에서 **정확하고 투명한 보고**가 필수적이다.
- 경로 공유는 파일 이동의 진위성을 증명하기 위한 필수 절차이다.
- 명시된 규칙을 위반할 경우, 보고 신뢰도에 영향을 미칠 수 있다. 

이 규칙은 파일 관리의 효율성과 정확성을 높이기 위한 체계입니다. 에이전트 간의 명료한 소통이 목표이며, 파일 이동의 효과적인 완료를 보장합니다.

[KnowledgeLearned: owner-data-path.md@e61e73c9]
# 사장님 데이터 경로 요약

## 경로 정보

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 및 정보

- **사장님 프로필 파일**
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님 이름, 성격 등

- **사장님 페르소나 파일**
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 대화 및 보고 시 참고할 사장님 페르소나

- **사장님 사진 폴더**
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님 사진들

## 주의 사항

- 에이전트는 **반드시 위에 명시된 경로**를 사용하여 사장님 관련 정보를 검색하거나 저장해야 합니다.
- 다른 경로를 사용하거나 추측하지 말아야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@d7d36ca6]
# 에이전트 간 파일 이동 규칙

## 주요 규칙

- **완료 전 금지**
  - 파일 복사·이동이 완료되기 전, 절대 "완료" 표현 사용 금지.
  - 사장님 지시 직후에는 "요청해볼게요", "진행할게요" 등 **예정** 표현 사용.

- **완료 시 경로 필수**
  - 복사가 확인된 후에만 완료를 말하며, **저장된 파일 경로** 완전 기재 필수.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 찾기 실패 시 "완료" 대신 문제 위치·조건·다음 조치 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다" 등의 표현 금지 → 경로가 증거.

[KnowledgeLearned: owner-data-path.md@55eb0cf0]
# 사장님 데이터 경로

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json` — 사장님 이름, 성격 정보 포함
- **페르소나 파일:** `persona.md` — 대화 및 보고 시 참고되는 페르소나 정보
- **사진 폴더:** `photo/` — 사장님 사진 저장 

## 주의사항
- 에이전트는 사장님 관련 정보를 검색하거나 저장할 때 반드시 지정된 경로를 사용해야 함.
- 다른 위치는 추측하지 않음. 

이 경로는 사장님과 관련된 모든 정보의 저장 및 검색을 위한 표준 경로로 사용됩니다.

[KnowledgeLearned: cross-agent-file-transfer.md@42492665]
# 에이전트 간 파일 이동 규칙

## 기본 규칙

- **완료 전 금지**: 파일 복사·이동 작업이 **완료되기 전에는**, "저장했어요", "옮겼어요", "받았어요" 등의 완료 표현을 사용하지 않음.
  - 작업 전: "요청해볼게요", "진행할게요" 등의 **예정 표현**만 사용.

- **완료 시 경로 기재 필수**: 복사가 **확인된 후에만** 완료를 알리고, 반드시 **저장된 파일 경로**를 명시.
  - 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히 보고**: 파일을 찾지 못했거나 복사에 실패할 경우 **완료 표현 금지**, 찾은 위치·조건 및 다음 조치 내용 보고.

- **허위 보고 금지**: 경로 없이 "옮겼다", "저장했다"라고만 말하는 것을 금지. 경로는 증거 자료임.

항상 **정확한 정보**와 **책임감 있는 보고**가 중요하며, 규칙을 준수하여 업무를 처리하여야 합니다.

[KnowledgeLearned: owner-data-path.md@5e0357f7]
# 사장님 데이터 경로 요약

## 데이터 위치

사장님의 프로필, 페르소나, 사진이 저장된 폴더 정보:

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 및 폴더

- **프로필 파일:** `profile.json`  
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름, 성격 등 기본 정보
  
- **페르소나 파일:** `persona.md`  
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 대화 및 보고 시 참고할 페르소나 정보

- **사진 폴더:**  
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님의 사진 파일 모음

## 사용 지침

- **에이전트의 경로 사용:**  
  - 사장님과 관련된 정보를 찾거나 저장할 때는 **반드시 위의 경로**를 사용합니다.
  - 다른 경로를 추측하거나 임의로 사용하지 않습니다. 

## 반복된 정보

위 데이터 경로 및 파일 정보는 문서 내에서 여러 번 반복되어 설명되고 있습니다. 주요 경로와 파일에 대한 안내가 중복되어 있으나 중요성을 강조합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@bd6b1a1b]
# 에이전트 간 파일 이동 규칙 요약

## 완료 전 금지
- 파일 복사·이동이 실제로 완료되기 전에는 완료 표현 사용 금지
- 예문: "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 사용 불가
- 대체 표현: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현 사용

## 완료 시 경로 필수
- 복사 완료 후에만 완료 표현 사용 가능
- 완료 보고 시 반드시 자세한 파일 경로 제시
  ```
  📁 저장 경로:
  · 파일명.pdf
    /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
  ```

## 실패 시 솔직 보고
- 파일을 찾지 못하거나 복사 실패 시 "완료" 표현 금지
- 문제 발생 위치, 조건 및 다음 조치 설명 필수

## 허위 보고 금지
- 파일 경로 없이 "옮겼다", "저장했다"는 표현 사용 금지
- 경로 제공이 보고의 핵심 증거

## 규칙 강조
- 위 사항 반복 강조: 명확한 지침 준수 요구
- 시스템적인 규칙으로, 모든 에이전트가 동일하게 적용받음

이 규칙들은 에이전트 간의 정확한 파일 이동 및 협업을 위한 필수 지침으로, 실패 및 혼선을 방지하기 위한 것입니다. 모든 에이전트는 해당 규칙을 준수해야 합니다.

[KnowledgeLearned: owner-data-path.md@925105bb]
# 사장님 데이터 경로 요약

- **데이터 위치**
  - **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
  - **워크스페이스 기준 경로:** `company/owner`

- **주요 파일**
  - `profile.json`:
    - 내용: 사장님의 이름, 성격 등 프로필 정보 포함
  - `persona.md`:
    - 내용: 사장님의 페르소나 정보 제공, 대화 및 보고 시 참고
  - `photo/` 폴더:
    - 내용: 사장님의 사진이 저장되어 있음

- **경로 사용 지침**
  - 에이전트는 사장님 관련 정보를 조회하거나 저장할 때 반드시 지정된 경로를 사용해야 함.
  - 지정된 경로 외 다른 위치를 추측하거나 사용하지 않음. 

이 요약은 사장님과 관련된 데이터의 저장 위치와 주요 파일에 대한 정보를 간략히 제공하며, 에이전트가 해당 정보에 접근할 때의 안전하고 정확한 경로를 안내합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@687e9687]
# 에이전트 간 파일 이동 규칙

## 핵심 규칙

- **완료 전 금지**
  - 파일 복사·이동이 완료되기 전, "저장했어요", "옮겼어요" 등의 완료 표현 사용 금지.
  - 지시 직후에는 "요청해볼게요", "진행할게요" 등의 **예정** 표현 사용.

- **완료 시 경로 필수**
  - 복사 완료 시 저장된 파일 경로 전부를 명시해야 함.
  - 예제 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 복사 실패 시, "'완료'" 표현 금지. 현재 상황과 다음 조치를 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 말하는 것을 금지. 경로가 증거가 됨. 

각 규칙은 에이전트 간 파일 이동 과정의 투명성과 신뢰성을 보장하기 위한 필수 절차.

[KnowledgeLearned: owner-data-path.md@586d79be]
# 사장님 데이터 경로

### 데이터 경로 정보
- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 경로**: `company/owner`

### 주요 파일
- **프로필**: `profile.json` — 사장님의 이름, 성격 등 정보 포함
- **페르소나**: `persona.md` — 대화 및 보고 시 참조할 페르소나 정보
- **사진**: `photo/` — 사장님 사진 보관

### 중요 지침
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **항상 해당 경로**를 사용해야 합니다.
- 다른 위치로의 경로 변경이나 추측은 허용되지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@ab55964a]
# 에이전트 간 파일 이동

## 규칙 (필수)

- **완료 전 금지**
  - 파일 복사·이동이 실제로 완료되기 전에는 "저장했어요", "옮겼어요", 등 완료 표현 금지.
  - "요청해볼게요", "진행할게요" 등 예정 표현만 사용.

- **완료 시 경로 필수**
  - 실제 복사가 확인되면 완료 언급 가능.
  - 저장된 파일 경로를 반드시 표기.
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 찾기 실패 시 "완료"라고 말하지 말고 상황 설명과 다음 조치 안내.

- **허위 보고 금지**
  - 경로 없는 "옮겼다", "저장했다" 표현 금지. 
  - 경로는 작업 증명 필수 요소. 

### 주의사항
- 위 규칙은 반복적으로 강조되므로, 모든 항목을 준수해야 함.
- 경로 제공은 보고 시 신뢰성을 높힘.
- 작업 진행의 적확성을 보장하기 위해 상세 경로 의무화. 

규칙은 체계적 파일 관리와 신뢰성 있는 데이터 교환을 위한 필수 요건임.

[KnowledgeLearned: owner-data-path.md@34d70a05]
# 사장님 데이터 경로 요약

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필:** `profile.json`
  - 내용: 사장님의 이름, 성격 등 기본 정보
- **페르소나:** `persona.md`
  - 내용: 대화 및 보고 시 참고할 사항
- **사진:** `photo/`
  - 내용: 사장님의 사진 파일 저장

## 에이전트 지침
- 사장님 데이터 관련 정보 검색 및 저장 시 **지정된 경로**를 사용
- 다른 위치를 추측하거나 사용하지 않음

이 경로는 에이전트의 사장님 데이터 처리에 필수적입니다.

[ProjectPlaybook v1]

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

[KnowledgeLearned: cross-agent-file-transfer.md@3f2a1218]
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

[KnowledgeLearned: owner-data-path.md@c5b89637]
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

[KnowledgeLearned: cross-agent-file-transfer.md@8bb275ce]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 금지**
  - 파일 복사·이동이 완료되지 않은 상태에서 "저장했어요", "옮겼어요" 등 완료 표현 사용 금지.
  - 지시 직후에는 "요청해볼게요", "진행할게요" 등 예정 표현만 사용.

- **완료 시 경로 필수**
  - 실제 복사 완료 시에만 완료 선언 가능.
  - 반드시 파일의 저장 경로를 정확하게 작성.
  - 형식 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일을 찾지 못했거나 복사에 실패할 경우, "완료"라고 말하지 않음.
  - 찾은 위치 및 조건, 다음 조치를 구체적으로 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 말하는 것 금지.
  - 경로 제시가 곧 완료의 증거임. 

위의 규칙을 반복해 강조하여 준수하도록 권장.

[KnowledgeLearned: owner-data-path.md@b829bd34]
# 사장님 데이터 경로

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름, 성격 등 프로필 정보
- **페르소나 파일:** `persona.md`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 사장님의 페르소나 정보 (대화 및 보고 시 참고)
- **사진 폴더:** 
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님 사진

## 주의사항
- 모든 사장님 관련 정보의 저장 및 조회는 반드시 위에 명시된 경로를 통해야 합니다.
- 다른 위치를 사용하거나 경로를 추측하지 않습니다.

[KnowledgeLearned: project-playbook.md@6368cbba]
# Project 협업 플레이북 요약

## AgentCompany Project 표준 절차 (필수)

- **1. 목표 설정**
  - 사장님 지시에서 공통 목표와 범위 설정
  - 산출물 및 제외 항목 명확히

- **2. 계획 수립**
  - 리서치 → 구현/실행 → 검증 → PM 보고의 순서로 Phase 구분
  - 작업 검토 루프(최대 5회)

- **3. 작업 분배**
  - 번호 + @에이전트명: 수행할 작업 형태로 작성
  - 예: `1. @한서준: 공식 PDF 출처 URL 조사`

- **4. 에이전트 선별**
  - 실제 회사 에이전트만 사용(외부 인력 금지)
  - 역할, 직함, 능력에 맞게 매칭

- **5. Project 실행 승인**
  - PM이 계획을 사장님께 제시하고 승인 요청
  - 승인이 완료되면 Project 채팅방 생성 및 에이전트 협업 시작
  - 산출물 전달 체계 확립: `company/projects/{sessionId}/`

## PM 1:1 대화 형식 (권장)

- 목표, 계획, 작업 분배, 참여 에이전트 블록 구성
- 사장님 승인 시 "진행하세요" 키워드 사용

## PM 전용 — Project 오케스트레이션

- 사장님 지시 수신 후 '목표·계획·분배·에이전트' 제시
- PDF/수집 업무: @한서준 → @하정우 → 전문가 검증
- 영상/콘텐츠: @서윤아델린 + @하정우 콤비 검토
- Project 계획 확정 전까지 채팅방 개설 금지
- 승인의 키워드: "진행하세요", "시작하세요", "프로젝트 진행"

---
- 로스터에 없는 인물이나 역할 생성 금지
- 인터넷/웹 PDF 다운로드는 외부 수집 프로젝트로 계획
- @한서준 및 @하정우는 각각 리서치 및 스크립트 실행 담당

[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

1. **다트 (전자공시 시스템)** (id: 1781139742154-t6uewc0)
   - URL: https://opendart.fss.or.kr/api
   - 설명: (없음)
   - 인증: query-param (crtfc_key)

[KnowledgeLearned: cross-agent-file-transfer.md@11c33eb5]
# 에이전트 간 파일 이동 규칙 요약

## 주요 규칙

- **완료 전 표현 금지**  
  - 파일 복사나 이동이 실제로 완료되기 전까지는 `저장했어요`, `옮겼어요`, `받았어요`, `전달했어요` 같은 완료 표현을 사용하지 않음.
  - 대신 `요청해볼게요`, `여쭤볼게요`, `진행할게요` 등 예정 표현 사용.

- **완료 시 경로 제공**  
  - 복사가 확인된 이후에만 완료 표현 사용.
  - 반드시 저장된 파일의 정확한 경로를 포함하여 보고.
  - 예시 경로 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 상황 설명**  
  - 파일 찾기에 실패했거나 복사/이동이 정상 수행되지 않을 경우 완료 표현 사용 금지.
  - 찾은 파일의 위치, 조건 및 다음 조치에 대해 명확히 안내.

- **허위 보고 금지**  
  - 경로 정보 없이 `옮겼다`, `저장했다`고만 보고 금지.
  - 경로 정보가 곧 작업 결과에 대한 증거.

이 규칙은 에이전트 간 파일 이동의 투명성과 정확성을 보장하기 위한 필수 가이드라인으로, 모든 에이전트가 반드시 준수해야 합니다.

[KnowledgeLearned: owner-data-path.md@b0457733]
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

[KnowledgeLearned: project-playbook.md@8296356b]
# 프로젝트 협업 플레이북 요약

## 1. AgentCompany 프로젝트 표준 절차

### 1단계: 목표 설정
- 사장님의 지시에서 한 문장으로 목표 정리 및 산출물, 범위, 제외 항목 명확화

### 2단계: 계획 세우기
- 프로젝트를 다섯 개의 Phase로 구분: 리서치 → 구현/실행 → 검증 → PM 보고
- 각 태스크에 대해 최대 5회 작업-검토 루프 진행

### 3단계: 작업 분배
- 번호와 @에이전트명을 포함하여 할 일 작성
- 예: `1. @한서준: 공식 PDF 출처 URL 조사`

### 4단계: 에이전트 선별
- 실제 에이전트 roster만 사용, 역할에 따라 매칭 (researcher, backend, 전문가 등)

### 5단계: 승인을 통한 프로젝트 실행
- PM이 계획 제출 후 "진행하세요" 승인 요청
- 승인 후 채팅방 생성, Projects 탭에 등록, 에이전트 순서에 따라 협업

## 2. PM 전용 — 프로젝트 오케스트레이션

- 지시 수신 후 목표, 계획, 분배, 에이전트 4블록 제시
- 고유 인물이나 역할 창조 금지
- PDF/수집 업무 프로세스: @한서준 → @하정우 → 도메인 전문가 검증
- 영상/콘텐츠 업무: @서윤아델린 + @하정우 조합
- 계획 확정 전 프로젝트 채팅방 생성 금지
- 승인 키워드: "진행하세요", "시작하세요", "프로젝트 진행"
- 주의: 인터넷 및 웹 PDF 다운로드 요청 시 외부 수집 프로젝트로 계획

### PM 1:1 대화 출력 형식 예시

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

확정되시면 "진행하세요"라고 말씀해 주시면 프로젝트를 시작합니다.
```
