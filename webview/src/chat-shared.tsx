import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Agent, postMessage } from './vscode';
import { useVoiceInput } from './use-voice-input';
import { useVoicePttShortcut } from './use-voice-ptt-shortcut';

export interface MentionState {
  query: string;
  atIndex: number;
}

/** IME 조합 중/직후 Enter로 잔여 글자("아" 등)가 별도 명령으로 전송되는 것 방지 */
const IME_LEFTOVER_MS = 200;
const MIN_COMMAND_LENGTH = 3;

export function isLikelyImeLeftover(command: string): boolean {
  const trimmed = command.trim();
  if (!trimmed || trimmed.includes('@')) return false;
  return trimmed.length < MIN_COMMAND_LENGTH;
}

export function useCeoCommandInput(agents: Agent[], threadId?: string) {
  const [value, setValue] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);
  const discardImeLeftoverUntilRef = useRef(0);

  const mention = useMemo(
    () => (value.includes('@') ? parseMention(value, agents) : null),
    [value, agents]
  );

  const filteredAgents = useMemo(
    () => (mention ? filterAgents(agents, mention.query) : []),
    [mention, agents]
  );

  const showDropdown = mention !== null && agents.length > 0;

  useEffect(() => {
    setHighlight(0);
  }, [mention?.query]);

  const selectAgent = useCallback(
    (agent: Agent) => {
      if (!mention) return;
      const before = value.slice(0, mention.atIndex);
      const after = value.slice(mention.atIndex + 1 + mention.query.length);
      const next = `${before}@${agent.name} ${after}`;
      const nextCursor = before.length + agent.name.length + 2;
      setValue(next);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [mention, value]
  );

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const canAcceptCommand = useCallback(
    (command: string): boolean => {
      const trimmed = command.trim();
      if (!trimmed) return false;
      if (Date.now() < discardImeLeftoverUntilRef.current && isLikelyImeLeftover(trimmed)) {
        return false;
      }
      if (threadId || trimmed.includes('@')) return true;
      return trimmed.length >= MIN_COMMAND_LENGTH;
    },
    [threadId]
  );

  const handleChange = useCallback((next: string) => {
    if (Date.now() < discardImeLeftoverUntilRef.current && isLikelyImeLeftover(next)) {
      valueRef.current = '';
      setValue('');
      return;
    }
    valueRef.current = next;
    setValue(next);
  }, []);

  const sendCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim();
      if (!canAcceptCommand(trimmed)) return;
      postMessage('executeCommand', { command: trimmed, threadId });
      valueRef.current = '';
      setValue('');
      discardImeLeftoverUntilRef.current = Date.now() + IME_LEFTOVER_MS;
      isComposingRef.current = false;
    },
    [canAcceptCommand, threadId]
  );

  const voice = useVoiceInput({
    getInputBase: () => valueRef.current,
    onInterimTranscript: (interim) => {
      const base = valueRef.current.trim();
      const next = interim.trim();
      const merged = next ? (base ? `${base} ${next}` : next) : valueRef.current;
      valueRef.current = merged;
      setValue(merged);
    },
    onTranscript: (text) => {
      valueRef.current = text;
      setValue(text);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        const len = inputRef.current?.value.length ?? 0;
        inputRef.current?.setSelectionRange(len, len);
      });
    },
    onSendNow: sendCommand,
  });

  useVoicePttShortcut(voice);

  const send = useCallback(() => {
    sendCommand(valueRef.current);
  }, [sendCommand]);

  const canSend = Boolean(value.trim()) && !voice.isRecording && !voice.isProcessing;

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (showDropdown && filteredAgents.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlight((i) => Math.min(i + 1, filteredAgents.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlight((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          if (e.nativeEvent.isComposing || isComposingRef.current || e.keyCode === 229) {
            return;
          }
          e.preventDefault();
          selectAgent(filteredAgents[highlight]);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setValue('');
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (e.nativeEvent.isComposing || isComposingRef.current || e.keyCode === 229) {
          return;
        }
        e.preventDefault();
        send();
      }
    },
    [showDropdown, filteredAgents, highlight, selectAgent, send]
  );

  return {
    value,
    setValue,
    handleChange,
    send,
    canSend,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    inputRef,
    mention,
    filteredAgents,
    showDropdown,
    highlight,
    setHighlight,
    selectAgent,
    voice,
  };
}

export function parseMention(value: string, agents: Agent[]): MentionState | null {
  if (!value.startsWith('@')) return null;

  const rest = value.slice(1);
  if (rest.length === 0) return { query: '', atIndex: 0 };

  for (const agent of agents) {
    if (rest.startsWith(`${agent.name} `)) return null;
  }

  const spaceIdx = rest.indexOf(' ');
  if (spaceIdx !== -1) {
    const namePart = rest.slice(0, spaceIdx);
    const exactMatch = agents.some((a) => a.name.toLowerCase() === namePart.toLowerCase());
    if (exactMatch) return null;

    const multiWordTyping = agents.some(
      (a) =>
        a.name.includes(' ') &&
        a.name.toLowerCase().startsWith(rest.toLowerCase()) &&
        rest.length <= a.name.length
    );
    if (multiWordTyping) return { query: rest, atIndex: 0 };

    return { query: namePart, atIndex: 0 };
  }

  return { query: rest, atIndex: 0 };
}

export function filterAgents(agents: Agent[], query: string): Agent[] {
  const q = query.toLowerCase().trim();
  if (!q) return agents;

  return agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.name.toLowerCase().startsWith(q)
  );
}

export function MicIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.25 : 0}
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 11L21 3L13 21L11 13L3 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}
