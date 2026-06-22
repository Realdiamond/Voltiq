"use client";

import MetricCard from "@/components/MetricCard";
import EnergyChart from "@/components/EnergyChart";
import DeviceStatus from "@/components/DeviceStatus";
import AlertsPanel from "@/components/AlertsPanel";
import ReadingsSummary from "@/components/ReadingsSummary";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useSettings } from "@/lib/SettingsContext";
import {
  Zap, Activity, Cpu, BatteryCharging, Radio, CircleDollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const { devices, readings, latestReading, alerts, chartData } = useDashboard();
  const { tariff, currency } = useSettings();

  const cost = latestReading.energy * tariff;

  const kpis = [
    { label: "Voltage", value: latestReading.voltage.toFixed(1), unit: "V", icon: Zap, accent: "#2563eb", trend: 1.2, note: "Nominal: 220V" },
    { label: "Current", value: latestReading.current.toFixed(2), unit: "A", icon: Activity, accent: "#0ea5e9", trend: -0.5, note: "Max rated: 20A" },
    { label: "Power", value: latestReading.power.toFixed(0), unit: "W", icon: Cpu, accent: "#6366f1", trend: 3.8, note: "Active load" },
    { label: "Energy", value: latestReading.energy.toFixed(2), unit: "kWh", icon: BatteryCharging, accent: "#0891b2", trend: 4.3, note: "Cumulative" },
    { label: "Frequency", value: latestReading.frequency.toFixed(1), unit: "Hz", icon: Radio, accent: "#14b8a6", note: "Nominal: 50Hz" },
    { label: "Cost", value: Number(cost.toFixed(0)).toLocaleString(), unit: currency, icon: CircleDollarSign, accent: "#1d4ed8", trend: 4.3, note: `@ ${currency}${tariff}/kWh` },
  ];

  return (
    <>
      {/* KPI cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.label} {...kpi} />
        ))}
      </section>

      {/* Chart + Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {chartData.length > 0 ? (
            <EnergyChart data={chartData} />
          ) : (
            <div className="surface p-6 flex items-center justify-center h-[360px]">
              <p className="text-muted text-sm">No readings yet — waiting for data…</p>
            </div>
          )}
        </div>
        <div>
          <ReadingsSummary readings={readings} />
        </div>
      </section>

      {/* Devices + Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DeviceStatus devices={devices} />
        <AlertsPanel alerts={alerts} />
      </section>

      <div className="pb-4" />
    </>
  );
}
