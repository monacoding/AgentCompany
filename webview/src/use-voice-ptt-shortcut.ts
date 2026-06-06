import { useEffect, useRef } from 'react';
import {
  isShortcutReleaseKey,
  loadVoiceShortcut,
  matchesVoiceShortcut,
  VOICE_SHORTCUT_EVENT,
  type VoiceShortcut,
} from './voice-shortcut';
import type { useVoiceInput } from './use-voice-input';

type VoiceApi = Pick<
  ReturnType<typeof useVoiceInput>,
  'pressStart' | 'pressEnd' | 'isRecording' | 'isProcessing'
>;

export function useVoicePttShortcut(voice: VoiceApi, enabled = true): void {
  const shortcutRef = useRef<VoiceShortcut>(loadVoiceShortcut());
  const activeRef = useRef(false);
  const voiceRef = useRef(voice);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  useEffect(() => {
    const sync = () => {
      shortcutRef.current = loadVoiceShortcut();
    };
    window.addEventListener(VOICE_SHORTCUT_EVENT, sync);
    return () => window.removeEventListener(VOICE_SHORTCUT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcutRef.current;
      if (!shortcut.code || voiceRef.current.isProcessing) return;
      if (!matchesVoiceShortcut(event, shortcut)) return;

      event.preventDefault();
      event.stopPropagation();

      if (!activeRef.current && !voiceRef.current.isRecording) {
        activeRef.current = true;
        voiceRef.current.pressStart();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!activeRef.current && !voiceRef.current.isRecording) return;
      const shortcut = shortcutRef.current;
      if (!isShortcutReleaseKey(event, shortcut)) return;

      event.preventDefault();
      event.stopPropagation();
      activeRef.current = false;
      voiceRef.current.pressEnd();
    };

    const onBlur = () => {
      if (!activeRef.current && !voiceRef.current.isRecording) return;
      activeRef.current = false;
      voiceRef.current.pressEnd();
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled]);
}
