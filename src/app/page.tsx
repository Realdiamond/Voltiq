import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Activity, ShieldCheck, CircleDollarSign, BellRing, Smartphone, Cpu,
  ArrowRight, Zap, Radio, Database, LayoutDashboard,
} from "lucide-react";

const features = [
  { icon: Activity, title: "Real-time monitoring", body: "Live voltage, current, power, energy and frequency streamed straight from your meter — no refresh needed." },
  { icon: ShieldCheck, title: "Offline-resilient", body: "Readings are cached on-device during outages and synced when the network returns. Zero data loss." },
  { icon: CircleDollarSign, title: "Cost insights", body: "Energy converted to Naira on a configurable tariff, with daily and monthly billing projections." },
  { icon: BellRing, title: "Smart alerts", body: "Threshold breaches and device events surface instantly so you can act before bills climb." },
  { icon: Smartphone, title: "Installable app", body: "A full PWA — install it on your phone or desktop and launch it like a native app, even offline." },
  { icon: Cpu, title: "Device-aware", body: "Track every ESP32 + PZEM-004T node, its location and online status, from one place." },
];

const steps = [
  { icon: Radio, title: "Sense", body: "The PZEM-004T V3.0 measures electrical parameters with optical isolation for safe, precise readings." },
  { icon: Database, title: "Sync", body: "An ESP32 streams the data over Wi-Fi into Firebase Realtime Database, buffering to SD when offline." },
  { icon: LayoutDashboard, title: "Visualise", body: "This dashboard renders it live — KPIs, trends, costs and alerts — on any device." },
];

const stack = ["Next.js", "React", "Firebase", "Chart.js", "ESP32", "PZEM-004T"];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-app)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-app) 80%, transparent)" }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Voltiq" width={32} height={32} className="w-8 h-8 rounded-lg" />
            <span className="text-primary font-bold text-[15px]">Voltiq</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: "var(--accent)" }}>
              Open Dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(60% 50% at 50% 0%, var(--accent-soft), transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto px-5 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium mb-6 surface text-secondary">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} /> IoT Energy Monitoring System
          </span>
          <h1 className="text-primary font-bold tracking-tight text-4xl sm:text-5xl leading-[1.1]">
            Know exactly where your <span style={{ color: "var(--accent)" }}>energy</span> goes.
          </h1>
          <p className="text-secondary text-[15px] sm:text-base mt-5 max-w-xl mx-auto leading-relaxed">
            Voltiq turns an ESP32 + PZEM-004T meter into a real-time, offline-resilient
            energy dashboard — with live readings, cost tracking and smart alerts.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold text-white"
              style={{ background: "var(--accent)" }}>
              Launch the dashboard <ArrowRight size={16} />
            </Link>
            <a href="#how"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold surface surface-hover text-secondary">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface surface-hover p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--accent-soft)" }}>
                <Icon size={18} style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-primary font-semibold text-[15px]">{title}</h3>
              <p className="text-muted text-[13px] mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h2 className="text-primary font-bold text-2xl tracking-tight">From plug to chart in three steps</h2>
          <p className="text-muted text-[14px] mt-2">Hardware to insight, end to end.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="surface p-6 relative">
              <span className="absolute top-5 right-5 text-faint font-bold text-2xl tabular-nums">0{i + 1}</span>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--accent)" }}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="text-primary font-semibold text-[16px]">{title}</h3>
              <p className="text-muted text-[13px] mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack + CTA */}
      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="surface p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(50% 80% at 50% 0%, var(--accent-soft), transparent 70%)" }} />
          <div className="relative">
            <Zap size={28} className="mx-auto mb-4" style={{ color: "var(--accent)" }} />
            <h2 className="text-primary font-bold text-2xl tracking-tight">Ready when your meter is.</h2>
            <p className="text-secondary text-[14px] mt-3 max-w-md mx-auto">
              Open the live dashboard and watch your consumption update in real time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {stack.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-[12px] font-medium surface-inset text-secondary">{s}</span>
              ))}
            </div>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white mt-8"
              style={{ background: "var(--accent)" }}>
              Open Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted text-[13px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={20} height={20} className="w-5 h-5 rounded" />
            Voltiq — IoT Energy Monitoring System
          </div>
          <p className="text-faint text-[12px]">Built with Next.js · ESP32 · PZEM-004T · Firebase</p>
        </div>
      </footer>
    </div>
  );
}
