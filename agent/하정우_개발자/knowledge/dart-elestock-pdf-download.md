# DART 임원·주요주주 소유보고 PDF 다운로드

[DartElestockPdfPlaybook v1]

## 역할
Open DART API로 **임원·주요주주 특정증권등 소유상황보고서** 목록을 조회하고, 접수번호(`rcept_no`)별 **공시 원문을 PDF**로 저장합니다.

## 사전 조건
- AgentCompany **API 탭**에 `다트 (전자공시 시스템)` 등록
- Base URL: `https://opendart.fss.or.kr/api`
- 인증: **query-param**, 파라미터명 **`crtfc_key`** (Bearer 아님)
- API Key: 40자 (opendart.fss.or.kr 발급)
- 스크립트 실행 시 환경변수 `DART_API_KEY` 또는 `CRTFC_KEY` 사용

## corp_code(고유번호) 구하기
| 방법 | URL/경로 |
|------|----------|
| 공식 ZIP | `GET /api/corpCode.xml?crtfc_key=KEY` → ZIP 내 `CORPCODE.xml`에서 `stock_code` 검색 |
| 공시검색 | `GET /api/list.json?crtfc_key=KEY&corp_code=...` |
| 예시 | 삼성전자 `00126380`, SK하이닉스 `00164779` |

## 3단계 파이프라인

### 1) 소유보고 목록 — `elestock.json`
```
GET https://opendart.fss.or.kr/api/elestock.json
  ?crtfc_key={KEY}
  &corp_code={8자리 고유번호}
```
- `status=000` 이면 정상
- 주요 필드: `rcept_no`(14자리), `rcept_dt`, `repror`(보고자), `isu_exctv_ofcps`, `sp_stock_lmp_rate`
- 공시뷰어: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}`

**대안(기간·유형 필터):** `list.json` + `pblntf_ty=D`, `pblntf_detail_ty=D002`

### 2) 공시 원문 — `document.xml` (공식 API)
```
GET https://opendart.fss.or.kr/api/document.xml
  ?crtfc_key={KEY}
  &rcept_no={14자리 접수번호}
```
- 응답: **ZIP** (내부 `{rcept_no}.xml`)
- XML 문서명: `임원ㆍ주요주주 특정증권등 소유상황보고서`
- Open DART는 **PDF 직접 API를 제공하지 않음** → 3단계 변환 필요

### 3) XML → PDF 변환
- **권장:** `agent/하정우_개발자/outputs/scripts/download_dart_elestock_pdfs.py` 실행 (`--pdf`)
- `reportlab` 설치 시 XML 테이블·텍스트를 PDF로 렌더링
- `reportlab` 미설치 시 XML/ZIP만 저장하고 PDF 단계는 스킵
- ⚠️ `dart.fss.or.kr/pdf/download/pdf.do` 웹 URL은 세션·쿠키 없으면 **빈 파일** — 주 경로로 쓰지 않음

## 스크립트
```bash
# API Key (한 번만)
export DART_API_KEY="발급받은_40자_키"

# 삼성전자 최근 5건 PDF
python3 agent/하정우_개발자/outputs/scripts/download_dart_elestock_pdfs.py \
  --corp-code 00126380 \
  --limit 5 \
  --pdf \
  --out company/projects/{sessionId}/files/pdfs/DART_임원주요주주

# 종목코드로 조회
python3 agent/하정우_개발자/outputs/scripts/download_dart_elestock_pdfs.py \
  --stock-code 005930 \
  --since 2024-01-01 \
  --pdf \
  --out company/projects/{sessionId}/files/pdfs/DART_임원주요주주
```

## 저장 규칙
- 경로: `company/projects/{sessionId}/files/pdfs/DART_임원주요주주/`
- 파일명: `{corp_name}_{rcept_dt}_{repror}_{rcept_no}.pdf`
- XML 백업(선택): 같은 폴더에 `.xml` 동시 저장
- 완료 보고 시 **저장 경로 전체** + 다운로드 건수 필수

## 검증
- PDF: 파일 헤더 `%PDF` 확인
- XML: `DOCUMENT-NAME`에 `소유상황보고서` 포함
- API 오류 코드: `010` 키 오류, `013` 데이터 없음, `020` 호출 한도

## Project 연동
1. @한서준 — 조사 대상 회사·기간·corp_code 확인
2. @하정우 — 이 스크립트 실행·PDF 저장
3. @박준호 — PDF 건수·경로 검증·PM 보고

## 참고
- Open DART 개발가이드: 지분공시 → 임원ㆍ주요주주 소유보고 (`elestock`)
- Open DART 개발가이드: 공시서류원본파일 (`document.xml`)
- External API id: `1781139742154-t6uewc0`
