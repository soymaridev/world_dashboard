"use client";

import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { GlobeParams } from "@/components/Earth3D";
import SettingsPanel from "@/components/SettingsPanel";
import { useGlobeSettings } from "@/components/GlobeSettingsContext";

export default function AjustesPage() {
  const { params: globalParams, saveParams } = useGlobeSettings();
  const [params, setParams] = useState<GlobeParams>(globalParams);

  // Sync with global params on mount or when globalParams change
  useEffect(() => {
    setParams(globalParams);
  }, [globalParams]);

  const handleParamsChange = (newParams: Partial<GlobeParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleSave = () => {
    saveParams(params);
    alert("Configuración guardada correctamente");
  };

  return (
    <main className="dashboard ajustes-page">
      <div className="scanlines" />
      <DashboardHeader onSave={handleSave} />
      
      <div className="ajustes-container">
        <div className="globe-preview">
          {/* Managed by PersistentGlobe */}
          
          <div className="preview-overlay">
            <div className="preview-label">LIVE PREVIEW MODE</div>
          </div>
        </div>
        
        <SettingsPanel params={params} onChange={handleParamsChange} />
      </div>

      <style jsx>{`
        .ajustes-page {
          overflow: hidden;
        }

        .ajustes-container {
          display: flex;
          flex: 1;
          height: calc(100vh - 54px);
          position: relative;
        }

        .globe-preview {
          flex: 1;
          position: relative;
          background: radial-gradient(circle at center, rgba(0, 80, 180, 0.05) 0%, transparent 70%);
        }

        .preview-overlay {
          position: absolute;
          top: 20px;
          left: 20px;
          pointer-events: none;
        }

        .preview-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(0, 224, 255, 0.6);
          border: 1px solid rgba(0, 224, 255, 0.3);
          padding: 4px 12px;
          border-radius: 4px;
          background: rgba(0, 224, 255, 0.05);
        }
      `}</style>
    </main>
  );
}
