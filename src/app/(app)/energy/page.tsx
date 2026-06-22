"use client";

import EnergyChart from "@/components/EnergyChart";
import MetricCard from "@/components/MetricCard";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useSettings } from "@/lib/SettingsContext";
import { BatteryCharging, CircleDollarSign, Cpu, CalendarDays } from "lucide-react";

export default function EnergyPage() {
  const { readings, latestReading, chartData } = useDashboard();
  const { tariff, currency } = useSettings();

  const len = readings.length || 1;
  const avgPowerW = readings.reduce((s, r) => s + (r.power || 0), 0) / len;

  // Projected consumption from current average draw
  const kWhPerDay = (avgPowerW / 1000) * 24;
  const costPerDay = kWhPerDay * tariff;
  const costPerMonth = costPerDay * 30;

  const money = (n: number) =>
    `${currency}${Math.round(n).toLocaleString()}`;

  const stats = [
    { label: "Cumulative Energy", value: latestReading.energy.toFixed(2), unit: "kWh", icon: BatteryCharging, accent: "#0891b2", note: "Meter total" },
    { label: "Avg Power Draw", value: avgPowerW.toFixed(0), unit: "W", icon: Cpu, accent: "#6366f1", note: `${readings.length} samples` },
    { label: "Est. Daily Cost", value: Math.round(costPerDay).toLocaleString(), unit: currency, icon: CircleDollarSign, accent: "#2563eb", note: `${kWhPerDay.toFixed(1)} kWh/day` },
    { label: "Est. Monthly Cost", value: Math.round(costPerMonth).toLocaleString(), unit: currency, icon: CalendarDays, accent: "#1d4ed8", note: `@ ${currency}${tariff}/kWh` },
  ];

  return (
    <>
      <div>
        <h1 className="text-primary font-semibold text-lg">Energy &amp; Cost</h1>
        <p className="text-muted text-[12px] mt-1">
          Consumption and projected billing at {money(tariff)}/kWh (configurable in Settings).
        </p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <MetricCard key={s.label} {...s} />
        ))}
      </section>

      <section>
        {chartData.length > 0 ? (
          <EnergyChart data={chartData} />
        ) : (
          <div className="surface p-6 flex items-center justify-center h-[360px]">
            <p className="text-muted text-sm">No readings yet — waiting for data…</p>
          </div>
        )}
      </section>

      <div className="pb-4" />
    </>
  );
}
