"use client";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  unit?: string;
  icon?: string;
}

export default function StatCard({
  label,
  value,
  change,
  changeType = "up",
  unit = "",
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {icon && <span className="stat-icon">{icon}</span>}
        {label}
      </div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {change && (
        <div className={`stat-change stat-change--${changeType}`}>
          <span className="stat-change-arrow">
            {changeType === "up" ? "▲" : changeType === "down" ? "▼" : "●"}
          </span>{" "}
          {change}
        </div>
      )}
    </div>
  );
}
