export type VoiceInputMode = 'append' | 'send' | 'file-delivery' | 'follow-up';

export type VoiceEngine = 'auto' | 'browser' | 'whisper';

export interface VoiceInputModeOption {
  id: VoiceInputMode;
  label: string;
  hint: string;
}

export interface VoiceEngineOption {
  id: VoiceEngine;
  label: string;
  hint: string;
}

export const VOICE_INPUT_MODES: VoiceInputModeOption[] = [
  { id: 'append', label: '지시 입력', hint: '음성을 인식해 입력창에 넣습니다' },
  { id: 'send', label: '바로 전송', hint: '인식이 끝나면 즉시 명령을 전송합니다' },
  { id: 'file-delivery', label: '파일 전달 지시', hint: '파일 찾기·전달 요청에 맞게 인식합니다' },
  { id: 'follow-up', label: '후속 말하기', hint: '이전 대화 맥락에 이어지는 짧은 지시' },
];

export const VOICE_ENGINES: VoiceEngineOption[] = [
  { id: 'auto', label: '자동', hint: '브라우저 인식 → 실패 시 Whisper' },
  { id: 'browser', label: '브라우저 인식', hint: '빠른 실시간 인식 (가능한 환경)' },
  { id: 'whisper', label: 'Whisper (OpenAI)', hint: '정확한 한국어 인식 (API 사용)' },
];

export const VOICE_SETTINGS_EVENT = 'agentcompany:voice-settings-changed';

const MODE_STORAGE_KEY = 'agentcompany.voiceInputMode';
const ENGINE_STORAGE_KEY = 'agentcompany.voiceEngine';
const DEVICE_STORAGE_KEY = 'agentcompany.voiceInputDevice';

export function applyVoiceModeText(mode: VoiceInputMode, text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  switch (mode) {
    case 'file-delivery':
      if (/파일|pdf|전달|폴더|가져|줘|줄래/i.test(trimmed)) return trimmed;
      return `${trimmed} 파일 전달해줘`;
    default:
      return trimmed;
  }
}

export function notifyVoiceSettingsChanged(): void {
  window.dispatchEvent(new CustomEvent(VOICE_SETTINGS_EVENT));
}

export function loadVoiceMode(): VoiceInputMode {
  try {
    const raw = localStorage.getItem(MODE_STORAGE_KEY);
    if (VOICE_INPUT_MODES.some((m) => m.id === raw)) return raw as VoiceInputMode;
  } catch {
    /* ignore */
  }
  return 'append';
}

export function saveVoiceMode(mode: VoiceInputMode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  notifyVoiceSettingsChanged();
}

export function loadVoiceEngine(): VoiceEngine {
  try {
    const raw = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (VOICE_ENGINES.some((e) => e.id === raw)) return raw as VoiceEngine;
  } catch {
    /* ignore */
  }
  return 'auto';
}

export function saveVoiceEngine(engine: VoiceEngine): void {
  try {
    localStorage.setItem(ENGINE_STORAGE_KEY, engine);
  } catch {
    /* ignore */
  }
  notifyVoiceSettingsChanged();
}

export function loadVoiceDeviceId(): string {
  try {
    return localStorage.getItem(DEVICE_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveVoiceDeviceId(deviceId: string): void {
  try {
    if (deviceId) localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    else localStorage.removeItem(DEVICE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  notifyVoiceSettingsChanged();
}
