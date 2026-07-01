// ─── Shared AI types (client + server safe — no server-only imports here) ─────
// These describe the request payloads and structured responses for every AI
// feature in Voltiq. Both the client hook (useAI) and the API route import
// from this file so the contract stays in one place.

export type AITask = "diagnose" | "insights" | "advisor" | "anomaly" | "chat";

// ── Compact snapshots we send to the model as grounding context ──────────────
// We deliberately send small, pre-summarised numbers rather than raw arrays so
// prompts stay cheap and fast on the free tier.

export interface ReadingSnapshot {
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  cost: number;
  timestamp: string;
}

export interface StatsSnapshot {
  sampleCount: number;
  avgPower: number;
  peakPower: number;
  minVoltage: number;
  peakVoltage: number;
  maxCurrent: number;
  avgFrequency: number;
  energyUsed: number;      // kWh across the window
}

export interface AlertInput {
  type: "critical" | "warning" | "info";
  message: string;
  value: number;
  timestamp: string;
}

// ── Per-task request payloads ────────────────────────────────────────────────

export interface DiagnosePayload {
  alert: AlertInput;
  latest: ReadingSnapshot;
  stats: StatsSnapshot;
  currency: string;
}

export interface InsightsPayload {
  latest: ReadingSnapshot;
  stats: StatsSnapshot;
  deviceCount: number;
  onlineCount: number;
  tariff: number;
  currency: string;
}

export interface AdvisorPayload {
  avgPower: number;
  kWhPerDay: number;
  costPerDay: number;
  costPerMonth: number;
  tariff: number;
  currency: string;
}

export interface AnomalyPayload {
  stats: StatsSnapshot;
  series: { label: string; power: number; energy: number }[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPayload {
  messages: ChatMessage[];
  latest: ReadingSnapshot;
  stats: StatsSnapshot;
  tariff: number;
  currency: string;
}

// ── Per-task structured responses ────────────────────────────────────────────

export interface DiagnoseResult {
  title: string;          // short human name for the condition
  cause: string;          // likely root cause
  severity: "low" | "medium" | "high";
  recommendation: string; // one-line headline action
  steps: string[];        // concrete steps the user can take
}

export interface InsightsResult {
  status: "normal" | "attention" | "critical";
  summary: string;
  highlight: string;
  tip: string;
}

export interface AdvisorResult {
  summary: string;
  recommendations: { title: string; detail: string; saving: string }[];
}

export interface AnomalyResult {
  hasAnomaly: boolean;
  narrative: string;
  findings: string[];
}

export interface ChatResult {
  reply: string;
}
