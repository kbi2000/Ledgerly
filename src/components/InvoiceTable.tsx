"use client";

import type { Invoice, InvoiceStatus } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Draft", color: "var(--text-muted)", icon: "○" },
  sent: { label: "Sent", color: "var(--status-warning)", icon: "◑" },
  paid: { label: "Paid", color: "var(--status-good)", icon: "●" },
  overdue: { label: "Overdue", color: "var(--status-critical)", icon: "▲" },
};

export function InvoiceTable({
  invoices,
  onStatusChange,
  onDelete,
}: {
  invoices: Invoice[];
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onDelete: (id: string) => void;
}) {
  if (invoices.length === 0) {
    return (
      <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        No invoices yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
            <th className="py-2 pr-4 font-medium">Client</th>
            <th className="py-2 pr-4 font-medium">Issued</th>
            <th className="py-2 pr-4 font-medium">Due</th>
            <th className="py-2 pr-4 text-right font-medium">Total</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-2" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const meta = STATUS_META[inv.status];
            return (
              <tr
                key={inv.id}
                className="border-b transition-colors last:border-0 hover:bg-[var(--page)]"
                style={{ borderColor: "var(--gridline)" }}
              >
                <td className="py-3 pr-4" style={{ color: "var(--text-primary)" }}>
                  {inv.clientName}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {dateFmt.format(new Date(inv.issueDate))}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {dateFmt.format(new Date(inv.dueDate))}
                </td>
                <td
                  className="py-3 pr-4 text-right font-medium whitespace-nowrap"
                  style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
                >
                  {currency.format(invoiceTotal(inv))}
                </td>
                <td className="py-3 pr-4">
                  <select
                    value={inv.status}
                    onChange={(e) => onStatusChange(inv.id, e.target.value as InvoiceStatus)}
                    className="rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium"
                    style={{ borderColor: "var(--border)", color: meta.color }}
                  >
                    {(Object.keys(STATUS_META) as InvoiceStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].icon} {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-2 text-right">
                  <button
                    onClick={() => onDelete(inv.id)}
                    className="text-xs transition-colors hover:text-[var(--status-critical)]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
