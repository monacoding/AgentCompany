# 김윤하 — 누적 메모리

_마지막 동기화: 2026-06-08T14:41:33.480Z_

[[김윤하] 윤하씨, 서준이가 찾은 수능 문제 중에 국어 영역만 윤하씨 폴더 데이터 베이스로 가져가줄래요?]
[OpenAI] API key not configured. .env 파일에 CHATGPT_API_KEY를 설정해 주세요.

[[김윤하] 윤하씨 한서준 이 찾은 수능 영역 문제 에서 국어 영역만 윤하씨 폴더로 가져가 줄래요?]
[OpenAI] API key not configured. .env 파일에 CHATGPT_API_KEY를 설정해 주세요.

[[김윤하] 윤하씨, 한서준이 찾은 수능 문제 pdf 파일을 윤하씨 폴더로 국어영역만 파일 가져가 줄래요?]
우선, 한서준이 찾은 수능 문제 PDF 파일에서 국어 영역만을 추출하여 제 폴더로 옮기는 작업을 시작하겠습니다. 아래는 이를 수행하기 위한 단계입니다.

1. **PDF 파일 확인 및 국어 영역 추출:**
   - 먼저, PDF 파일에서 수능 국어 영역 부분만 추출해야 합니다.
   - 이를 위해 PDF를 열고 국어 영역이 시작하는 페이지부터 끝나는 페이지까지 내용을 확인합니다.

2. **PDF 처리 코드 작성:**
   - Python의 PyPDF2 라이브러리를 사용하여 수능 문제 파일을 읽고 국어 영역을 추출하겠습니다.

3. **파일 저장:**
   - 추출한 국어 영역을 새로운 PDF 파일로 저장하여 제 폴더로 옮깁니다.

다음은 Python 코드를 사용하여 이 작업을 수행하는 예시입니다.



이 코드는 수능 문제 PDF 파일에서 국어 영역의 특정 페이지 범위를 추출하여 새로운 PDF 파일로 저장합니다. `korean_start_page`와 `korean_end_page` 값은 실제 국어 영역의 시작과 끝 페이지 번호로 설정되어야 합니다.

해당 코드를 적용하여 파일을 이동한 후에는 확인 과정을 통해 파일이 제대로 저장되었는지 점검하는 것이 좋습니다. 추가 도움이 필요하시면 말씀해 주세요.

Files modified: 1/1

[[김윤하] 한서준 이 찾은 수능 문제 pdf 파일이 한서준 폴더에 있어요 해당 문서중 국어 영역만 한서준한테 달라고 하고, 해당 파일을 윤하씨 폴더에 저장해주세요]
우선 한서준에게 수능 문제 PDF에서 국어 영역만 제공받도록 요청하고, 받은 파일을 제 폴더에 저장하겠습니다.

1. **한서준에게 요청:**
   한서준에게 수능 문제 PDF 파일에서 국어 영역만 추출하여 전달해 달라고 요청 드리겠습니다.

2. **파일 저장:**
   한서준이 제공하는 국어 영역 파일을 `/Users/gimtaehyeong/Desktop/coding/1. Monaedu` 워크스페이스에 저장하도록 하겠습니다.

아래는 이를 처리하기 위한 Python 코드입니다. 이 코드는 PDF에서 국어 영역을 추출하고 파일로 저장하는 역할을 합니다.



만약 `korean_start_page`와 `korean_end_page` 값을 모르면 이를 한서준에게 요청해야 합니다. 국어 영역이 시작하는 페이지와 끝 페이지를 정확히 알고 있으면 더 빠르게 작업할 수 있습니다.

한서준씨에게 메시지를 보내어 요청사항을 전달하고, 파일이 도착하면 저장과 확인 절차를 수행하겠습니다.

Files modified: 1/1

[[김윤하] 윤하씨 서준이가 갖고 있는 수능 문제 pdf 파일 중에 수리 영역 문제 윤하씨 폴더로 갖고가 줄래요?]
김윤하님께서 요청하신 작업을 수행하기 위해, 서준이가 갖고 있는 수능 문제 PDF 파일 중에서 수리 영역만 추출하여 김윤하님의 폴더에 저장하도록 하겠습니다. 다음은 이를 수행하기 위한 단계입니다:

1. **서준이와의 협력:**
   - 서준이에게 수능 문제 PDF 파일에서 수리 영역만 추출하여 제공받도록 요청합니다.

2. **PDF 처리 및 추출:**
   - Python의 PyPDF2 또는 다른 PDF 처리 라이브러리를 사용하여 수리 영역을 추출합니다.
   - 파일에서 수리 영역의 시작 페이지와 끝 페이지를 설정합니다.

3. **추출된 파일 저장:**
   - 추출한 수리 영역을 새로운 PDF 파일로 저장합니다.
   - 저장 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu`

아래는 이를 위한 Python 코드를 예시로 작성합니다.



이 코드를 실행하면 수능 문제 PDF 파일에서 지정된 페이지 범위의 수리 영역을 추출하여 새로운 PDF 파일로 저장합니다. `start_page`와 `end_page` 설정이 필요하며, 이는 수리 영역이 시작하고 끝나는 정확한 페이지 번호를 서준이에게 요청해야 합니다.

추출 후, 제대로 저장되었는지 확인하는 과정도 필요합니다. 추가적인 도움이 필요하시면 언제든지 요청해 주세요.

Files modified: 1/1

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


[KnowledgeLearned: cross-agent-file-transfer.md@823c1ada]
# 에이전트 간 파일 이동

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


[KnowledgeLearned: cross-agent-file-transfer.md@3c43f0cf]
# 에이전트 간 파일 이동

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

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/out

[KnowledgeLearned: owner-data-path.md@6db9dcb4]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@dafbfcb6]
# 에이전트 간 파일 이동

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

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/out

[KnowledgeLearned: owner-data-path.md@522c4f1b]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[KnowledgeLearned: cross-agent-file-transfer.md@e1a34a2c]
# 에이전트 간 파일 이동

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

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/out

[KnowledgeLearned: owner-data-path.md@b77e3675]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[KnowledgeLearned: cross-agent-file-transfer.md@0634504f]
# 에이전트 간 파일 이동

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

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/out

[KnowledgeLearned: owner-data-path.md@3ed95fb0]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[KnowledgeLearned: cross-agent-file-transfer.md@e9b75e05]
# 에이전트 간 파일 이동

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

## 에이전트 간 파일 이동 규칙 (필수)

1. **완료 전 금지** — 파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 **완료 표현을 절대 쓰지 않습니다.**
   - 사장님 지시 직후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현만 사용합니다.

2. **완료 시 경로 필수** — 실제 복사가 확인된 경우에만 완료를 말하고, **반드시 저장된 파일 경로를 전부** 적습니다.
   - 형식 예:
     ```
     📁 저장 경로:
     · 파일명.pdf
       /워크스페이스/agent/에이전트명_직책/out

