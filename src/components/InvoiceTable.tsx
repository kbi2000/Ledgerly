"use client";

import { Fragment, useState } from "react";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { invoiceTotal, isEffectivelyOverdue } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_META: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
  draft: { label: "Draft", color: "var(--text-muted)", icon: "○" },
  sent: { label: "Sent", color: "var(--status-warning)", icon: "◑" },
  paid: { label: "Paid", color: "var(--status-good)", icon: "●" },
  overdue: { label: "Overdue", color: "var(--status-critical)", icon: "▲" },
};

interface ReminderState {
  loading: boolean;
  draft: string | null;
  error: string | null;
  copied: boolean;
}

export function InvoiceTable({
  invoices,
  onStatusChange,
  onDelete,
  businessName,
}: {
  invoices: Invoice[];
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onDelete: (id: string) => void;
  businessName?: string;
}) {
  const [reminders, setReminders] = useState<Record<string, ReminderState>>({});

  async function draftReminder(inv: Invoice) {
    setReminders((prev) => ({ ...prev, [inv.id]: { loading: true, draft: null, error: null, copied: false } }));
    try {
      const res = await fetch("/api/invoice-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: inv.clientName,
          amount: invoiceTotal(inv),
          dueDate: inv.dueDate,
          businessName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReminders((prev) => ({ ...prev, [inv.id]: { loading: false, draft: data.draft, error: null, copied: false } }));
      } else {
        setReminders((prev) => ({
          ...prev,
          [inv.id]: { loading: false, draft: null, error: data.error ?? "Couldn't draft a reminder.", copied: false },
        }));
      }
    } catch {
      setReminders((prev) => ({
        ...prev,
        [inv.id]: { loading: false, draft: null, error: "Couldn't reach the drafting service.", copied: false },
      }));
    }
  }

  async function copyDraft(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setReminders((prev) => ({ ...prev, [id]: { ...prev[id], copied: true } }));
      setTimeout(() => setReminders((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], copied: false } } : prev)), 1500);
    } catch {
      // clipboard access denied; nothing more we can do here
    }
  }

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
            const overdue = isEffectivelyOverdue(inv);
            const reminder = reminders[inv.id];
            return (
              <Fragment key={inv.id}>
                <tr
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
                  <td className="py-3 pr-2 text-right whitespace-nowrap">
                    {overdue && (
                      <button
                        onClick={() => draftReminder(inv)}
                        disabled={reminder?.loading}
                        className="mr-3 text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ color: "var(--brand-1)" }}
                      >
                        {reminder?.loading ? "Drafting…" : "Draft reminder"}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(inv.id)}
                      className="text-xs transition-colors hover:text-[var(--status-critical)]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {(reminder?.draft || reminder?.error) && (
                  <tr style={{ borderColor: "var(--gridline)" }} className="border-b last:border-0">
                    <td colSpan={6} className="pb-3">
                      {reminder.draft && (
                        <div
                          className="flex flex-col gap-2 rounded-[10px] border p-3"
                          style={{ borderColor: "var(--border)", background: "var(--page)" }}
                        >
                          <pre className="whitespace-pre-wrap text-xs" style={{ color: "var(--text-secondary)" }}>
                            {reminder.draft}
                          </pre>
                          <button
                            type="button"
                            onClick={() => copyDraft(inv.id, reminder.draft!)}
                            className="self-start text-xs font-medium"
                            style={{ color: "var(--brand-1)" }}
                          >
                            {reminder.copied ? "Copied!" : "Copy to clipboard"}
                          </button>
                        </div>
                      )}
                      {reminder.error && (
                        <p className="text-xs" style={{ color: "var(--status-critical)" }}>
                          {reminder.error}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
