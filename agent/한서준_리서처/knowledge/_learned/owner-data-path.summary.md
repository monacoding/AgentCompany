# Learned: owner-data-path.md

_hash: ac5bca488172a9d4_  
_learned: 2026-06-10T22:16:49.331Z_

# 사장님 데이터 경로

## 기본 정보
- 사장님의 프로필, 페르소나, 사진이 포함된 데이터는 특정 폴더에 저장되어 있습니다.
- 에이전트는 이 정보를 찾거나 저장할 때 **반드시 설정된 경로**를 사용해야 합니다.

## 경로 정보
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일 및 폴더
- `profile.json` — 사장님의 이름, 성격 등의 프로필 정보.
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
- `persona.md` — 사장님의 페르소나를 기록한 파일. 대화 및 보고 시 참고 자료.
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
- `photo/` — 사장님 사진이 저장된 폴더.
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

## 주의사항
- 에이전트는 다른 경로를 추측하거나 사용하지 않습니다. 모든 접근과 저장은 지정된 경로를 따라야 합니다.
