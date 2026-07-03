"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { CircleDollarSign, Gauge, RotateCcw, Database, UserCircle, Check, Loader2, BellRing } from "lucide-react";
import { notificationPermission, requestNotificationPermission, notificationsSupported } from "@/lib/notifications";

export default function SettingsPage() {
  const { tariff, powerLimitW, currency, notify, setTariff, setPowerLimitW, setNotify, reset } = useSettings();
  const { displayName, user, updateName } = useAuth();

  const [perm, setPerm] = useState<NotificationPermission>("default");
  useEffect(() => { setPerm(notificationPermission()); }, []);

  const toggleNotify = async () => {
    if (notify) { setNotify(false); return; }
    const p = await requestNotificationPermission();
    setPerm(p);
    setNotify(p === "granted");
  };

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

      {/* Notifications */}
      <section className="surface p-6 max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <BellRing size={16} className="mt-0.5" style={{ color: "var(--accent)" }} />
            <div>
              <h2 className="text-primary font-semibold text-[14px]">Alert notifications</h2>
              <p className="text-muted text-[12px] mt-1 max-w-md">
                Get a notification when a new critical or warning alert is raised — for example when a
                reading exceeds its limit. Works while Voltiq is open in your browser.
              </p>
              {perm === "denied" && (
                <p className="text-[11px] mt-2" style={{ color: "var(--warning)" }}>
                  Notifications are blocked in your browser. Enable them for this site in your browser settings.
                </p>
              )}
              {!notificationsSupported() && (
                <p className="text-[11px] mt-2 text-faint">This browser doesn&apos;t support notifications.</p>
              )}
            </div>
          </div>

          {/* toggle */}
          <button
            role="switch"
            aria-checked={notify}
            aria-label="Toggle alert notifications"
            onClick={toggleNotify}
            disabled={perm === "denied" || !notificationsSupported()}
            className="relative w-12 h-7 rounded-full flex-shrink-0 transition-colors disabled:opacity-40"
            style={{ background: notify ? "var(--accent)" : "var(--bg-subtle)" }}
          >
            <span
              className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: notify ? "translateX(22px)" : "translateX(4px)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
            />
          </button>
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
