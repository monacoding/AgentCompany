import * as vscode from 'vscode';

export interface VoiceShortcutConfig {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  code: string;
}

const GLOBAL_KEY = 'agentcompany.voiceShortcut';

export const BUILTIN_VOICE_SHORTCUT: VoiceShortcutConfig = {
  ctrl: false,
  alt: true,
  shift: false,
  meta: false,
  code: 'KeyV',
};

export class VoiceShortcutSettings {
  constructor(private readonly context: vscode.ExtensionContext) {}

  get(): VoiceShortcutConfig {
    const saved = this.context.globalState.get<VoiceShortcutConfig>(GLOBAL_KEY);
    if (saved?.code) return { ...saved };
    return { ...BUILTIN_VOICE_SHORTCUT };
  }

  hasCustom(): boolean {
    const saved = this.context.globalState.get<VoiceShortcutConfig>(GLOBAL_KEY);
    return Boolean(saved?.code);
  }

  async save(shortcut: VoiceShortcutConfig): Promise<VoiceShortcutConfig> {
    const normalized = {
      ctrl: !!shortcut.ctrl,
      alt: !!shortcut.alt,
      shift: !!shortcut.shift,
      meta: !!shortcut.meta,
      code: shortcut.code,
    };
    await this.context.globalState.update(GLOBAL_KEY, normalized);
    return normalized;
  }

  async clear(): Promise<VoiceShortcutConfig> {
    await this.context.globalState.update(GLOBAL_KEY, undefined);
    return { ...BUILTIN_VOICE_SHORTCUT };
  }
}
