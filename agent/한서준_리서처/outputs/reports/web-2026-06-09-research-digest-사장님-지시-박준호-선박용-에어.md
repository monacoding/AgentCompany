# Research digest: ## 사장님 지시

@박준호 선박용 에어 컴프레서 실무 보고서 작성

## PM 계획 요약

_자동 수집: 2026-06-09T22:49:42.188Z_

- **Query:** ## 사장님 지시

@박준호 선박용 에어 컴프레서 실무 보고서 작성

## PM 계획 요약

네, 사장님. 선박용 에어 컴프레서의 실제 운용·정비·고장 대응 관점까지 반영한 실무형 보고서 작성 업무로 이해했습니다. 목표와 범위를 정리해 계획을 수립하겠습니다.

## 목표  
사장님, **선박용 에어 컴프레서의 구조·운전·정비·고장 대응·안전관리까지 포함한 실무형 보고서**를 작성하겠습니다.  

- **산출물:** 선박용 에어 컴프레서 실무 보고서 `.md` 문서  
- **범위:**  
  - 선박용 에어 컴프레서 개요  
  - 선박 내 사용 목적  
  - 주요 구성품  
  - 작동 원리  
  - 운전 절차  
  - 정비·점검 항목  
  - 주요 고장 사례 및 대응  
  - 안전관리  
  - 실무 체크리스트  
- **제외 항목:**  
  - 특정 제조사 매뉴얼의 무단 복제  
  - 선급 규정 원문 전체 번역  
  - 실제 선박별 장비 도면 기반 상세 설계  

## 계획  

### P1. 자료 조사 및 구조화  
선박용 에어 컴프레서의 실무 정보를 신뢰 가능한 기준으로 조사하고, 보고서 목차를 확정합니다.  
- 선박에서의 사용처  
- 시동 공기 시스템  
- 제어 공기·서비스 공기  
- 왕복동식/스크류식 컴프레서 차이  
- 해상 운용 특성  

### P2. 실무 내용 작성  
운전자가 바로 이해할 수 있도록 현장 중심으로 정리합니다.  
- 운전 전 점검  
- 기동 절차  
- 운전 중 확인 사항  
- 정지 절차  
- 이상 징후 판단 기준  
- 예방정비 항목  

### P3. 고장 대응 및 안전관리 정리  
현장에서 자주 발생하는 문제를 중심으로 원인·점검 포인트·조치 방법을 정리합니다.  
- 압력 상승 불량  
- 과열  
- 오일 소모 증가  
- 수분 배출 불량  
- 언로더 작동 불량  
- 안전밸브 작동  
- 인터록·알람 대응  

### P4. 보고서 최종화  
PM 관점에서 문서 흐름, 실무성, 교육 자료 활용 가능성을 검토해 최종 보고서로 정리합니다.  
- 표 형식 체크리스트 포함  
- 초보 기관사도 이해할 수 있는 설명  
- 교육 유튜브·교육 자료로 확장 가능한 문체 적용  

## 작업 분배  

1. **@한서준:** 선박용 에어 컴프레서 기본 개념, 선박 내 사용 목적, 일반적인 운용·정비 기준 조사  
2. **@강하늘:** 조사 자료를 보고서 형식에 맞게 정리하고, 목차·표·체크리스트 초안 구성  
3. **@박준호:** 전체 보고서 구조 설계, 실무 흐름 검토, 최종 문서 작성 및 품질 관리  

## 참여 에이전트  
@박준호 · @한서준 · @강하늘  

사장님, 이대로 진행할까요?
선박용 에어 컴프레서 개요, 사용 목적, 구성품, 작동 원리, 정비 기준 조사
- **Source:** https://oshri.kosha.or.kr/kosha/business/shipbuildingb_a.do?mode=download&articleNo=437652&attachNo=245875

---

# 선박용 에어 컴프레서 조사 요약 보고

## 1. 요약

