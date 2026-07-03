// ─── Browser notification helpers ────────────────────────────────────────────
// Foreground/local notifications: fired while the app is open (or its tab is
// backgrounded) when a new alert arrives. For notifications delivered while the
// app is fully CLOSED, a push service (Firebase Cloud Messaging + a Cloud
// Function / backend that sends on threshold breach) is required — see README.

import type { Alert } from "@/lib/types";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : "denied";
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

const TITLE: Record<Alert["type"], string> = {
  critical: "⚠️ Critical alert",
  warning: "Warning",
  info: "Voltiq",
};

// Show a notification for an alert. Prefers the service worker (works best on
// mobile/PWA); falls back to the Notification constructor.
export async function showAlertNotification(alert: Alert): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const title = TITLE[alert.type] || "Voltiq";
  const options: NotificationOptions = {
    body: alert.message || "A new alert was raised on your energy system.",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: `voltiq-alert-${alert.id}`, // de-duplicates repeats of the same alert
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
  } catch {
    // Some browsers block the constructor; the SW path above is the primary route.
  }
}