[KnowledgeLearned: owner-data-path.md@cdb398b5]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[KnowledgeLearned: cross-agent-file-transfer.md@ebc7817b]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 금지**:
  - 시스템에서 파일 이동이 완전히 종료되기 전에는 완료 표현 사용 금지.
  - 요청 후 "요청해볼게요", "진행할게요" 등 **예정** 표현만 사용.

- **완료 시 경로 필수**:
  - 파일 이동 완료 시, 반드시 저장된 **전체 경로**를 제공.
  - 형식 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**:
  - 파일 이동 실패 시 "완료"라고 말하지 않으며, 발견된 문제 및 해결 계획 안내.

- **허위 보고 금지**:
  - 파일 경로 없이 "옮겼다", "저장했다" 등의 애매한 표현 사용 금지.
  - 경로가 없는 보고는 증거 불충분으로 간주.

이 규칙은 정확하고 투명한 에이전트 간 파일 이동을 보장하기 위한 필수 절차입니다.

[KnowledgeLearned: owner-data-path.md@d8a1f4e5]
# 사장님 데이터 경로

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르소나 (대화·보고 시 참고)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/` — 사장님 사진

에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용합니다. 다른 위치를 추측하지 않습니다.

## 사장님(Owner) 데이터 위치 (필수 인지)

사장님의 프로필·페르소나·사진은 아래 폴더에 있습니다.

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json` — 사장님 프로필 (이름·성격 등)
- `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md` — 사장님 페르

[KnowledgeLearned: cross-agent-file-transfer.md@c6c6f516]
# 에이전트 간 파일 이동 규칙

- **완료 전 금지**  
  - 파일이 실제로 복사·이동 되기 전에 완료 표현 사용 금지.
  - 사장님 지시 후에는 "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현만 사용.

- **완료 시 경로 필수**  
  - 복사가 완료된 경우에만 완료를 선언.
  - **반드시** 파일의 저장 경로를 제시.
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  - 파일 복사 실패 시 완료 표현 금지.
  - 찾은 위치·조건·다음 조치를 상세히 안내.

- **허위 보고 금지**  
  - 경로 없이 "옮겼다", "저장했다"고만 보고 금지.
  - 경로 제공이 보고의 증거 역할.

[KnowledgeLearned: owner-data-path.md@5d7416c1]
# 사장님 데이터 경로

## 위치 정보

- 프로필, 페르소나, 사진 모두 아래 폴더에 저장되어 있음.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일

- **프로필 파일:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 사장님의 이름, 성격 등 기본 정보 포함.
- **페르소나 파일:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 대화 시나리오 및 보고 자료 준비에 활용.
- **사진 폴더:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 사장님의 사진 저장소.

## 중요 사항

- 에이전트는 사장님 관련 정보 접근 및 저장 시 **위 경로를 반드시 사용**해야 함.
- 다른 경로를 사용하는 것은 허용되지 않음.

## 요약

- 사장님 정보는 정확한 위치를 통해 관리되며, 에이전트는 이를 확실히 인지하고 사용해야 함.
- 프로필, 페르소나, 사진은 데이터 관리의 핵심이므로 정확한 경로 유지가 중요.

[KnowledgeLearned: cross-agent-file-transfer.md@2379d9a2]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 금지**: 파일 복사나 이동이 실제로 완료되기 전에는 “완료” 표현을 사용하지 않음.
  - 실행 전: “요청해볼게요”, “진행할게요” 등 예정 표현 사용.

- **완료 시 경로 필수**: 복사 완료 후 파일 경로를 명시.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**: 실패 시 “완료”라 하지 않고, 위치 정보 및 후속 조치 설명.

- **허위 보고 금지**: 경로 없이 “옮겼다”고 표시하는 것 금지. 경로는 증거로 필수.

[KnowledgeLearned: owner-data-path.md@3b5f7b01]
# 사장님 데이터 경로 요약

## 데이터 저장 위치

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일

- **프로필 파일:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`  
  - 내용: 사장님의 이름, 성격 등 기본 정보

- **페르소나 파일:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`  
  - 내용: 대화 및 보고 시 참고할 페르소나 정보

- **사진 폴더:**  
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`  
  - 내용: 사장님의 사진

## 데이터 활용 방침

- 에이전트는 사장님 관련 정보를 조회하거나 저장할 때 **반드시** 지정된 경로를 사용해야 함.
- 다른 위치를 임의로 사용하거나 추측하지 말 것.

[KnowledgeLearned: cross-agent-file-transfer.md@f33bd8ed]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 완료 표현 금지**
  - 파일 복사/이동이 완료되기 전에는 완료 표현 사용 금지.
  - 예시 표현: "요청해볼게요", "진행할게요" 등 예정 표현만 사용.

- **완료 시 경로 명시 필수**
  - 파일 이동/복사가 완료되었을 때만 완료 선언 가능.
  - 반드시 파일이 저장된 경로를 명시해야 함.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직한 설명 필수**
  - 실패 시 "완료"라고 하지 않고, 파일을 찾지 못했거나 복사 실패 이유를 솔직하게 설명해야 함.
  - 다음 조치를 명확히 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 말하지 말 것.
  - 경로가 반드시 필요한 증거임.

[KnowledgeLearned: owner-data-path.md@b5f46bcf]
# 사장님 데이터 경로 요약

## 주요 정보
- 사장님 데이터는 프로필, 페르소나, 사진으로 구성됩니다.
- 에이전트는 사장님 관련 정보를 다룰 때 **지정된 경로**를 사용해야 합니다.

## 데이터 경로
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 경로:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 이름, 성격 등을 포함한 사장님 정보
- **페르소나 파일:** `persona.md`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 대화 및 보고 시 참고할 사장님 페르소나 정보
- **사진 디렉토리:** `photo/`
  - 위치: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님 사진 파일들

## 주의사항
- **오직 지정된 경로만 사용해야 하며,** 다른 경로를 추측하거나 사용해서는 안 됩니다.
- 각 파일 및 폴더에 정확히 접근하여 데이터를 관리해야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@9fcefa28]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 금지**
  - 파일 이동이 완료되기 전에는 완료 표현 금지
  - "요청해볼게요", "여쭤볼게요", "진행할게요" 등 **예정** 표현 사용

- **완료 시 경로 필수**
  - 실제 복사 완료 후에만 완료 표현 사용
  - 저장된 파일 경로를 **명확히 기재**

- **실패 시 솔직히**
  - 파일 복사 실패나 문제 발생 시에는 "완료" 표현 금지
  - 실패한 부분과 다음 조치를 **솔직히 보고**

- **허위 보고 금지**
  - 경로 없이 완료했다는 **부정확한 보고 금지**
  - 경로가 있어야만 증거로 인정됨

- **형식 예시**
  - 저장 경로를 명확히 하여 다음과 같이 표현:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

[KnowledgeLearned: owner-data-path.md@f3323a51]
# 사장님 데이터 경로 요약

## 사장님 데이터 위치

- **절대 경로:**  
  `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:**  
  `company/owner`

