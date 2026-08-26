"use client";

import { useState, type FormEvent } from "react";
import type { InvoiceItem, NewInvoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);
const inTwoWeeks = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
};

const emptyItem = (): InvoiceItem => ({ description: "", quantity: 1, rate: 0 });

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function InvoiceForm({ onSubmit }: { onSubmit: (input: NewInvoice) => Promise<void> }) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(inTwoWeeks());
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || items.length === 0) return;
    setSubmitting(true);
    try {
      await onSubmit({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        items: items.filter((it) => it.description.trim()),
        status: "draft",
        issueDate,
        dueDate,
      });
      setClientName("");
      setClientEmail("");
      setItems([emptyItem()]);
      setIssueDate(today());
      setDueDate(inTwoWeeks());
    } finally {
      setSubmitting(false);
    }
  }

  const total = invoiceTotal({ items });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Client name</span>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Client email (optional)</span>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Issue date</span>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Line items
        </span>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_100px_auto] gap-2">
            <input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(i, { description: e.target.value })}
              className="rounded-md border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
              className="rounded-md border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Rate"
              value={item.rate}
              onChange={(e) => updateItem(i, { rate: Number(e.target.value) })}
              className="rounded-md border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              disabled={items.length === 1}
              className="text-xs disabled:opacity-30"
              style={{ color: "var(--text-muted)" }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="self-start text-xs font-medium"
          style={{ color: "var(--brand-1)" }}
        >
          + Add line item
        </button>
      </div>

      <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Total: {currency.format(total)}
        </span>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[10px] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--brand-gradient)" }}
        >
          {submitting ? "Saving…" : "Create invoice"}
        </button>
      </div>
    </form>
  );
}
