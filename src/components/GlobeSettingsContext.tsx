"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GlobeParams } from "./Earth3D";

const DEFAULT_PARAMS: Required<GlobeParams> = {
  landColor: "#6d96cc",
  landPoints: 30000,
  landDotSize: 0.033,
  landFalloff: 2.95,
  landCoreBoost: 1.45,
  landSizeVar: 0.48,
  landBrightVar: 0.13,
  
  borderColor: "#00dfff",
  borderDotSize: 0.024,
  borderFalloff: 3.2,
  borderCoreBoost: 3.0,
  
  shieldColor: "#689ee5",
  shieldOpacity: 0.93,
  shieldHexScale: 12.0,
  shieldHexOpacity: 0.14,
  
  twinkleIntensity: 2.0,
  twinkleSpeed: 3.2,
};

interface GlobeSettingsContextType {
  params: GlobeParams;
  saveParams: (newParams: GlobeParams) => void;
}

const GlobeSettingsContext = createContext<GlobeSettingsContextType | undefined>(undefined);

export function GlobeSettingsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<GlobeParams>(DEFAULT_PARAMS);

  const saveParams = (newParams: GlobeParams) => {
    setParams(newParams);
  };

  return (
    <GlobeSettingsContext.Provider value={{ params, saveParams }}>
      {children}
    </GlobeSettingsContext.Provider>
  );
}

export function useGlobeSettings() {
  const context = useContext(GlobeSettingsContext);
  if (context === undefined) {
    throw new Error("useGlobeSettings must be used within a GlobeSettingsProvider");
  }
  return context;
}
