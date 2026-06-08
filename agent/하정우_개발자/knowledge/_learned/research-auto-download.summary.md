# Learned: research-auto-download.md

_hash: 15a1d4f38a9dde63_  
_learned: 2026-06-08T13:02:54.173Z_

# 리서치 자료 자동 다운로드 (하정우)

## 역할
@한서준(리서처)이 조사한 **fileSeq·URL·출처**를 바탕으로 PDF를 일괄 다운로드합니다.

## 스크립트
- 경로: `agent/하정우_개발자/outputs/scripts/download_research_assets.py`
- 원본 템플릿: `src/team/templates/download_suneung_pdfs.py`

## 수능 PDF (평가원 공식)
```bash
python3 agent/하정우_개발자/download_research_assets.py \
  --out company/projects/{프로젝트폴더}/files/pdfs \
  --subjects 국어,수학 \
  --years 2005,2006,2010
```

- 공식 게시판: https://www.suneung.re.kr/boardCnts/list.do?boardID=1500234
- 구 영역명: **언어=국어**, **수리=수학** (2006년 이전)
- page 18까지 (2005년~)

## Project 연동
1. @한서준 — 출처·fileSeq 조사 (Research Planner)
2. @하정우 — 이 스크립트 실행·경로 저장
3. @박준호 — PDF 검증·PM 보고

## 검증
- 다운로드 파일은 %PDF 헤더 확인
- 완료 보고 시 **저장 경로 전체** 필수
