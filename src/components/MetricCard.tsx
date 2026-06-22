"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  accent: string;
  trend?: number;
  note?: string;
}

export default function MetricCard({
  label, value, unit, icon: Icon, accent, trend, note,
}: MetricCardProps) {
  return (
    <div className="surface surface-hover p-5 flex flex-col gap-4 min-w-0">
      {/* Top: icon + trend */}
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}1f` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>

        {trend !== undefined && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: trend > 0 ? "var(--success)" : trend < 0 ? "var(--danger)" : "var(--text-muted)",
              background:
                trend > 0 ? "var(--success-soft)" : trend < 0 ? "var(--danger-soft)" : "var(--bg-subtle)",
            }}
          >
            {trend > 0 && <TrendingUp size={10} />}
            {trend < 0 && <TrendingDown size={10} />}
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>

      {/* Bottom: value */}
      <div>
        <p className="text-muted text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-primary text-[28px] font-bold tabular-nums leading-none tracking-tight">
            {value}
          </span>
          <span className="text-[13px] font-semibold" style={{ color: accent }}>
            {unit}
          </span>
        </div>
        {note && <p className="text-faint text-[10px] mt-2">{note}</p>}
      </div>
    </div>
  );
}
