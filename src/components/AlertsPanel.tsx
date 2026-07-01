"use client";

import { ShieldAlert, AlertTriangle, Info, Clock } from "lucide-react";
import type { Alert } from "@/lib/mockData";
import DiagnoseButton from "@/components/ai/DiagnoseButton";

// Config for known alert types — colors reference theme tokens
const config: Record<string, {
  Icon: React.ElementType;
  color: string;
  soft: string;
}> = {
  critical: { Icon: ShieldAlert,   color: "var(--danger)",  soft: "var(--danger-soft)" },
  warning:  { Icon: AlertTriangle, color: "var(--warning)", soft: "var(--warning-soft)" },
  info:     { Icon: Info,          color: "var(--accent)",  soft: "var(--accent-soft)" },
};

const fallbackConfig = config.info;

function ago(ts: string) {
  if (!ts) return "—";
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const crit = alerts.filter((a) => a.type === "critical").length;

  return (
    <div className="surface p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-primary font-semibold text-[14px]">Recent Alerts</h3>
          <p className="text-muted text-[11px] mt-1">System events &amp; notifications</p>
        </div>
        {crit > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: "var(--danger-soft)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full opacity-60" style={{ background: "var(--danger)" }} />
              <span className="relative rounded-full h-2 w-2" style={{ background: "var(--danger)" }} />
            </span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--danger)" }}>{crit} Critical</span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted text-sm">No alerts yet</p>
        </div>
      )}

      {/* Alert rows */}
      <div className="space-y-2.5">
        {alerts.map((a) => {
          const c = config[a.type] ?? fallbackConfig;
          return (
            <div
              key={a.id}
              className="flex gap-3 p-3.5 rounded-xl surface-inset"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: c.soft }}
              >
                <c.Icon size={14} style={{ color: c.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-secondary text-[12px] leading-relaxed">{a.message || "No message"}</p>
                  <span
                    className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: c.soft, color: c.color }}
                  >
                    {a.type || "info"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-muted text-[10px]">
                  <Clock size={9} />
                  <span>{ago(a.timestamp)}</span>
                  {a.value > 0 && (
                    <span className="ml-2 font-mono text-faint">{a.value.toFixed(1)}</span>
                  )}
                </div>
                <DiagnoseButton alert={a} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
