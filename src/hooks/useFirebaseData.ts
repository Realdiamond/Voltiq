"use client";

import { useEffect, useState } from "react";
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Device, EnergyReading, Alert, ChartDataPoint } from "@/lib/types";

// ─── Fallback mock data (shown while loading / if Firebase is empty) ──────────

const FALLBACK_READING: EnergyReading = {
  id: "fallback",
  device_id: "device_001",
  voltage: 0,
  current: 0,
  power: 0,
  energy: 0,
  frequency: 0,
  cost: 0,
  timestamp: new Date().toISOString(),
};

// ─── Hook Return Type ─────────────────────────────────────────────────────────

export interface DashboardData {
  devices: Device[];
  readings: EnergyReading[];
  latestReading: EnergyReading;
  alerts: Alert[];
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFirebaseData(): DashboardData {
  const [devices, setDevices] = useState<Device[]>([]);
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Track which listeners have reported in
    let devicesLoaded = false;
    let readingsLoaded = false;
    let alertsLoaded = false;

    const checkDone = () => {
      if (devicesLoaded && readingsLoaded && alertsLoaded) {
        setLoading(false);
      }
    };

    // ── 1) Devices ──────────────────────────────────────────────────────────
    const devicesRef = ref(db, "devices");
    const unsubDevices = onValue(
      devicesRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: Device[] = Object.entries(val).map(([key, data]) => {
            const d = data as Record<string, unknown>;
            return {
              id: key,
              name: (d.name as string) || key,
              status: (d.status as "online" | "offline") || "offline",
              location: (d.location as string) || "Unknown",
              last_updated: (d.last_updated as string) || new Date().toISOString(),
            };
          });
          setDevices(list);
        } else {
          setDevices([]);
        }
        devicesLoaded = true;
        checkDone();
      },
      (err) => {
        console.error("Firebase devices error:", err);
        setError(`Devices: ${err.message}`);
        devicesLoaded = true;
        checkDone();
      }
    );

    // ── 2) Readings (last 50, ordered by timestamp) ─────────────────────────
    const readingsRef = query(
      ref(db, "readings"),
      orderByChild("timestamp"),
      limitToLast(50)
    );
    const unsubReadings = onValue(
      readingsRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: EnergyReading[] = Object.entries(val)
            .map(([key, data]) => {
              const r = data as Record<string, unknown>;
              return {
                id: key,
                device_id: (r.device_id as string) || "",
                voltage: Number(r.voltage) || 0,
                current: Number(r.current) || 0,
                power: Number(r.power) || 0,
                energy: Number(r.energy) || 0,
                frequency: Number(r.frequency) || 0,
                cost: Number(r.cost) || 0,
                timestamp: (r.timestamp as string) || "",
              };
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setReadings(list);
        } else {
          setReadings([]);
        }
        readingsLoaded = true;
        checkDone();
      },
      (err) => {
        console.error("Firebase readings error:", err);
        setError(`Readings: ${err.message}`);
        readingsLoaded = true;
        checkDone();
      }
    );

    // ── 3) Alerts ───────────────────────────────────────────────────────────
    const alertsRef = query(
      ref(db, "alerts"),
      orderByChild("timestamp"),
      limitToLast(10)
    );
    const unsubAlerts = onValue(
      alertsRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const VALID_TYPES = new Set(["critical", "warning", "info"]);
          const list: Alert[] = Object.entries(val)
            .map(([key, data]) => {
              const a = data as Record<string, unknown>;
              const rawType = String(a.type || "info").toLowerCase();
              return {
                id: key,
                type: (VALID_TYPES.has(rawType) ? rawType : "info") as "critical" | "warning" | "info",
                message: (a.message as string) || "",
                value: Number(a.value) || 0,
                timestamp: (a.timestamp as string) || "",
              };
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setAlerts(list);
        } else {
          setAlerts([]);
        }
        alertsLoaded = true;
        checkDone();
      },
      (err) => {
        console.error("Firebase alerts error:", err);
        setError(`Alerts: ${err.message}`);
        alertsLoaded = true;
        checkDone();
      }
    );

    // Cleanup on unmount
    return () => {
      unsubDevices();
      unsubReadings();
      unsubAlerts();
    };
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────

  const latestReading: EnergyReading =
    readings.length > 0 ? readings[readings.length - 1] : FALLBACK_READING;

  const chartData: ChartDataPoint[] = readings.map((r) => ({
    label: new Date(r.timestamp).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    energy: parseFloat(r.energy.toFixed(2)),
    power: parseFloat(r.power.toFixed(1)),
  }));

  return { devices, readings, latestReading, alerts, chartData, loading, error };
}
