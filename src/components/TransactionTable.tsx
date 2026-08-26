"use client";

import type { Transaction } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function TransactionTable({
  transactions,
  onDelete,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        No transactions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
          >
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Description</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 text-right font-medium">Amount</th>
            <th className="py-2 pr-2" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className="border-b transition-colors last:border-0 hover:bg-[var(--page)]"
              style={{ borderColor: "var(--gridline)" }}
            >
              <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                {dateFmt.format(new Date(t.date))}
              </td>
              <td className="py-3 pr-4" style={{ color: "var(--text-primary)" }}>
                {t.description}
              </td>
              <td className="py-3 pr-4">
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: "var(--page)", color: "var(--text-secondary)" }}
                >
                  {t.category}
                </span>
              </td>
              <td
                className="py-3 pr-4 text-right font-medium whitespace-nowrap"
                style={{ color: t.type === "income" ? "var(--success-text)" : "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
              >
                {t.type === "income" ? "+" : "−"}
                {currency.format(t.amount)}
              </td>
              <td className="py-3 pr-2 text-right">
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-xs transition-colors hover:text-[var(--status-critical)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