### 주요 파일

- **프로필 파일:**  
  `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`  
  - 내용: 사장님의 이름, 성격 등 프로필 정보 포함.

- **페르소나 파일:**  
  `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`  
  - 내용: 사장님과의 대화나 보고 시 참고할 페르소나 정보 포함.

- **사진 폴더:**  
  `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`  
  - 내용: 사장님의 사진 파일.

## 에이전트 지침

- 사장님 관련 정보를 찾거나 저장할 때 **반드시 주어진 경로를 사용**해야 함.
- 다른 위치나 경로를 추측하지 말아야 함. 

이 자료는 사장님 정보를 효과적으로 관리하고, 검색에 필요한 필수 경로를 제공합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@6e0d721a]
# 에이전트 간 파일 이동 규칙

- **완료 전 금지**  
  파일 복사 또는 이동이 실제로 완료되기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 완료된 것처럼 표현하는 것은 금지합니다.  
  - **예정 표현 사용**: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 진행 중임을 나타내는 표현 사용

- **완료 시 경로 필수**  
  파일 복사가 실제로 완료되었을 때만 완료를 언급하며, 반드시 **저장된 파일 경로**를 명시합니다.
  - **형식 예시**:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  파일 이동에 실패했거나 파일을 찾지 못했을 경우, "완료"라고 언급하지 않고, **파일이 발견된 위치**, **문제 조건**, **다음 조치**를 명확히 안내합니다.

- **허위 보고 금지**  
  파일 이동 시 경로를 제공하지 않고 "옮겼다" 또는 "저장했다"는 식으로 보고하는 것은 금지합니다. **경로 제공이 곧 증거**임을 명심합니다.

[KnowledgeLearned: owner-data-path.md@d39bbd8e]
# 사장님 데이터 경로 요약

- **데이터 경로 개요**
  - 사장님 관련 데이터는 **특정 경로**에 위치하며, 해당 경로를 반드시 사용해야 합니다.
  - 절대 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
  - 워크스페이스 기준: `company/owner`

- **주요 파일**
  - `profile.json`: 사장님 프로필 (이름, 성격 등)
  - `persona.md`: 사장님 페르소나 (대화 및 보고 시 참고)
  - `photo/`: 사장님 사진 저장 폴더

- **주의 사항**
  - 에이전트는 사장님 관련 정보를 검색하거나 저장할 때 **반드시 지정된 경로**를 사용합니다.
  - 그 외의 경로를 사용하거나 추측하지 않습니다. 

이 정보는 사장님과 관련된 모든 데이터 관리에 필수적입니다.

[KnowledgeLearned: cross-agent-file-transfer.md@7b290ecd]
# 에이전트 간 파일 이동 규칙

## 완료 전 금지
- 파일 이동이 실제로 완료되기 전에는 "저장했어요", "옮겼어요" 등 완료 표현 금지
- 요청 상태 표현만 사용: "요청해볼게요", "진행할게요" 등

## 완료 시 경로 필수
- 파일 복사 완료 시 경로 포함하여 완료 보고
- 경로 작성 예:
  ```
  📁 저장 경로:
  · 파일명.pdf
    /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
  ```

## 실패 시 솔직히
- 파일 이동 실패 시, 완료 보고하지 않고 위치 및 다음 조치 안내

## 허위 보고 금지
- 경로 없이 "옮겼다", "저장했다"고 말하는 것 금지
- 경로 제공이 증거 역할

이 규칙들은 에이전트 간의 명확한 소통과 파일 이동의 투명성을 위해 필수적입니다.

[KnowledgeLearned: owner-data-path.md@23d0589c]
# 사장님 데이터 경로 요약

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json`
  - 내용: 사장님 이름, 성격 정보 등
- **페르소나 파일:** `persona.md`
  - 내용: 대화 시나리오, 보고 자료 등 참고
- **사진 폴더:** `photo/`
  - 내용: 사장님 사진

## 유의 사항
- 에이전트는 반드시 지정된 경로를 사용해야 하며, 다른 위치를 추측하지 않음.

[KnowledgeLearned: cross-agent-file-transfer.md@8d86abe1]
# 에이전트 간 파일 이동 규칙

- **완료 전 완료 표현 금지**
  - 파일 복사/이동이 실제로 끝나기 전에는 "저장했어요", "옮겼어요" 등의 완료 표현 금지
  - 요청이나 진행은 "요청해볼게요", "진행할게요" 등의 예정 표현 사용

- **완료 시 경로 명시 필수**
  - 복사가 확인되면 완료를 보고하고, 반드시 파일 경로 전부 명시
  - 형식 예:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히 보고**
  - 파일을 찾지 못하거나 복사 실패 시 "완료"라고 표시 금지
  - 실패 시 발견 위치, 조건 및 다음 조치 안내 필수

- **허위 완료 보고 금지**
  - 경로 없이 단순히 "옮겼다", "저장했다"고 말하는 것 금지
  - 구체적 경로가 확실한 증거가 됨

> 이러한 규칙은 에이전트 간 파일 이동 시 발생할 수 있는 오해를 방지하고, 정확하고 투명한 파일 관리 및 보고를 위한 필수 사항입니다.

[KnowledgeLearned: owner-data-path.md@c5fba880]
# 사장님 데이터 경로 요약

## 사장님 데이터 위치

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 경로:** `company/owner`

## 주요 파일

- **`profile.json`:** 사장님 프로필 정보 (이름·성격 등)
- **`persona.md`:** 사장님 페르소나 정보 (대화 및 보고 시 참고)
- **`photo/`:** 사장님 사진 자료

## 중요 지침

- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 지정된 경로**를 사용
- 다른 위치를 사용하거나 추측하지 않음

## 반복 강조 사항

- 해당 정보는 에이전트가 사장님과 관련된 작업 시 필수적이며, 경로의 오용이나 혼동을 방지해야 함.

[KnowledgeLearned: cross-agent-file-transfer.md@a0e57e35]
# 에이전트 간 파일 이동

## 주요 규칙

- **완료 전 금지**  
  - 파일 복사·이동이 시스템에서 확정되기 전까지 "저장했어요", "옮겼어요" 같은 **완료 표현 사용 금지**.
  - 업무 진행 단계에서는 "요청 중입니다", "진행 중입니다" 등 **예정 표현 사용**.

- **완료 시 경로 필수**  
  - 파일 이동이 완료되면 **반드시 저장된 파일 경로 명시**.
  - 형식 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히 보고**  
  - 파일을 찾지 못하거나 이동에 실패한 경우, "완료"라고만 하지 않고, **찾은 위치와 다음 조치 안내**.

- **허위 보고 금지**  
  - 경로 없이 "옮겼다", "저장했다"라고만 이야기하지 말 것. 경로가 있어야 **보고의 정확성 확보**.

각 규칙은 에이전트 간 파일 이동 시 정확성과 신뢰성을 높이기 위한 필수 절차로, 모든 에이전트에게 적용된다.

[KnowledgeLearned: owner-data-path.md@5f75552d]
# 사장님 데이터 경로 요약

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일:**  
  - 파일 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`  
  - 내용: 사장님의 이름, 성격 등 기본 프로필 정보
