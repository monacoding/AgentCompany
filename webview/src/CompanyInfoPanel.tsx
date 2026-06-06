import { useCallback, useEffect, useState } from 'react';
import { CompanyInfo, postMessage } from './vscode';

interface CompanyInfoModalProps {
  info: CompanyInfo;
  logoUrl?: string;
  onClose: () => void;
}

const EMPTY_FORM = (): Omit<CompanyInfo, 'updatedAt'> => ({
  companyName: '',
  businessItem: '',
  policy: '',
  mindset: '',
  tendency: '',
  mission: '',
  foundedAt: '',
});

export function CompanyInfoModal({ info, logoUrl, onClose }: CompanyInfoModalProps) {
  const [form, setForm] = useState(EMPTY_FORM());
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    setForm({
      companyName: info.companyName ?? '',
      businessItem: info.businessItem ?? '',
      policy: info.policy ?? '',
      mindset: info.mindset ?? '',
      tendency: info.tendency ?? '',
      mission: info.mission ?? '',
      foundedAt: info.foundedAt ?? '',
    });
    setSavedAt(info.updatedAt ?? '');
  }, [info]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'companyInfoSaved') {
        setSaving(false);
        const saved = event.data.payload as CompanyInfo;
        setSavedAt(saved.updatedAt);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const update = useCallback((patch: Partial<Omit<CompanyInfo, 'updatedAt'>>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = () => {
    setSaving(true);
    postMessage('saveCompanyInfo', form);
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
          <h2>회사 정보</h2>
          <button type="button" className="btn-icon modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body company-modal-body">
          <div className="company-logo-section">
            <span className="company-field-label">회사 로고</span>
            <div className="company-logo-row">
              <div className="company-logo-preview">
                {logoUrl ? (
                  <img src={logoUrl} alt="회사 로고" className="company-logo-img" />
                ) : (
                  <span className="company-logo-placeholder">🏢</span>
                )}
              </div>
              <div className="company-logo-actions">
                <button type="button" className="btn-sm" onClick={() => postMessage('pickCompanyLogo')}>
                  로고 선택
                </button>
                {logoUrl && (
                  <button type="button" className="btn-sm warn" onClick={() => postMessage('removeCompanyLogo')}>
                    제거
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="company-field">
            <span>회사 이름</span>
            <input
              value={form.companyName}
              onChange={(e) => update({ companyName: e.target.value })}
              placeholder="예: 모노에듀"
            />
          </label>

          <label className="company-field">
            <span>창립일</span>
            <input
              type="date"
              value={form.foundedAt}
              onChange={(e) => update({ foundedAt: e.target.value })}
            />
            <span className="company-field-hint">대시보드 상단에 창립일 기준 운영일(+N)이 표시됩니다.</span>
          </label>

          <label className="company-field">
            <span>사업 아이템</span>
            <textarea
              rows={2}
              value={form.businessItem}
              onChange={(e) => update({ businessItem: e.target.value })}
              placeholder="주력 사업·제품·서비스"
            />
          </label>

          <label className="company-field">
            <span>미션·비전</span>
            <textarea
              rows={2}
              value={form.mission}
              onChange={(e) => update({ mission: e.target.value })}
              placeholder="회사가 지향하는 목표"
            />
          </label>

          <label className="company-field">
            <span>경영 정책</span>
            <textarea
              rows={3}
              value={form.policy}
              onChange={(e) => update({ policy: e.target.value })}
              placeholder="의사결정·품질·커뮤니케이션 원칙"
            />
          </label>

          <label className="company-field">
            <span>마인드셋</span>
            <textarea
              rows={3}
              value={form.mindset}
              onChange={(e) => update({ mindset: e.target.value })}
              placeholder="CEO·조직이 추구하는 사고방식"
            />
          </label>

          <label className="company-field">
            <span>성향·업무 스타일</span>
            <textarea
              rows={3}
              value={form.tendency}
              onChange={(e) => update({ tendency: e.target.value })}
              placeholder="말투, 속도, 우선순위, 협업 방식 등"
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
