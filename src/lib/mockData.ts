// ─── Mock / demo data ─────────────────────────────────────────────────────────
// Used as a fallback so the dashboard and AI features have something to show when
// Firebase is empty (e.g. hardware not connected yet, or during a live demo).
//
// This whole file is self-contained. To remove mock data once the hardware is
// streaming reliably, set NEXT_PUBLIC_ENABLE_MOCK=false in your environment, or
// delete this file's data exports and the fallback branch in useFirebaseData.ts.

import type { Device, EnergyReading, Alert } from "@/lib/types";

// Re-export types so existing imports like `import type { Device } from "@/lib/mockData"` keep working.
export type { Device, EnergyReading, Alert, ChartDataPoint } from "@/lib/types";

// Toggle: mock is on unless explicitly disabled.
export const MOCK_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MOCK !== "false";

export const MOCK_DEVICES: Device[] = [
  {
    id: "device_001",
    name: "Main Distribution Board",
    status: "online",
    location: "Utility Room",
    last_updated: new Date().toISOString(),
  },
  {
    id: "device_002",
    name: "Lab Sub-Meter",
    status: "offline",
    location: "Electronics Lab",
    last_updated: new Date(Date.now() - 42 * 60_000).toISOString(),
  },
];

// Generate a realistic recent time-series. Voltage hovers around 228V with a
// deliberate overvoltage excursion near the end so the alert + AI diagnosis
// have real grounding to reason about.
export function generateMockReadings(count = 30): EnergyReading[] {
  const now = Date.now();
  const stepMs = 2 * 60_000; // one sample every 2 minutes
  let energy = 12.4; // cumulative kWh on the meter

  const readings: EnergyReading[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * stepMs;
    const idx = count - 1 - i;

    // Base voltage ~228V with gentle wave + a spike toward the latest samples.
    const wave = Math.sin(idx / 3) * 4;
    const spike = idx >= count - 3 ? 20 + (idx - (count - 3)) * 4 : 0; // → ~252V at the end
    const voltage = 228 + wave + spike;

    // Load varies through the window; higher mid-window.
    const loadFactor = 0.5 + 0.4 * Math.sin(idx / 4 + 1);
    const power = Math.max(80, 900 * loadFactor + (idx % 5 === 0 ? 350 : 0));
    const current = power / voltage;
    const frequency = 49.9 + Math.sin(idx / 5) * 0.15;

    energy += power / 1000 / 30; // kWh added per 2-min step
    const cost = energy * 60; // rough, real cost uses the user's tariff in the UI

    readings.push({
      id: `mock_${idx}`,
      device_id: "device_001",
      voltage: +voltage.toFixed(1),
      current: +current.toFixed(2),
      power: +power.toFixed(0),
      energy: +energy.toFixed(3),
      frequency: +frequency.toFixed(2),
      cost: +cost.toFixed(1),
      timestamp: new Date(t).toISOString(),
    });
  }
  return readings;
}

export const MOCK_ALERTS: Alert[] = [
  {
    id: "mock_a1",
    type: "critical",
    message: "Overvoltage detected: supply exceeded 250V",
    value: 252.3,
    timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    id: "mock_a2",
    type: "warning",
    message: "Power draw approaching rated capacity",
    value: 1720,
    timestamp: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: "mock_a3",
    type: "info",
    message: "Lab Sub-Meter went offline",
    value: 0,
    timestamp: new Date(Date.now() - 42 * 60_000).toISOString(),
  },
];
