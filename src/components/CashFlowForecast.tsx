"use client";

import { useState } from "react";
import type { BusinessMetrics } from "@/lib/businessMetrics";
import type { BusinessType } from "@/lib/types";

interface Forecast {
  projectedIncome: number;
  projectedExpense: number;
  projectedNet: number;
  reasoning: string;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function CashFlowForecast({
  metrics,
  businessType,
}: {
  metrics: BusinessMetrics;
  businessType?: BusinessType;
}) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canForecast = metrics.monthlyTrend.length >= 2;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyTrend: metrics.monthlyTrend, businessType }),
      });
      const data = await res.json();
      if (res.ok) {
        setForecast(data);
      } else {
        setError(data.error ?? "Couldn't generate a forecast.");
      }
    } catch {
      setError("Couldn't reach the forecasting service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="relative mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: "var(--brand-gradient)" }}
          >
            ✦
          </span>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Next month forecast
          </h2>
        </div>
        <button
          onClick={generate}
          disabled={loading || !canForecast}
          className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
        >
          {loading ? "Forecasting…" : forecast ? "Regenerate" : "Forecast"}
        </button>
      </div>

      {!canForecast && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Record at least two months of transactions to unlock a forecast.
        </p>
      )}

      {forecast && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Income
              </p>
              <p className="font-semibold" style={{ color: "var(--success-text)", fontVariantNumeric: "tabular-nums" }}>
                {currency.format(forecast.projectedIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Expense
              </p>
              <p className="font-semibold" style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                {currency.format(forecast.projectedExpense)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Net
              </p>
              <p
                className="font-semibold"
                style={{
                  color: forecast.projectedNet >= 0 ? "var(--success-text)" : "var(--status-critical)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {currency.format(forecast.projectedNet)}
              </p>
            </div>
          </div>
          {forecast.reasoning && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {forecast.reasoning}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}

      {!forecast && !error && canForecast && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Project next month&apos;s income, expense, and net based on your recent trend.
        </p>
      )}
    </div>
  );
}
