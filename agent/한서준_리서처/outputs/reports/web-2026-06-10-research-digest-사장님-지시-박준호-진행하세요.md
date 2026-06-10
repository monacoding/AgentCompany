# Research digest: ## 사장님 지시

@박준호 진행하세요
@박준호 Inert gas gerator 에 의한 

_자동 수집: 2026-06-10T04:40:38.569Z_

- **Query:** ## 사장님 지시

@박준호 진행하세요
@박준호 Inert gas gerator 에 의한 화물 탱크 내 염분 유입 가능성 검토 보고서 작성
@박준호 진행하세요

## PM 계획 요약

사장님, 기존 선박 관련 검토 흐름에 이어서 Inert gas generator 사용 시 화물 탱크 내 염분 유입 가능성을 검토하는 보고서 작성 건으로 이해했습니다. 목표와 범위를 정리해 바로 프로젝트 계획을 세우겠습니다.

## 목표
Inert Gas Generator(IGG) 운전 과정에서 **화물 탱크 내 염분이 유입될 수 있는 경로·조건·가능성·저감 대책**을 검토하여, 사장님께 제출 가능한 기술 검토 보고서를 작성합니다.

## 계획
**P1. 자료 조사 및 조건 정의**  
- IGG의 일반 구성, 연소가스 세정 방식, 해수 스크러버 사용 여부, 데미스터/드레인 구조 조사  
- 화물 탱크로 유입 가능한 물질 경로 정리  
- 검토 범위: 선박 화물 탱크, IGG 배관, 스크러버, 데미스터, 드레인, 블로워, deck water seal 등  
- 제외 항목: 특정 선박 도면 기반 상세 설계 검증, 실제 염분 농도 실측 분석

**P2. 염분 유입 메커니즘 분석**  
- 해수 스크러버 사용 시 염분 미스트 동반 가능성  
- 데미스터 성능 저하, 과부하 운전, 드레인 불량, 배관 응축수 역류 가능성 검토  
- IGG가 연소식인지, 질소 발생기 방식인지에 따른 차이 구분

**P3. 가능성 평가 및 리스크 분류**  
- 정상 운전 조건 / 비정상 운전 조건으로 구분  
- 화물 탱크 내 염분 유입 가능성을 낮음·중간·높음으로 평가  
- 화물 품질, 탱크 부식, 세정 부담 측면 영향 정리

**P4. 예방·점검 대책 정리**  
- 데미스터 점검  
- 스크러버 해수 carry-over 방지  
- 드레인 및 water seal 관리  
- 산소 농도, 이슬점, 배관 응축수 관리  
- 탱크 투입 전 IG 품질 확인 항목 제안

**P5. 최종 보고서 작성**  
- 기술 검토 보고서 형식으로 작성  
- 결론, 원인 경로, 조건별 가능성, 권고사항 포함  
- 산출물은 프로젝트 폴더에 최종 보고서로 정리

## 작업 분배
1. @한서준: IGG 구조, 해수 스크러버, 데미스터, inert gas system 관련 신뢰 가능한 기술 자료 조사  
2. @최현석: 염분 미스트 carry-over 가능성, 조건별 리스크를 논리적·정량적 관점에서 평가  
3. @김윤하: 보고서 문장 구조, 논리 흐름, 결론의 명확성 검토  
4. @박준호: 전체 검토 기준 수립, 리스크 매트릭스 정리, 최종 보고서 작성 및 품질 검수

## 참여 에이전트
@박준호 · @한서준 · @최현석 · @김윤하

사장님, 이대로 진행할까요?
IGG, 해수 스크러버, 데미스터, inert gas system 관련 기술 자료 조사
- **Source:** https://www.imo.org/en/OurWork/Safety/Pages/InertGasSystems.aspx

---

## 1. 요약

