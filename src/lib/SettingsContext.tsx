"use client";

import { createContext, useContext, useEffect, useState } from "react";

// User-configurable settings (persisted in localStorage).
// Tariff matches the project's "configurable tariff model" requirement.
export interface Settings {
  tariff: number;        // ₦ per kWh
  powerLimitW: number;   // rated capacity used for utilisation %
  currency: string;      // symbol
}

const DEFAULTS: Settings = {
  tariff: 60,            // ₦60/kWh — Nigerian MYTO reference
  powerLimitW: 2000,     // 2 kW
  currency: "₦",
};

const STORAGE_KEY = "smartbase-settings";

interface SettingsContextValue extends Settings {
  setTariff: (v: number) => void;
  setPowerLimitW: (v: number) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // Persist on change
  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const value: SettingsContextValue = {
    ...settings,
    setTariff: (v) => update({ tariff: Number.isFinite(v) && v >= 0 ? v : 0 }),
    setPowerLimitW: (v) => update({ powerLimitW: Number.isFinite(v) && v > 0 ? v : DEFAULTS.powerLimitW }),
    reset: () => update(DEFAULTS),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
