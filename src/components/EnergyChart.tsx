"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, Legend,
  type ScriptableContext,
} from "chart.js";
import type { ChartDataPoint } from "@/lib/mockData";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

// Track dark mode so the canvas (which can't read CSS vars) restyles on theme switch
function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function EnergyChart({ data }: { data: ChartDataPoint[] }) {
  const dark = useIsDark();
  const labels = data.map((d) => d.label);
  const energy = data.map((d) => d.energy);
  const power  = data.map((d) => d.power);

  const ACCENT = "#3b82f6";   // blue — energy
  const ACCENT2 = "#0ea5e9";  // sky — power
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const tick = dark ? "rgba(255,255,255,0.4)" : "rgba(71,85,105,0.7)";
  const tipBg = dark ? "#1a2335" : "#ffffff";
  const tipBorder = dark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const tipTitle = dark ? "rgba(255,255,255,0.55)" : "rgba(71,85,105,0.8)";
  const tipBody = dark ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.9)";
  const pointBorder = dark ? "#111827" : "#ffffff";

  return (
    <div className="surface p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-primary font-semibold text-[14px]">Energy Consumption</h3>
          <p className="text-muted text-[11px] mt-1">24-hour overview · hourly intervals</p>
        </div>
        <span
          className="text-[11px] font-semibold px-3 py-1 rounded-full"
          style={{ color: "var(--success)", background: "var(--success-soft)" }}
        >
          ↑ 4.3% today
        </span>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Energy (kWh)",
                data: energy,
                borderColor: ACCENT,
                borderWidth: 2,
                fill: true,
                backgroundColor: (ctx: ScriptableContext<"line">) => {
                  const { ctx: c, chartArea } = ctx.chart;
                  if (!chartArea) return "transparent";
                  const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  g.addColorStop(0, "rgba(59,130,246,0.18)");
                  g.addColorStop(1, "rgba(59,130,246,0)");
                  return g;
                },
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: ACCENT,
                pointHoverBorderColor: pointBorder,
                pointHoverBorderWidth: 3,
              },
              {
                label: "Power (W)",
                data: power,
                borderColor: ACCENT2,
                borderWidth: 1.5,
                borderDash: [5, 4],
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: ACCENT2,
                pointHoverBorderColor: pointBorder,
                pointHoverBorderWidth: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: {
                position: "top",
                align: "end",
                labels: {
                  color: tick,
                  boxWidth: 12,
                  boxHeight: 2,
                  usePointStyle: false,
                  font: { size: 11 },
                  padding: 20,
                },
              },
              tooltip: {
                backgroundColor: tipBg,
                borderColor: tipBorder,
                borderWidth: 1,
                titleColor: tipTitle,
                bodyColor: tipBody,
                bodyFont: { size: 12 },
                padding: 14,
                cornerRadius: 10,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
              },
            },
            scales: {
              x: {
                grid: { color: grid, drawTicks: false },
                ticks: {
                  color: tick,
                  font: { size: 10 },
                  maxRotation: 0,
                  maxTicksLimit: 8,
                  padding: 8,
                },
                border: { display: false },
              },
              y: {
                grid: { color: grid, drawTicks: false },
                ticks: { color: tick, font: { size: 10 }, padding: 12 },
                border: { display: false },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
