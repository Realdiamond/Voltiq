"use client";

// Energy page: AI cost/savings advisor. Turns the projected bill into concrete
// ways to spend less.

import { PiggyBank, Loader2, AlertCircle, TrendingDown } from "lucide-react";
import { useAI } from "@/lib/ai/useAI";
import type { AdvisorResult } from "@/lib/ai/types";
import AINotice from "./AINotice";

interface Props {
  avgPower: number;
  kWhPerDay: number;
  costPerDay: number;
  costPerMonth: number;
  tariff: number;
  currency: string;
}

export default function CostAdvisor(props: Props) {
  const { data, loading, error, notConfigured, run } = useAI<AdvisorResult>("advisor");

  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
            <PiggyBank size={15} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3 className="text-primary font-semibold text-[14px]">AI Cost Advisor</h3>
            <p className="text-muted text-[11px]">Ways to reduce your bill</p>
          </div>
        </div>
        <button
          onClick={() => run(props)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg surface surface-hover disabled:opacity-60"
          style={{ color: "var(--accent)" }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <TrendingDown size={13} />}
          {loading ? "Analysing…" : data ? "Refresh" : "Get advice"}
        </button>
      </div>

      {notConfigured ? (
        <AINotice kind="setup" />
      ) : error ? (
        <div className="flex items-start gap-2 text-[12px]" style={{ color: "var(--danger)" }}>
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <p className="text-secondary text-[13px] leading-relaxed">{data.summary}</p>
          <div className="space-y-2.5">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-xl surface-inset">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-primary font-semibold text-[12px]">{rec.title}</h4>
                  {rec.saving && (
                    <span
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--success-soft)", color: "var(--success)" }}
                    >
                      {rec.saving}
                    </span>
                  )}
                </div>
                <p className="text-muted text-[12px] leading-relaxed mt-1">{rec.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted text-[12px]">
          Tap <span className="text-secondary font-medium">Get advice</span> for personalised, AI-generated ways to cut your electricity cost.
        </p>
      )}
    </div>
  );
}
