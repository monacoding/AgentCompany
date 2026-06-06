# Learned: suneung-pdf-download.md

_hash: e91c75b8ae65cd88_  
_learned: 2026-06-06T14:24:57.213Z_

[DownloadKnowledge v1]

# 수능 PDF 다운로드 — 검증된 방법

> "못 찾았다"고 답하기 전에 아래 경로를 **반드시** 시도하세요. 이 방법으로 2022·2024학년도 PDF가 실제로 다운로드된 사례가 있습니다.

## 1순위: 호랭이닷컴 직링크 (curl/fetch 친화적)

- **베이스 URL:** `https://horaeng.com/wp-content/uploads`
- **파일명 패턴:** `{학년도}학년도-대학수학능력시험-{과목}-{문제|정답}.pdf`

### 예시 (2022학년도 주요 4과목)

| 과목 | URL |
|------|-----|
| 국어 문제 | https://horaeng.com/wp-content/uploads/2022학년도-대학수학능력시험-국어-문제.pdf |
| 수학 문제 | https://horaeng.com/wp-content/uploads/2022학년도-대학수학능력시험-수학-문제.pdf |
| 영어 문제 | https://horaeng.com/wp-content/uploads/2022학년도-대학수학능력시험-영어-문제.pdf |
| 한국사 문제 | https://horaeng.com/wp-content/uploads/2022학년도-대학수학능력시험-한국사-문제.pdf |

### 예시 (2024학년도)

- 목록 페이지: https://horaeng.com/350
- URL 패턴 동일 (`2024학년도-...`)

## 실행 절차

1. 사용자 요청에서 **학년도**(예: 2022, 2024)와 **과목** 추출
2. 과목 미지정 시 기본 4과목: 국어, 수학, 영어, 한국사
3. 위 패턴으로 URL 생성 후 `research/downloads/`에 저장
4. 다운로드 후 `%PDF` 헤더로 파일 검증
5. 성공 시 저장 경로를 사용자에게 보고

## 검색 쿼리 (보조)

- `site:horaeng.com {학년도}학년도 수능 PDF`
- `호랭이닷컴 {학년도} 수능 문제 pdf`

## 2순위 fallback

- 한국교육과정평가원 `suneung.re.kr` / `cdn.kice.re.kr` — `fileDown.do` 동적 링크라 직접 fetch가 어려울 수 있음
- 호랭이닷컴 실패 시에만 시도

## 금지 사항

- **검색·다운로드 파이프라인 없이** "찾을 수 없습니다"라고 단정하지 말 것
- "찾고 있습니다"라고만 말하고 실제 작업을 하지 않지 말 것 — 반드시 Research 파이프라인 실행

## 저장 위치

`research/downloads/{파일명}.pdf`
