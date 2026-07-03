"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { initialsOf } from "@/lib/initials";

export default function Header({ lastUpdated }: { lastUpdated: string }) {
  const { user, displayName } = useAuth();
  const [timeLabel, setTimeLabel] = useState("—");

  useEffect(() => {
    const d = new Date(lastUpdated);
    if (!isNaN(d.getTime())) {
      setTimeLabel(d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }));
    }
  }, [lastUpdated]);

  const initials = initialsOf(displayName || user?.email || "?");

  return (
    <header
      className="flex items-center justify-between gap-3 px-5 lg:px-8 h-[68px] flex-shrink-0"
      style={{ background: "transparent" }}
    >
      {/* Left: system status pill */}
      <div className="pl-12 lg:pl-0 min-w-0">
        <div
          className="inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full"
          style={{ background: "var(--success-soft)" }}
        >
          <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
          <span className="text-[12px] font-medium" style={{ color: "var(--success)" }}>
            All systems normal
          </span>
          <span className="text-faint">·</span>
          <span className="text-[12px] tabular-nums" style={{ color: "var(--success)" }}>{timeLabel}</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Link
          href="/alerts"
          aria-label="Alerts"
          className="relative w-10 h-10 rounded-xl surface surface-hover flex items-center justify-center text-secondary"
        >
          <Bell size={16} />
          <span
            className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--danger)", boxShadow: "0 0 0 2px var(--bg-app)" }}
          />
        </Link>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold text-white select-none"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
          title={user?.email || ""}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
