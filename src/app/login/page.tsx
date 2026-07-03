"use client";

// Login / sign-up screen. Gates access to the dashboard.
// Two-panel layout: a branded showcase panel (desktop) beside the auth form.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2, LogIn, UserPlus, Mail, Lock, AlertCircle, User as UserIcon,
  Activity, BellRing, PiggyBank, ShieldCheck,
} from "lucide-react";

const FEATURES = [
  { Icon: Activity, title: "Real-time monitoring", text: "Live voltage, current, power and energy from your meter." },
  { Icon: BellRing, title: "Smart alerts", text: "Know the moment something looks wrong — and why." },
  { Icon: PiggyBank, title: "Cost insight", text: "Turn kilowatt-hours into what they actually cost you." },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(email, password, name);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl px-4 py-3 text-primary surface-inset outline-none focus:border-[var(--accent)] text-[14px] transition-colors";

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-app)" }}>
      {/* ── Left: brand showcase (desktop only) ─────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[46%] max-w-[620px] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #1d4ed8 0%, #2563eb 45%, #1e3a8a 100%)" }}
      >
        {/* decorative glows */}
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: "#60a5fa" }} />
        <div className="pointer-events-none absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: "#93c5fd" }} />

        {/* brand */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
          </div>
          <div>
            <p className="text-white font-bold text-[17px] leading-none">Voltiq</p>
            <p className="text-white/60 text-[11px] mt-1">IoT Smart Energy Monitoring</p>
          </div>
        </div>

        {/* headline + features */}
        <div className="relative">
          <h2 className="text-white font-bold text-[30px] leading-[1.2] tracking-tight max-w-[420px]">
            Understand your energy, the moment it happens.
          </h2>
          <div className="mt-9 space-y-5 max-w-[380px]">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[14px]">{title}</p>
                  <p className="text-white/65 text-[12.5px] leading-relaxed mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-white/60 text-[12px]">
          <ShieldCheck size={14} />
          <span>Protected by Firebase authentication &amp; security rules.</span>
        </div>
      </aside>

      {/* ── Right: auth form ────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px]">
          {/* compact brand (mobile only) */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Image src="/logo.png" alt="Voltiq" width={52} height={52} className="rounded-2xl" style={{ boxShadow: "0 8px 24px var(--accent-soft)" }} />
            <h1 className="text-primary font-bold text-xl mt-3">Voltiq</h1>
            <p className="text-muted text-[12px] mt-1">IoT Smart Energy Monitoring</p>
          </div>

          <h2 className="text-primary font-bold text-[22px] tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-muted text-[13px] mt-1.5 mb-7">
            {mode === "signin"
              ? "Sign in to access your energy dashboard."
              : "Get started monitoring your energy in real time."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-secondary text-[12.5px] font-medium flex items-center gap-1.5">
                  <UserIcon size={13} /> Name
                </span>
                <input
                  type="text" required autoComplete="name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Timilehin"
                  className={inputClass} style={{ background: "var(--bg-inset)" }}
                />
              </label>
            )}

            <label className="block">
              <span className="text-secondary text-[12.5px] font-medium flex items-center gap-1.5">
                <Mail size={13} /> Email
              </span>
              <input
                type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass} style={{ background: "var(--bg-inset)" }}
              />
            </label>

            <label className="block">
              <span className="text-secondary text-[12.5px] font-medium flex items-center gap-1.5">
                <Lock size={13} /> Password
              </span>
              <input
                type="password" required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass} style={{ background: "var(--bg-inset)" }}
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 text-[12.5px] rounded-xl px-3 py-2.5" style={{ color: "var(--danger)", background: "var(--danger-soft)" }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-white font-semibold text-[14px] disabled:opacity-60 transition-transform active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 8px 20px var(--accent-soft)" }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "signin" ? <LogIn size={16} /> : <UserPlus size={16} />}
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted">
            {mode === "signin" ? "New to Voltiq? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              className="font-semibold text-accent hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
