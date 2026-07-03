"use client";

// Small bridge to the OneSignal web SDK (loaded by OneSignalInit). Used to
// trigger the push-subscription permission prompt from a user gesture — which
// is required on iOS PWAs and is good practice everywhere.

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export function oneSignalConfigured(): boolean {
  return Boolean(APP_ID);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OneSignal = any;

// Ask the user to allow notifications via OneSignal. Resolves true if granted.
// Must be called from a click/tap handler (iOS requirement).
export function promptPush(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!APP_ID || typeof window === "undefined") {
      resolve(false);
      return;
    }
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: OneSignal) => {
      try {
        // Fire the native permission prompt directly (our modal is the gesture).
        if (OneSignal?.Notifications?.requestPermission) {
          await OneSignal.Notifications.requestPermission();
        }
        resolve(Boolean(OneSignal?.Notifications?.permission));
      } catch {
        resolve(false);
      }
    });
  });
}
