"use client";

// Watches the live alerts and fires a browser notification when a NEW
// critical/warning alert appears (limit breach, fault, etc.). Existing alerts
// present at load are treated as already-seen so the user isn't spammed on open.

import { useEffect, useRef } from "react";
import type { Alert } from "@/lib/types";
import { showAlertNotification, notificationPermission } from "@/lib/notifications";

export function useAlertNotifications(alerts: Alert[], enabled: boolean) {
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    // First run: baseline every current alert as seen (don't notify on load).
    if (seen.current === null) {
      seen.current = new Set(alerts.map((a) => a.id));
      return;
    }
    if (!enabled || notificationPermission() !== "granted") {
      // Still mark as seen so they don't fire in a burst once enabled later.
      alerts.forEach((a) => seen.current!.add(a.id));
      return;
    }
    for (const a of alerts) {
      if (seen.current.has(a.id)) continue;
      seen.current.add(a.id);
      if (a.type === "critical" || a.type === "warning") {
        void showAlertNotification(a);
      }
    }
  }, [alerts, enabled]);
}
