"use client";

import React from "react";
import { GlobeParams } from "./Earth3D";

interface SettingsPanelProps {
  params: GlobeParams;
  onChange: (newParams: Partial<GlobeParams>) => void;
}

export default function SettingsPanel({ params, onChange }: SettingsPanelProps) {
  const handleChange = (key: keyof GlobeParams, value: any) => {
    onChange({ [key]: value });
  };

  return (
    <div className="settings-sidebar">
      <div className="settings-header">
        <h2 className="settings-title">GLOBE PARAMETERS</h2>
        <div className="settings-line" />
      </div>

      <div className="settings-content">
        {/* --- LAND DOTS --- */}
        <div className="settings-section">
          <h3 className="section-title">LAND SPHERE</h3>
          
          <div className="setting-item">
            <label>Color</label>
            <input 
              type="color" 
              value={params.landColor} 
              onChange={(e) => handleChange("landColor", e.target.value)} 
            />
          </div>

          <div className="setting-item">
            <label>Dot Size ({params.landDotSize})</label>
            <input 
              type="range" min="0.005" max="0.1" step="0.001" 
              value={params.landDotSize} 
              onChange={(e) => handleChange("landDotSize", parseFloat(e.target.value))} 
            />
          </div>

          <div className="setting-item">
            <label>Falloff ({params.landFalloff})</label>
            <input 
              type="range" min="0.5" max="8" step="0.1" 
              value={params.landFalloff} 
              onChange={(e) => handleChange("landFalloff", parseFloat(e.target.value))} 
            />
          </div>

          <div className="setting-item">
            <label>Core Boost ({params.landCoreBoost})</label>
            <input 
              type="range" min="0" max="4" step="0.1" 
              value={params.landCoreBoost} 
              onChange={(e) => handleChange("landCoreBoost", parseFloat(e.target.value))} 
            />
          </div>
        </div>

        {/* --- BORDER DOTS --- */}
        <div className="settings-section">
          <h3 className="section-title">BORDER DOTS</h3>
          
          <div className="setting-item">
            <label>Color</label>
            <input 
              type="color" 
              value={params.borderColor} 
              onChange={(e) => handleChange("borderColor", e.target.value)} 
            />
          </div>

          <div className="setting-item">
            <label>Dot Size ({params.borderDotSize})</label>
            <input 
              type="range" min="0.005" max="0.1" step="0.001" 
              value={params.borderDotSize} 
              onChange={(e) => handleChange("borderDotSize", parseFloat(e.target.value))} 
            />
          </div>
        </div>

        {/* --- ENERGY SHIELD --- */}
        <div className="settings-section">
          <h3 className="section-title">ENERGY SHIELD</h3>
          
          <div className="setting-item">
            <label>Shield Color</label>
            <input 
              type="color" 
              value={params.shieldColor} 
              onChange={(e) => handleChange("shieldColor", e.target.value)} 
            />
          </div>

          <div className="setting-item">
            <label>Opacity ({params.shieldOpacity})</label>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={params.shieldOpacity} 
              onChange={(e) => handleChange("shieldOpacity", parseFloat(e.target.value))} 
            />
          </div>

          <div className="setting-item">
            <label>Hex Scale ({params.shieldHexScale})</label>
            <input 
              type="range" min="1" max="30" step="0.5" 
              value={params.shieldHexScale} 
              onChange={(e) => handleChange("shieldHexScale", parseFloat(e.target.value))} 
            />
          </div>

          <div className="setting-item">
            <label>Hex Opacity ({params.shieldHexOpacity})</label>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={params.shieldHexOpacity} 
              onChange={(e) => handleChange("shieldHexOpacity", parseFloat(e.target.value))} 
            />
          </div>
        </div>

        {/* --- TWINKLE --- */}
        <div className="settings-section">
          <h3 className="section-title">TWINKLE EFFECT</h3>
          
          <div className="setting-item">
            <label>Intensity ({params.twinkleIntensity})</label>
            <input 
              type="range" min="0" max="10" step="0.1" 
              value={params.twinkleIntensity} 
              onChange={(e) => handleChange("twinkleIntensity", parseFloat(e.target.value))} 
            />
          </div>

          <div className="setting-item">
            <label>Speed ({params.twinkleSpeed})</label>
            <input 
              type="range" min="0.1" max="20" step="0.1" 
              value={params.twinkleSpeed} 
              onChange={(e) => handleChange("twinkleSpeed", parseFloat(e.target.value))} 
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-sidebar {
          width: 350px;
          height: 100%;
          background: rgba(10, 16, 32, 0.8);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 10;
          overflow-y: auto;
          font-family: 'Rajdhani', sans-serif;
        }

        .settings-header {
          padding: 24px;
          position: sticky;
          top: 0;
          background: rgba(10, 16, 32, 0.9);
          z-index: 2;
        }

        .settings-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #fff;
          margin: 0 0 12px 0;
          text-shadow: 0 0 12px rgba(0, 224, 255, 0.4);
        }

        .settings-line {
          height: 1px;
          background: linear-gradient(90deg, #00e0ff, transparent);
        }

        .settings-content {
          padding: 0 24px 40px 24px;
        }

        .settings-section {
          margin-top: 32px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #00e0ff;
          letter-spacing: 2px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(0, 224, 255, 0.2);
        }

        .setting-item {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-item label {
          font-size: 11px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 1px;
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #00e0ff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 224, 255, 0.6);
        }

        input[type="color"] {
          -webkit-appearance: none;
          border: none;
          width: 40px;
          height: 24px;
          background: none;
          cursor: pointer;
        }

        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        input[type="color"]::-webkit-color-swatch {
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
