"use client";

interface MiniChartProps {
  data: number[];
  type?: "bar" | "line" | "hbar" | "segmented";
  color?: string;
  height?: number;
  labels?: string[];
}

export default function MiniChart({
  data,
  type = "bar",
  color = "var(--accent-cyan)",
  height = 60,
  labels,
}: MiniChartProps) {
  const maxVal = Math.max(...data, 1);

  if (type === "line") {
    const w = 200;
    const h = height;
    const points = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / maxVal) * h;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="mini-chart mini-chart--line">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${h} ${points} ${w},${h}`}
            fill="url(#lineGrad)"
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
        {labels && (
          <div className="chart-labels">
            {labels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Horizontal bars ── */
  if (type === "hbar") {
    return (
      <div className="mini-chart mini-chart--hbar">
        {data.map((v, i) => (
          <div key={i} className="hbar-row">
            {labels && labels[i] && (
              <span className="hbar-label">{labels[i]}</span>
            )}
            <div className="hbar-track">
              <div
                className="hbar-fill"
                style={{
                  width: `${(v / maxVal) * 100}%`,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                }}
              >
                <div className="hbar-glow" style={{ background: color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Segmented (block matrix) ── */
  if (type === "segmented") {
    const blockCount = 10;
    return (
      <div className="mini-chart mini-chart--segmented" style={{ height }}>
        {data.map((v, i) => {
          const activeBlocks = Math.round((v / maxVal) * blockCount);
          return (
            <div key={i} className="segmented-col">
              {[...Array(blockCount)].map((_, idx) => (
                <div
                  key={idx}
                  className={`block ${idx < activeBlocks ? "block--active" : ""}`}
                  style={idx < activeBlocks ? { backgroundColor: color, boxShadow: `0 0 5px ${color}` } : {}}
                />
              ))}
              {labels && labels[i] && (
                <span className="bar-label">{labels[i]}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mini-chart mini-chart--bar" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="bar-col">
          <span className="bar-value">{v}</span>
          <div
            className="bar"
            style={{
              height: `${(v / maxVal) * 100}%`,
              background: `linear-gradient(to top, ${color}, ${color}88)`,
            }}
          />
          {labels && labels[i] && (
            <span className="bar-label">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
