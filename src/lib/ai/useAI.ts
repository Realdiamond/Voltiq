"use client";

// ─── Client hook for calling the AI endpoint ─────────────────────────────────
// Handles loading / error / "not configured" state so components stay simple.

import { useCallback, useState } from "react";
import type { AITask } from "./types";

interface AIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
}

export function useAI<T>(task: AITask) {
  const [state, setState] = useState<AIState<T>>({
    data: null,
    loading: false,
    error: null,
    notConfigured: false,
  });

  const run = useCallback(
    async (payload: unknown): Promise<T | null> => {
      setState((s) => ({ ...s, loading: true, error: null, notConfigured: false }));
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task, payload }),
        });
        const json = await res.json();
        if (!res.ok) {
          setState({
            data: null,
            loading: false,
            error: json?.error || "AI request failed.",
            notConfigured: Boolean(json?.notConfigured),
          });
          return null;
        }
        setState({ data: json.result as T, loading: false, error: null, notConfigured: false });
        return json.result as T;
      } catch {
        setState({ data: null, loading: false, error: "Network error — please try again.", notConfigured: false });
        return null;
      }
    },
    [task]
  );

  const reset = useCallback(
    () => setState({ data: null, loading: false, error: null, notConfigured: false }),
    []
  );

  return { ...state, run, reset };
}
