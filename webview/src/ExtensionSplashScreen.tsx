interface ExtensionSplashScreenProps {
  visible: boolean;
  fading: boolean;
  logoUrl?: string;
  ceoName: string;
}

export function ExtensionSplashScreen({
  visible,
  fading,
  logoUrl,
  ceoName,
}: ExtensionSplashScreenProps) {
  if (!visible) return null;

  return (
    <div
      className={`extension-splash${fading ? ' extension-splash-fading' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="AgentCompany 시작 중"
    >
      <div className="extension-splash-card">
        <div className="extension-splash-logo-wrap">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="extension-splash-logo" />
          ) : (
            <span className="extension-splash-logo-fallback" aria-hidden="true">
              🏢
            </span>
          )}
        </div>
        <h2 className="extension-splash-ceo">{ceoName}</h2>
        <p className="extension-splash-role">(CEO)</p>
        <p className="extension-splash-status">
          출근중
          <span className="extension-splash-dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  );
}

export function resolveCeoDisplayName(name?: string): string {
  const trimmed = name?.trim();
  return trimmed || '사장';
}
