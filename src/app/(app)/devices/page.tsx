"use client";

import DeviceStatus from "@/components/DeviceStatus";
import MetricCard from "@/components/MetricCard";
import { useDashboard } from "@/lib/DashboardDataContext";
import { Cpu, Wifi, WifiOff } from "lucide-react";

export default function DevicesPage() {
  const { devices } = useDashboard();
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.length - online;

  const stats = [
    { label: "Total Devices", value: String(devices.length), unit: "", icon: Cpu, accent: "#2563eb", note: "Registered" },
    { label: "Online", value: String(online), unit: "", icon: Wifi, accent: "#16a34a", note: "Reporting" },
    { label: "Offline", value: String(offline), unit: "", icon: WifiOff, accent: "#dc2626", note: "Not reporting" },
  ];

  return (
    <>
      <div>
        <h1 className="text-primary font-semibold text-lg">Devices</h1>
        <p className="text-muted text-[12px] mt-1">
          ESP32 + PZEM-004T sensing nodes registered to your account.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <MetricCard key={s.label} {...s} />
        ))}
      </section>

      <section>
        <DeviceStatus devices={devices} />
      </section>

      <div className="pb-4" />
    </>
  );
}
