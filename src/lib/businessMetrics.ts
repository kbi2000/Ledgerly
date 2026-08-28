import type { Invoice, Transaction } from "@/lib/types";
import { invoiceTotal, isEffectivelyOverdue } from "@/lib/types";

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function computeBusinessMetrics(transactions: Transaction[], invoices: Invoice[]) {
  const today = new Date().toISOString().slice(0, 10);

  let totalIncome = 0;
  let totalExpense = 0;
  const byMonth = new Map<string, { income: number; expense: number }>();
  const byExpenseCategory = new Map<string, number>();

  for (const t of transactions) {
    const key = monthKey(t.date);
    const bucket = byMonth.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "income") {
      totalIncome += t.amount;
      bucket.income += t.amount;
    } else {
      totalExpense += t.amount;
      bucket.expense += t.amount;
      byExpenseCategory.set(t.category, (byExpenseCategory.get(t.category) ?? 0) + t.amount);
    }
    byMonth.set(key, bucket);
  }

  const monthlyTrend = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, income: round2(v.income), expense: round2(v.expense) }));

  const topExpenseCategories = Array.from(byExpenseCategory.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount: round2(amount) }));

  const byClient = new Map<string, number>();
  for (const inv of invoices) {
    byClient.set(inv.clientName, (byClient.get(inv.clientName) ?? 0) + invoiceTotal(inv));
  }
  const totalInvoiced = Array.from(byClient.values()).reduce((s, v) => s + v, 0);
  const topClients = Array.from(byClient.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([client, amount]) => ({
      client,
      amount: round2(amount),
      pctOfInvoicedRevenue: totalInvoiced > 0 ? round2((amount / totalInvoiced) * 100) : 0,
    }));

  const overdue = invoices.filter((inv) => isEffectivelyOverdue(inv, today));
  const overdueAmount = round2(overdue.reduce((s, inv) => s + invoiceTotal(inv), 0));

  return {
    totalIncome: round2(totalIncome),
    totalExpense: round2(totalExpense),
    net: round2(totalIncome - totalExpense),
    monthlyTrend,
    topExpenseCategories,
    topClients,
    overdueInvoiceCount: overdue.length,
    overdueInvoiceAmount: overdueAmount,
    transactionCount: transactions.length,
    invoiceCount: invoices.length,
  };
}

export type BusinessMetrics = ReturnType<typeof computeBusinessMetrics>;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