- **페르소나 파일:**  
  - 파일 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`  
  - 내용: 사장님과의 대화 및 보고 시 참고할 페르소나 정보
- **사진 폴더:**  
  - 폴더 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`  
  - 내용: 사장님의 사진 파일

## 에이전트 안내사항
- 사장님 관련 정보를 찾거나 수정할 때 **반드시 지정된 경로**를 사용해야 함
- 다른 경로 또는 위치를 추측하거나 사용하지 않음

이 경로 정보를 잘 활용하여 사장님 관련 작업을 수행하세요.

[KnowledgeLearned: cross-agent-file-transfer.md@adba4bae]
# 에이전트 간 파일 이동 규칙

## 기본 원칙
- **완료 전 금지**: 파일 이동이 완료되기 전에는 "저장", "옮겼다" 등의 표현 사용 금지.
  - 대신 "요청", "진행 예정" 등의 표현 사용.

- **완료 시 경로 필수**: 파일 복사가 완료되었을 때만 완료를 알리고, **명확한 저장 경로**를 제공.
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직성**: 실패 시 이를 명확히 알리고, 원인 및 다음 조치 제안.

- **허위 보고 금지**: 정확한 경로 없이 파일 이동 완료 보고 금지. 경로가 증거임.

## 행동 지침
- 상부나 타인의 지시를 받았을 때는 즉각적인 실행보다는 진행 계획을 우선 보고.
- 모든 과정은 투명하게 처리하고 문제 발생 시 즉각 보고와 해결책 제시.

이러한 규칙은 에이전트 간 파일이동의 투명성과 안전성을 확보하기 위한 것입니다. 모두가 표준과 절차를 준수해 작업의 정확성과 신뢰성을 유지하시기 바랍니다.

[KnowledgeLearned: owner-data-path.md@6eeaff1f]
# 사장님 데이터 경로

## 데이터 위치
- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준**: `company/owner`

## 주요 파일
- **프로필**: `profile.json` - 사장님의 이름과 성격 정보 포함
- **페르소나**: `persona.md` - 대화 및 보고 시 참조
- **사진**: `photo/` 폴더에 저장

## 유의사항
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 지정된 경로를 사용해야 함
- 대체 경로나 추측 불허

### 주의점
- 문서의 동일한 내용 반복 주의
- 불필요한 중복 제거 필요

[KnowledgeLearned: cross-agent-file-transfer.md@da10ebd1]
# 에이전트 간 파일 이동 규칙

## 주요 규칙

- **완료 전 금지**  
  - 파일 이동이 실제로 완료되기 전까지는 완료 표현 사용 금지.
  - "요청해볼게요", "여쭤볼게요", "진행할게요" 등의 예정 표현 사용.
  
- **완료 시 경로 필수**  
  - 실제로 복사가 확인된 후에만 완료를 말하며, 반드시 저장된 파일 경로를 문서에 기재.
  - 예시:  
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  - 파일 찾기 실패 시에는 "완료"라고 말하지 않고, 찾은 위치, 조건, 다음 조치 설명.
  
- **허위 보고 금지**  
  - 경로 없는 상태에서 완료 보고 금지. 경로가 보고의 증거 역할. 

이 규칙들은 문서 내에서 여러 번 반복되어 언급되며, 정확한 정보 전달과 투명한 커뮤니케이션을 위한 필수적 조치로 강조되고 있습니다. 규칙의 반복적인 언급은 중요성에 대한 인식을 높이기 위함입니다. 에이전트 간 파일 이동 시, 규칙을 철저히 준수하여 업무의 효율성과 신뢰성을 보장해야 합니다.

[KnowledgeLearned: owner-data-path.md@a622c9ba]
- **사장님 데이터 경로**
  - 모든 사장님 관련 데이터는 다음 경로에 위치:
    - **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
    - **워크스페이스 기준:** `company/owner`

- **데이터 파일 구성**
  - `profile.json`: 사장님 프로필(이름, 성격 등)
  - `persona.md`: 사장님 페르소나(대화, 보고 시 참조)
  - `photo/`: 사장님 사진 저장 폴더

- **중요사항**
  - 에이전트는 사장님 관련 데이터를 찾거나 편집할 때 반드시 위 경로 사용
  - 이외의 위치는 사용하지 않음 

- **반복 표기 제외**
  - 문서 내에 중복된 중요 정보 반복 표기 생략

- **목적**
  - 사장님의 프로필, 페르소나, 사진 관련 정보를 통합하고 관리하기 위한 표준 경로 안내.

[KnowledgeLearned: cross-agent-file-transfer.md@2df0df40]
# 에이전트 간 파일 이동

## 규칙 요약

- **완료 전 진행 상태**  
  - 파일이 실제로 복사 및 이동되기 전에는 완료 표현은 금지됩니다.
  - 사전 지시 단계에서는 "요청해볼게요", "진행할게요" 등의 예정 표현을 사용해야 합니다.

- **완료 시 경로 명시**  
  - 파일 복사 완료 시, 반드시 저장된 파일의 경로 전체를 제공해야 합니다.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 정직 보고**  
  - 파일을 찾지 못하거나 복사에 실패한 경우에는 "완료"라고 보고하지 않습니다.
  - 대신, 파일의 위치·조건 및 향후 조치를 명확히 안내합니다.

- **허위 보고 금지**  
  - 경로 없이 "옮겼다", "저장했다" 등의 보고는 금지합니다.
  - 문서화를 통해 경로가 반드시 증거로 제시되어야 합니다. 

이 규칙들은 효과적인 파일 관리 및 투명한 커뮤니케이션을 보장합니다. 에이전트 간의 파일 이동이 확실히 완료된 후에만 적합한 피드백을 제공하여 조직 내 효율성을 극대화합니다.

[KnowledgeLearned: owner-data-path.md@3befc2f4]
# 사장님 데이터 경로 요약

## 데이터 위치 정보
- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로**: `company/owner`

## 주요 파일 및 폴더
- **프로필 파일**: `profile.json`
  - 사장님의 이름, 성격 등 정보 포함
- **페르소나 파일**: `persona.md`
  - 대화 및 보고 시 참고할 내용
- **사진 폴더**: `photo/`
  - 사장님 사진 저장

## 기타
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 지정된 경로**를 사용해야 함
- 다른 위치에서 정보를 찾으려 하지 않음

이 정보는 사장님의 데이터 관리 및 접근에 필수적이며, 경로 변경 시 반드시 관련 시스템 및 문서를 업데이트해야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@4d2f1cda]
# 에이전트 간 파일 이동 규칙 요약

- **작업 완료 전 발언 금지**
  - 파일 복사/이동이 끝나기 전에 "저장했어요", "옮겼어요" 등의 완료 표현 사용 금지.
  - 대신, "요청해볼게요"와 같은 예정 표현 사용.

