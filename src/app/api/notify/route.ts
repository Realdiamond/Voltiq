// ─── Push-notification send endpoint (OneSignal) ─────────────────────────────
// Sends a web-push notification to all subscribed devices via OneSignal — so
// users are alerted even when the app is CLOSED. Call this when a threshold is
// breached (from the ESP32/backend, or from a server-side check).
//
//   POST /api/notify
//   headers: { "x-notify-secret": NOTIFY_SECRET }   (if NOTIFY_SECRET is set)
//   body:    { "title": "Overvoltage", "message": "Supply hit 252V", "url": "/alerts" }
//
// Requires: NEXT_PUBLIC_ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY (server-only).
// Optional: NOTIFY_SECRET — a shared secret so only your devices can trigger sends.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const restKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !restKey) {
    return NextResponse.json(
      { error: "Push is not configured. Set NEXT_PUBLIC_ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY." },
      { status: 503 }
    );
  }

  // Optional shared-secret guard so the endpoint can't be abused publicly.
  const secret = process.env.NOTIFY_SECRET;
  if (secret && req.headers.get("x-notify-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // New OneSignal keys (via "Add Key") use "Key <token>"; the older "Legacy API
  // Key" uses "Basic <token>". Default to "Key"; set ONESIGNAL_AUTH_SCHEME=Basic
  // if you use the legacy key.
  const scheme = process.env.ONESIGNAL_AUTH_SCHEME || "Key";

  let body: { title?: string; message?: string; body?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = String(body.title || "Voltiq alert").slice(0, 120);
  const message = String(body.message || body.body || "A new alert was raised on your energy system.").slice(0, 500);

  try {
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${scheme} ${restKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        target_channel: "push",
        included_segments: ["Subscribed Users"],
        headings: { en: title },
        contents: { en: message },
        ...(body.url ? { url: body.url } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("OneSignal send failed:", data);
      return NextResponse.json({ error: "Could not send the notification." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, id: (data as { id?: string }).id });
  } catch {
    return NextResponse.json({ error: "Could not reach the push service." }, { status: 502 });
  }
}
