# 리서치 파이프라인 (v1.7.89+)

## 표준 절차

1. **Research Planner** — knowledge + LLM으로 목표·검색어 5~8개·공식 URL 후보 생성
2. **Multi-Search** — DuckDuckGo 다중 쿼리 + `site:` / `filetype:pdf` 변형
3. **Known Sources** — 도메인별 커넥터 (수능 → 평가원 공식 1순위)
4. **Crawl4AI** — JS 렌더 사이트 크롤 (localhost:11235)
5. **교차검증 요약** — A/B/C 신뢰도 + 출처 URL 필수

## 수능 PDF

- 공식: `https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234&m=0403&s=suneung`
- 전체 180건, **page 18**에 2005~2006 (구 영역명: **언어=국어**, **수리=수학**)
- `fileDown.do?fileSeq=` 패턴
- 호랭이닷컴은 **미러 보조**만

## 검색 팁

- 공식 우선: `site:suneung.re.kr`, `site:go.kr`, `site:arxiv.org`
- PDF: `filetype:pdf`
- 실패 시 쿼리 단순화 후 재검색 (파이프라인 자동)

## 산출물

- 리포트: `agent/한서준_리서처/outputs/reports/`
- PDF: `agent/한서준_리서처/outputs/downloads/`
