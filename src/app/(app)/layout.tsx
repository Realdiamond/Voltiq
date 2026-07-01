"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatAssistant from "@/components/ai/ChatAssistant";
import { DashboardDataProvider, useDashboard } from "@/lib/DashboardDataContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, WifiOff, FlaskConical } from "lucide-react";

// Redirects to /login when there's no authenticated user, and shows a loader
// while auth state is resolving. Only renders the dashboard once signed in.
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg-app)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }
  return <>{children}</>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const { latestReading, loading, error, isMock } = useDashboard();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-app)" }}>
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Header lastUpdated={latestReading.timestamp} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            {/* Demo-data banner — shown when readings fall back to mock data */}
            {isMock && !loading && (
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px]"
                style={{ background: "var(--warning-soft)", color: "var(--warning)" }}
              >
                <FlaskConical size={14} className="flex-shrink-0" />
                <span>
                  Showing <strong>demo data</strong> — no live readings in Firebase yet. AI features work on this sample data too.
                </span>
              </div>
            )}

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

      {/* Global AI assistant (floating) */}
      <ChatAssistant />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <SettingsProvider>
        <DashboardDataProvider>
          <Shell>{children}</Shell>
        </DashboardDataProvider>
      </SettingsProvider>
    </AuthGate>
  );
}
