"use client";

import { useState } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { CircleDollarSign, Gauge, RotateCcw, Database, UserCircle, Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { tariff, powerLimitW, currency, setTariff, setPowerLimitW, reset } = useSettings();
  const { displayName, user, updateName } = useAuth();

  const [name, setName] = useState(user?.displayName || "");
  const [savingName, setSavingName] = useState(false);
  const [savedName, setSavedName] = useState(false);

  const saveName = async () => {
    if (!name.trim() || savingName) return;
    setSavingName(true);
    setSavedName(false);
    try {
      await updateName(name);
      setSavedName(true);
      setTimeout(() => setSavedName(false), 2000);
    } finally {
      setSavingName(false);
    }
  };

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "—";

  return (
    <>
      <div>
        <h1 className="text-primary font-bold text-[20px] sm:text-[22px] tracking-tight">Settings</h1>
        <p className="text-muted text-[12px] mt-1">
          Configure tariff, capacity and appearance. Saved to this browser.
        </p>
      </div>

      {/* Profile */}
      <section className="surface p-6 space-y-5 max-w-2xl">
        <div className="flex items-center gap-2">
          <UserCircle size={16} style={{ color: "var(--accent)" }} />
          <h2 className="text-primary font-semibold text-[14px]">Profile</h2>
        </div>

        <label className="block">
          <span className="text-secondary text-[12px] font-medium">Display name</span>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-xl px-4 py-2.5 text-primary surface-inset outline-none focus:border-[var(--accent)] text-[14px]"
              style={{ background: "var(--bg-inset)" }}
            />
            <button
              onClick={saveName}
              disabled={savingName || !name.trim() || name.trim() === (user?.displayName || "")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {savingName ? <Loader2 size={14} className="animate-spin" /> : savedName ? <Check size={14} /> : null}
              {savedName ? "Saved" : "Save"}
            </button>
          </div>
          <span className="text-faint text-[11px] mt-1.5 block">
            Shown in the greeting and across the app. Currently: <span className="text-secondary capitalize">{displayName || "—"}</span>
          </span>
        </label>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12px] pt-1">
          <dt className="text-muted">Signed in as</dt>
          <dd className="text-secondary truncate">{user?.email || "—"}</dd>
        </dl>
      </section>

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
