"use client";

// Elegant, native-feeling "smart summary" strip for the dashboard. Reads the
// live system in plain language. Always visible; on any problem it shows a calm,
// friendly message rather than a technical error.

import { useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Lightbulb, Info } from "lucide-react";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useSettings } from "@/lib/SettingsContext";
import { useAI } from "@/lib/ai/useAI";
import { buildStats, toReadingSnapshot } from "@/lib/ai/snapshot";
import type { InsightsResult } from "@/lib/ai/types";

const statusDot: Record<string, string> = {
  normal: "var(--success)",
  attention: "var(--warning)",
  critical: "var(--danger)",
};

export default function AIInsightCard() {
  const { readings, latestReading, devices } = useDashboard();
  const { tariff, currency } = useSettings();
  const { data, loading, error, run } = useAI<InsightsResult>("insights");
  const ran = useRef(false);

  const analyse = () => {
    run({
      latest: toReadingSnapshot(latestReading),
      stats: buildStats(readings),
      deviceCount: devices.length,
      onlineCount: devices.filter((d) => d.status === "online").length,
      tariff,
      currency,
    });
  };

  useEffect(() => {
    if (!ran.current && readings.length > 0) {
      ran.current = true;
      analyse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings.length]);

  return (
    <div
      className="surface p-5 sm:p-6 relative overflow-hidden"
      style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, var(--border))" }}
    >
      {/* soft accent glow */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--accent-soft)" }}
      />
      <div className="relative flex items-start gap-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
        >
          <Sparkles size={16} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-primary font-semibold text-[13px]">Smart summary</h3>
            {data && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium capitalize" style={{ color: statusDot[data.status] || "var(--text-muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusDot[data.status] || "var(--text-muted)" }} />
                {data.status}
              </span>
            )}
            <button
              onClick={analyse}
              disabled={loading}
              aria-label="Refresh summary"
              className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {loading && !data ? (
            <div className="mt-3 space-y-2 animate-pulse">
              <div className="h-3 rounded" style={{ background: "var(--bg-subtle)", width: "92%" }} />
              <div className="h-3 rounded" style={{ background: "var(--bg-subtle)", width: "70%" }} />
            </div>
          ) : data ? (
            <div className="mt-1.5 space-y-2.5">
              <p className="text-secondary text-[13px] leading-relaxed">{data.summary}</p>
              {data.tip && (
                <p className="flex items-start gap-2 text-muted text-[12px] leading-relaxed">
                  <Lightbulb size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
                  {data.tip}
                </p>
              )}
            </div>
          ) : error ? (
            <p className="mt-2 flex items-start gap-2 text-muted text-[12px] leading-relaxed">
              <Info size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
              {error}
            </p>
          ) : (
            <p className="mt-2 text-muted text-[12px]">Reading your system…</p>
          )}
        </div>
      </div>
    </div>
  );
}
