"use client";

import { createContext, useContext } from "react";
import { useFirebaseData, type DashboardData } from "@/hooks/useFirebaseData";

// Calls useFirebaseData ONCE at the dashboard shell level and shares the
// result with every route/component, instead of each opening its own
// Firebase listeners.
const DashboardDataContext = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const data = useFirebaseData();
  return (
    <DashboardDataContext.Provider value={data}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboard(): DashboardData {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardDataProvider");
  return ctx;
}
