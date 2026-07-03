"use client";

// ─── Authentication context ──────────────────────────────────────────────────
// Wraps Firebase Auth (email/password) and exposes the current user plus
// sign-in / sign-up / sign-out helpers. Used to gate the dashboard.

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Preferred display name: the profile name if set, else the email prefix. */
  displayName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Turn Firebase's error codes into friendly messages.
function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/invalid-email": return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Incorrect email or password.";
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/weak-password": return "Password should be at least 6 characters.";
    case "auth/too-many-requests": return "Too many attempts. Please try again shortly.";
    case "auth/network-request-failed": return "Network error — check your connection.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in isn't enabled in Firebase. Enable it in Authentication → Sign-in method.";
    default: return "Authentication failed. Please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const clean = name?.trim();
      if (clean) {
        await updateProfile(cred.user, { displayName: clean });
        // updateProfile doesn't re-fire onAuthStateChanged; push the fresh user.
        setUser({ ...cred.user, displayName: clean } as User);
      }
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  };

  const updateName = async (name: string) => {
    if (!auth.currentUser) return;
    const clean = name.trim();
    await updateProfile(auth.currentUser, { displayName: clean });
    setUser({ ...auth.currentUser, displayName: clean } as User);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const displayName =
    user?.displayName?.trim() ||
    (user?.email ? user.email.split("@")[0].replace(/[._-]+/g, " ") : "");

  return (
    <AuthContext.Provider value={{ user, loading, displayName, signIn, signUp, updateName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
