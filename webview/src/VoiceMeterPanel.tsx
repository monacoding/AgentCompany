import type { VoiceInputModeOption } from './voice-input-modes';

interface VoiceMeterPanelProps {
  open: boolean;
  mode: VoiceInputModeOption;
  level: number;
  decibels: number;
  bars: number[];
  interimText: string;
  isProcessing: boolean;
  error: string | null;
  onStop: () => void;
}

export function VoiceMeterPanel({
  open,
  mode,
  level,
  decibels,
  bars,
  interimText,
  isProcessing,
  error,
  onStop,
}: VoiceMeterPanelProps) {
  if (!open && !isProcessing) return null;

  const dbLabel = decibels <= -55 ? '조용함' : decibels <= -35 ? '보통' : '큼';
  const active = level > 8;

  return (
    <div className={`voice-meter-panel ${isProcessing ? 'processing' : active ? 'active' : ''}`}>
      <div className="voice-meter-header">
        <span className="voice-meter-title">
          {isProcessing ? '음성 인식 중…' : `🎤 ${mode.label}`}
        </span>
        {!isProcessing && (
          <button type="button" className="voice-meter-stop" onClick={onStop}>
            중지
          </button>
        )}
      </div>

      <div className="voice-meter-body">
        <div className="voice-meter-bars" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="voice-meter-bar"
              style={{ height: `${Math.max(8, Math.min(100, h))}%` }}
            />
          ))}
        </div>

        <div className="voice-meter-stats">
          <div className="voice-meter-level-track">
            <div className="voice-meter-level-fill" style={{ width: `${level}%` }} />
          </div>
          <span className="voice-meter-db">
            {isProcessing ? '…' : `${decibels.toFixed(0)} dB · ${dbLabel}`}
          </span>
        </div>
      </div>

      <p className="voice-meter-hint">{mode.hint}</p>

      {(interimText || isProcessing) && (
        <p className="voice-meter-transcript">{interimText || '말씀해 주세요…'}</p>
      )}

      {error && <p className="voice-meter-error">{error}</p>}
    </div>
  );
}
