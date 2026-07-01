// ─── AI task handlers (SERVER ONLY) ──────────────────────────────────────────
// Each handler turns a typed payload into a grounded prompt, calls the model,
// and returns a typed result. The domain expertise (what an overvoltage means,
// how to advise on cost, etc.) lives in the system prompts here.

import "server-only";
import { generate, parseJSON, type ChatTurn } from "./provider";
import type {
  AITask,
  DiagnosePayload, DiagnoseResult,
  InsightsPayload, InsightsResult,
  AdvisorPayload, AdvisorResult,
  AnomalyPayload, AnomalyResult,
  ChatPayload, ChatResult,
} from "./types";

// A shared framing so every feature speaks with the same domain grounding.
const DOMAIN = `You are Voltiq AI, the built-in energy assistant for an IoT smart energy monitoring system.
The system uses an ESP32 microcontroller and a PZEM-004T V3.0 meter to measure a single-phase mains
supply. Nominal grid values for this deployment (Nigeria, 230V region): voltage ~220-240V, frequency ~50Hz.
Overvoltage (>250V) and undervoltage (<200V) both risk damaging appliances. Costs are billed per kWh at a
user-set tariff. Be accurate, practical and concise. Never invent readings you were not given. If data is
missing or all-zero, say monitoring is still warming up rather than guessing.`;

function num(n: number, d = 1) {
  return Number.isFinite(n) ? n.toFixed(d) : "0";
}

// ── 1) Diagnose an alert: root cause + recommended action ─────────────────────

async function diagnose(p: DiagnosePayload): Promise<DiagnoseResult> {
  const system = `${DOMAIN}

TASK: A monitoring alert was raised. Explain the MOST LIKELY underlying issue in plain language for a
non-expert, then give concrete actions. Base your reasoning on the live readings provided.

Respond with ONLY a JSON object of this exact shape:
{
  "title": "short name of the condition (e.g. 'Overvoltage event')",
  "cause": "1-2 sentence most-likely root cause",
  "severity": "low" | "medium" | "high",
  "recommendation": "one-line headline action",
  "steps": ["specific step 1", "specific step 2", "step 3"]
}`;

  const user = `ALERT
  type: ${p.alert.type}
  message: ${p.alert.message}
  value: ${p.alert.value}
  time: ${p.alert.timestamp}

LIVE READINGS AT THIS TIME
  voltage: ${num(p.latest.voltage)} V
  current: ${num(p.latest.current, 2)} A
  power: ${num(p.latest.power, 0)} W
  frequency: ${num(p.latest.frequency)} Hz
  energy (cumulative): ${num(p.latest.energy, 2)} kWh

RECENT WINDOW
  samples: ${p.stats.sampleCount}
  avg power: ${num(p.stats.avgPower, 0)} W, peak power: ${num(p.stats.peakPower, 0)} W
  voltage range: ${num(p.stats.minVoltage)}–${num(p.stats.peakVoltage)} V
  max current: ${num(p.stats.maxCurrent, 2)} A`;

  const raw = await generate({ system, turns: [{ role: "user", content: user }], json: true, temperature: 0.3 });
  const r = parseJSON<DiagnoseResult>(raw);
  return {
    title: r.title || "Diagnosis",
    cause: r.cause || "",
    severity: (["low", "medium", "high"].includes(r.severity) ? r.severity : "medium") as DiagnoseResult["severity"],
    recommendation: r.recommendation || "",
    steps: Array.isArray(r.steps) ? r.steps.slice(0, 6) : [],
  };
}

// ── 2) Dashboard insights: plain-English status + one tip ─────────────────────

async function insights(p: InsightsPayload): Promise<InsightsResult> {
  const system = `${DOMAIN}

TASK: Summarise the current state of the user's electricity in 1-2 sentences a normal person understands,
call out the single most notable thing, and give ONE actionable tip. Respond with ONLY this JSON:
{
  "status": "normal" | "attention" | "critical",
  "summary": "1-2 sentence plain-English status",
  "highlight": "the single most notable observation",
  "tip": "one practical, specific tip"
}`;

  const dailyKWh = (p.stats.avgPower / 1000) * 24;
  const user = `NOW
  voltage: ${num(p.latest.voltage)} V, current: ${num(p.latest.current, 2)} A, power: ${num(p.latest.power, 0)} W, frequency: ${num(p.latest.frequency)} Hz
RECENT
  avg power: ${num(p.stats.avgPower, 0)} W, peak: ${num(p.stats.peakPower, 0)} W, voltage range: ${num(p.stats.minVoltage)}–${num(p.stats.peakVoltage)} V
  projected use at this rate: ${num(dailyKWh, 1)} kWh/day → about ${p.currency}${num(dailyKWh * p.tariff, 0)}/day
DEVICES: ${p.onlineCount}/${p.deviceCount} online
TARIFF: ${p.currency}${p.tariff}/kWh`;

  const raw = await generate({ system, turns: [{ role: "user", content: user }], json: true, temperature: 0.4 });
  const r = parseJSON<InsightsResult>(raw);
  return {
    status: (["normal", "attention", "critical"].includes(r.status) ? r.status : "normal") as InsightsResult["status"],
    summary: r.summary || "",
    highlight: r.highlight || "",
    tip: r.tip || "",
  };
}