- IGG/IGS는 일반적으로 **가스 발생원, 스크러버/냉각·세정 장치, 블로워, 데크 워터실 또는 비반환 장치, 데크 메인 및 계측·알람**으로 구성되며, IMO FSS Code와 USCG eCFR에서 불활성가스 시스템 요건으로 다뤄진다. 출처: IMO MSC.98(73) FSS Code PDF https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.98(73).pdf / IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf / eCFR 46 CFR Part 32 Subpart 32.53 https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53  
- 해수 스크러버를 사용하는 IGG에서는 해수 자체가 염분원을 제공하며, 스크러버 액적이 데미스터에서 충분히 제거되지 않으면 염분 미스트 또는 응축수 형태로 후단 배관 및 화물 탱크 방향으로 이동할 가능성이 있다. 출처: USGS salinity 설명 https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity / EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  
- 정상 운전에서는 스크러버, 미스트 제거기, 드레인, 데크 워터실·비반환 장치가 설계대로 작동한다는 전제하에 염분 유입 가능성은 낮게 보는 것이 타당하지만, 데미스터 오염·손상, 스크러버 flooding, 과유속, 드레인 막힘, 워터실 이상, 배관 내 응축수 체류 시 가능성이 상승한다. 출처: EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf / EPA Wet Scrubber Inspection and Evaluation Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf / Wärtsilä Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system  
- 현재 제공된 IMO 웹페이지는 수집 시점에 HTTP 500 오류로 본문 확인이 불가하므로, 공식 근거는 IMO 결의서 PDF, FSS Code, eCFR, 선급 규칙 및 제조사 매뉴얼로 보강해야 한다. 출처: https://www.imo.org/en/OurWork/Safety/Pages/InertGasSystems.aspx  

---

## 2. 핵심 발견

### A. IGG/IGS의 규정상 구성 및 기능

- IMO FSS Code는 선박용 화재안전 시스템 중 하나로 **inert gas system**을 규정하며, 불활성가스 시스템은 화물 탱크 내 가연성 분위기 형성을 억제하기 위한 장치로 다뤄진다. 출처: IMO MSC.98(73) FSS Code https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.98(73).pdf  
- IMO MSC.367(93)은 FSS Code Chapter 15의 inert gas system 요건을 개정한 문서로, IGG/IGS의 설계·장비·계측·알람·안전장치 검토 시 우선 확인해야 할 공식 IMO 자료다. 출처: IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf  
- USCG eCFR은 미국 규정 체계에서 탱커의 inert gas system 관련 요건을 46 CFR Part 32 Subpart 32.53에 두고 있어, 미국 기국·입항·검사 관점의 보조 기준으로 활용 가능하다. 출처: eCFR 46 CFR Part 32 Subpart 32.53 https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53  
- Wärtsilä의 기술 설명은 IGS가 가스 발생 또는 보일러 배기가스 사용, 스크러버, 블로워, 데크 워터실, 데크 메인 등으로 구성된다는 실무적 개요를 제공한다. 출처: Wärtsilä Encyclopedia, Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system  

### B. 해수 스크러버가 염분 유입원의 후보가 되는 이유

- 해수는 용존 염류를 포함하며, 해수의 염분은 일반적으로 salinity 개념으로 관리되므로 해수 스크러버를 사용하는 경우 스크러버수 자체가 염분원이다. 출처: USGS, Saline water and salinity https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity  
- Wet scrubber는 가스와 세정액을 접촉시켜 오염물질을 제거하는 장치이며, 후단으로 액적이 동반될 수 있기 때문에 mist eliminator가 필요하다. 출처: EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  
- Wet scrubber에서 mist eliminator는 액적 carry-over를 줄이는 장치이나, 막힘·오염·부적절한 운전 조건에서는 압력손실 증가 또는 제거성능 저하가 발생할 수 있다. 출처: EPA Wet Scrubber Inspection and Evaluation Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf  
- 따라서 IGG의 해수 스크러버 후단에서 데미스터가 정상 성능을 내지 못하면, 해수 액적 또는 염분을 포함한 응축수가 IG 배관 방향으로 이동할 수 있다는 메커니즘은 기술적으로 개연성이 있다. 출처: EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf / USGS salinity https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity  

### C. 데미스터 성능 저하와 carry-over 리스크

- EPA 자료는 wet scrubber 후단의 mist eliminator가 entrained droplets 제거에 사용된다고 설명하므로, 데미스터는 해수 스크러버 후단 염분 미스트 저감의 핵심 장치로 볼 수 있다. 출처: EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  
- Mist eliminator의 오염, plugging, 세정 불량, 과도한 액적 부하 또는 가스 유속 변화는 액적 제거성능 저하와 carry-over 증가로 이어질 수 있다. 출처: EPA Wet Scrubber Inspection and Evaluation Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf  
- IGG 제조사 자료에서는 inert gas generator가 연소가스를 세정·냉각하여 탱크에 공급하는 시스템으로 소개되며, 해수 세정 방식의 경우 스크러버 및 후단 분리장치의 상태가 IG 품질에 직접 영향을 준다. 출처: Alfa Laval Inert Gas Systems https://www.alfalaval.com/products/process-solutions/inert-gas-systems/  

### D. 드레인, 데크 워터실, 역류 방지 장치 관련 유입 경로

