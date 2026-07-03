"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, LogOut, Settings, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { initialsOf } from "@/lib/initials";

export default function Header({ lastUpdated }: { lastUpdated: string }) {
  const { user, displayName, logout } = useAuth();
  const router = useRouter();
  const [timeLabel, setTimeLabel] = useState("—");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = new Date(lastUpdated);
    if (!isNaN(d.getTime())) {
      setTimeLabel(d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }));
    }
  }, [lastUpdated]);

  // Close the menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = initialsOf(displayName || user?.email || "?");

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between gap-3 px-5 lg:px-8 h-[68px] flex-shrink-0">
      {/* Left: system status pill */}
      <div className="pl-12 lg:pl-0 min-w-0">
        <div
          className="inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full"
          style={{ background: "var(--success-soft)" }}
        >
          <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
          <span className="text-[12px] font-medium hidden sm:inline" style={{ color: "var(--success)" }}>
            All systems normal
          </span>
          <span className="text-faint hidden sm:inline">·</span>
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

        {/* Account menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-1.5 pl-1 pr-2 h-10 rounded-xl surface surface-hover"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold text-white select-none"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
            >
              {initials}
            </span>
            <ChevronDown size={14} className="text-muted hidden sm:block" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl overflow-hidden z-50"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
            >
              <div className="px-4 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-primary text-[13px] font-semibold truncate capitalize">{displayName || "Signed in"}</p>
                <p className="text-muted text-[11px] truncate mt-0.5">{user?.email || "—"}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-secondary hover:bg-[var(--bg-subtle)]"
                >
                  <Settings size={15} /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium"
                  style={{ color: "var(--danger)" }}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
