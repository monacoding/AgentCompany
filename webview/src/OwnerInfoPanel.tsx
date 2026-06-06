import { useCallback, useEffect, useState } from 'react';
import { OwnerInfo, postMessage } from './vscode';

const OWNER_EMOTIONS = ['기쁨', '슬픔', '화남', '놀람', '걱정', '기본'] as const;

interface OwnerInfoModalProps {
  info: OwnerInfo;
  emotionPhotos?: Record<string, string>;
  profilePhotoUrl?: string;
  onClose: () => void;
}

const EMPTY_FORM = (): Omit<OwnerInfo, 'updatedAt'> => ({
  name: '',
  personality: '',
  tendency: '',
  orientation: '',
});

export function OwnerInfoModal({
  info,
  emotionPhotos,
  profilePhotoUrl,
  onClose,
}: OwnerInfoModalProps) {
  const [form, setForm] = useState(EMPTY_FORM());
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    setForm({
      name: info.name ?? '',
      personality: info.personality ?? '',
      tendency: info.tendency ?? '',
      orientation: info.orientation ?? '',
    });
    setSavedAt(info.updatedAt ?? '');
  }, [info]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'ownerInfoSaved') {
        setSaving(false);
        const saved = event.data.payload as OwnerInfo;
        setSavedAt(saved.updatedAt);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const update = useCallback((patch: Partial<Omit<OwnerInfo, 'updatedAt'>>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = () => {
    setSaving(true);
    postMessage('saveOwnerInfo', form);
  };

  const formatSaved = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel company-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>사장님 정보</h2>
          <button type="button" className="btn-icon modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body company-modal-body">
          <div className="owner-photo-section">
            <span className="company-field-label">프로필 사진</span>
            <div className="company-logo-row">
              <div className="company-logo-preview">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="사장님 프로필" className="company-logo-img" />
                ) : (
                  <span className="company-logo-placeholder">👤</span>
                )}
              </div>
              <div className="company-logo-actions">
                <button type="button" className="btn-sm" onClick={() => postMessage('pickOwnerPhoto', { emotion: '기본' })}>
                  프로필 선택
                </button>
              </div>
            </div>

            <div className="owner-photo-grid">
              {OWNER_EMOTIONS.map((emotion) => (
                <div key={emotion} className="owner-photo-card">
                  <div className="owner-photo-preview">
                    {emotionPhotos?.[emotion] ? (
                      <img src={emotionPhotos[emotion]} alt={`${emotion} 표정`} className="owner-photo-img" />
                    ) : (
                      <span className="owner-photo-placeholder">🙂</span>
                    )}
                  </div>
                  <span className="owner-photo-label">{emotion}</span>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => postMessage('pickOwnerPhoto', { emotion })}
                  >
                    선택
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="company-field">
            <span>이름 (호칭)</span>
            <input
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="예: 사장님"
            />
          </label>

          <label className="company-field">
            <span>성격</span>
            <textarea
              rows={3}
              value={form.personality}
              onChange={(e) => update({ personality: e.target.value })}
              placeholder="말투·성향·의사결정 스타일"
            />
          </label>

          <label className="company-field">
            <span>업무 성향</span>
            <textarea
              rows={3}
              value={form.tendency}
              onChange={(e) => update({ tendency: e.target.value })}
              placeholder="속도, 우선순위, 협업 방식"
            />
          </label>

          <label className="company-field">
            <span>지향점</span>
            <textarea
              rows={3}
              value={form.orientation}
              onChange={(e) => update({ orientation: e.target.value })}
              placeholder="중요하게 생각하는 가치·목표"
            />
          </label>
        </div>

        <div className="company-modal-footer">
          <div className="company-panel-actions">
            {savedAt && <span className="company-saved-at">저장: {formatSaved(savedAt)}</span>}
          </div>
          <div className="company-modal-footer-buttons">
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
              닫기
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
