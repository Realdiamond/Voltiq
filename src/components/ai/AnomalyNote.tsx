"use client";

// Analytics page: AI narration of the recent trend — spots spikes/sags and
// explains them in plain language.

import { useEffect, useRef } from "react";
import { ScanLine, Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useAI } from "@/lib/ai/useAI";
import { buildStats } from "@/lib/ai/snapshot";
import type { AnomalyResult } from "@/lib/ai/types";
import AINotice from "./AINotice";

export default function AnomalyNote() {
  const { readings, chartData } = useDashboard();
  const { data, loading, error, notConfigured, run } = useAI<AnomalyResult>("anomaly");
  const ran = useRef(false);

  const scan = () => {
    run({
      stats: buildStats(readings),
      series: chartData.map((c) => ({ label: c.label, power: c.power, energy: c.energy })),
    });
  };

  useEffect(() => {
    if (!ran.current && readings.length > 0) {
      ran.current = true;
      scan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings.length]);

  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
            <ScanLine size={15} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3 className="text-primary font-semibold text-[14px]">AI Trend Analysis</h3>
            <p className="text-muted text-[11px]">Anomaly detection on recent readings</p>
          </div>
        </div>
        <button
          onClick={scan}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg surface surface-hover disabled:opacity-60"
          style={{ color: "var(--accent)" }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <ScanLine size={13} />}
          {loading ? "Scanning…" : "Re-scan"}
        </button>
      </div>

      {notConfigured ? (
        <AINotice kind="setup" />
      ) : error ? (
        <div className="flex items-start gap-2 text-[12px]" style={{ color: "var(--danger)" }}>
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading && !data ? (
        <p className="text-muted text-[12px]">Analysing the trend…</p>
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {data.hasAnomaly ? (
              <AlertTriangle size={15} style={{ color: "var(--warning)" }} />
            ) : (
              <CheckCircle2 size={15} style={{ color: "var(--success)" }} />
            )}
            <span className="text-[12px] font-semibold" style={{ color: data.hasAnomaly ? "var(--warning)" : "var(--success)" }}>
              {data.hasAnomaly ? "Anomaly detected" : "Trend looks normal"}
            </span>
          </div>
          <p className="text-secondary text-[13px] leading-relaxed">{data.narrative}</p>
          {data.findings.length > 0 && (
            <ul className="space-y-1.5">
              {data.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-muted text-[12px] leading-relaxed">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-muted text-[12px]">Waiting for readings…</p>
      )}
    </div>
  );
}
