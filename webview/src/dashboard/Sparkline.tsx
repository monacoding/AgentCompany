/** 미니 스파크라인 — 통계 카드 트렌드 시각화 */
export function Sparkline({
  data,
  width = 64,
  height = 24,
  color = '#f97316',
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 값 기반 결정론적 트렌드 데이터 (히스토리 API 없을 때 시각용) */
export function buildSparklineData(seed: number, points = 8): number[] {
  const base = Math.max(1, seed);
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i * 0.9 + seed * 0.3) * base * 0.25;
    const trend = (i - points / 2) * (base * 0.04);
    return Math.max(0, Math.round(base + wave + trend));
  });
}