- 선박용 에어 컴프레서는 주로 **주기관·발전기 디젤엔진 시동용 압축공기**, **서비스 공기**, **제어·계장 공기** 공급에 사용되는 핵심 보조기계로 분류할 수 있다. 출처: https://www.wartsila.com/encyclopedia/term/starting-air-system, https://www.sauercompressors.com/en/applications/marine/  
- 선급·규정 자료는 공기압축기 단품보다 **시동공기 계통, 공기병/압력용기, 안전밸브, 드레인, 압력계, 배관 안전**을 중심으로 요구사항을 다루는 경향이 있다. 출처: https://www.ecfr.gov/current/title-46/section-58.10-15, https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169  
- 실무 보고서는 왕복동식 컴프레서를 중심으로 **흡입–압축–토출**, **다단 압축·중간냉각**, **수분 분리·드레인**, **언로더·자동 기동/정지** 흐름으로 설명하는 구성이 적합하다. 출처: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor  
- 운용·정비 기준은 제조사 매뉴얼과 선박별 PMS를 기준으로 하되, 공기병 안전밸브·압력계·드레인 등 압력용기 안전요건은 규정 기반 체크리스트로 별도 관리하는 것이 적절하다. 출처: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169, https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html  

---

## 2. 핵심 발견

### A. 개요 및 선박 내 사용 목적

- **시동공기 계통**은 공기압축기, 공기병/air bottle, 배관·밸브류를 통해 주기관 및 보조 디젤엔진에 시동용 압축공기를 공급하는 계통으로 설명된다. 출처: https://www.wartsila.com/encyclopedia/term/starting-air-system  
- 해상용 컴프레서 제조사 Sauer는 선박 분야 적용처로 **starting air, service air, control air** 등을 제시하고 있어, 보고서에서 사용 목적을 “시동공기·서비스공기·제어공기”로 구분하는 것이 타당하다. 출처: https://www.sauercompressors.com/en/applications/marine/  
- 미국 eCFR의 선박 기계 규정은 내연기관의 starting system을 별도로 다루고 있어, 선박에서 시동공기 계통은 단순 보조설비가 아니라 안전·운항 연속성과 관련된 계통으로 취급된다. 출처: https://www.ecfr.gov/current/title-46/section-58.10-15  

### B. 주요 구성품 분류

| 구분 | 주요 구성품 | 실무 보고서 반영 포인트 | 출처 |
|---|---|---|---|
| 압축기 본체 | 실린더, 피스톤, 크랭크축, 커넥팅로드, 흡입밸브, 토출밸브 | 왕복동식 구조 설명의 핵심 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor |
| 시동공기 저장부 | 공기병/air receiver/air bottle | 압력 저장, 안전밸브, 압력계, 드레인 관리 필요 | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169 |
| 냉각·수분 제거부 | 애프터쿨러, 인터쿨러, 수분분리기, 드레인 | 압축열 저감 및 응축수 배출 관리 필요 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor |
| 제어·안전장치 | 언로더, 압력스위치, 안전밸브, 체크밸브, 알람·인터록 | 자동 기동/정지, 과압 방지, 역류 방지 확인 필요 | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169, https://www.ecfr.gov/current/title-46/section-58.10-15 |

### C. 작동 원리

- 왕복동식 공기압축기는 피스톤이 실린더 내부에서 왕복운동하면서 흡입행정에서 공기를 흡입하고 압축행정에서 압력을 높인 뒤 토출밸브를 통해 압축공기를 내보내는 방식이다. 출처: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor  
- 고압 공기를 얻기 위해 다단 압축을 적용할 수 있으며, 압축 과정에서 발생한 열은 중간냉각 또는 후냉각을 통해 낮추는 방식으로 설명된다. 출처: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor  
- 스크류식 컴프레서는 피스톤이 아니라 서로 맞물린 로터 회전에 의해 공기를 압축하는 방식이므로, 보고서에서는 왕복동식과 스크류식을 구조·용도·정비 포인트가 다른 장비로 구분하는 것이 적절하다. 출처: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/how-does-a-screw-compressor-work  

### D. 운용 기준으로 정리할 항목

| 단계 | 점검 항목 | 실무 기준화 방향 | 출처 |
|---|---|---|---|
| 운전 전 | 윤활유 레벨, 냉각수/냉각팬 상태, 흡입필터, 드레인 상태, 토출밸브 라인업 | 제조사 매뉴얼 및 선박 PMS 기준으로 체크리스트화 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor |
| 기동 시 | 무부하 기동 여부, 압력 상승 속도, 이상음·진동, 토출온도 | 초기 압력 상승 불량은 밸브 누설·언로더 불량·흡입 제한 가능성으로 분류 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/air-compressor-troubleshooting-guide |
| 운전 중 | 토출압력, 각 단 온도, 윤활상태, 냉각상태, 응축수 배출 | 압축열과 응축수 관리를 핵심 운전 포인트로 반영 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor |
| 정지 후 | 공기병 압력, 누설음, 자동정지 압력, 드레인 배출, 운전시간 기록 | 공기병 드레인은 응축수 축적 방지를 위해 정기 배출 항목으로 관리 | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169 |

