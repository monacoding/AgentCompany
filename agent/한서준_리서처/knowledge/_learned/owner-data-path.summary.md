# Learned: owner-data-path.md

_hash: 9442e6c11b65dd79_  
_learned: 2026-06-10T09:28:30.535Z_

# 사장님 데이터 경로 요약

- 사장님의 프로필, 페르소나, 사진 데이터는 특정 경로에 위치하고 있음
- 절대 경로 : `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- 워크스페이스 기준 경로 : `company/owner`

## 중요 데이터 파일 

- 프로필 (이름, 성격 등) : `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
- 페르소나 (대화, 보고서 참고용) : `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
- 사진 : `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 위 경로를 사용합니다. 다른 위치를 추측하여 사용하지 않습니다. 

## 주의사항
- 파일과 폴더의 위치를 변경하지 말아야 함
- 에이전트는 해당 경로 외에는 탐색하지 않으므로, 데이터 위치의 변동은 에이전트의 기능을 방해할 수 있음.
