/** SVG progress ring — 프로젝트 Health 지표 */
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  label,
  sublabel,
  accent = '#f97316',
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  accent?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className="progress-ring" style={{ width: size, height: size }} role="img" aria-label={`${clamped}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="progress-ring-label">
        <span className="progress-ring-value">{clamped}%</span>
        {label && <span className="progress-ring-text">{label}</span>}
        {sublabel && <span className="progress-ring-sub">{sublabel}</span>}
      </div>
    </div>
  );
}
