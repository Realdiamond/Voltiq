"use client";

// Lightweight, app-wide check for whether AI is configured (GET /api/ai).
// Cached at module level so it fires only once per session, not per component.
// Returns: null = still checking, true/false = known.

import { useEffect, useState } from "react";

let cache: boolean | null = null;
let inflight: Promise<boolean> | null = null;

export function useAIConfigured(): boolean | null {
  const [state, setState] = useState<boolean | null>(cache);

  useEffect(() => {
    if (cache !== null) {
      setState(cache);
      return;
    }
    if (!inflight) {
      inflight = fetch("/api/ai")
        .then((r) => r.json())
        .then((d) => {
          cache = Boolean(d?.configured);
          return cache;
        })
        .catch(() => {
          cache = false;
          return false;
        });
    }
    let alive = true;
    inflight.then((v) => alive && setState(v));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
