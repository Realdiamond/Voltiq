// Re-export types from the shared types file
// so existing component imports like `import type { Device } from "@/lib/mockData"` still work.
export type { Device, EnergyReading, Alert, ChartDataPoint } from "@/lib/types";