// ── 3) Cost / savings advisor ─────────────────────────────────────────────────

async function advisor(p: AdvisorPayload): Promise<AdvisorResult> {
  const system = `${DOMAIN}

TASK: Act as an energy cost advisor. Given the user's consumption and tariff, give a short overview then
2-4 concrete ways to reduce the bill, each with a rough saving expressed in ${p.currency} or %. Be realistic —
do not promise unrealistic savings. Respond with ONLY this JSON:
{
  "summary": "1-2 sentence overview of their spending",
  "recommendations": [
    { "title": "short action", "detail": "how/why, 1-2 sentences", "saving": "rough estimate e.g. '${p.currency}1,500/mo' or '~10%'" }
  ]
}`;

  const user = `CONSUMPTION
  average power draw: ${num(p.avgPower, 0)} W
  projected: ${num(p.kWhPerDay, 1)} kWh/day
  estimated cost: ${p.currency}${num(p.costPerDay, 0)}/day, ${p.currency}${num(p.costPerMonth, 0)}/month
  tariff: ${p.currency}${p.tariff}/kWh`;

  const raw = await generate({ system, turns: [{ role: "user", content: user }], json: true, temperature: 0.5 });
  const r = parseJSON<AdvisorResult>(raw);
  return {
    summary: r.summary || "",
    recommendations: Array.isArray(r.recommendations)
      ? r.recommendations.slice(0, 5).map((x) => ({
          title: x.title || "",
          detail: x.detail || "",
          saving: x.saving || "",
        }))
      : [],
  };
}

// ── 4) Anomaly narration for the analytics trend ──────────────────────────────

async function anomaly(p: AnomalyPayload): Promise<AnomalyResult> {
  const system = `${DOMAIN}

TASK: Look at the recent power/energy trend and stats. Decide whether anything looks unusual (a spike, a
sag, unstable voltage, a sudden drop to zero). Explain what you see in plain language. Respond with ONLY:
{
  "hasAnomaly": true | false,
  "narrative": "1-3 sentence plain-English reading of the trend",
  "findings": ["specific observation 1", "observation 2"]
}`;

  const seriesText = p.series
    .slice(-24)
    .map((s) => `${s.label}: ${num(s.power, 0)}W`)
    .join(", ");
  const user = `STATS
  samples: ${p.stats.sampleCount}, avg power: ${num(p.stats.avgPower, 0)} W, peak: ${num(p.stats.peakPower, 0)} W
  voltage range: ${num(p.stats.minVoltage)}–${num(p.stats.peakVoltage)} V, max current: ${num(p.stats.maxCurrent, 2)} A
POWER SERIES (oldest→newest): ${seriesText || "no data yet"}`;

  const raw = await generate({ system, turns: [{ role: "user", content: user }], json: true, temperature: 0.4 });
  const r = parseJSON<AnomalyResult>(raw);
  return {
    hasAnomaly: Boolean(r.hasAnomaly),
    narrative: r.narrative || "",
    findings: Array.isArray(r.findings) ? r.findings.slice(0, 5) : [],
  };
}

// ── 5) Conversational assistant grounded in live data ─────────────────────────

async function chat(p: ChatPayload): Promise<ChatResult> {
  const system = `${DOMAIN}

TASK: You are chatting with the user about their electricity usage. Use the CONTEXT below as the current
state of their system. Keep replies short, friendly and practical. If they ask something the data can't
answer, say so briefly. Do not use JSON — reply in plain conversational text.

CURRENT CONTEXT
  voltage: ${num(p.latest.voltage)} V, current: ${num(p.latest.current, 2)} A, power: ${num(p.latest.power, 0)} W, frequency: ${num(p.latest.frequency)} Hz
  cumulative energy: ${num(p.latest.energy, 2)} kWh
  recent avg power: ${num(p.stats.avgPower, 0)} W, peak: ${num(p.stats.peakPower, 0)} W, voltage range: ${num(p.stats.minVoltage)}–${num(p.stats.peakVoltage)} V
  tariff: ${p.currency}${p.tariff}/kWh`;

  const turns: ChatTurn[] = p.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
  const reply = await generate({ system, turns, temperature: 0.6, maxTokens: 600 });
  return { reply: reply.trim() };
}

// ── Dispatcher used by the API route ──────────────────────────────────────────

export async function runTask(task: AITask, payload: unknown): Promise<unknown> {
  switch (task) {
    case "diagnose": return diagnose(payload as DiagnosePayload);
    case "insights": return insights(payload as InsightsPayload);
    case "advisor": return advisor(payload as AdvisorPayload);
    case "anomaly": return anomaly(payload as AnomalyPayload);
    case "chat": return chat(payload as ChatPayload);
    default: throw new Error(`Unknown AI task: ${task}`);
  }
}
