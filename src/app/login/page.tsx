"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const { user, loading, configured, signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1">
      {/* Brand panel */}
      <div
        className="relative hidden w-[42%] flex-col justify-between overflow-hidden px-10 py-10 lg:flex"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--brand-gradient)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--brand-gradient)" }}
        />

        <div className="relative flex items-center gap-2">
          <Logo />
          <span className="text-sm font-semibold" style={{ color: "var(--sidebar-fg)" }}>
            Ledgerly
          </span>
        </div>

        <div className="relative flex flex-col gap-4">
          <p className="max-w-sm text-3xl leading-[1.15] font-semibold tracking-tight" style={{ color: "var(--sidebar-fg)" }}>
            Books that explain themselves.
          </p>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--sidebar-fg-muted)" }}>
            Track income and expenses, send invoices, and let AI auto-categorize
            transactions and surface plain-language insights about your business.
          </p>
        </div>

        <p className="relative text-xs" style={{ color: "var(--sidebar-fg-muted)" }}>
          © {new Date().getFullYear()} Ledgerly
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Logo />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Ledgerly
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            {mode === "signin" ? "Sign in to your books." : "Start tracking in under a minute."}
          </p>

          {!configured && (
            <p
              className="mt-5 rounded-[10px] border p-3 text-xs leading-relaxed"
              style={{ borderColor: "var(--border)", color: "var(--status-warning)" }}
            >
              Firebase isn&apos;t configured yet. Add your project values to{" "}
              <code>.env.local</code> (see README.md) and restart the dev server before
              signing in.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                Email
              </span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface-1)" }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface-1)" }}
              />
            </label>

            {error && (
              <p className="text-sm" style={{ color: "var(--status-critical)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-[10px] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--brand-gradient)" }}
            >
              {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {mode === "signin" ? (
              <>
                Need an account?{" "}
                <span className="font-medium" style={{ color: "var(--brand-1)" }}>
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="font-medium" style={{ color: "var(--brand-1)" }}>
                  Sign in
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