### E. 정비·안전 기준으로 정리할 항목

- 공기저장용 receiver에는 압력계가 필요하며, 안전밸브는 허용압력 초과를 방지하도록 설치되어야 한다. 출처: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169  
- 공기 receiver에는 내부 수분·오일 축적을 방지하기 위한 드레인 관리가 필요하며, OSHA 규정은 receiver의 드레인 배출 필요성을 명시한다. 출처: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169  
- 선박용 시동공기 계통은 flag state, 선급, 엔진 제조사 요구가 함께 적용될 수 있으므로, 보고서에는 “일반 원칙”과 “본선 적용 기준 확인 필요 항목”을 분리해야 한다. 출처: https://www.ecfr.gov/current/title-46/section-58.10-15, https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html, https://www.dnv.com/rules-standards/  

### F. 고장 징후 및 대응 표 작성용 분류

| 고장 징후 | 가능 원인 | 1차 확인 포인트 | 출처 |
|---|---|---|---|
| 압력 상승 불량 | 흡입필터 막힘, 밸브 누설, 언로더 불량, 배관 누설 | 흡입 상태, 토출밸브, receiver 누설, 언로더 작동 확인 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/air-compressor-troubleshooting-guide |
| 과열 | 냉각 불량, 과부하, 윤활 불량, 압축비 증가 | 냉각수/팬, 오일, 토출압력, 인터쿨러 상태 확인 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor |
| 수분 과다 | 애프터쿨러 성능 저하, 드레인 불량, receiver 응축수 축적 | 드레인 작동, 수분분리기, 공기병 배출상태 확인 | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169 |
| 안전밸브 작동 | 압력스위치 불량, 자동정지 실패, 토출밸브 오조작, 과압 | 즉시 부하 제거, 압력스위치·언로더·정지회로 확인 | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169 |
| 이상음·진동 | 베어링 마모, 밸브 손상, 체결부 풀림, 기초 볼트 이완 | 운전 정지 후 외관·체결·윤활·밸브 점검 | https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/air-compressor-troubleshooting-guide |

---

## 3. 출처 신뢰도

### A등급: 정부·공식·선급·공공기관 자료

- **KOSHA 산업안전보건연구원 PDF** — 국내 공공기관 자료이나, 제공된 수집본은 PDF 바이너리 형태로 텍스트 추출이 불완전하여 세부 내용 인용에는 추가 확인이 필요하다.  
  URL: https://oshri.kosha.or.kr/kosha/business/shipbuildingb_a.do?mode=download&articleNo=437652&attachNo=245875  
- **eCFR 46 CFR §58.10-15** — 미국 연방규정의 선박 기계 starting system 관련 조항으로, 시동계통 요구사항 확인용 1차 법령 자료다.  
  URL: https://www.ecfr.gov/current/title-46/section-58.10-15  
- **OSHA 29 CFR 1910.169 Air receivers** — 압축공기 receiver의 안전밸브, 압력계, 드레인 등 일반 산업안전 요구사항 확인용 정부 규정 자료다.  
  URL: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169  
- **ABS Rules and Guides** — 선급 규정 원문 확인용 공식 포털로, 본선 적용 선급이 ABS인 경우 세부 조항 확인이 필요하다.  
  URL: https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html  
- **DNV Rules and Standards** — 선급 규정 원문 확인용 공식 포털로, 본선 적용 선급이 DNV인 경우 세부 조항 확인이 필요하다.  
  URL: https://www.dnv.com/rules-standards/  

### B등급: 제조사·기업 기술자료

- **Wärtsilä Encyclopedia – Starting air system** — 시동공기 계통의 개념과 구성 이해에 유용한 기업 기술백과 자료다.  
  URL: https://www.wartsila.com/encyclopedia/term/starting-air-system  
- **Sauer Compressors – Marine applications** — 선박용 공기압축기의 적용처를 확인할 수 있는 제조사 자료다.  
  URL: https://www.sauercompressors.com/en/applications/marine/  
- **Atlas Copco – Reciprocating compressor** — 왕복동식 압축기의 구조와 작동 원리 설명에 활용 가능한 제조사 기술자료다.  
  URL: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor  
- **Atlas Copco – Screw compressor working principle** — 스크류식 압축기의 원리 비교용 제조사 기술자료다.  
  URL: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/how-does-a-screw-compressor-work  
