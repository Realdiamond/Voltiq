"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellDot, RefreshCw, Wifi } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ lastUpdated }: { lastUpdated: string }) {
  const [timeLabel, setTimeLabel] = useState("—");

  useEffect(() => {
    const d = new Date(lastUpdated);
    setTimeLabel(
      d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) +
      "  ·  " +
      d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
    );
  }, [lastUpdated]);

  return (
    <header
      className="flex items-center justify-between gap-3 px-6 lg:px-8 h-[72px] flex-shrink-0 border-b backdrop-blur-xl"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-app) 80%, transparent)" }}
    >
      {/* Left */}
      <div className="pl-12 lg:pl-0 min-w-0">
        <h1 className="text-primary font-semibold text-base leading-none truncate">
          Energy Dashboard
        </h1>
        <p className="text-muted text-[11px] mt-1.5 truncate">
          ESP32 + PZEM-004T · Firebase Realtime Database
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Live pill */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "var(--success-soft)" }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: "var(--success)" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "var(--success)" }}
            />
          </span>
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--success)" }}>
            LIVE
          </span>
        </div>

        {/* Timestamp */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full surface">
          <RefreshCw size={10} className="text-muted" />
          <span className="text-secondary text-[11px]">{timeLabel}</span>
        </div>

        {/* Firebase status */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full surface">
          <Wifi size={11} style={{ color: "var(--accent)" }} />
          <span className="text-secondary text-[11px]">Firebase</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <Link
          href="/alerts"
          aria-label="Alerts"
          className="relative w-10 h-10 rounded-xl surface surface-hover flex items-center justify-center text-secondary"
        >
          <BellDot size={16} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: "var(--danger)", boxShadow: "0 0 0 2px var(--bg-card)" }}
          />
        </Link>
      </div>
    </header>
  );
}
