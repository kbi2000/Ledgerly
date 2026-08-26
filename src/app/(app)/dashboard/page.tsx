"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { StatTile } from "@/components/StatTile";
import { CashFlowChart, type CashFlowPoint } from "@/components/charts/CashFlowChart";
import {
  CategoryBreakdownChart,
  type CategoryAmount,
} from "@/components/charts/CategoryBreakdownChart";

function monthKey(iso: string) {
  return iso.slice(0, 7); // yyyy-mm
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export default function DashboardPage() {
  const { transactions, loading } = useTransactions();
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const { totalIncome, totalExpense, cashFlow, byCategory } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const byMonth = new Map<string, { income: number; expense: number }>();
    const byCat = new Map<string, number>();

    for (const t of transactions) {
      const key = monthKey(t.date);
      const bucket = byMonth.get(key) ?? { income: 0, expense: 0 };
      if (t.type === "income") {
        income += t.amount;
        bucket.income += t.amount;
      } else {
        expense += t.amount;
        bucket.expense += t.amount;
        byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
      }
      byMonth.set(key, bucket);
    }

    const cashFlow: CashFlowPoint[] = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({ period: monthLabel(key), income: v.income, expense: v.expense }));

    const byCategory: CategoryAmount[] = Array.from(byCat.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    return { totalIncome: income, totalExpense: expense, cashFlow, byCategory };
  }, [transactions]);

  async function generateInsight() {
    setInsightLoading(true);
    setInsightError(null);
    setInsight(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalIncome,
          totalExpense,
          byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c.amount])),
          periodLabel: "all recorded transactions",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInsight(data.insight);
      } else {
        setInsightError(data.error ?? "Couldn't generate insights.");
      }
    } catch {
      setInsightError("Couldn't reach the insights service.");
    } finally {
      setInsightLoading(false);
    }
  }

  const net = totalIncome - totalExpense;
  const netCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Net position
        </p>
        <p
          className="text-5xl leading-none font-semibold tracking-tight"
          style={{
            color: net >= 0 ? "var(--text-primary)" : "var(--status-critical)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {netCurrency.format(net)}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Across {transactions.length} recorded transaction{transactions.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total income" value={totalIncome} tone="good" icon={<ArrowIcon direction="up" />} />
        <StatTile label="Total expense" value={totalExpense} icon={<ArrowIcon direction="down" />} />
        <StatTile label="Net" value={net} tone={net >= 0 ? "good" : "bad"} icon={<ScaleIcon />} />
      </div>

      <div
        className="relative overflow-hidden rounded-[var(--radius-lg)] border p-5"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-[0.07] blur-2xl"
          style={{ background: "var(--brand-gradient)" }}
        />
        <div className="relative mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ background: "var(--brand-gradient)" }}
            >
              ✦
            </span>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              AI insights
            </h2>
          </div>
          <button
            onClick={generateInsight}
            disabled={insightLoading || loading || transactions.length === 0}
            className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
          >
            {insightLoading ? "Thinking…" : "Generate insights"}
          </button>
        </div>
        {insight && (
          <p className="relative text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {insight}
          </p>
        )}
        {insightError && (
          <p className="relative text-sm" style={{ color: "var(--status-critical)" }}>
            {insightError}
          </p>
        )}
        {!insight && !insightError && (
          <p className="relative text-sm" style={{ color: "var(--text-muted)" }}>
            Generate a plain-language summary of trends in your income and spending.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="rounded-[var(--radius-lg)] border p-5"
          style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Cash flow by month
          </h2>
          <CashFlowChart data={cashFlow} />
        </div>
        <div
          className="rounded-[var(--radius-lg)] border p-5"
          style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Spend by category
          </h2>
          <CategoryBreakdownChart data={byCategory} />
        </div>
      </div>
    </div>
  );
}

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d={direction === "up" ? "M7 11V3M3.5 6.5 7 3l3.5 3.5" : "M7 3v8M3.5 7.5 7 11l3.5-3.5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M4 4.5h6M2.5 4.5 1 8.5h3l-1.5-4ZM11.5 4.5 10 8.5h3l-1.5-4Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
