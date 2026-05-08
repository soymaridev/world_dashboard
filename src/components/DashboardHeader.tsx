"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  onSave?: () => void;
}

export default function DashboardHeader({ onSave }: DashboardHeaderProps) {
  const pathname = usePathname();
  const isAjustes = pathname === "/ajustes";

  return (
    <header className="dashboard-header">
      <div className="header-logo" />

      <div className="header-title-area">
        <h1 className="header-title">3D EARTH MODEL MONITOR</h1>
        <p className="header-subtitle">
          Real-time globe visualization analytics
        </p>
      </div>

      <div className="header-right">
        {isAjustes ? (
          <>
            <button 
              className="header-adjust-button" 
              style={{ borderColor: "rgba(0, 255, 163, 0.3)", color: "var(--accent-green)" }}
              onClick={onSave}
            >
              GUARDAR
            </button>
            <Link href="/estadisticas">
              <button className="header-adjust-button">ESTADÍSTICAS</button>
            </Link>
          </>
        ) : (
          <Link href="/ajustes">
            <button className="header-adjust-button">ADJUST</button>
          </Link>
        )}
      </div>

      <div className="header-line" />
    </header>
  );
}
