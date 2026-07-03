// ─── Provider-agnostic AI client (SERVER ONLY) ───────────────────────────────
// This is the single place that talks to an LLM. Everything is driven by
// environment variables, so you can swap the API key — or the whole provider —
// in Vercel without touching any code:
//
//   AI_PROVIDER   "openai" (default) | "gemini"
//   AI_API_KEY    your key  (falls back to OPENAI_API_KEY / GEMINI_API_KEY)
//   AI_MODEL      optional model override (default: gpt-4o-mini for OpenAI)
//   AI_BASE_URL   optional base URL for any OpenAI-compatible endpoint
//                 (OpenRouter, Groq, Together, a local server, …)
//
// Default is OpenAI. Just set OPENAI_API_KEY. To switch providers later, set
// AI_PROVIDER + AI_API_KEY and (optionally) AI_MODEL — no code change needed.

import "server-only";

type Provider = "gemini" | "openai";

interface AIConfig {
  provider: Provider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

const DEFAULT_MODELS: Record<Provider, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o-mini",
};

export function getAIConfig(): AIConfig {
  // Default provider is OpenAI. Override with AI_PROVIDER=gemini to switch back.
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase() as Provider;
  const apiKey =
    process.env.AI_API_KEY ||
    (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY) ||
    "";
  const model = process.env.AI_MODEL || DEFAULT_MODELS[provider] || DEFAULT_MODELS.gemini;
  const baseUrl = process.env.AI_BASE_URL || undefined;
  return { provider, apiKey, model, baseUrl };
}

export function isAIConfigured(): boolean {
  return getAIConfig().apiKey.length > 0;
}

export class AINotConfiguredError extends Error {
  constructor() {
    super("AI is not configured. Set AI_API_KEY (or GEMINI_API_KEY) in your environment.");
    this.name = "AINotConfiguredError";
  }
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface GenerateOptions {
  system: string;
  turns: ChatTurn[];
  json?: boolean;        // ask the model to return strict JSON
  temperature?: number;
  maxTokens?: number;
}

// ── Public entry point ───────────────────────────────────────────────────────

export async function generate(opts: GenerateOptions): Promise<string> {
  const cfg = getAIConfig();
  if (!cfg.apiKey) throw new AINotConfiguredError();

  if (cfg.provider === "openai") return generateOpenAI(cfg, opts);
  return generateGemini(cfg, opts);
}

// ── Google Gemini (free tier) ────────────────────────────────────────────────

async function generateGemini(cfg: AIConfig, opts: GenerateOptions): Promise<string> {
  const base = cfg.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  const url = `${base}/models/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;

  const contents = opts.turns.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));

  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 1024,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

// ── OpenAI-compatible (OpenAI, OpenRouter, Groq, Together, local, …) ──────────

async function generateOpenAI(cfg: AIConfig, opts: GenerateOptions): Promise<string> {
  const base = cfg.baseUrl || "https://api.openai.com/v1";
  const url = `${base}/chat/completions`;

  const messages = [
    { role: "system", content: opts.system },
    ...opts.turns.map((t) => ({ role: t.role, content: t.content })),
  ];

  const body = {
    model: cfg.model,
    messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 1024,
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("AI returned an empty response.");
  return text;
}

// ── Helper: parse a JSON object out of a model response, tolerant of fences ───

export function parseJSON<T>(raw: string): T {
  let s = raw.trim();
  // Strip ```json ... ``` or ``` ... ``` fences if present
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  // Fall back to the first {...} block if there's surrounding prose
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first > 0 || last < s.length - 1) {
    if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);
  }
  return JSON.parse(s) as T;
}
