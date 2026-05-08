"use client";

import React from "react";
import dynamic from "next/dynamic";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardPanel from "@/components/DashboardPanel";
import GaugeChart from "@/components/GaugeChart";
import MiniChart from "@/components/MiniChart";
import StatCard from "@/components/StatCard";
import RankingList from "@/components/RankingList";
import DonutChart from "@/components/DonutChart";
import { useGlobeSettings } from "@/components/GlobeSettingsContext";

// Earth3D is now managed globally by PersistentGlobe

/* ─── 3D Model data ──────────────────────────────── */
const shaderPerf = [92, 78, 65, 88, 70, 55, 82, 60, 85, 74];
const shaderLabels = ["Vert","Frag","TSL","Glow","Atm","Noise","Disp","Bloom","Fog","Post"];
const geometryData = [80, 65, 50, 72, 58, 45, 68, 55, 40, 62];
const geometryLabels = ["Sphere","Points","Grid","Rings","Cloud","Halo","Axis","Inst","LOD","Clip"];

const rankingItems = [
  { name: "Fibonacci Sampling", value: 95 },
  { name: "Land Mask Filter", value: 88 },
  { name: "TSL Shaders", value: 82 },
  { name: "Point Cloud", value: 78 },
  { name: "Atmosphere Glow", value: 72 },
  { name: "Noise Displacement", value: 68 },
  { name: "Orbital Camera", value: 65 },
  { name: "Post-Processing", value: 60 },
];

const fpsHistory = [58, 60, 59, 61, 60, 62, 60, 59, 61, 60, 62, 60];

export default function EstadisticasPage() {
  const { params } = useGlobeSettings();

  return (
    <main className="dashboard">
      {/* ── Scan-line overlay ── */}
      <div className="scanlines" />

      {/* ═══ HEADER ═══ */}
      <DashboardHeader />
      <div className="dashboard-grid">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="dashboard-left">
          <DashboardPanel
            title="Vertex Count"
            subtitle="Total vertices in the globe mesh"
          >
            <div className="gauge-row">
              <GaugeChart
                value={74.2}
                label="Active"
                size={80}
                suffix="%"
                color="var(--accent-cyan)"
              />
              <div className="gauge-info">
                <span className="gauge-big-value">120,000</span>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Land Points"
            subtitle="Fibonacci points filtered by land mask"
          >
            <div className="gauge-row">
              <GaugeChart
                value={38.6}
                label="On Land"
                size={80}
                suffix="%"
                color="var(--accent-blue)"
              />
              <div className="gauge-info">
                <span className="gauge-big-value">46,200</span>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Shader Performance"
            subtitle="GPU shader pass efficiency per stage"
            className="panel-flex panel-flex-v12"
          >
            <MiniChart
              data={shaderPerf}
              type="hbar"
              color="var(--accent-blue)"
              labels={shaderLabels}
              height={100}
            />
            <div className="panel-footer-stat">
              <span className="footer-plus">⊕</span>
              <span className="footer-label">Avg Pass Time</span>
              <span className="footer-value">▲ 0.42 ms</span>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Geometry Breakdown"
            subtitle="Draw calls by geometry type"
            className="panel-flex panel-flex-v08 panel-header-down"
          >
            <MiniChart
              data={geometryData}
              type="segmented"
              color="var(--accent-blue)"
              labels={geometryLabels}
              height={80}
            />
            <div className="panel-footer-stat">
              <span className="footer-plus">⊕</span>
              <span className="footer-label">Draw Calls</span>
              <span className="footer-value">▲ 14 total</span>
            </div>
          </DashboardPanel>
        </div>

        {/* ═══ CENTER (GLOBE) ═══ */}
        <div className="dashboard-center">
          {/* The globe is now managed by PersistentGlobe in the root layout */}

          <div className="center-overlay">
            <div className="center-card center-top">
              <p className="center-top-label">Globe Model Overview</p>
            </div>

            <div className="center-card center-stats-left">
              <p className="center-label">
                <span className="panel-arrow">›</span> Total Triangles
              </p>
              <div className="center-big-number">240,000</div>
              <div style={{ marginTop: 8 }}>
                <p className="center-label">
                  <span className="panel-arrow">›</span> Frame Rate
                </p>
                <div className="big-stat-triangle">
                  <span className="big-stat-arrow">▲</span>
                  <span className="big-stat-number">
                    60<span className="big-stat-unit"> FPS</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="center-card center-stats-right">
              <p className="center-label">Texture Resolution</p>
              <div
                className="center-big-number"
                style={{ fontSize: 24, marginTop: 4 }}
              >
                4096 × 2048
              </div>
              <div className="center-sub-stat" style={{ marginTop: 4 }}>
                <p style={{ margin: 0, fontSize: 9, color: "var(--text-dim)" }}>
                  WebGL 2.0 — Three.js r169
                </p>
                <p style={{ margin: 0, fontSize: 8, color: "var(--text-dim)" }}>
                  Shaders: TSL Node Material, GLSL Post-FX
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="dashboard-right">
          <DashboardPanel
            title="Render Techniques"
            subtitle="Core rendering pipeline features"
            className="panel-flex"
          >
            <RankingList items={rankingItems} />
            <div className="chart-24h" style={{ marginTop: 8 }}>
              <div className="chart-24h-header">
                <span className="chart-24h-title">FPS Over Last 12s</span>
              </div>
              <MiniChart
                data={fpsHistory}
                type="line"
                color="var(--accent-blue)"
                height={40}
              />
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Textures & Materials"
            subtitle="Loaded texture assets breakdown"
          >
            <div className="education-grid">
              <span className="edu-label">Earth Diffuse Map</span>
              <span className="edu-value">4K</span>
              <span className="edu-label">Land Mask Texture</span>
              <span className="edu-value">2K</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <DonutChart
                segments={[
                  { value: 65, color: "var(--accent-cyan)", label: "GPU VRAM" },
                  { value: 35, color: "rgba(40,60,100,0.5)", label: "Free" },
                ]}
                size={70}
                centerValue="65"
                centerUnit="%"
              />
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Render Pipeline"
            subtitle="GPU resource allocation per pass"
          >
            <div className="donut-legend-row">
              <DonutChart
                segments={[
                  { value: 35, color: "var(--accent-cyan)", label: "Geometry" },
                  { value: 25, color: "var(--accent-blue)", label: "Shading" },
                  { value: 22, color: "var(--accent-deep)", label: "Post-FX" },
                  { value: 18, color: "rgba(0, 180, 255, 0.2)", label: "Particles" },
                ]}
                size={90}
                centerValue="14"
                centerUnit="ms"
              />
              <div className="legend">
                {/* ... legend content ... */}
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "var(--accent-cyan)" }} />
                  <span>Geometry</span>
                  <span className="legend-value">4.9 ms</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "var(--accent-blue)" }} />
                  <span>Shading</span>
                  <span className="legend-value">3.5 ms</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "var(--accent-deep)" }} />
                  <span>Post-FX</span>
                  <span className="legend-value">3.1 ms</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: "rgba(0, 180, 255, 0.2)" }} />
                  <span>Particles</span>
                  <span className="legend-value">2.5 ms</span>
                </div>
              </div>
            </div>
            <div className="panel-footer-stat">
              <span className="footer-plus">⊕</span>
              <span className="footer-label">Total Frame Time</span>
              <span className="footer-value">▲ 14 ms</span>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </main>
  );
}
