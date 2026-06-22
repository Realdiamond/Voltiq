// ─── Firebase Database Types ──────────────────────────────────────────────────
// These match the structure stored in Firebase Realtime Database.

export interface Device {
  id: string;
  name?: string;
  status: "online" | "offline";
  location: string;
  last_updated: string;
}

export interface EnergyReading {
  id: string;
  device_id: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  cost: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  value: number;
  timestamp: string;
}

export interface ChartDataPoint {
  label: string;
  energy: number;
  power: number;
}
