"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import "./loading.css";

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    { id: 1, label: "CARGANDO DATOS", sub: "Datos geoespaciales y recursos" },
    { id: 2, label: "INICIALIZANDO MODELO 3D", sub: "Generando geometría y mallas" },
    { id: 3, label: "APLICANDO TEXTURAS", sub: "Cargando texturas y materiales" },
    { id: 4, label: "PREPARANDO RENDER", sub: "Configurando pipeline de renderizado" },
    { id: 5, label: "LISTO PARA VISUALIZAR", sub: "Optimizando escena final" },
  ];

  useEffect(() => {
    const tl = gsap.to({}, {
      duration: 5,
      ease: "power1.inOut",
      onUpdate: function() {
        const p = Math.floor(this.progress() * 100);
        setProgress(p);
        
        // Update steps based on progress
        if (p < 20) setStep(0);
        else if (p < 40) setStep(1);
        else if (p < 60) setStep(2);
        else if (p < 80) setStep(3);
        else if (p < 100) setStep(4);
      },
      onComplete: () => {
        router.push("/estadisticas");
      }
    });

    return () => { tl.kill(); };
  }, [router]);

  return (
    <main className="loading-screen">
      <div className="scanlines" />
      
      <div className="loading-content">
        {/* LOGO */}
        <div className="logo-container">
          <svg width="80" height="80" viewBox="0 0 100 100" className="logo-svg">
            <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="#00e0ff" strokeWidth="1" />
            <path d="M50 5 L50 95 M10 25 L90 75 M10 75 L90 25" stroke="rgba(0, 224, 255, 0.4)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#00e0ff" strokeWidth="1" />
            <circle cx="50" cy="5" r="2" fill="#00e0ff" />
            <circle cx="90" cy="25" r="2" fill="#00e0ff" />
            <circle cx="90" cy="75" r="2" fill="#00e0ff" />
            <circle cx="50" cy="95" r="2" fill="#00e0ff" />
            <circle cx="10" cy="75" r="2" fill="#00e0ff" />
            <circle cx="10" cy="25" r="2" fill="#00e0ff" />
          </svg>
        </div>

        {/* TITLES */}
        <h1 className="loading-title">3D EARTH MODEL MONITOR</h1>
        <p className="loading-subtitle">REAL-TIME GLOBE VISUALIZATION ANALYTICS</p>

        {/* STATUS */}
        <div className="status-label">INICIALIZANDO SISTEMA</div>

        {/* PROGRESS RING */}
        <div className="progress-ring-container">
          <svg className="progress-ring" width="180" height="180">
            <circle
              className="progress-ring__circle-bg"
              stroke="rgba(0, 224, 255, 0.1)"
              strokeWidth="8"
              fill="transparent"
              r="70"
              cx="90"
              cy="90"
            />
            <circle
              className="progress-ring__circle"
              stroke="#00e0ff"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              fill="transparent"
              r="70"
              cx="90"
              cy="90"
              style={{ filter: "drop-shadow(0 0 8px #00e0ff)" }}
            />
          </svg>
          <div className="progress-text">
            <span className="progress-number">{progress}<span>%</span></span>
            <span className="progress-label">CARGANDO</span>
          </div>
        </div>

        <div className="status-label-sub">CARGANDO MODELO 3D DEL GLOBO</div>

        {/* STEPPER */}
        <div className="stepper-container">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`step-item ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}>
                <div className="step-icon">
                  {i < step ? (
                    <span className="check">✓</span>
                  ) : i === step ? (
                    <div className="spinner" />
                  ) : (
                    <div className="dot" />
                  )}
                </div>
                <div className="step-info">
                  <div className="step-label">{s.label}</div>
                  <div className="step-sub">{s.sub}</div>
                </div>
                {i <= step && <div className="step-check-mark">✓</div>}
              </div>
              {i < steps.length - 1 && (
                <div className={`step-line ${i < step ? 'active' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* INFO BOX */}
        <div className="info-box">
          <div className="info-icon">i</div>
          <div className="info-text">
            Los modelos 3D de alta resolución pueden tardar unos momentos en cargarse.<br />
            Gracias por tu paciencia.
          </div>
        </div>
      </div>
    </main>
  );
}
