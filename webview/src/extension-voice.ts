import { postMessage } from './vscode';

const BAR_COUNT = 14;

export function isExtensionVoiceContext(): boolean {
  return typeof window.acquireVsCodeApi === 'function';
}

export function barsFromLevel(level: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const wave = Math.sin((Date.now() / 120 + i) * 0.9) * 0.18 + 0.82;
    return Math.max(6, Math.min(100, level * wave * (0.75 + (i % 5) * 0.05)));
  });
}

export function startExtensionVoiceCapture(sessionId: string, deviceId: string): void {
  postMessage('startVoiceCapture', { sessionId, deviceId });
}

export function stopExtensionVoiceCapture(sessionId: string): void {
  postMessage('stopVoiceCapture', { sessionId });
}

export function listExtensionVoiceDevices(requestId: string): void {
  postMessage('listVoiceDevices', { requestId });
}

export function openExtensionMicrophoneSettings(): void {
  postMessage('openMicrophoneSettings');
}
