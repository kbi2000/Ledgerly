"use client";

import { useState, type FormEvent } from "react";
import { categoriesFor } from "@/lib/categories";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import type { BusinessType, RecurringFrequency, TransactionType } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const FREQUENCIES: { key: RecurringFrequency; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export function RecurringTransactions({ businessType = "other" }: { businessType?: BusinessType }) {
  const { recurring, addRecurring, removeRecurring, setActive, runDue } = useRecurringTransactions();
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categoriesFor("expense", businessType)[0]);
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [startDate, setStartDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [runNote, setRunNote] = useState<string | null>(null);

  function changeType(next: TransactionType) {
    setType(next);
    setCategory(categoriesFor(next, businessType)[0]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setSubmitting(true);
    try {
      await addRecurring({
        description: description.trim(),
        amount: Math.abs(Number(amount)),
        type,
        category,
        frequency,
        startDate,
        nextRunDate: startDate,
        active: true,
      });
      setDescription("");
      setAmount("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRunDue() {
    setRunning(true);
    setRunNote(null);
    try {
      const count = await runDue();
      setRunNote(count > 0 ? `Created ${count} transaction${count === 1 ? "" : "s"}.` : "Nothing due yet.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Recurring transactions
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Rent, subscriptions, retainers — set it once, run it whenever it&apos;s due.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDue}
            disabled={running || recurring.length === 0}
            className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
          >
            {running ? "Running…" : "Run due now"}
          </button>
        </div>
      </div>
      {runNote && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {runNote}
        </p>
      )}

      {recurring.length > 0 && (
        <ul className="flex flex-col gap-2">
          {recurring.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-sm"
              style={{ borderColor: "var(--border)", background: "var(--page)" }}
            >
              <div className="min-w-0">
                <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
                  {r.description}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {r.type === "income" ? "+" : "−"}
                  {currency.format(r.amount)} · {r.category} · {r.frequency} · next {r.nextRunDate}
                  {!r.active ? " · ended" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActive(r.id, !r.active)}
                  className="text-xs font-medium"
                  style={{ color: "var(--brand-1)" }}
                >
                  {r.active ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  onClick={() => removeRecurring(r.id)}
                  className="text-xs transition-colors hover:text-[var(--status-critical)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <div className="inline-flex w-fit gap-0.5 rounded-full border p-0.5" style={{ borderColor: "var(--border)" }}>
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeType(t)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors"
              style={
                type === t
                  ? { background: "var(--brand-gradient)", color: "#ffffff" }
                  : { background: "transparent", color: "var(--text-muted)" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (e.g. Office rent)"
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none sm:col-span-2"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          >
            {categoriesFor(type, businessType).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Starts</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-[10px] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--brand-gradient)" }}
        >
          {submitting ? "Saving…" : "Add recurring transaction"}
        </button>
      </form>
    </div>
  );
}
