"use client";

import { useState, type FormEvent } from "react";
import { categoriesFor } from "@/lib/categories";
import type { NewTransaction, TransactionType } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({
  onSubmit,
}: {
  onSubmit: (input: NewTransaction) => Promise<void>;
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categoriesFor("expense")[0]);
  const [date, setDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  function changeType(next: TransactionType) {
    setType(next);
    setCategory(categoriesFor(next)[0]);
  }

  async function handleAutoCategorize() {
    if (!description.trim()) return;
    setCategorizing(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: Number(amount) || undefined, type }),
      });
      const data = await res.json();
      if (res.ok && data.category) {
        setCategory(data.category);
      } else {
        setAiNote(data.error ?? "Couldn't get a suggestion.");
      }
    } catch {
      setAiNote("Couldn't reach the categorizer.");
    } finally {
      setCategorizing(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setSubmitting(true);
    try {
      await onSubmit({
        description: description.trim(),
        amount: Math.abs(Number(amount)),
        type,
        category,
        date,
      });
      setDescription("");
      setAmount("");
      setAiNote(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="inline-flex w-fit gap-0.5 rounded-full border p-0.5"
        style={{ borderColor: "var(--border)" }}
      >
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
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span style={{ color: "var(--text-secondary)" }}>Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Adobe Creative Cloud subscription"
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Amount (USD)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span style={{ color: "var(--text-secondary)" }}>Category</span>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
            >
              {categoriesFor(type).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAutoCategorize}
              disabled={categorizing || !description.trim()}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border px-3.5 py-2.5 text-xs font-medium transition-colors disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
            >
              <SparkleIcon />
              {categorizing ? "Thinking…" : "Auto-categorize"}
            </button>
          </div>
          {aiNote && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {aiNote}
            </span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 self-start rounded-[10px] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--brand-gradient)" }}
      >
        {submitting ? "Saving…" : "Add transaction"}
      </button>
    </form>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"
        fill="currentColor"
      />
    </svg>
  );
}
