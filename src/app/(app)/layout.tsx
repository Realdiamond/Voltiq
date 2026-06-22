"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DashboardDataProvider, useDashboard } from "@/lib/DashboardDataContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import { Loader2, WifiOff } from "lucide-react";

function Shell({ children }: { children: React.ReactNode }) {
  const { latestReading, loading, error } = useDashboard();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-app)" }}>
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Header lastUpdated={latestReading.timestamp} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            {/* Global connection-error banner (shown on every page) */}
            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ background: "var(--danger-soft)", borderColor: "var(--danger)" }}
              >
                <WifiOff size={18} className="flex-shrink-0" style={{ color: "var(--danger)" }} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--danger)" }}>
                    Connection Error
                  </p>
                  <p className="text-secondary text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent)" }} />
                <div className="text-center">
                  <p className="text-secondary text-sm font-medium">Connecting to Firebase…</p>
                  <p className="text-muted text-xs mt-1">Fetching real-time data from your devices</p>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <DashboardDataProvider>
        <Shell>{children}</Shell>
      </DashboardDataProvider>
    </SettingsProvider>
  );
}
