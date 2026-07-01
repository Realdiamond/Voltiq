// ─── AI endpoint ─────────────────────────────────────────────────────────────
// One POST endpoint for every AI feature. The client sends { task, payload };
// the model call (and the API key) stay entirely on the server.
//
//   POST /api/ai   body: { task: AITask, payload: <task payload> }
//   GET  /api/ai   → { configured: boolean }  (used by the UI to show setup hints)

import { NextRequest, NextResponse } from "next/server";
import { runTask } from "@/lib/ai/tasks";
import { isAIConfigured, AINotConfiguredError } from "@/lib/ai/provider";
import type { AITask } from "@/lib/ai/types";

export const runtime = "nodejs";

const VALID: AITask[] = ["diagnose", "insights", "advisor", "anomaly", "chat"];

export async function GET() {
  return NextResponse.json({ configured: isAIConfigured() });
}

export async function POST(req: NextRequest) {
  let body: { task?: AITask; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { task, payload } = body;
  if (!task || !VALID.includes(task)) {
    return NextResponse.json({ error: `Missing or invalid 'task'. Expected one of: ${VALID.join(", ")}.` }, { status: 400 });
  }

  try {
    const result = await runTask(task, payload);
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof AINotConfiguredError) {
      return NextResponse.json({ error: err.message, notConfigured: true }, { status: 503 });
    }
    const message = err instanceof Error ? err.message : "AI request failed.";
    console.error(`AI task '${task}' failed:`, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