- IGS에는 화물 탱크 측 가스 또는 액체가 기계실·IGG 측으로 역류하지 않도록 deck water seal 또는 non-return arrangement가 포함된다. 출처: Wärtsilä Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system / IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf  
- 워터실, 드레인 포트, 배관 저점부는 액체 체류와 역류 가능성을 관리해야 하는 설비이므로, 드레인 막힘·수봉 수위 이상·동결·부식·오조작은 응축수 또는 세정수의 비정상 이동 경로가 될 수 있다. 출처: IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf / Wärtsilä Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system  
- 데크 메인 및 IG 배관에서 가스가 냉각되면 수분이 응축될 수 있으므로, 응축수가 염분을 포함하거나 이전 carry-over 액적과 혼합된 경우 배관 저점부 및 탱크 유입부에서 염분 오염원이 될 수 있다. 출처: EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf / EPA Wet Scrubber Inspection Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf  

### E. 정상/비정상 운전 조건별 잠정 리스크 판단

- **정상 운전**: 스크러버 수량, 가스 유량, 데미스터 상태, 드레인 배출, deck water seal 또는 non-return 장치가 설계 기준대로 유지되면 염분 미스트의 화물 탱크 유입 가능성은 낮은 편으로 평가할 수 있다. 출처: IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf / EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  
- **비정상 운전**: 데미스터 파손·오염, 스크러버 flooding, 과도한 가스 유속, 드레인 막힘, 워터실 수위 이상, 배관 저점부 응축수 체류가 있으면 염분 포함 액적 또는 응축수가 탱크 방향으로 이동할 가능성이 상승한다. 출처: EPA Wet Scrubber Inspection Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf / Wärtsilä Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system  
- **정량 평가**: 공개 규정·개요 자료만으로는 화물 탱크 내 염분 농도, carry-over rate, ppm 또는 mg/m³ 수준의 유입량을 산정하기 어렵고, 제조사 성능자료와 선박별 P&ID·운전기록·드레인 분석값이 필요하다. 출처: IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf / Alfa Laval Inert Gas Systems https://www.alfalaval.com/products/process-solutions/inert-gas-systems/  

---

## 3. 출처 신뢰도

### A등급: 정부·공식·규정·공공 기술자료

- IMO MSC.98(73), International Code for Fire Safety Systems, FSS Code.  
  URL: https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.98(73).pdf  
- IMO MSC.367(93), Amendments to the International Code for Fire Safety Systems.  
  URL: https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf  
- eCFR 46 CFR Part 32 Subpart 32.53, Inert Gas Systems.  
  URL: https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53  
- EPA, Wet Scrubber Fact Sheet.  
  URL: https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  
- EPA, Wet Scrubber Inspection and Evaluation Manual.  
  URL: https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf  
- USGS, Saline water and salinity.  
  URL: https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity  

### B등급: 선급·제조사·산업단체 공식 자료

- Wärtsilä Encyclopedia, Inert Gas System.  
  URL: https://www.wartsila.com/encyclopedia/term/inert-gas-system  
- Alfa Laval, Inert Gas Systems.  
  URL: https://www.alfalaval.com/products/process-solutions/inert-gas-systems/  
- OCIMF, Inert Gas Systems publication page.  
  URL: https://www.ocimf.org/publications/books/inert-gas-systems-the-use-of-inert-gas-for-the-carriage-of-flammable-oil-cargoes  

### C등급: 블로그·SNS

- 이번 1차 조사에서는 C등급 자료를 핵심 근거로 사용하지 않았다.  

### 접근 실패 또는 주의 필요 자료

- IMO “Inert Gas Systems” 웹페이지는 수집 시점에 HTTP 500 오류가 발생해 본문 확인이 불가했다.  
  URL: https://www.imo.org/en/OurWork/Safety/Pages/InertGasSystems.aspx  

---

## 4. 교차검증

### 일치 항목

- IMO FSS Code, eCFR, Wärtsilä 자료는 모두 IGS를 선박 화물 탱크의 불활성 분위기 유지와 관련된 안전 시스템으로 다루며, 스크러버·블로워·데크 측 역류방지 장치가 시스템 검토의 핵심 요소라는 점에서 방향이 일치한다. 출처: IMO MSC.98(73) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.98(73).pdf / eCFR https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53 / Wärtsilä https://www.wartsila.com/encyclopedia/term/inert-gas-system  
- EPA wet scrubber 자료와 제조사 IGG 자료는 스크러버가 가스를 세정·냉각하는 과정에서 액적 동반 문제가 생길 수 있고, 이를 줄이기 위해 mist eliminator 또는 유사한 액적 제거 장치가 필요하다는 점에서 일치한다. 출처: EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf / Alfa Laval https://www.alfalaval.com/products/process-solutions/inert-gas-systems/  
- USGS salinity 자료와 EPA scrubber 자료를 결합하면, 해수를 세정수로 사용하는 경우 동반 액적은 염분을 포함할 수 있다는 물리적 경로가 성립한다. 출처: USGS https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity / EPA https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  

