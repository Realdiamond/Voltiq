"use client";

// The flagship feature: for a given alert, ask the AI what the underlying issue
// most likely is and what the user should actually do about it.

import { Stethoscope, Loader2, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useSettings } from "@/lib/SettingsContext";
import { useAI } from "@/lib/ai/useAI";
import { buildStats, toReadingSnapshot } from "@/lib/ai/snapshot";
import type { Alert } from "@/lib/types";
import type { DiagnoseResult } from "@/lib/ai/types";
import AINotice from "./AINotice";

const sevColor: Record<string, string> = {
  low: "var(--success)",
  medium: "var(--warning)",
  high: "var(--danger)",
};

export default function DiagnoseButton({ alert }: { alert: Alert }) {
  const { readings, latestReading } = useDashboard();
  const { currency } = useSettings();
  const { data, loading, error, notConfigured, run, reset } = useAI<DiagnoseResult>("diagnose");

  const diagnose = () => {
    if (data) { reset(); return; } // toggle closed if already open
    run({
      alert: { type: alert.type, message: alert.message, value: alert.value, timestamp: alert.timestamp },
      latest: toReadingSnapshot(latestReading),
      stats: buildStats(readings),
      currency,
    });
  };

  return (
    <div className="mt-2">
      <button
        onClick={diagnose}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg surface surface-hover disabled:opacity-60"
        style={{ color: "var(--accent)" }}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Stethoscope size={12} />}
        {loading ? "Diagnosing…" : data ? "Hide diagnosis" : "Explain this alert"}
        {data && <ChevronDown size={12} />}
      </button>

      {notConfigured && <div className="mt-2"><AINotice kind="setup" /></div>}

      {error && !notConfigured && (
        <div className="mt-2 flex items-start gap-2 text-[11px]" style={{ color: "var(--danger)" }}>
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="mt-2 p-3.5 rounded-xl surface-inset space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-primary font-semibold text-[13px]">{data.title}</h4>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "var(--bg-subtle)", color: sevColor[data.severity] || "var(--text-secondary)" }}
            >
              {data.severity} severity
            </span>
          </div>

          <div>
            <p className="text-muted text-[10px] font-semibold uppercase tracking-wider mb-1">Likely cause</p>
            <p className="text-secondary text-[12px] leading-relaxed">{data.cause}</p>
          </div>

          {data.recommendation && (
            <div>
              <p className="text-muted text-[10px] font-semibold uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-primary text-[12px] font-medium leading-relaxed">{data.recommendation}</p>
            </div>
          )}

          {data.steps.length > 0 && (
            <div>
              <p className="text-muted text-[10px] font-semibold uppercase tracking-wider mb-1.5">What to do</p>
              <ul className="space-y-1.5">
                {data.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-secondary text-[12px] leading-relaxed">
                    <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-faint text-[10px] pt-1">AI-generated guidance — verify before acting on electrical hardware.</p>
        </div>
      )}
    </div>
  );
}
