"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Activity, Cpu, Zap,
  BellDot, Settings, Menu, LogOut, X
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { initialsOf } from "@/lib/initials";

const links = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Activity, label: "Analytics", href: "/analytics" },
  { icon: Cpu, label: "Devices", href: "/devices" },
  { icon: Zap, label: "Energy", href: "/energy" },
  { icon: BellDot, label: "Alerts", href: "/alerts" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, logout } = useAuth();

  const email = user?.email || "";
  const initials = initialsOf(displayName || email || "?");

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <>
      {/* Mobile toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Toggle menu"
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-xl surface flex items-center justify-center text-secondary lg:hidden"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        className={`
          fixed top-0 left-0 bottom-0 z-40 w-[240px] flex flex-col border-r
          transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-[72px] border-b" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Voltiq"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl"
              style={{ boxShadow: "0 6px 16px var(--accent-soft)" }}
            />
            <div>
              <h2 className="text-primary font-bold text-[15px] leading-none">Voltiq</h2>
              <p className="text-muted text-[10px] mt-1">IoT Energy Monitor</p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 -mr-2 rounded-lg flex items-center justify-center text-secondary lg:hidden hover:bg-[var(--bg-subtle)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-faint text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {links.map(({ icon: Icon, label, href }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                style={
                  active
                    ? { background: "var(--accent-soft)", color: "var(--accent)" }
                    : undefined
                }
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-150
                  ${active ? "" : "text-muted hover:text-primary hover:bg-[var(--bg-subtle)]"}
                `}
              >
                <Icon size={17} />
                <span>{label}</span>
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "var(--bg-subtle)" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: "var(--accent-strong)" }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-primary text-[12px] font-semibold truncate capitalize">
                {displayName || "Signed in"}
              </p>
              <p className="text-muted text-[10px] truncate">{email || "—"}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
