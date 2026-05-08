"use client";

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  centerValue?: string;
  centerUnit?: string;
}

export default function DonutChart({
  segments,
  size = 110,
  centerValue,
  centerUnit,
}: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const rendered = segments.map((seg, i) => {
    const segLen = (seg.value / total) * circumference;
    const gap = 3;
    const dash = Math.max(segLen - gap, 0);
    const offset = -accumulated + circumference * 0.25;
    accumulated += segLen;
    return (
      <circle
        key={i}
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth="7"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={offset}
        className="donut-segment"
      />
    );
  });

  return (
    <div className="donut-chart" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="7"
        />
        {rendered}
      </svg>
      {centerValue && (
        <div className="donut-center">
          <span className="donut-center-value">{centerValue}</span>
          {centerUnit && (
            <span className="donut-center-unit">{centerUnit}</span>
          )}
        </div>
      )}
    </div>
  );
}
