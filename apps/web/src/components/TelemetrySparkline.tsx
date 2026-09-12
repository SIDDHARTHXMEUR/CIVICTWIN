import React from 'react';

interface TelemetrySparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  isDark?: boolean;
}

export function TelemetrySparkline({
  data,
  width = 120,
  height = 24,
  color = '#4fc9dc',
  isDark = true,
}: TelemetrySparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * usableWidth;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points[0].split(',')[0]},${height} L ${points.join(' L ')} L ${points[points.length - 1].split(',')[0]},${height} Z`;
  const lastPoint = points[points.length - 1].split(',');
  const gradId = `spark-grad-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 4)}`;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={isDark ? "0.35" : "0.25"} />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={areaD}
          fill={`url(#${gradId})`}
        />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Active live data pulse point with glow */}
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="4"
          fill={color}
          opacity="0.3"
        />
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="2.5"
          fill={color}
          stroke={isDark ? '#12141a' : '#ffffff'}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
