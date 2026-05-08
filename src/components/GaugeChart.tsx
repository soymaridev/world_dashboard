"use client";

interface GaugeChartProps {
  value: number; // 0-100
  label: string;
  color?: string;
  size?: number;
  suffix?: string;
}

export default function GaugeChart({
  value,
  label,
  color = "var(--accent-cyan)",
  size = 100,
  suffix = "%",
}: GaugeChartProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <div className="gauge-chart" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          transform="rotate(-90 50 50)"
          className="gauge-ring"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          transform="rotate(-90 50 50)"
          opacity="0.3"
          filter="blur(4px)"
          className="gauge-glow"
        />
      </svg>
      <div className="gauge-label">
        <span className="gauge-value">
          {value}
          <small>{suffix}</small>
        </span>
        <span className="gauge-text">{label}</span>
      </div>
    </div>
  );
}
