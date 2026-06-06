import { useCallback, useEffect, useState } from 'react';
import { listExtensionVoiceDevices, openExtensionMicrophoneSettings } from './extension-voice';
import {
  loadVoiceDeviceId,
  loadVoiceEngine,
  loadVoiceMode,
  saveVoiceDeviceId,
  saveVoiceEngine,
  saveVoiceMode,
  VOICE_ENGINES,
  VOICE_INPUT_MODES,
  type VoiceEngine,
  type VoiceInputMode,
} from './voice-input-modes';
import {
  captureShortcutFromEvent,
  clearVoiceShortcut,
  defaultVoiceShortcut,
  formatVoiceShortcut,
  loadVoiceShortcut,
  saveVoiceShortcut,
  VOICE_SHORTCUT_EVENT,
  type VoiceShortcut,
} from './voice-shortcut';

interface MicDeviceOption {
  deviceId: string;
  label: string;
}

export function VoiceSettingsSection() {
  const [mode, setMode] = useState<VoiceInputMode>(loadVoiceMode);
  const [engine, setEngine] = useState<VoiceEngine>(loadVoiceEngine);
  const [deviceId, setDeviceId] = useState(loadVoiceDeviceId);
  const [devices, setDevices] = useState<MicDeviceOption[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState<VoiceShortcut>(loadVoiceShortcut);
  const [capturingShortcut, setCapturingShortcut] = useState(false);
  const [shortcutSaved, setShortcutSaved] = useState(false);

  const refreshDevices = useCallback(() => {
    const requestId = crypto.randomUUID();
    setDeviceStatus('마이크 목록 불러오는 중…');

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'voiceDevicesResult') return;
      const payload = event.data.payload as {
        requestId?: string;
        devices?: Array<{ id: string; label: string }>;
        error?: string;
      };
      if (payload.requestId !== requestId) return;
      window.removeEventListener('message', handler);

      const next = (payload.devices ?? []).map((d) => ({
        deviceId: d.id,
        label: d.label,
      }));
      setDevices(next);
      setDeviceStatus(
        payload.error ? payload.error : next.length ? null : '연결된 마이크가 없어요.'
      );
    };

    window.addEventListener('message', handler);
    listExtensionVoiceDevices(requestId);
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  useEffect(() => {
    const sync = () => setShortcut(loadVoiceShortcut());
    window.addEventListener(VOICE_SHORTCUT_EVENT, sync);
    return () => window.removeEventListener(VOICE_SHORTCUT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!shortcutSaved) return;
    const timer = window.setTimeout(() => setShortcutSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [shortcutSaved]);

  useEffect(() => {
    if (!capturingShortcut) return;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setCapturingShortcut(false);
        return;
      }

      const captured = captureShortcutFromEvent(event);
      if (!captured) return;

      saveVoiceShortcut(captured);
      setShortcut(captured);
      setCapturingShortcut(false);
      setShortcutSaved(true);
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [capturingShortcut]);

  const modeHint = VOICE_INPUT_MODES.find((m) => m.id === mode)?.hint ?? '';
  const engineHint = VOICE_ENGINES.find((e) => e.id === engine)?.hint ?? '';

  return (
    <section className="settings-section">
      <h3>마이크 / 음성 입력</h3>
      <div className="form-panel">
        <p className="panel-hint">
          Cursor 웹뷰는 브라우저 마이크를 직접 쓸 수 없어요. AgentCompany가 Cursor 앱(ffmpeg)으로
          녹음합니다.
        </p>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={openExtensionMicrophoneSettings}>
            마이크 권한 설정 열기
          </button>
          <button type="button" className="btn-sm" onClick={refreshDevices}>
            목록 새로고침
          </button>
        </div>

        <label className="field-label">입력 마이크</label>
        <select value={deviceId} onChange={(e) => {
          setDeviceId(e.target.value);
          saveVoiceDeviceId(e.target.value);
        }}>
          <option value="">시스템 기본 마이크</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
        {deviceStatus && <p className="panel-hint">{deviceStatus}</p>}

        <label className="field-label">마이크 단축키 (누르고 있는 동안만 녹음)</label>
        <div className="voice-shortcut-row">
          <div className={`voice-shortcut-display ${capturingShortcut ? 'capturing' : ''}`}>
            {capturingShortcut ? '키를 눌러 주세요… (Esc 취소)' : formatVoiceShortcut(shortcut)}
          </div>
          <button
            type="button"
            className="btn-sm"
            onClick={() => setCapturingShortcut(true)}
            disabled={capturingShortcut}
          >
            단축키 설정
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={() => {
              clearVoiceShortcut();
              setShortcut(defaultVoiceShortcut());
              setShortcutSaved(true);
            }}
            disabled={capturingShortcut}
          >
            지우기
          </button>
        </div>
        {shortcutSaved && <p className="panel-hint voice-shortcut-saved">단축키가 저장되었어요.</p>}
        <p className="panel-hint">
          채팅창·대시보드가 열려 있을 때 단축키를 누르고 있는 동안 마이크가 켜집니다. 기본값: ⌥+V (전송은
          Enter)
        </p>

        <label className="field-label">마이크 입력 방식</label>
        <select value={mode} onChange={(e) => {
          const next = e.target.value as VoiceInputMode;
          setMode(next);
          saveVoiceMode(next);
        }}>
          {VOICE_INPUT_MODES.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="panel-hint">{modeHint}</p>

        <label className="field-label">음성 인식 방식</label>
        <select value={engine} onChange={(e) => {
          const next = e.target.value as VoiceEngine;
          setEngine(next);
          saveVoiceEngine(next);
        }}>
          {VOICE_ENGINES.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="panel-hint">{engineHint}</p>
        <p className="panel-hint">Cursor 환경에서는 Whisper 인식을 권장합니다.</p>
      </div>
    </section>
  );
}
