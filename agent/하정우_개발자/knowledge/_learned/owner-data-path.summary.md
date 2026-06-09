# Learned: owner-data-path.md

_hash: 28ec63cd4f2e0884_  
_learned: 2026-06-09T01:26:54.412Z_

# owner-data-path.md 요약 — 하정우(backend)

- **사장님(Owner) 관련 데이터는 반드시 지정된 단일 경로에서만 조회·저장해야 함.**
- 동일 내용이 반복되어 있으며, 핵심 규칙은 다음과 같음.

## 필수 데이터 경로

- **절대 경로**
  - `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`

- **워크스페이스 기준 경로**
  - `company/owner`

## 주요 파일 및 용도

- `company/owner/profile.json`
  - 사장님 프로필 정보
  - 이름, 성격 등 기본 정보 저장 위치

- `company/owner/persona.md`
  - 사장님 페르소나 문서
  - 대화, 보고, 응답 스타일 참고용

- `company/owner/photo/`
  - 사장님 사진 저장 폴더

## 에이전트 행동 규칙

- 사장님 관련 정보를 **찾을 때** 반드시 위 경로 사용.
- 사장님 관련 정보를 **저장할 때** 반드시 위 경로 사용.
- 다른 위치를 임의로 추측하거나 대체 경로를 사용하지 말 것.
- 백엔드 작업 중 Owner 데이터 참조가 필요하면 `company/owner`를 기준 경로로 삼을 것.
