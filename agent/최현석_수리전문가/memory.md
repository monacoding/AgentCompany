# 최현석 — 누적 메모리

_마지막 동기화: 2026-06-08T13:44:41.559Z_

[CrossAgentFileTransfer v1]

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
     ```

3. **실패 시 솔직히** — 파일을 찾지 못했거나 복사에 실패하면 "완료"라고 말하지 않고, 찾은 위치·조건·다음 조치를 안내합니다.

4. **허위 보고 금지** — 경로 없이 "옮겼다", "저장했다"고만 말하는 것은 금지입니다. 경로가 곧 증거입니다.


[OwnerDataPath v1]

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@ebc7817b]
# 에이전트 간 파일 이동 규칙 요약

## 기본 규칙

- **완료 전 표현 금지**
  - 파일 복사나 이동이 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요" 등의 완료 표현 사용 금지.
  - 대체 표현: "요청해볼게요", "여쭤볼게요", "진행할게요" 등의 예정 표현 사용.

- **완료 시 경로 기재 필수**
  - 복사가 확인되면 완료를 말할 수 있으며, 반드시 파일의 저장 경로를 명시.
  - 경로 예시: `/워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf`

- **실패 시 솔직한 보고**
  - 파일을 찾지 못했거나 복사에 실패할 경우 완료로 보고하지 말고, 위치, 조건, 다음 조치를 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 보고하는 행위 금지. 경로가 증거임.

## 중요 포인트

- 모든 과정에서의 책임성과 투명성 강조.
- 완료보고는 최종 확인 후에만 가능하며, 항상 명확한 경로를 통해 증명되어야 함.
- 실수나 실패 시 솔직히 보고하고 필요한 경우 즉시 수정 조치.

[KnowledgeLearned: owner-data-path.md@5d7416c1]
# 사장님 데이터 경로 요약

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 및 내용

- **Profile 파일:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름, 성격 등 프로필 정보 포함

- **Persona 파일:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 대화 및 보고 시 활용할 사장님의 페르소나 정보

- **사진:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님의 사진 모음

## 에이전트 지침

- 사장님 관련 모든 정보의 검색 및 저장 시 **위의 명시된 경로**를 반드시 사용해야 함
- 경로 외 다른 위치를 추측하거나 사용하지 않음

이 정보는 코드 및 프로젝트 관리에 있어서 필수로 인지되어야 하며, 사장님과 관련된 어떠한 데이터도 이 경로에서 벗어나지 않도록 해야 합니다.

[KnowledgeLearned: project-playbook.md@f298300b]
# Project 도메인 검증 — 수학

[ProjectPlaybook v1]

## 수학 PDF 검증 태스크
- 수학 영역 PDF 메타·분류 검증
- 2차 Project에서 수학 확장 담당

[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

1. **날씨예보** (id: 1780730812068-zzj5ynu)
   - URL: https://api.openweathermap.org/data/2.5
   - 설명: 날씨 관련 API
   - 인증: query-param (appid)