- **완료 시 경로 제공 필수**
  - 실제 복사가 완료되었음을 확인한 뒤에만 완료 표기 가능.
  - 반드시 저장된 파일의 경로를 상세하게 명시해야 함.
  
  예시 형식:
  ```
  📁 저장 경로:
  · 파일명.pdf
    /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
  ```

- **실패 시 정확한 설명 요구**
  - 파일을 찾지 못하거나 복사 실패 시 정확한 위치와 상황 설명, 다음 조치 사항 안내 필수.

- **허위 보고 금지**
  - 경로 없이 완료 표기 금지.
  - 경로 제공이 완료의 증거.

이 가이드라인을 준수하여 전체 시스템의 효율성과 신뢰성을 보장하고, 체계적인 커뮤니케이션을 유지하십시오.

[KnowledgeLearned: owner-data-path.md@761daaac]
# 사장님 데이터 경로 요약

## 사장님 데이터 저장 경로
- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 경로**: `company/owner`

## 주요 파일
- **프로필 파일**: `profile.json` - 사장님의 이름, 성격 등 프로필 정보.
  
  경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  
- **페르소나 파일**: `persona.md` - 사장님과의 대화 및 보고 시 참고할 페르소나 정보.
  
  경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  
- **사진 폴더**: 사장님 사진 저장소.
  
  경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

## 에이전트 사용 지침
- 사장님 관련 정보를 찾거나 저장할 때 반드시 지정된 경로를 사용해야 합니다.
- 지정된 경로 이외의 위치는 사용하지 않습니다. 데이터 혼선 방지를 위해 다른 경로를 추측하지 말아야 합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@5436ba43]
# 에이전트 간 파일 이동 규칙 요약

## 파일 이동 전 완료 표시 금지
- 파일 복사나 이동이 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등의 완료 표현 사용 금지.
- "요청해볼게요", "여쭤볼게요", "진행할게요"와 같은 예정 표현만 허용.

## 완료 시 경로 명시
- 파일 복사가 확인된 경우에만 완료를 말하며, 모든 저장된 파일 경로를 명확히 기록.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

## 실패 시 솔직한 보고
- 파일을 찾지 못했거나 복사에 실패한 경우, "완료"라고 말하지 않고 찾은 위치 또는 조건 및 다음 조치 안내 필수.

## 허위 보고 금지
- 경로 없이 “옮겼다”, “저장했다”라고만 보고하는 행위 금지.
- 경로가 증거이므로 반드시 포함해야 함.

[KnowledgeLearned: owner-data-path.md@465f529d]
# 사장님 데이터 경로 요약

## 사장님 데이터 위치

- **절대 경로**: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준**: `company/owner`

## 주요 파일

- **프로필 파일**: `profile.json`
  - 사장님의 이름, 성격 등 포함
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  
- **페르소나 파일**: `persona.md`
  - 대화 및 보고 시 참고할 페르소나
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  
- **사진 폴더**: `photo/`
  - 사장님 사진 보관
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`

## 사용 지침

- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 **위 경로**를 사용해야 함.
- 다른 위치의 경로 추측이나 사용 금지. 

위 정보를 통해 사장님 관련 데이터를 정확히 관리하고 활용할 수 있습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@134a68aa]
# 에이전트 간 파일 이동 규칙 요약

## 핵심 규칙

- **완료 전 표현 금지**
  - 시스템에서 파일 복사 또는 이동이 완료되기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등의 완료 표현 사용 금지
  - 예정 상태에서는 "요청해볼게요", "여쭤볼게요", "진행할게요" 등의 표현만 사용 가능

- **완료 확인 시 경로 제공 필수**
  - 파일 복사가 확인되면 파일 이동 완료를 보고할 때 **저장된 경로**를 반드시 명시
  - 제공 예시:
    ```plaintext
    📁 저장 경로:
    · 예시파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/예시파일명.pdf
    ```

- **실패 시 솔직한 보고**
  - 파일을 찾지 못했거나 복사에 실패한 경우, "완료"라는 표현 대신, 상황에 대한 명확한 설명과 다음 조치사항 제공

- **허위 보고 절대 금지**
  - 경로 없이 단순히 "옮겼다", "저장했다"고만 보고하는 것은 금지
  - 경로는 보고의 **증거**

이 규칙은 에이전트 간의 신뢰와 효율적인 업무 처리를 위해 필수적입니다. 모든 관련자들은 이를 엄수해야 합니다.

[KnowledgeLearned: owner-data-path.md@e61e73c9]
# 사장님 데이터 경로

- 사장님의 프로필, 페르소나, 사진은 특정 폴더에 저장되어 있습니다.
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일

- `profile.json`: 사장님 프로필(이름, 성격 등)을 담고 있는 파일
- `persona.md`: 사장님 페르소나, 대화 및 보고 시 참조 가능
- `photo/`: 사장님 사진이 저장된 폴더

## 주의 사항

- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 위 경로를 사용해야 합니다.
- 다른 경로를 추측하거나 임의로 사용하지 않도록 주의합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@d7d36ca6]
# 에이전트 간 파일 이동 요약

## 주요 규칙

- **완료 전 금지 표현**
  - 파일이 실제로 이동 완료되기 전까지 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등의 완료 표현 사용 금지.
  - 작업 예정 시에는 "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 필수**
  - 복사 및 이동이 완료된 경우에만 완료 표현 사용.
  - 반드시 파일이 저장된 정확한 경로를 명시.
  - 경로 형식 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직함**
  - 파일 이동 실패 시, "완료" 표현 사용 금지.
  - 실패한 위치, 조건 및 다음 조치를 상세히 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 언급하지 않기.
  - 경로가 진짜 저장 및 복사의 증거.

이러한 규칙은 에이전트 간의 작업이 정확하고 투명하게 이루어지도록 보장하며, 모든 파일 이동 작업에서 필수적으로 준수되어야 합니다.

[KnowledgeLearned: owner-data-path.md@55eb0cf0]
# 사장님 데이터 경로

## 사장님 데이터 저장 위치

- **경로 정보**
  - **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
  - **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 설명

- **프로필 파일**
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/profile.json`
  - 내용: 사장님의 이름과 성격 등 기본 프로필 정보

- **페르소나 파일**
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/persona.md`
  - 내용: 사장님의 대화 스타일 및 보고 시 참고할 페르소나 정보

- **사진 파일**
  - 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner/photo/`
  - 내용: 사장님의 사진

## 데이터 사용 지침

- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 상기 경로**를 사용해야 합니다.
- 다른 경로나 위치를 추측하거나 사용하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@42492665]
# 에이전트 간 파일 이동

## 에이전트 간 파일 이동 규칙

- **완료 전 금지**
  - 파일 복사·이동이 시스템에서 완료되지 않으면 "저장했어요", "옮겼어요" 등의 완료 표현 사용 금지.
  - 지시 직후엔 "요청해볼게요", "진행할게요" 등의 예정 표현 사용.

