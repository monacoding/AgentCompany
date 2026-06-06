import * as vscode from 'vscode';
import { AgentCompanyService } from '../services';
import { VoiceShortcutConfig } from '../services/voice-shortcut-settings';
import { openMicrophonePrivacySettings } from '../services/voice-capture';
import { broadcastVoiceShortcut } from './voice-webview-registry';

export async function handleVoiceWebviewMessage(
  message: { type: string; payload?: Record<string, unknown> },
  webview: vscode.Webview,
  service: AgentCompanyService
): Promise<boolean> {
  switch (message.type) {
    case 'saveVoiceShortcut': {
      const shortcut = message.payload as VoiceShortcutConfig;
      const saved = await service.saveVoiceShortcut(shortcut);
      broadcastVoiceShortcut(saved);
      return true;
    }
    case 'clearVoiceShortcut': {
      const builtin = await service.clearVoiceShortcut();
      broadcastVoiceShortcut(builtin);
      return true;
    }
    case 'listVoiceDevices': {
      const { requestId } = (message.payload ?? {}) as { requestId?: string };
      try {
        const devices = await service.listVoiceDevices();
        webview.postMessage({
          type: 'voiceDevicesResult',
          payload: { requestId, devices },
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        webview.postMessage({
          type: 'voiceDevicesResult',
          payload: { requestId, error: errMsg, devices: [] },
        });
      }
      return true;
    }
    case 'startVoiceCapture': {
      const { sessionId, deviceId } = message.payload as { sessionId: string; deviceId?: string };
      try {
        const available = await service.isVoiceCaptureAvailable();
        if (!available) {
          throw new Error(
            'ffmpeg가 필요해요. 터미널에서 `brew install ffmpeg` 실행 후 다시 시도해 주세요.'
          );
        }
        service.startVoiceCapture(
          sessionId,
          deviceId ?? '0',
          (level) => {
            webview.postMessage({
              type: 'voiceCaptureLevel',
              payload: { sessionId, ...level },
            });
          },
          (text) => {
            webview.postMessage({
              type: 'voicePartialTranscript',
              payload: { sessionId, text },
            });
          }
        );
        webview.postMessage({
          type: 'voiceCaptureStarted',
          payload: { sessionId },
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        webview.postMessage({
          type: 'voiceCaptureError',
          payload: { sessionId, error: errMsg },
        });
      }
      return true;
    }
    case 'stopVoiceCapture': {
      const { sessionId } = message.payload as { sessionId: string };
      try {
        const result = service.stopVoiceCapture();
        if (result.sessionId !== sessionId) {
          throw new Error('녹음 세션이 일치하지 않아요.');
        }
        webview.postMessage({
          type: 'voiceCaptureStopped',
          payload: result,
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        service.cancelVoiceCapture();
        webview.postMessage({
          type: 'voiceCaptureError',
          payload: { sessionId, error: errMsg },
        });
      }
      return true;
    }
    case 'cancelVoiceCapture': {
      service.cancelVoiceCapture();
      return true;
    }
    case 'openMicrophoneSettings': {
      try {
        await openMicrophonePrivacySettings();
        service.notifications.showInfo(
          '시스템 설정에서 Cursor의 마이크 접근을 켜 주세요. 변경 후 Reload Window 하세요.'
        );
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        service.notifications.showWarning(errMsg);
      }
      return true;
    }
    default:
      return false;
  }
}
