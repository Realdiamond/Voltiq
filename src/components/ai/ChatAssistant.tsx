"use client";

// Global floating "Ask Voltiq" assistant. Grounded in the current live/mock
// readings so answers are about the user's actual system.

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useDashboard } from "@/lib/DashboardDataContext";
import { useSettings } from "@/lib/SettingsContext";
import { buildStats, toReadingSnapshot } from "@/lib/ai/snapshot";
import type { ChatMessage, ChatResult } from "@/lib/ai/types";

const SUGGESTIONS = [
  "Why might my bill be high?",
  "Is my voltage safe right now?",
  "How can I save energy today?",
];

export default function ChatAssistant() {
  const { readings, latestReading } = useDashboard();
  const { tariff, currency } = useSettings();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "chat",
          payload: {
            messages: next,
            latest: toReadingSnapshot(latestReading),
            stats: buildStats(readings),
            tariff,
            currency,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.notConfigured
          ? "AI isn't configured yet. Add GEMINI_API_KEY to enable the assistant."
          : json?.error || "Something went wrong.");
      } else {
        const r = json.result as ChatResult;
        setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full text-white font-semibold text-[13px] shadow-lg"
          style={{ background: "var(--accent)", boxShadow: "var(--shadow-pop)" }}
        >
          <Sparkles size={16} />
          Ask Voltiq
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-40 w-[min(92vw,380px)] h-[min(70vh,560px)] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
                <Sparkles size={14} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-primary font-semibold text-[13px] leading-none">Voltiq AI</p>
                <p className="text-muted text-[10px] mt-1">Grounded in your live data</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-lg surface-hover flex items-center justify-center text-muted">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-muted text-[12px] leading-relaxed">
                  Hi! I can answer questions about your energy usage right now. Try:
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full text-left text-[12px] px-3 py-2 rounded-xl surface-inset surface-hover text-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === "user"
                      ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "var(--bg-subtle)", color: "var(--text-secondary)", borderBottomLeftRadius: 4 }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-2xl" style={{ background: "var(--bg-subtle)" }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
                </div>
              </div>
            )}

            {error && <p className="text-[11px]" style={{ color: "var(--danger)" }}>{error}</p>}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 px-3 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your energy…"
              className="flex-1 rounded-xl px-3.5 py-2.5 text-[12px] text-primary outline-none surface-inset"
              style={{ background: "var(--bg-inset)" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
