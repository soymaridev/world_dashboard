"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useGlobeSettings } from "./GlobeSettingsContext";

const Earth3D = dynamic(() => import("./Earth3D"), { ssr: false });

export default function PersistentGlobe() {
  const pathname = usePathname();
  const { params } = useGlobeSettings();

  const isHome = pathname === "/";
  const isEstadisticas = pathname === "/estadisticas";
  const isAjustes = pathname === "/ajustes";

  // Note: We keep the component mounted across all pages to prevent
  // the Three.js scene from being destroyed and recreated.
  
  return (
    <div className={`persistent-globe-container ${pathname.replace(/\//g, "route-")}`}>
      <div className="globe-wrapper">
        <Earth3D params={params} />
      </div>

      <style jsx global>{`
        .persistent-globe-container {
          position: fixed;
          z-index: 1;
          pointer-events: none;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .persistent-globe-container .globe-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          pointer-events: auto;
        }

        /* --- HOME (Loading Screen) --- */
        .persistent-globe-container.route- {
          opacity: 0;
          visibility: hidden;
          left: 316px;
          top: 66px;
          width: calc(100vw - 642px);
          height: calc(100vh - 80px);
        }

        /* --- ESTADISTICAS --- */
        .persistent-globe-container.route-estadisticas {
          opacity: 1;
          visibility: visible;
          left: 316px;
          top: 66px;
          width: calc(100vw - 642px);
          height: calc(100vh - 80px);
          transform: none;
        }

        /* --- AJUSTES --- */
        .persistent-globe-container.route-ajustes {
          opacity: 1;
          visibility: visible;
          left: 0;
          top: 54px;
          width: calc(100vw - 350px);
          height: calc(100vh - 54px);
          transform: none;
        }

        /* --- Respondive adjustments if needed --- */
        @media (max-width: 1200px) {
          .persistent-globe-container.route-estadisticas {
            left: 0;
            width: 100vw;
          }
        }
      `}</style>
    </div>
  );
}
