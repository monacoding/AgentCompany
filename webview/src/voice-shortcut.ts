import { postMessage } from './vscode';

export interface VoiceShortcut {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  code: string;
}

const STORAGE_KEY = 'agentcompany.voiceShortcut';

export const VOICE_SHORTCUT_EVENT = 'agentcompany:voice-shortcut-changed';

const CODE_LABELS: Record<string, string> = {
  Space: 'Space',
  Enter: 'Enter',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Escape: 'Esc',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
};

let cachedShortcut: VoiceShortcut | null = null;

export function defaultVoiceShortcut(): VoiceShortcut {
  return { ctrl: false, alt: true, shift: false, meta: false, code: 'KeyV' };
}

function loadVoiceShortcutFromLocal(): VoiceShortcut {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultVoiceShortcut();
    const parsed = JSON.parse(raw) as Partial<VoiceShortcut>;
    if (!parsed.code) return defaultVoiceShortcut();
    return {
      ctrl: !!parsed.ctrl,
      alt: !!parsed.alt,
      shift: !!parsed.shift,
      meta: !!parsed.meta,
      code: parsed.code,
    };
  } catch {
    return defaultVoiceShortcut();
  }
}

function normalizeShortcut(shortcut: Partial<VoiceShortcut> | null | undefined): VoiceShortcut {
  if (!shortcut?.code) return defaultVoiceShortcut();
  return {
    ctrl: !!shortcut.ctrl,
    alt: !!shortcut.alt,
    shift: !!shortcut.shift,
    meta: !!shortcut.meta,
    code: shortcut.code,
  };
}

function persistVoiceShortcutLocal(shortcut: VoiceShortcut): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcut));
  } catch {
    /* ignore */
  }
}

export function hydrateVoiceShortcut(shortcut: Partial<VoiceShortcut> | null | undefined): void {
  cachedShortcut = normalizeShortcut(shortcut);
  persistVoiceShortcutLocal(cachedShortcut);
  window.dispatchEvent(new CustomEvent(VOICE_SHORTCUT_EVENT));
}

export function loadVoiceShortcut(): VoiceShortcut {
  if (cachedShortcut) return cachedShortcut;
  cachedShortcut = loadVoiceShortcutFromLocal();
  return cachedShortcut;
}

export function saveVoiceShortcut(shortcut: VoiceShortcut): void {
  const normalized = normalizeShortcut(shortcut);
  hydrateVoiceShortcut(normalized);
  postMessage('saveVoiceShortcut', normalized);
}

export function clearVoiceShortcut(): void {
  const builtin = defaultVoiceShortcut();
  hydrateVoiceShortcut(builtin);
  postMessage('clearVoiceShortcut');
}

function formatKeyCode(code: string): string {
  if (CODE_LABELS[code]) return CODE_LABELS[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `Num${code.slice(6)}`;
  return code;
}

export function formatVoiceShortcut(shortcut: VoiceShortcut | null): string {
  if (!shortcut?.code) return '설정 안 됨';
  const parts: string[] = [];
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('⌥');
  if (shortcut.shift) parts.push('⇧');
  parts.push(formatKeyCode(shortcut.code));
  return parts.join('+');
}

export function captureShortcutFromEvent(event: KeyboardEvent): VoiceShortcut | null {
  if (event.key === 'Escape') return null;
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return null;

  return {
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
    code: event.code,
  };
}

export function matchesVoiceShortcut(event: KeyboardEvent, shortcut: VoiceShortcut): boolean {
  if (!shortcut.code) return false;
  return (
    event.code === shortcut.code &&
    event.ctrlKey === shortcut.ctrl &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift &&
    event.metaKey === shortcut.meta
  );
}

export function isShortcutReleaseKey(event: KeyboardEvent, shortcut: VoiceShortcut): boolean {
  if (!shortcut.code) return false;
  if (event.code === shortcut.code) return true;
  if (shortcut.ctrl && (event.key === 'Control' || event.code === 'ControlLeft' || event.code === 'ControlRight')) {
    return true;
  }
  if (shortcut.alt && (event.key === 'Alt' || event.code === 'AltLeft' || event.code === 'AltRight')) {
    return true;
  }
  if (shortcut.shift && (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight')) {
    return true;
  }
  if (shortcut.meta && (event.key === 'Meta' || event.code === 'MetaLeft' || event.code === 'MetaRight')) {
    return true;
  }
  return false;
}
