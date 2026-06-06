import * as vscode from 'vscode';
import { VoiceShortcutConfig } from '../services/voice-shortcut-settings';

const webviews = new Set<vscode.Webview>();

export function registerVoiceWebview(webview: vscode.Webview): () => void {
  webviews.add(webview);
  return () => {
    webviews.delete(webview);
  };
}

export function pushVoiceShortcutToWebview(
  webview: vscode.Webview,
  shortcut: VoiceShortcutConfig
): void {
  webview.postMessage({
    type: 'voiceShortcutUpdated',
    payload: shortcut,
  });
}

export function broadcastVoiceShortcut(shortcut: VoiceShortcutConfig): void {
  const message = { type: 'voiceShortcutUpdated', payload: shortcut };
  for (const webview of webviews) {
    webview.postMessage(message);
  }
}
