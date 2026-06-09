# proj suneung pdf — 최종 보고

- 작성자: 박준호
- 저장: 2026-06-08T11:53:00.000Z

# PM Project Report

- saved: 2026-06-08T11:53:00.000Z
- session: `proj_suneung_pdf_20260608`
- title: 수능 기출 PDF 다운로드 (국어·수학 1차)

## 참여 에이전트

@박준호 (PM) · @한서준 (리서치) · @하정우 (개발) · @김윤하 (국어 검증)

## 목표 달성 요약

| 단계 | 담당 | 결과 |
|------|------|------|
| P1 출처 조사 | @한서준 | 평가원 suneung.re.kr fileDown API 확인 ✅ |
| P2 자동화 | @하정우 | Python 스크립트 + 4 PDF 다운로드 ✅ |
| P3 국어 검증 | @김윤하 | 2025·2026학년도 국어 PDF 메타 검증 ✅ |
| P4 PM 보고 | @박준호 | 본 문서 |

## 산출물 위치

```
company/projects/proj_suneung_pdf_20260608/
  tasks/          # 에이전트별 작업 기록
  files/
    scripts/download_suneung_pdfs.py
    pdfs/대학수학능력시험/*.pdf
  PM_REPORT.md
```

## 다음 단계 (2차 Project 제안)

1. @최현석 — 수학 PDF 메타·난이도 태깅
2. 영어·한국사 영역 `--subjects` 확장
3. `--include-mock` 으로 6·9월 모의평가 수집
4. 정답·해설 PDF 별도 fileSeq 파싱 추가

## 사장님 안내

다운로드된 PDF는 Finder에서 아래 경로로 열 수 있습니다.

`company/projects/proj_suneung_pdf_20260608/files/pdfs/대학수학능력시험/`

재다운로드:

```bash
python3 company/projects/proj_suneung_pdf_20260608/files/scripts/download_suneung_pdfs.py \
  --out company/projects/proj_suneung_pdf_20260608/files/pdfs \
  --subjects 국어,수학,영어 \
  --years 2023,2024,2025,2026
```