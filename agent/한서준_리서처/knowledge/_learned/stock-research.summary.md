# Learned: stock-research.md

_hash: b6376dab32e02a75_  
_learned: 2026-06-11T01:32:58.074Z_

# 주가·증시 리서치 Playbook

[StockResearchPlaybook v1]

## 핵심 원칙

- **Open DART(opendart.fss.or.kr)는 실시간 주가 API가 아닙니다.** 전자공시·elestock(임원·주요주주 소유보고) 전용입니다.
- 주가·지수·티커 조회는 **금융 포털 웹 리서치**로 처리합니다.
- SEC.gov는 기업 공시·파일링용이며, **당일 시세·지수**에는 finance.yahoo.com·marketwatch.com 등을 함께 사용합니다.

## 1순위 출처 (실시간 시세·지수)

| 용도 | URL 패턴 |
|------|----------|
| 국내 종목 검색 | `https://finance.naver.com/search/search.naver?query={종목명}` |
| 국내 지수·시세 | `https://finance.naver.com/sise/` |
| 글로벌 종목 | `https://kr.investing.com/search/?q={티커 또는 종목명}` |
| 미국 시장·지수 | `https://finance.yahoo.com/markets/` |
| 미국 시장 뉴스·마감 | `https://www.marketwatch.com/` |

## 검색 쿼리 예시

- `{종목명} 주가 site:finance.naver.com`
- `{티커} stock price site:finance.yahoo.com`
- `{종목명} site:kr.investing.com`
- `nasdaq s&p dow jones today` (미국 시장 전반)
- `코스피 코스닥 지수 site:finance.naver.com`

## 보고 형식

1. **요청 종목/지수** — 현재가·등락률·거래량 (출처 URL 명시)
2. **시장 맥락** — 같은 날 코스피/나스닥 등 지수 흐름 (해당 시)
3. **최근 이슈** — 뉴스 1~3건 (제목·URL)
4. **한계** — 실시간 데이터는 조회 시점 기준이며, 투자 조언이 아님을 명시

## 하정우·DART와 구분

- DART PDF·elestock·공시 다운로드 → **@하정우** (개발·스크립트)
- 주가·증시·시장 동향 조사 → **한서준 리서치 파이프라인** (본 playbook)
