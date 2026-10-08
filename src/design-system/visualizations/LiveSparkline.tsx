import React from 'react';

interface LiveSparklineProps {
  data: number[];
  strokeColor?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  showGradient?: boolean;
}

export const LiveSparkline: React.FC<LiveSparklineProps> = ({
  data,
  strokeColor = '#51CF66',
  width = 120,
  height = 36,
  strokeWidth = 2,
  showGradient = true
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-[#1F2736]/30 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const gradientId = `spark-grad-${Math.abs(strokeColor.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
  const fillPathD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {showGradient && (
        <path d={fillPathD} fill={`url(#${gradientId})`} />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trailing live pulse point */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r={2.5}
          fill={strokeColor}
        />
      )}
    </svg>
  );
};