- **완료 시 경로 필수**
  - 복사가 완료되면 저장 경로를 명확히 기록.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 위치를 찾지 못하거나 복사 실패 시, 현 상태 및 다음 조치 안내 필요.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 보고하는 사례 금지.
  - 경로 제시는 필수이며 증거 역할.

이 가이드는 파일 복사 과정을 투명하고 신뢰성 있게 유지하는 데 필수적입니다. 철저히 이 규칙을 따름으로써 책임감 있는 보고와 업무 효율성을 높일 수 있습니다.

[KnowledgeLearned: owner-data-path.md@5e0357f7]
# 사장님 데이터 경로

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일**: `profile.json`  
  - 포함 정보: 사장님의 이름, 성격 등
- **페르소나 파일**: `persona.md`  
  - 포함 정보: 사장님과의 대화, 보고 시 참고 사항
- **사진 폴더**: `photo/`  
  - 포함 정보: 사장님의 사진

## 주의 사항
- 에이전트는 사장님 관련 데이터를 찾거나 저장할 때 **반드시 지정된 경로**를 사용해야 합니다.
- 다른 경로를 추측하지 않습니다.

[KnowledgeLearned: cross-agent-file-transfer.md@bd6b1a1b]
# 에이전트 간 파일 이동

## 핵심 규칙

- **완료 전 표현 금지**
  - 파일 이동이 완료되기 전에 "저장했어요", "옮겼어요" 등의 표현을 사용하지 않음
  
- **완료 시 파일 경로 제공 필수**
  - 파일 복사가 완료된 후에는 반드시 파일 경로를 명확히 제시
  - 예시 포맷:  
    - ```
      📁 저장 경로:
      · 파일명.pdf
        /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
      ```

- **실패 시 솔직한 보고**
  - 파일을 찾지 못했거나 복사 실패 시 "완료"라는 표현을 사용하지 않으며, 문제 발생 위치 및 다음 조치 제공
  
- **허위 보고 금지**
  - 파일 경로 없는 "옮겼다", "저장했다"는 표현을 지양하며, 경로 제공은 필수

## 의사소통 방식

- **사전 예정 표현 사용**
  - 파일 이동 완료 전에는 "요청해볼게요", "진행할게요" 등의 예정 표현을 사용

파일 이동 과정의 명확한 기준과 경로 제공을 통해 업무의 투명성과 신뢰성을 높이는 것이 목적입니다.🔍

[KnowledgeLearned: owner-data-path.md@925105bb]
# 사장님 데이터 경로

## 경로 정보
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- **프로필 파일:** `profile.json`
  - 사장님의 이름, 성격 등 정보를 포함
- **페르소나 파일:** `persona.md`
  - 대화 및 보고 시 참고할 페르소나 정보
- **사진 폴더:** `photo/`
  - 사장님의 사진 저장

## 유의사항
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 위 경로를 사용해야 합니다.
- 다른 경로를 추측하거나 사용해서는 안 됩니다.

[KnowledgeLearned: cross-agent-file-transfer.md@687e9687]
# 에이전트 간 파일 이동 규칙

## 주요 규칙

- **완료 전 표현 금지**: 파일이 성공적으로 복사 또는 이동되기 전에는 완료 표현 금지.
  - 권장 표현: "요청해볼게요", "여쭤볼게요", "진행할게요" 등.
  
