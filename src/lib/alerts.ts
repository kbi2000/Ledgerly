import type { Transaction } from "@/lib/types";

export interface Alert {
  id: string;
  severity: "warning" | "serious";
  message: string;
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

/** Same amount + category within a 3-day window looks like an accidental duplicate entry. */
function findDuplicates(transactions: Transaction[]): Alert[] {
  const alerts: Alert[] = [];
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const daysApart = Math.abs(
        (new Date(b.date).getTime() - new Date(a.date).getTime()) / 86_400_000
      );
      if (daysApart > 3) break; // sorted by date, so nothing further will be closer
      if (
        a.type === b.type &&
        a.category === b.category &&
        Math.abs(a.amount - b.amount) < 0.01
      ) {
        alerts.push({
          id: `dup-${a.id}-${b.id}`,
          severity: "warning",
          message: `Possible duplicate: two ${a.type === "income" ? "income" : "expense"} entries for $${a.amount.toFixed(
            2
          )} in "${a.category}" within ${Math.round(daysApart) || "the same"} day${daysApart >= 1 ? "s" : ""} of each other (${a.description} / ${b.description}).`,
        });
      }
    }
  }
  return alerts;
}

/** Flags a category whose current-month expense total is well above its own historical monthly average. */
function findSpendingSpikes(transactions: Transaction[]): Alert[] {
  const expenses = transactions.filter((t) => t.type === "expense");
  const months = Array.from(new Set(expenses.map((t) => monthKey(t.date)))).sort();
  if (months.length < 2) return [];

  const currentMonth = months[months.length - 1];
  const priorMonths = months.slice(0, -1);

  const byCategoryByMonth = new Map<string, Map<string, number>>();
  for (const t of expenses) {
    const cat = byCategoryByMonth.get(t.category) ?? new Map<string, number>();
    cat.set(monthKey(t.date), (cat.get(monthKey(t.date)) ?? 0) + t.amount);
    byCategoryByMonth.set(t.category, cat);
  }

  const alerts: Alert[] = [];
  for (const [category, byMonth] of byCategoryByMonth) {
    const current = byMonth.get(currentMonth);
    if (!current) continue;
    const priorValues = priorMonths.map((m) => byMonth.get(m) ?? 0);
    const priorAvg = priorValues.reduce((s, v) => s + v, 0) / priorValues.length;
    if (priorAvg < 10) continue; // avoid flagging noise on categories with negligible history
    if (current > priorAvg * 1.75) {
      const multiple = current / priorAvg;
      alerts.push({
        id: `spike-${category}-${currentMonth}`,
        severity: multiple > 3 ? "serious" : "warning",
        message: `"${category}" spending this month ($${current.toFixed(
          2
        )}) is ${multiple.toFixed(1)}x your recent monthly average ($${priorAvg.toFixed(2)}).`,
      });
    }
  }
  return alerts;
}

export function computeAlerts(transactions: Transaction[]): Alert[] {
  return [...findSpendingSpikes(transactions), ...findDuplicates(transactions)];
}
