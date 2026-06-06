import { postMessage } from './vscode';

const pending = new Map<string, (text: string) => void>();
let initialized = false;

export function initClipboardBridge(): void {
  if (initialized) return;
  initialized = true;

  window.addEventListener('message', (event) => {
    if (event.data.type !== 'clipboardText') return;
    const { requestId, text } = event.data.payload as { requestId: string; text: string };
    pending.get(requestId)?.(text ?? '');
    pending.delete(requestId);
  });
}

export function readClipboardFromExtension(): Promise<string> {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return new Promise((resolve) => {
    pending.set(requestId, resolve);
    postMessage('readClipboard', { requestId });
    window.setTimeout(() => {
      if (pending.has(requestId)) {
        pending.delete(requestId);
        resolve('');
      }
    }, 5000);
  });
}

export function insertAtSelection(
  current: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number
): { value: string; cursor: number } {
  const next = `${current.slice(0, selectionStart)}${insertion}${current.slice(selectionEnd)}`;
  return { value: next, cursor: selectionStart + insertion.length };
}
