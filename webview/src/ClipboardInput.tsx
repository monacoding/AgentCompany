import { useRef } from 'react';
import { insertAtSelection, readClipboardFromExtension } from './clipboard-bridge';

interface ClipboardInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  pasteLabel?: string;
}

/** VS Code/Cursor webview에서 Cmd+V 붙여넣기가 막힐 때 확장 클립보드 API 사용 */
export function ClipboardInput({
  value,
  onValueChange,
  pasteLabel = '붙여넣기',
  className,
  ...props
}: ClipboardInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  const applyPaste = async () => {
    const text = (await readClipboardFromExtension()).trim();
    if (!text) return;

    const el = ref.current;
    if (!el) {
      onValueChange(text);
      return;
    }

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? start;
    const { value: next, cursor } = insertAtSelection(value, text, start, end);
    onValueChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      await applyPaste();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const native = e.clipboardData.getData('text');
    if (native) return;
    e.preventDefault();
    await applyPaste();
  };

  return (
    <div className="clipboard-input-row">
      <input
        {...props}
        ref={ref}
        className={className ? `${className} clipboard-input-field` : 'clipboard-input-field'}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
      <button type="button" className="btn-sm btn-paste" onClick={() => void applyPaste()} title={pasteLabel}>
        📋
      </button>
    </div>
  );
}
