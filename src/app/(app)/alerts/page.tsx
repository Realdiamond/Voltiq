"use client";

import AlertsPanel from "@/components/AlertsPanel";
import MetricCard from "@/components/MetricCard";
import { useDashboard } from "@/lib/DashboardDataContext";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";

export default function AlertsPage() {
  const { alerts } = useDashboard();
  const count = (t: string) => alerts.filter((a) => a.type === t).length;

  const stats = [
    { label: "Critical", value: String(count("critical")), unit: "", icon: ShieldAlert, accent: "#dc2626", note: "Needs attention" },
    { label: "Warnings", value: String(count("warning")), unit: "", icon: AlertTriangle, accent: "#d97706", note: "Monitor" },
    { label: "Info", value: String(count("info")), unit: "", icon: Info, accent: "#2563eb", note: "Notices" },
  ];

  return (
    <>
      <div>
        <h1 className="text-primary font-bold text-[20px] sm:text-[22px] tracking-tight">Alerts</h1>
        <p className="text-muted text-[12px] mt-1">
          Threshold breaches and system events pushed from your devices.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <MetricCard key={s.label} {...s} />
        ))}
      </section>

      <section>
        <AlertsPanel alerts={alerts} />
      </section>

      <div className="pb-4" />
    </>
  );
}