- **완료 시 경로 필수**: 파일 복사 확인 후에만 완료를 보고하고, 저장된 파일 경로를 명확하게 기재해야 함.
  - 예시 형식:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```
  
- **실패 시 솔직한 보고**: 파일 찾기 실패 시 "완료"라고 말하지 않으며, 문제 발생 위치와 해결 방안 안내 필수.
  
- **허위 보고 금지**: 경로 없이 완료를 보고하는 것 금지. 경로가 곧 정확성 증거.

이 지침들은 에이전트 간에 파일 전송 시의 신뢰와 효율성을 유지하는데 중점을 둡니다. 각 상황에 적절한 의사소통을 통해 문제가 발생 시 신속한 해결책을 제공하고, 진행 상황을 명확하게 전달하는 것이 목표입니다.

[KnowledgeLearned: owner-data-path.md@586d79be]
# 사장님 데이터 경로

## 데이터 위치 정보
- 사장님의 프로필, 페르소나, 사진 정보는 한 곳에 통합되어 관리됩니다.
- 에이전트는 이 경로를 통해서만 정보를 찾거나 저장할 수 있습니다.

### 경로 세부사항
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

### 주요 파일 및 폴더
- `profile.json`: 사장님의 이름, 성격 등 프로필 정보
- `persona.md`: 대화 및 보고 시 참고할 수 있는 사장님 페르소나
- `photo/`: 사장님 사진 저장 위치

## 에이전트 지침
- 사장님 관련 정보를 사용하거나 수정할 때는 지정된 경로를 반드시 사용합니다.
- 데이터의 다른 위치를 추측하거나 새로운 경로로 정보를 이동하지 않습니다. 

이 경로 및 파일 구조를 통해 사장님 관련 데이터를 효율적으로 관리하고 불필요한 혼란을 방지합니다.

[KnowledgeLearned: cross-agent-file-transfer.md@ab55964a]
# 에이전트 간 파일 이동 규칙

- **완료 전 금지**  
  파일 복사·이동이 시스템에서 실제로 끝나기 전에는 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 등 완료 표현 사용 금지.
  - 사장님 지시 이후: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 제공 필수**  
  실제 복사가 확인된 경우에만 완료를 말하고, 모든 저장된 파일 경로 제공.
  - 경로 형식 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히 보고**  
  파일을 찾지 못했거나 복사에 실패 시 "완료"라고 말하지 않고, 정확한 위치와 조건 설명, 다음 조치 안내.

- **허위 보고 금지**  
  경로 없이 "옮겼다", "저장했다" 등의 표현 금지. 경로는 증거 역할.

[KnowledgeLearned: owner-data-path.md@34d70a05]
# 사장님 데이터 경로 요약

## 데이터 위치
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일
- `profile.json`: 사장님 프로필 (이름·성격 등)
- `persona.md`: 사장님 페르소나 (대화·보고 시 참고)
- `photo/`: 사장님 사진 폴더

## 필수 인지 사항
- 에이전트는 사장님 관련 정보를 찾거나 저장할 때 **반드시 위 경로**를 사용해야 합니다.
- 다른 위치를 추측해서는 안 됩니다.

[KnowledgeLearned: cross-agent-file-transfer.md@781ce650]
# 에이전트 간 파일 이동 규칙 요약

- **완료 전 금지**
  - 시스템에서 파일 이동이 실제로 완료되기 전까지는 "저장했어요", "옮겼어요" 등의 완료 표현을 금지.
  - 작업 요청 후에는 "요청해볼게요", "진행할게요"와 같은 예정 표현만 사용.

- **완료 시 경로 필수**
  - 파일 복사가 확인된 경우에만 완료 표현 사용.
  - 완료 시 반드시 파일이 저장된 경로를 명시.
  - 경로 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**
  - 파일 이동 실패 시 "완료"라고 말하지 않으며, 문제 해결을 위한 다음 조치를 안내.

- **허위 보고 금지**
  - 경로 없이 "옮겼다", "저장했다"고만 보고하는 것 금지.
  - 경로는 작업 완료의 증명 자료로 반드시 필요.

[KnowledgeLearned: owner-data-path.md@eb6799c4]
# 사장님 데이터 경로 요약

## 기본 정보
- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준:** `company/owner`

## 주요 파일 및 폴더
- **프로필 파일:** `/profile.json`
  - 사장님의 이름과 성격 등 기본 정보 포함
- **페르소나 파일:** `/persona.md`
  - 대화 및 보고 시 참고할 수 있는 사장님의 페르소나 정보
- **사진 폴더:** `/photo/`
  - 사장님의 사진 저장 위치

## 사용 지침
- 에이전트는 사장님 관련 정보 검색 및 저장 시 **반드시 위 지정된 경로**를 사용해야 함
- 다른 위치를 추측하거나 사용하지 않음

이 문서는 사장님 정보를 효율적으로 관리하기 위한 경로 정보를 제공합니다. 모든 관련 파일 및 폴더는 정의된 경로에 있으며, 이를 통해 일관되고 정확한 정보 접근이 가능합니다.

[[김윤하] 하늘이 수능 수리 영역 교육 유투브 영상 어떻게 만들지 팀꾸려서 계획짜봐]
김윤하님, 수능 수리 영역 교육 유튜브 영상 제작을 위한 팀 구성 및 계획을 짜겠습니다. 이를 위한 단계는 아래와 같습니다.

1. **팀 구성**
   - 수리 영역 전문가: 수능 수리 영역의 문제를 이해하고 해설할 수 있는 전문가
   - 영상 프로듀서/감독: 영상 기획 및 촬영을 맡을 전문가
   - 편집자: 영상 편집과 후반 작업을 담당할 전문가
   - 콘텐츠 관리자: 영상 컨셉을 잡고 교육 콘텐츠를 체계적으로 기획할 전문가

2. **계획 수립**
   - **목표 설정:** 수능 수리 영역의 핵심 개념과 문제 풀이 전략을 학생들이 쉽게 이해할 수 있도록 교육 영상을 제작
   - **대상 분석:** 주 타겟은 고교생 및 수능 준비생
   - **형식 결정:** 강의 스타일의 해설 및 문제 풀이 영상, 개념 소개 그리고 자주 틀리는 문제 설명
   - **스케줄 수립:** 기획 → 촬영 → 편집 → 리뷰 → 배포까지의 전체 일정 수립
   - **리소스 준비:** 촬영 장비, 장소 섭외, 자료 준비
   - **콘텐츠 검토:** 각 콘텐츠의 내용 검토 및 피드백

3. **실행**
   - 팀원들에게 각각의 역할과 책임을 분담
   - 주기적인 회의를 통해 진행 상황 체크 및 피드백 제공

4. **후속 조치**
   - 학생들의 피드백을 받아 콘텐츠 개선
   - 추가 강의 콘텐츠 제작 및 업로드 계획

위와 같은 계획을 바탕으로 팀을 구성하고 본격적인 작업을 진행해보겠습니다. 추가 의견이나 디테일한 계획이 필요하시면 말씀해 주세요.

[[김윤하] /팀 수능 기출 분석하고 쇼츠 대본까지 협업해줘 @강하늘 함께 조사하고 정리해줘 @최현우 기획하고 구현까지 연계해서 해줘]
## Task Overview

The task involves analyzing Korean SAT (수능) test papers, creating a script for a short video, and collaborating with the team for implementation and integration. The following are the key roles for the task:

1. **김윤하 (Yoonha Kim)**: Analyze the test papers, identify key concepts, and develop them into a structured educational curriculum.
2. **강하늘 (Haneul Kang)**: Collaborate on research and organize findings.
3. **최현우 (Hyunwoo Choi)**: Plan and execute the implementation and integration process for the final output.

## Task Breakdown

### Step 1: Analyze SAT Korean Test Papers
- **Objective**: Identify, analyze and extrapolate primary test concepts to create a comprehensive knowledge graph.
- **Actions**:
  - Gather SAT Korean test papers.
  - Use analysis tools to extract significant patterns and logic.
  - Document findings and insights.

### Step 2: Collaborate and Organize Findings
- **Collaborators**: Yoonha Kim & Haneul Kang
- **Objective**: Synthesize research data and ensure accurate documentation.
- **Actions**:
  - Haneul will assist in gathering additional necessary data and resources.
  - Organize the extracted data logically and insightfully in collaboration with Haneul.

### Step 3: Create a Script for a Short Video
- **Objective**: Write a compelling, informative script for a short educational video.
- **Actions**:
  - Use insights from analysis to draft a script highlighting key findings.
  - Ensure the script is concise, informative, and engaging.

### Step 4: Plan and Execute Implementation
- **Leads**: Hyunwoo Choi
- **Objective**: Develop and deploy the final product or presentation.
- **Actions**:
  - Draft an action plan for video production and release.
  - Execute the sustainability and efficiency plan for the task's objectives.

## Deliverables

1. **Analysis Report**: A detailed report on SAT Korean Test Paper analysis.
2. **Short Video Script**: A well-structured script for the educational short video.
3. **Implementation Plan**: A comprehensive plan covering the production, execution, and roll-out of the video.

I'll begin the analysis process for the SAT Korean test papers, coordinating with 강하늘 (Haneul Kang) on research. 최현우 (Hyunwoo Choi) will manage the planning and execution phases thereafter.

For the implementation of the steps necessary, I may refer to some files or codes if required:



With this strategy in place, I'll initiate the first step and loop back for collaboration and script drafting. If there's any update or requirement, feel free to inform me.

Files modified: 1/1

[KnowledgeLearned: cross-agent-file-transfer.md@1fb28a1d]
# 에이전트 간 파일 이동

## 파일 이동 규칙

- **완료 전 금지 표현**: 
  - 파일의 복사나 이동이 실제로 완료되기 전까지 "저장했어요", "옮겼어요", "받았어요", "전달했어요" 같은 표현을 사용하지 말 것.
  - 지시 직후에는 "요청해볼게요", "진행할게요" 등 **예정** 표현 사용.

- **완료 시 경로 필수**: 
  - 복사 완료 시에는 반드시 저장된 경로를 포함하여 완료 사실을 보고해야 함.
  - 예시:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히 보고**: 
  - 파일을 찾지 못하거나 복사 실패 시에는 "완료"라고 말하지 않고, 문제가 발생한 이유와 다음 조치를 명확하게 안내.

- **허위 보고 금지**: 
  - 경로 없이 "옮겼다", "저장했다"고만 말하는 것은 금지됨. 경로 제공이 중요.

이 규칙은 에이전트 간 파일 이동의 투명성을 유지하고 효율성을 높이기 위한 조치입니다. 모든 에이전트는 이 절차를 철저히 준수해야 합니다.

[KnowledgeLearned: owner-data-path.md@42a9c0b0]
- **사장님 데이터 경로:**
  - 절대 경로: `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
  - 워크스페이스 기준: `company/owner`

