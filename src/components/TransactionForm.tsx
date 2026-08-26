"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { categoriesFor } from "@/lib/categories";
import type { NewTransaction, TransactionType } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  const [scanning, setScanning] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleScanReceipt(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setScanning(true);
    setAiNote(null);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });
      const data = await res.json();
      if (res.ok) {
        setType("expense");
        setDescription(data.description);
        setAmount(String(data.amount));
        setDate(data.date);
        setCategory(data.category);
      } else {
        setAiNote(data.error ?? "Couldn't read that receipt.");
      }
    } catch {
      setAiNote("Couldn't reach the receipt scanner.");
    } finally {
      setScanning(false);
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
      <div className="flex items-center justify-between gap-3">
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleScanReceipt}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
        >
          <CameraIcon />
          {scanning ? "Scanning…" : "Scan receipt"}
        </button>
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

function CameraIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 4.5h1.6l.7-1.3c.1-.2.3-.3.5-.3h4.4c.2 0 .4.1.5.3l.7 1.3H12a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7.8" r="2.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
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
