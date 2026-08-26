"use client";

import { useState, type FormEvent } from "react";
import type { Transaction } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How much did I spend last month?",
  "What's my biggest expense category?",
  "Am I profitable so far?",
];

export function AskBooksChat({ transactions }: { transactions: Transaction[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, transactions }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setError(data.error ?? "Couldn't answer that.");
      }
    } catch {
      setError("Couldn't reach the assistant.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div
      className="flex flex-col rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white"
          style={{ background: "var(--brand-gradient)" }}
        >
          ✦
        </span>
        Ask your books
      </h2>

      {messages.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Ask a question about your recorded transactions.
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={transactions.length === 0 || loading}
                className="rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-3 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className="max-w-[85%] rounded-[14px] px-3.5 py-2 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? { background: "var(--brand-gradient)", color: "#ffffff" }
                    : { background: "var(--page)", color: "var(--text-secondary)" }
                }
              >
                {m.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p
                className="rounded-[14px] px-3.5 py-2 text-sm"
                style={{ background: "var(--page)", color: "var(--text-muted)" }}
              >
                Thinking…
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mb-2 text-xs" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={transactions.length === 0 ? "Add some transactions first…" : "Ask a question…"}
          disabled={transactions.length === 0}
          className="flex-1 rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)] disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || transactions.length === 0}
          className="shrink-0 rounded-[10px] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--brand-gradient)" }}
        >
          Ask
        </button>
      </form>
    </div>
  );
}
