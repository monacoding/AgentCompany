# Learned: ai-video-production-stack.md

_hash: 8f549911b5b95650_  
_learned: 2026-06-06T14:43:25.080Z_

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
- **지표 도구:** YouTube Analytics API
- 업로드 48시간 후 피드백 반영

## 3. MVP 스택 (1인·소규모)
- **추천 조합:** ChatGPT로 기획·대본, CapCut 편집
- **예상 비용:** $50~200/월

## 4. 프로덕션 스택 (주 2~3편)
- **추천 오케스트레이션:** n8n + AgentCompany
- **인프라:** GPU 서버 또는 클라우드 API

## 5. 콘텐츠 유형별 스택
- **AI 스토리 숏폼:** Kling/Runway, CapCut
- **설명·튜토리얼:** HeyGen, Remotion 활용

## 6. API·연동 체크리스트
- 시작 전, API 키와 로컬 설치 준비

## 7. 서윤의 답변 규칙
1. 사용자 목적 먼저 확인
2. MVP vs 프로덕션 규모 제안
3. 필요한 레이어별 도구 제시

## 9. 실행 규칙
- 제작 요청 시 Production 파이프라인 작동
- 파일 경로 및 결과 포함 필수

## 8. 참고 링크
- [Runway](https://runwayml.com)
- [Kling](https://klingai.com)
- [Remotion](https://www.remotion.dev)
- [ElevenLabs](https://elevenlabs.io)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [FFmpeg](https://ffmpeg.org)
