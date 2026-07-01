"use client";

// Small shared notice shown when the AI key isn't configured yet, so the app
// degrades gracefully instead of erroring during a demo.

import { KeyRound } from "lucide-react";

export default function AINotice({ kind = "setup" }: { kind?: "setup" }) {
  if (kind === "setup") {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl surface-inset">
        <KeyRound size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
        <div className="text-[12px] leading-relaxed">
          <p className="text-primary font-medium">AI not configured</p>
          <p className="text-muted mt-0.5">
            Add <code className="text-secondary">GEMINI_API_KEY</code> to your environment
            (see <code className="text-secondary">.env.example</code>) to enable AI features.
          </p>
        </div>
      </div>
    );
  }
  return null;
}