- **주요 파일:**
  - `profile.json`: 사장님 프로필 (이름, 성격 등)
  - `persona.md`: 사장님 페르소나 (대화, 보고 시 참고)
  - `photo/`: 사장님 사진

- **유의사항:**
  - 에이전트는 사장님 관련 정보를 찾거나 저장할 때 반드시 지정된 경로를 사용해야 합니다.
  - 지정된 경로 이외의 위치를 추측하지 않습니다.

[KnowledgeLearned: project-playbook.md@d9344f8d]
# Project 도메인 검증 — 국어

[ProjectPlaybook v1]

## 국어 PDF 검증 태스크
- 학년도·영역·회차 메타 확인
- 누락·중복 체크
- 승인 시 마지막 줄에 FINISHED

[KnowledgeLearned: cross-agent-file-transfer.md@1552312c]
# 에이전트 간 파일 이동

## 핵심 규칙

- **완료 전 금지**  
  - 실제 파일 복사·이동이 끝나기 전에는 완료 표현 사용 금지.
  - 대체 표현: "요청해볼게요", "여쭤볼게요", "진행할게요" 등 예정 표현 사용.

- **완료 시 경로 필수**  
  - 복사가 완료되면 저장된 파일 경로를 전부 명시.
  - 경로 형식 예시 제공:
    ```
    📁 저장 경로:
    · 파일명.pdf
      /워크스페이스/agent/에이전트명_직책/outputs/downloads/from-한서준/파일명.pdf
    ```

- **실패 시 솔직히**  
  - 파일 찾기 실패나 복사 불가 시, "완료" 대신 상황 보고 및 후속 조치 안내.

- **허위 보고 금지**  
  - 경로 없이 "옮겼다", "저장했다"는 허위 보고 금지. 경로가 증거 역할을 함. 

이 규칙들은 파일 이동의 신뢰성과 효과성을 높이는 데 필수적입니다. 에이전트 간의 파일 이동에서 부정확한 정보를 줄여 업무의 효율성을 보장합니다.

[KnowledgeLearned: owner-data-path.md@1ed5b9c2]
# 사장님 데이터 경로 요약

## 데이터 위치

- **절대 경로:** `/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/owner`
- **워크스페이스 기준 경로:** `company/owner`

## 주요 파일 설명

- **프로필 파일**: `/profile.json`
  - 포함 정보: 이름, 성격 등
- **페르소나 파일**: `/persona.md`
  - 사용 시기: 대화 및 보고
- **사진 폴더**: `/photo/`
  - 포함 내용: 사장님 사진

## 경로 사용 지침

- 에이전트는 사장님 관련 정보를 **반드시 위 경로**를 통해 접근해야 하며, 다른 경로를 추측하지 않음.

이 경로 정보는 사장님 데이터에 접근할 때 항상 필요하며, 일관된 방식으로 사용되어야 합니다.

[KnowledgeLearned: project-playbook.md@f0527c20]
# Project 협업 플레이북

## AgentCompany Project 표준 절차 (필수)

사장님이 PM에게 업무를 지시하면 아래 **5단계**를 따릅니다.

### 1. 목표
- 사장님 지시에서 **한 문장 목표** + 산출물·범위·제외 항목을 명확히 합니다.

### 2. 계획
- Phase 단위로 나눕니다 (리서치 → 구현/실행 → 검증 → PM 보고).
- 각 태스크마다 **작업 → 검토 루프**(최대 5회, FINISHED 키워드)가 돌아갑니다.

### 3. 작업 분배
- 계획을 **번호 + @에이전트명: 할 일** 형식으로 작성합니다.
- 예: `1. @한서준: 공식 PDF 출처 URL 조사`

### 4. 에이전트 선별
- **실제 회사 에이전트 roster만** 사용 (가상 직함·외부 인력 금지).
- role·title·capabilities로 매칭 (리서치→researcher, 자동화→backend, 도메인→전문가).

### 5. 승인 후 Project 실행
- PM이 계획을 사장님께 제시하고 **"진행하세요"** 승인을 요청합니다.
- 승인 시: Project 채팅방 생성 → Projects 탭 등록 → 에이전트 순차 협업.
- 산출물: `company/projects/{sessionId}/` (tasks/, files/, PM_REPORT.md)
- 이전 태스크 산출물은 **carry_data**로 다음 태스크에 전달됩니다.

## PM 1:1 대화 출력 형식 (권장)

```
## 목표
(한 문장)

## 계획
P1 … / P2 … / P3 …

## 작업 분배
1. @에이전트명: 할 일
2. @에이전트명: 할 일

## 참여 에이전트
@박준호 · @한서준 · …

확정되시면 "진행하세요"라고 말씀해 주시면 Project를 시작합니다.
```


##

[KnowledgeLearned: suneung-pdf-download.md@400f0e7f]
# 수능 PDF 다운로드

[SuneungPdfPlaybook v1]

## 수능 PDF 다운로드 — 검증된 방법 (2026-06-08)

### 공식 출처 (A급)
- 사이트: https://www.suneung.re.kr
- 기출 목록: `boardCnts/list.do?boardID=1500234&m=0403&s=suneung`
- 모의평가: `boardCnts/list.do?boardID=1500236&m=0403&s=suneung`
- 다운로드: `boardCnts/fileDown.do?fileSeq={hex}`
- 로그인 불필요, curl/Python urllib로 직접 다운로드 가능

### 파일명 규칙
- `{학년도}학년도_{영역}영역_문제지.pdf`
- 예: 2026학년도_국어영역_문제지.pdf

### Project 산출물 경로
- `company/projects/{sessionId}/files/pdfs/대학수학능력시험/`
- `company/projects/{sessionId}/files/scripts/download_suneung_pdfs.py`

### 실행 예시
```bash
python3 company/projects/{sessionId}/files/scripts/download_suneung_pdfs.py \
  --out company/projects/{sessionId}/files/pdfs \
  --subjects 국어,수학 --years 2025,2026
```

### 검증된 fileSeq (2025·2026 국어·수학)
| 학년도 | 영역 | fileSeq |
|--------|------|---------|
| 2026 | 국어 | 60defdef6d83db1b756f841089563c5a |
| 2026 | 수학 | f9055b3484e917

[ExternalApiRegistry v2]
CEO 명령이 아래 API로 처리 가능하면 External API를 자동 호출합니다.
API 탭에서 추가·수정 시 이 목록이 자동 갱신됩니다.

1. **날씨예보** (id: 1780730812068-zzj5ynu)
   - URL: https://api.openweathermap.org/data/2.5
   - 설명: 날씨 관련 API
   - 인증: query-param (appid)