- **Atlas Copco – Air compressor troubleshooting guide** — 고장 징후와 일반 점검 방향 정리에 참고 가능한 제조사 기술자료다.  
  URL: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/air-compressor-troubleshooting-guide  

### C등급: 블로그·SNS 자료

- 이번 조사에서는 C등급 자료를 핵심 근거로 사용하지 않았다.

---

## 4. 교차검증

### 일치 항목

- **시동공기 계통의 핵심 구성은 공기압축기, 공기 저장용기, 배관·밸브류라는 점**은 Wärtsilä의 시동공기 계통 설명과 eCFR의 starting system 규정 방향이 일치한다. 출처: https://www.wartsila.com/encyclopedia/term/starting-air-system, https://www.ecfr.gov/current/title-46/section-58.10-15  
- **압축공기 저장용기는 과압 방지를 위한 안전밸브, 압력 확인 장치, 응축수 배출 관리가 필요하다는 점**은 OSHA air receiver 규정과 선박 시동공기 계통 안전관리 방향에 부합한다. 출처: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169, https://www.ecfr.gov/current/title-46/section-58.10-15  
- **왕복동식 압축기는 피스톤·실린더·밸브를 이용해 공기를 흡입·압축·토출한다는 설명**은 제조사 기술자료에서 일관되게 확인된다. 출처: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor  

### 불일치 항목

- 현재 확인한 범위에서 **왕복동식 압축기의 기본 작동 원리나 공기병 안전장치 필요성에 대한 직접적인 불일치 자료는 확인되지 않았다**. 출처: https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor, https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169  

### 불확실 항목

- **시동공기 압력, 공기병 용량, 요구 시동횟수, 압축기 대수, 자동기동 설정압력**은 선급, 선박 종류, 주기관 형식, flag state, 엔진 제조사 요구에 따라 달라질 수 있어 일반값으로 확정하면 안 된다. 출처: https://www.ecfr.gov/current/title-46/section-58.10-15, https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html, https://www.dnv.com/rules-standards/  
- 제공된 KOSHA PDF는 공식기관 자료이지만 수집된 텍스트가 깨져 있어, 현재 단계에서는 선박용 에어 컴프레서 세부 기준의 직접 근거로 사용하기 어렵다. 출처: https://oshri.kosha.or.kr/kosha/business/shipbuildingb_a.do?mode=download&articleNo=437652&attachNo=245875  
- 제조사 자료는 일반 원리·고장 징후·정비 항목 참고에는 유용하지만, 본선 법정검사나 선급검사 기준을 대체할 수 없으므로 최종 보고서에서는 선급·기국 규정을 우선해야 한다. 출처: https://www.sauercompressors.com/en/applications/marine/, https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor, https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html  

---

## 5. 다음 단계

1. **적용 선급 확인**  
   - 본선 선급이 KR, ABS, DNV, LR 중 어디인지 확인한 뒤 해당 선급의 Machinery/Piping/Pressure vessel/Starting air 관련 조항을 원문으로 확인해야 한다. 출처: https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html, https://www.dnv.com/rules-standards/  

2. **국내 기준 추가 확인**  
   - KOSHA PDF는 재다운로드 또는 원문 뷰어를 통해 텍스트 추출 후, 압축공기·압력용기·조선업 안전관리 관련 내용이 선박용 에어 컴프레서 보고서에 활용 가능한지 재검토해야 한다. 출처: https://oshri.kosha.or.kr/kosha/business/shipbuildingb_a.do?mode=download&articleNo=437652&attachNo=245875  

3. **제조사 매뉴얼 확보**  
   - 실제 보고서의 정비 주기, 윤활유 규격, 밸브 분해정비, 피스톤링 교환, 토출온도 알람값은 장비 제조사 매뉴얼과 본선 PMS 값을 기준으로 확정해야 한다. 출처: https://www.sauercompressors.com/en/applications/marine/, https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/reciprocating-compressor  

4. **실무 체크리스트화 권장**  
   - 최종 보고서에는 “운전 전–기동–운전 중–정지 후–비상상황” 순서로 체크리스트를 만들고, 공기병 안전밸브·압력계·드레인·누설·압력 상승 시간은 별도 필수 점검 항목으로 분리하는 것이 적절하다. 출처: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.169, https://www.atlascopco.com/en/compressors/wiki/compressed-air-articles/air-compressor-troubleshooting-guide
