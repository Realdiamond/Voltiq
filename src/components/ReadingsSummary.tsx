"use client";

import { Activity, Gauge, Zap } from "lucide-react";
import type { EnergyReading } from "@/lib/mockData";
import { useSettings } from "@/lib/SettingsContext";

export default function ReadingsSummary({ readings }: { readings: EnergyReading[] }) {
  const { tariff, powerLimitW, currency } = useSettings();
  const len = readings.length || 1; // prevent division by zero
  const avg = (k: keyof EnergyReading) =>
    readings.reduce((s, r) => s + (r[k] as number), 0) / len;
  const max = (k: keyof EnergyReading) =>
    readings.length > 0 ? Math.max(...readings.map((r) => r[k] as number)) : 0;

  const pct = Math.min((avg("power") / powerLimitW) * 100, 100);
  const kw = (powerLimitW / 1000).toFixed(powerLimitW % 1000 === 0 ? 0 : 1);

  const stats = [
    { label: "Avg Power",    val: `${avg("power").toFixed(0)}W`,    icon: Activity, color: "var(--accent)" },
    { label: "Peak Voltage", val: `${max("voltage").toFixed(1)}V`,  icon: Gauge,    color: "#0ea5e9" },
    { label: "Max Current",  val: `${max("current").toFixed(1)}A`,  icon: Zap,      color: "#6366f1" },
  ];

  return (
    <div className="surface p-6 h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-primary font-semibold text-[14px]">24h Summary</h3>
        <p className="text-muted text-[11px] mt-1">Aggregated from {readings.length} readings</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {stats.map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center gap-2 px-2 py-3.5 surface-inset min-w-0">
            <Icon size={15} style={{ color }} className="flex-shrink-0" />
            <span className="text-primary font-bold text-[13px] tabular-nums leading-none text-center">{val}</span>
            <span className="text-muted text-[9px] text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Utilisation bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[10px] mb-2 gap-2">
          <span className="text-muted">Power utilisation</span>
          <span className="text-secondary font-semibold tabular-nums whitespace-nowrap">{pct.toFixed(0)}% of {kw}kW</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-subtle)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), #0ea5e9)" }}
          />
        </div>
      </div>

      {/* Daily cost */}
      <div className="mt-auto p-4 surface-inset">
        <p className="text-muted text-[10px] uppercase tracking-wider font-medium">Est. Daily Cost</p>
        <p className="text-primary font-bold text-[22px] tabular-nums mt-1">
          {currency}{(avg("energy") * tariff).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className="text-faint text-[10px] mt-1">@ {currency}{tariff} / kWh tariff</p>
      </div>
    </div>
  );
}
