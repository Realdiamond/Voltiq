"use client";

// Initialises the OneSignal web-push SDK so users can subscribe to push
// notifications (delivered even when the app is closed). Does nothing unless
// NEXT_PUBLIC_ONESIGNAL_APP_ID is set, so it's safe to leave mounted.
//
// NOTE: because Voltiq already ships a service worker (public/sw.js), OneSignal
// is told to use it. For push to work you must also add the OneSignal SDK import
// to that worker — see the commented line in public/sw.js.

import { useEffect } from "react";

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: unknown) => void>;
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    if (!APP_ID) return;
    if (document.getElementById("onesignal-sdk")) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (OneSignal as any).init({
        appId: APP_ID,
        serviceWorkerPath: "sw.js",
        serviceWorkerParam: { scope: "/" },
        allowLocalhostAsSecureOrigin: true,
      });
    });

    const s = document.createElement("script");
    s.id = "onesignal-sdk";
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  return null;
}