### 불일치 항목

- 현재 확인한 공개 자료 간에 “해수 스크러버 사용 시 염분이 절대 유입된다” 또는 “절대 유입되지 않는다”는 식의 직접적인 상충 주장은 확인되지 않았다. 출처: IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf / EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  
- 다만 규정 자료는 안전 기능과 장비 요건 중심이고, 제조사 자료는 시스템 기능 설명 중심이므로, 실제 염분 유입량을 정량적으로 제시하는 공개 자료는 제한적이다. 출처: eCFR https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53 / Alfa Laval https://www.alfalaval.com/products/process-solutions/inert-gas-systems/  

### 불확실 항목

- 특정 선박의 IGG가 **해수 스크러버 방식인지, 담수 또는 폐회로 세정 방식인지, 또는 질소발생기 방식인지**는 선박별 P&ID와 장비 매뉴얼 확인 전까지 불확실하다. 출처: Alfa Laval IG systems https://www.alfalaval.com/products/process-solutions/inert-gas-systems/  
- 특정 선박에서 데미스터 후단 액적 농도, 염분 carry-over rate, 배관 응축수 염분 농도, 화물 탱크 유입 염분량은 공개 규정만으로 산정하기 어려워 불확실하다. 출처: EPA Wet Scrubber Inspection Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf / IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf  
- deck water seal 또는 non-return arrangement의 실제 구조, 드레인 라인의 역구배, 저점부, 막힘 가능성은 선박별 배관 배치와 정비 이력 확인 전까지 불확실하다. 출처: Wärtsilä Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system / eCFR https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53  

---

## 5. 다음 단계

1. **선박별 자료 확보**  
   - IGG maker manual, P&ID, scrubber arrangement, demister type, drain line routing, deck water seal 또는 non-return valve arrangement를 확보해야 한다. 출처: IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf  

2. **해수 스크러버 여부 및 세정수 계통 확인**  
   - 세정수가 해수인지, 담수인지, 순환식인지, 배출식인지 확인하고, 해수 사용 시 염분 미스트 유입 경로를 우선 검토해야 한다. 출처: USGS salinity https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity / EPA Wet Scrubber Fact Sheet https://www3.epa.gov/ttncatc1/dir1/fwetscrubbers.pdf  

3. **데미스터 성능 확인**  
   - 데미스터 차압, 세정 상태, 파손 여부, 막힘, 재비산 가능성, 과유속 운전 여부를 점검해야 한다. 출처: EPA Wet Scrubber Inspection Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf  

4. **드레인·워터실·저점부 점검**  
   - 스크러버 드레인, 블로워 전후단 드레인, deck water seal 수위, 배관 저점부 응축수 배출 상태를 확인해야 한다. 출처: Wärtsilä Inert Gas System https://www.wartsila.com/encyclopedia/term/inert-gas-system / IMO MSC.367(93) https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.367(93).pdf  

5. **현장 검증 항목 제안**  
   - IGG 운전 중 스크러버 후단 드레인수, IG main 저점부 응축수, deck main drain, 탱크 내 유입 전 응축수의 염분 또는 전기전도도 측정을 실시하면 염분 유입 가능성을 정량화할 수 있다. 출처: EPA Wet Scrubber Inspection Manual https://www3.epa.gov/ttncatc1/dir1/scrubber.pdf / USGS salinity https://www.usgs.gov/special-topics/water-science-school/science/saline-water-and-salinity  

6. **추가로 찾아야 할 자료**  
   - 해당 선급의 최신 Rules for Inert Gas Systems, 선박 Flag Administration 지침, OCIMF Inert Gas Systems 상세 가이드, IGG 제조사별 scrubber/demister 성능자료를 추가 확보해야 한다. 출처: OCIMF publication page https://www.ocimf.org/publications/books/inert-gas-systems-the-use-of-inert-gas-for-the-carriage-of-flammable-oil-cargoes / eCFR https://www.ecfr.gov/current/title-46/chapter-I/subchapter-D/part-32/subpart-32.53
