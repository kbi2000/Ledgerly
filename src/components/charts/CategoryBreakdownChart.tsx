"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { ResponsiveContainer } from "recharts";
import { EmptyState } from "./CashFlowChart";

const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export interface CategoryAmount {
  category: string;
  amount: number;
}

/** Caps to the top 7 categories by amount and folds the rest into "Other",
 * so the fixed 8-slot categorical palette never has to repeat a hue. */
function capToEightSlots(items: CategoryAmount[]): CategoryAmount[] {
  const sorted = [...items].sort((a, b) => b.amount - a.amount);
  if (sorted.length <= 8) return sorted;
  const head = sorted.slice(0, 7);
  const otherTotal = sorted.slice(7).reduce((sum, i) => sum + i.amount, 0);
  return [...head, { category: "Other", amount: otherTotal }];
}

export function CategoryBreakdownChart({ data }: { data: CategoryAmount[] }) {
  const capped = capToEightSlots(data.filter((d) => d.amount > 0));

  if (capped.length === 0) {
    return <EmptyState label="No expenses yet — add some to see your spend by category." />;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, capped.length * 40)}>
      <BarChart
        data={capped}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        barCategoryGap={8}
      >
        <CartesianGrid horizontal={false} stroke="var(--gridline)" />
        <XAxis
          type="number"
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
          tickFormatter={(v) => currency.format(v)}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={160}
        />
        <Tooltip
          cursor={{ fill: "var(--page)" }}
          contentStyle={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-primary)",
          }}
          formatter={(value) => currency.format(Number(value))}
        />
        <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {capped.map((entry, index) => (
            <Cell key={entry.category} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
