"use client";

import { useSettings } from "@/lib/SettingsContext";
import ThemeToggle from "@/components/ThemeToggle";
import { CircleDollarSign, Gauge, RotateCcw, Database } from "lucide-react";

export default function SettingsPage() {
  const { tariff, powerLimitW, currency, setTariff, setPowerLimitW, reset } = useSettings();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "—";

  return (
    <>
      <div>
        <h1 className="text-primary font-semibold text-lg">Settings</h1>
        <p className="text-muted text-[12px] mt-1">
          Configure tariff, capacity and appearance. Saved to this browser.
        </p>
      </div>

      {/* Billing / tariff */}
      <section className="surface p-6 space-y-5 max-w-2xl">
        <div className="flex items-center gap-2">
          <CircleDollarSign size={16} style={{ color: "var(--accent)" }} />
          <h2 className="text-primary font-semibold text-[14px]">Billing &amp; Tariff</h2>
        </div>

        <label className="block">
          <span className="text-secondary text-[12px] font-medium">Electricity tariff ({currency} per kWh)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={tariff}
            onChange={(e) => setTariff(parseFloat(e.target.value))}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-primary surface-inset outline-none focus:border-[var(--accent)] text-[14px] tabular-nums"
            style={{ background: "var(--bg-inset)" }}
          />
          <span className="text-faint text-[11px] mt-1.5 block">Nigerian MYTO reference is ~{currency}60/kWh. Used across all cost calculations.</span>
        </label>

        <label className="block">
          <span className="text-secondary text-[12px] font-medium flex items-center gap-1.5">
            <Gauge size={13} /> Rated capacity (W)
          </span>
          <input
            type="number"
            min={1}
            step={100}
            value={powerLimitW}
            onChange={(e) => setPowerLimitW(parseFloat(e.target.value))}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-primary surface-inset outline-none focus:border-[var(--accent)] text-[14px] tabular-nums"
            style={{ background: "var(--bg-inset)" }}
          />
          <span className="text-faint text-[11px] mt-1.5 block">Drives the power-utilisation gauge on the dashboard.</span>
        </label>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold surface surface-hover text-secondary"
        >
          <RotateCcw size={13} /> Reset to defaults
        </button>
      </section>

      {/* Appearance */}
      <section className="surface p-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-primary font-semibold text-[14px]">Appearance</h2>
            <p className="text-muted text-[12px] mt-1">Switch between light and dark themes.</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Connection */}
      <section className="surface p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Database size={16} style={{ color: "var(--accent)" }} />
          <h2 className="text-primary font-semibold text-[14px]">Data Source</h2>
        </div>
        <dl className="grid grid-cols-2 gap-y-2 text-[12px]">
          <dt className="text-muted">Backend</dt>
          <dd className="text-secondary">Firebase Realtime Database</dd>
          <dt className="text-muted">Project</dt>
          <dd className="text-secondary tabular-nums">{projectId}</dd>
          <dt className="text-muted">Hardware</dt>
          <dd className="text-secondary">ESP32 + PZEM-004T V3.0</dd>
        </dl>
      </section>

      <div className="pb-4" />
    </>
  );
}
