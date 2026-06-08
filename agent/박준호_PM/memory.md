# 박준호 — 누적 메모리

_마지막 동기화: 2026-06-08T09:44:27.595Z_

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

[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

1. **날씨예보** (id: 1780730812068-zzj5ynu)
   - URL: https://api.openweathermap.org/data/2.5
   - 설명: 날씨 관련 API
   - 인증: query-param (appid)
