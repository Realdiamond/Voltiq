"use client";

import { useEffect } from "react";

// Registers the service worker so the app is installable as a PWA.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      // Combined worker: OneSignal push + Voltiq PWA caching (see public/OneSignalSDKWorker.js).
      navigator.serviceWorker.register("/OneSignalSDKWorker.js", { scope: "/" }).catch(() => {
        /* registration failures are non-fatal */
      });
    };
    // If the page already finished loading, register now; otherwise wait for load.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
