"use client";

import MetricCard from "@/components/MetricCard";
import EnergyChart from "@/components/EnergyChart";
import AnomalyNote from "@/components/ai/AnomalyNote";
import { useDashboard } from "@/lib/DashboardDataContext";
import { Activity, Cpu, Gauge, Zap, TrendingUp, BatteryCharging } from "lucide-react";

export default function AnalyticsPage() {
  const { readings, chartData } = useDashboard();

  const len = readings.length || 1;
  const avg = (k: "power" | "voltage" | "current" | "frequency") =>
    readings.reduce((s, r) => s + (r[k] || 0), 0) / len;
  const peak = (k: "power" | "voltage" | "current") =>
    readings.length ? Math.max(...readings.map((r) => r[k] || 0)) : 0;
  const min = (k: "voltage") =>
    readings.length ? Math.min(...readings.map((r) => r[k] || 0)) : 0;

  // Energy consumed across the window (last cumulative − first cumulative)
  const energyDelta =
    readings.length > 1
      ? Math.max(0, readings[readings.length - 1].energy - readings[0].energy)
      : 0;

  const stats = [
    { label: "Avg Power", value: avg("power").toFixed(0), unit: "W", icon: Cpu, accent: "#6366f1", note: `${readings.length} samples` },
    { label: "Peak Power", value: peak("power").toFixed(0), unit: "W", icon: TrendingUp, accent: "#2563eb", note: "Window max" },
    { label: "Peak Voltage", value: peak("voltage").toFixed(1), unit: "V", icon: Gauge, accent: "#0ea5e9", note: "Window max" },
    { label: "Min Voltage", value: min("voltage").toFixed(1), unit: "V", icon: Gauge, accent: "#14b8a6", note: "Window min" },
    { label: "Max Current", value: peak("current").toFixed(2), unit: "A", icon: Zap, accent: "#0891b2", note: "Window max" },
    { label: "Energy Used", value: energyDelta.toFixed(2), unit: "kWh", icon: BatteryCharging, accent: "#1d4ed8", note: "Across window" },
  ];

  return (
    <>
      <div>
        <h1 className="text-primary font-bold text-[20px] sm:text-[22px] tracking-tight">Analytics</h1>
        <p className="text-muted text-[12px] mt-1">
          Derived metrics and trends from the latest {readings.length} readings.
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <MetricCard key={s.label} {...s} />
        ))}
      </section>

      <section>
        {chartData.length > 0 ? (
          <EnergyChart data={chartData} />
        ) : (
          <div className="surface p-6 flex items-center justify-center h-[360px]">
            <p className="text-muted text-sm flex items-center gap-2">
              <Activity size={16} /> No readings yet — analytics will populate as data arrives.
            </p>
          </div>
        )}
      </section>

      <section>
        <AnomalyNote />
      </section>

      <div className="pb-4" />
    </>
  );
}
