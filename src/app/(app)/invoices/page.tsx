"use client";

import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceTable } from "@/components/InvoiceTable";

export default function InvoicesPage() {
  const { invoices, addInvoice, setInvoiceStatus, removeInvoice } = useInvoices();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Invoices
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Create and track client invoices, or describe one in plain English and let AI draft it.
        </p>
      </div>

      <InvoiceForm onSubmit={addInvoice} />

      <div
        className="rounded-[var(--radius-lg)] border p-5"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <InvoiceTable invoices={invoices} onStatusChange={setInvoiceStatus} onDelete={removeInvoice} />
      </div>
    </div>
  );
}
