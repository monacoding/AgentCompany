# Learned: owner-data-path.md

_hash: 7eef113df54244cc_  
_learned: 2026-06-09T06:23:19.566Z_

# `owner-data-path.md` 요약 — 하정우(backend)

- 사장님(Owner) 관련 데이터는 **반드시 지정된 경로**에서만 조회·저장해야 합니다.
- 다른 위치를 임의로 추측하거나 대체 경로를 사용하면 안 됩니다.

## 필수 데이터 경로

- **절대 경로**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`

- **워크스페이스 기준 경로**
  - `company/owner`

## 주요 파일 및 폴더

- **프로필**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 사장님 이름, 성격 등 기본 프로필 정보

- **페르소나**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 사장님과의 대화, 보고 방식 참고용

- **사진 폴더**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 사장님 사진 저장 위치

## 에이전트 동작 규칙

- 사장님 관련 정보를 찾을 때:
  - `company/owner` 또는 위 절대 경로만 사용
- 사장님 관련 정보를 저장할 때:
  - 반드시 동일한 Owner 데이터 경로 하위에 저장
- 경로가 반복 기재되어 있으나 내용은 동일하며, 핵심은 **Owner 데이터 위치 고정**입니다.
