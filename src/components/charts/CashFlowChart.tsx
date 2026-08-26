"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface CashFlowPoint {
  period: string;
  income: number;
  expense: number;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  if (data.length === 0) {
    return <EmptyState label="No transactions yet — add some to see your cash flow." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis
          dataKey="period"
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(v) => currency.format(v)}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-primary)",
          }}
          formatter={(value) => currency.format(Number(value))}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={32}
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: "var(--series-1)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="var(--series-2)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: "var(--series-2)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex h-[280px] items-center justify-center text-sm"
      style={{ color: "var(--text-muted)" }}
    >
      {label}
    </div>
  );
}
