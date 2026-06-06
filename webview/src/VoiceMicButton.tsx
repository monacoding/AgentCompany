import { MicIcon } from './chat-shared';
import { VOICE_INPUT_MODES } from './voice-input-modes';
import type { useVoiceInput } from './use-voice-input';

type VoiceApi = ReturnType<typeof useVoiceInput>;

interface VoiceMicButtonProps {
  voice: VoiceApi;
  disabled?: boolean;
}

export function VoiceMicButton({ voice, disabled }: VoiceMicButtonProps) {
  const modeLabel = VOICE_INPUT_MODES.find((m) => m.id === voice.mode)?.label ?? '마이크';

  return (
    <button
      className={`btn-mic ${voice.isRecording ? 'recording' : ''}`}
      type="button"
      disabled={voice.isProcessing || disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        voice.pressStart();
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        voice.pressEnd();
      }}
      onMouseLeave={() => voice.pressEnd()}
      onTouchStart={(e) => {
        e.preventDefault();
        voice.pressStart();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        voice.pressEnd();
      }}
      onContextMenu={(e) => e.preventDefault()}
      title={
        voice.isRecording
          ? '누르고 있는 동안만 녹음 (떼면 종료)'
          : `${modeLabel} — 버튼을 누르고 말하기`
      }
      aria-pressed={voice.isRecording}
    >
      <MicIcon active={voice.isRecording} />
    </button>
  );
}
