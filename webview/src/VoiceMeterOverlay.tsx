import { createPortal } from 'react-dom';
import { VoiceMeterPanel } from './VoiceMeterPanel';
import { VOICE_INPUT_MODES } from './voice-input-modes';
import type { useVoiceInput } from './use-voice-input';

type VoiceApi = ReturnType<typeof useVoiceInput>;

interface VoiceMeterOverlayProps {
  voice: VoiceApi;
}

export function VoiceMeterOverlay({ voice }: VoiceMeterOverlayProps) {
  const modeOption = VOICE_INPUT_MODES.find((m) => m.id === voice.mode) ?? VOICE_INPUT_MODES[0];

  if (!voice.panelOpen && !voice.isProcessing) {
    if (!voice.error) return null;
    return (
      <p className={`ceo-voice-status error ${voice.isRecording ? 'recording' : ''}`}>{voice.error}</p>
    );
  }

  return createPortal(
    <div className="voice-meter-popup-layer" role="dialog" aria-label="마이크 입력">
      <VoiceMeterPanel
        open={voice.panelOpen}
        mode={modeOption}
        level={voice.level}
        decibels={voice.decibels}
        bars={voice.bars}
        interimText={voice.interimText}
        isProcessing={voice.isProcessing}
        error={voice.error}
        onStop={voice.pressEnd}
      />
    </div>,
    document.body
  );
}
