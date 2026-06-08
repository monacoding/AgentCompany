# Learned: suneung-pdf-download.md

_hash: 3e00da9d5fe8cdeb_  
_learned: 2026-06-08T11:55:02.969Z_

# 수능 PDF 다운로드 — 자동화

[SuneungPdfPlaybook v1]

## 구현 규칙
- @한서준 조사 결과의 fileSeq 사용
- Python urllib로 `fileDown.do?fileSeq=` 호출
- 저장: `company/projects/{sessionId}/files/pdfs/대학수학능력시험/`
- 파일명: `{학년도}학년도_{영역}영역_문제지.pdf`
- %PDF 헤더 검증 후 FINISHED

## 참고 템플릿
- `src/team/templates/download_suneung_pdfs.py`
