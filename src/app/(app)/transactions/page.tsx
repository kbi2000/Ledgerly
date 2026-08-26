"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";

export default function TransactionsPage() {
  const { transactions, addTransaction, removeTransaction } = useTransactions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Transactions
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Record income and expenses, or scan a receipt photo to fill the form automatically.
        </p>
      </div>

      <TransactionForm onSubmit={addTransaction} />

      <div
        className="rounded-[var(--radius-lg)] border p-5"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <TransactionTable transactions={transactions} onDelete={removeTransaction} />
      </div>
    </div>
  );
}
