"use client";

import { Wifi, WifiOff, MapPin } from "lucide-react";
import type { Device } from "@/lib/mockData";

export default function DeviceStatus({ devices }: { devices: Device[] }) {
  const online = devices.filter((d) => d.status === "online").length;

  return (
    <div className="surface p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-primary font-semibold text-[14px]">Device Status</h3>
          <p className="text-muted text-[11px] mt-1">
            <span className="font-semibold" style={{ color: "var(--success)" }}>{online}</span> of {devices.length} connected
          </p>
        </div>
      </div>

      {devices.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted text-sm">No devices connected</p>
        </div>
      )}

      <div className="space-y-3">
        {devices.map((d) => {
          const on = d.status === "online";
          return (
            <div
              key={d.id}
              className="flex items-center gap-4 p-4 rounded-xl border surface-hover"
              style={{
                background: on ? "var(--bg-inset)" : "var(--danger-soft)",
                borderColor: on ? "var(--border)" : "transparent",
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: on ? "var(--success-soft)" : "var(--danger-soft)" }}
              >
                {on
                  ? <Wifi size={16} style={{ color: "var(--success)" }} />
                  : <WifiOff size={16} style={{ color: "var(--danger)" }} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-primary text-[13px] font-medium truncate">{d.name}</p>
                <div className="flex items-center gap-1 mt-1 text-muted text-[10px]">
                  <MapPin size={9} />
                  <span className="truncate">{d.location}</span>
                </div>
              </div>

              {/* Badge */}
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  background: on ? "var(--success-soft)" : "var(--danger-soft)",
                  color: on ? "var(--success)" : "var(--danger)",
                }}
              >
                {d.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
