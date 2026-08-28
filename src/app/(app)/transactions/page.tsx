"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import { RecurringTransactions } from "@/components/RecurringTransactions";
import { DateRangeSelect } from "@/components/DateRangeSelect";
import { getPresetRange, inRange, type DateRangePreset } from "@/lib/dateRanges";

export default function TransactionsPage() {
  const { transactions, addTransaction, removeTransaction } = useTransactions();
  const { profile } = useBusinessProfile();
  const [preset, setPreset] = useState<DateRangePreset>("all-time");

  const range = useMemo(() => getPresetRange(preset, profile.fiscalYearStartMonth), [preset, profile.fiscalYearStartMonth]);

  const filtered = useMemo(
    () => transactions.filter((t) => inRange(t.date, range)),
    [transactions, range]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Transactions
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Record income and expenses, or scan a receipt photo to fill the form automatically.
          </p>
        </div>
        <DateRangeSelect value={preset} onChange={setPreset} />
      </div>

      <TransactionForm onSubmit={addTransaction} businessType={profile.businessType} />

      <div
        className="rounded-[var(--radius-lg)] border p-5"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <TransactionTable transactions={filtered} onDelete={removeTransaction} />
      </div>

      <RecurringTransactions businessType={profile.businessType} />
    </div>
  );
}
