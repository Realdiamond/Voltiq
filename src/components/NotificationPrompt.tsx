"use client";

// A one-time "enable notifications" modal shown on the dashboard (only when
// authenticated — it's mounted inside the app shell, never on the public home
// or login pages). Appears immediately, asks once, and the Enable tap is the
// user gesture that fires the real permission prompt (required on iOS PWAs).

import { useEffect, useState } from "react";
import { BellRing, X, Loader2 } from "lucide-react";
import {
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
} from "@/lib/notifications";
import { oneSignalConfigured, promptPush } from "@/lib/onesignal";

const SEEN_KEY = "voltiq-notif-prompt-seen";

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Only if notifications are usable, not yet decided, and not dismissed before.
    if (!notificationsSupported() && !oneSignalConfigured()) return;
    if (notificationsSupported() && notificationPermission() !== "default") return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {}
    setShow(true);
  }, []);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setShow(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      if (oneSignalConfigured()) await promptPush();
      else await requestNotificationPermission();
    } finally {
      setBusy(false);
      close();
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 animate-[fadeIn_0.15s_ease]"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div className="w-full max-w-[400px] surface p-6 relative">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg surface-hover flex items-center justify-center text-muted"
        >
          <X size={16} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
        >
          <BellRing size={22} className="text-white" />
        </div>

        <h3 className="text-primary font-bold text-[18px] tracking-tight mt-4">Stay in the loop</h3>
        <p className="text-secondary text-[13px] leading-relaxed mt-2">
          Turn on notifications to get instant alerts when your energy readings need attention —
          like an overvoltage or a load spike — even when the app is closed.
        </p>

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={enable}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-white font-semibold text-[14px] disabled:opacity-60 transition-transform active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 8px 20px var(--accent-soft)" }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
            Enable notifications
          </button>
          <button
            onClick={close}
            className="w-full rounded-xl py-2.5 text-secondary font-medium text-[13px] surface-hover"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
