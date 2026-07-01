"use client";

// Dashboard "AI Insights" card — plain-English status + one actionable tip.

import { useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Lightbulb, AlertCircle } from "lucide-react";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useSettings } from "@/lib/SettingsContext";
import { useAI } from "@/lib/ai/useAI";
import { buildStats, toReadingSnapshot } from "@/lib/ai/snapshot";
import type { InsightsResult } from "@/lib/ai/types";
import AINotice from "./AINotice";

const statusColor: Record<string, string> = {
  normal: "var(--success)",
  attention: "var(--warning)",
  critical: "var(--danger)",
};

export default function AIInsightCard() {
  const { readings, latestReading, devices } = useDashboard();
  const { tariff, currency } = useSettings();
  const { data, loading, error, notConfigured, run } = useAI<InsightsResult>("insights");
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

  // Auto-run once when the first readings arrive (keeps free-tier calls low).
  useEffect(() => {
    if (!ran.current && readings.length > 0) {
      ran.current = true;
      analyse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings.length]);

  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
            <Sparkles size={15} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3 className="text-primary font-semibold text-[14px]">AI Insights</h3>
            <p className="text-muted text-[11px]">Live reading of your system</p>
          </div>
        </div>
        <button
          onClick={analyse}
          disabled={loading}
          aria-label="Refresh insights"
          className="w-8 h-8 rounded-lg surface surface-hover flex items-center justify-center text-muted disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
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
        <SkeletonLines />
      ) : data ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: "var(--bg-subtle)", color: statusColor[data.status] || "var(--text-secondary)" }}
            >
              {data.status}
            </span>
          </div>
          <p className="text-secondary text-[13px] leading-relaxed">{data.summary}</p>
          {data.highlight && (
            <p className="text-muted text-[12px] leading-relaxed">
              <span className="text-primary font-medium">Notable:</span> {data.highlight}
            </p>
          )}
          {data.tip && (
            <div className="flex items-start gap-2 p-3 rounded-xl surface-inset">
              <Lightbulb size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
              <p className="text-secondary text-[12px] leading-relaxed">{data.tip}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted text-[12px]">Waiting for readings…</p>
      )}
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 rounded" style={{ background: "var(--bg-subtle)", width: "40%" }} />
      <div className="h-3 rounded" style={{ background: "var(--bg-subtle)", width: "90%" }} />
      <div className="h-3 rounded" style={{ background: "var(--bg-subtle)", width: "75%" }} />
    </div>
  );
}
