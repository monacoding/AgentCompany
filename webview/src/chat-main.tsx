import { createRoot } from 'react-dom/client';
import { CeoChatWindow } from './CeoChatWindow';
import { AgentChatThreadConfig } from './vscode';
import { bootstrapVoiceShortcutSync } from './voice-shortcut-sync';
import './styles.css';
import './chat-window.css';

bootstrapVoiceShortcutSync();

declare global {
  interface Window {
    __AGENT_CHAT__?: AgentChatThreadConfig;
  }
}

const threadConfig: AgentChatThreadConfig = window.__AGENT_CHAT__ ?? {
  threadId: '',
  agentName: 'CEO Command',
};

createRoot(document.getElementById('root')!).render(<CeoChatWindow threadConfig={threadConfig} />);
