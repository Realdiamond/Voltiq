"use client";

// Login / sign-up screen. Gates access to the dashboard.
// A demo account can be created here (sign-up), or in the Firebase console.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, LogIn, UserPlus, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, bounce to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-app)" }}>
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="Voltiq" width={56} height={56} className="rounded-2xl" style={{ boxShadow: "0 8px 24px var(--accent-soft)" }} />
          <h1 className="text-primary font-bold text-xl mt-4">Voltiq</h1>
          <p className="text-muted text-[12px] mt-1">IoT Smart Energy Monitoring</p>
        </div>

        <div className="surface p-7">
          <h2 className="text-primary font-semibold text-[16px]">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-muted text-[12px] mt-1 mb-5">
            {mode === "signin"
              ? "Enter your credentials to access the dashboard."
              : "Create an account to access the dashboard."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-secondary text-[12px] font-medium flex items-center gap-1.5">
                <Mail size={13} /> Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl px-4 py-2.5 text-primary surface-inset outline-none focus:border-[var(--accent)] text-[14px]"
                style={{ background: "var(--bg-inset)" }}
              />
            </label>

            <label className="block">
              <span className="text-secondary text-[12px] font-medium flex items-center gap-1.5">
                <Lock size={13} /> Password
              </span>
              <input
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl px-4 py-2.5 text-primary surface-inset outline-none focus:border-[var(--accent)] text-[14px]"
                style={{ background: "var(--bg-inset)" }}
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 text-[12px]" style={{ color: "var(--danger)" }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-white font-semibold text-[13px] disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "signin" ? <LogIn size={16} /> : <UserPlus size={16} />}
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              className="text-[12px] text-muted hover:text-primary"
            >
              {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-faint text-[11px] text-center mt-6">
          Access is restricted to authorised users. Data is protected by Firebase security rules.
        </p>
      </div>
    </div>
  );
}
