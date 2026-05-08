"use client";

interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardPanel({
  title,
  subtitle,
  children,
  className = "",
}: DashboardPanelProps) {
  return (
    <div className={`dashboard-panel ${className}`}>
      <div className="panel-header">
        <h3 className="panel-title">
          <span className="panel-arrow">›</span> {title}{" "}
          <span className="panel-arrow">→</span>
        </h3>
        {subtitle && <p className="panel-subtitle">{subtitle}</p>}
      </div>
      <div className="panel-content">{children}</div>
    </div>
  );
}
