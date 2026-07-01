// ─── Snapshot builders (client-safe) ─────────────────────────────────────────
// Turn the dashboard's reading arrays into the small summarised shapes the AI
// endpoint expects. Keeping this pure and shared avoids each component
// re-deriving stats slightly differently.

import type { EnergyReading } from "@/lib/types";
import type { ReadingSnapshot, StatsSnapshot } from "./types";

export function toReadingSnapshot(r: EnergyReading): ReadingSnapshot {
  return {
    voltage: r.voltage,
    current: r.current,
    power: r.power,
    energy: r.energy,
    frequency: r.frequency,
    cost: r.cost,
    timestamp: r.timestamp,
  };
}

export function buildStats(readings: EnergyReading[]): StatsSnapshot {
  const n = readings.length;
  if (n === 0) {
    return {
      sampleCount: 0, avgPower: 0, peakPower: 0, minVoltage: 0,
      peakVoltage: 0, maxCurrent: 0, avgFrequency: 0, energyUsed: 0,
    };
  }
  const sum = (k: keyof EnergyReading) => readings.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const max = (k: keyof EnergyReading) => Math.max(...readings.map((r) => Number(r[k]) || 0));
  const minV = Math.min(...readings.map((r) => Number(r.voltage) || 0));
  const energyUsed = Math.max(0, (Number(readings[n - 1].energy) || 0) - (Number(readings[0].energy) || 0));

  return {
    sampleCount: n,
    avgPower: sum("power") / n,
    peakPower: max("power"),
    minVoltage: minV,
    peakVoltage: max("voltage"),
    maxCurrent: max("current"),
    avgFrequency: sum("frequency") / n,
    energyUsed,
  };
}
