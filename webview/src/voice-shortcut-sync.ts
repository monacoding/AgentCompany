import { hydrateVoiceShortcut } from './voice-shortcut';

let bootstrapped = false;

export function bootstrapVoiceShortcutSync(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  window.addEventListener('message', (event) => {
    if (event.data?.type !== 'voiceShortcutUpdated') return;
    hydrateVoiceShortcut(event.data.payload);
  });
}
