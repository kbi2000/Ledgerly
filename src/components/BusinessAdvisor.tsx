"use client";

import { useState } from "react";
import type { BusinessMetrics } from "@/lib/businessMetrics";

type Focus = "growth" | "risk";

interface FocusState {
  points: string[] | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_STATE: FocusState = { points: null, loading: false, error: null };

const TABS: { key: Focus; label: string; prompt: string }[] = [
  { key: "growth", label: "Grow revenue", prompt: "Get AI ideas for growing this business, grounded in its real numbers." },
  { key: "risk", label: "Reduce risk", prompt: "Get AI-flagged risks — client concentration, overdue invoices, and more." },
];

export function BusinessAdvisor({
  metrics,
  hasData,
}: {
  metrics: BusinessMetrics;
  hasData: boolean;
}) {
  const [active, setActive] = useState<Focus>("growth");
  const [byFocus, setByFocus] = useState<Record<Focus, FocusState>>({
    growth: EMPTY_STATE,
    risk: EMPTY_STATE,
  });

  const current = byFocus[active];

  async function generate(focus: Focus) {
    setByFocus((prev) => ({ ...prev, [focus]: { ...prev[focus], loading: true, error: null } }));
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus, metrics }),
      });
      const data = await res.json();
      if (res.ok) {
        setByFocus((prev) => ({ ...prev, [focus]: { points: data.points, loading: false, error: null } }));
      } else {
        setByFocus((prev) => ({
          ...prev,
          [focus]: { points: null, loading: false, error: data.error ?? "Couldn't generate advice." },
        }));
      }
    } catch {
      setByFocus((prev) => ({
        ...prev,
        [focus]: { points: null, loading: false, error: "Couldn't reach the advisor." },
      }));
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: "var(--brand-gradient)" }}
      />
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: "var(--brand-gradient)" }}
          >
            ✦
          </span>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Business advisor
          </h2>
        </div>

        <div className="inline-flex gap-0.5 rounded-full border p-0.5" style={{ borderColor: "var(--border)" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={
                active === tab.key
                  ? { background: "var(--brand-gradient)", color: "#ffffff" }
                  : { background: "transparent", color: "var(--text-muted)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {TABS.find((t) => t.key === active)?.prompt}
        </p>
        <button
          onClick={() => generate(active)}
          disabled={current.loading || !hasData}
          className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
        >
          {current.loading ? "Thinking…" : current.points ? "Regenerate" : "Generate"}
        </button>
      </div>

      {current.points && (
        <ul className="relative mt-3 flex flex-col gap-2.5">
          {current.points.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span
                className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: active === "risk" ? "var(--status-serious)" : "var(--status-good)" }}
              />
              <span style={{ color: "var(--text-secondary)" }}>{point}</span>
            </li>
          ))}
        </ul>
      )}
      {current.error && (
        <p className="relative mt-3 text-sm" style={{ color: "var(--status-critical)" }}>
          {current.error}
        </p>
      )}
    </div>
  );
}
