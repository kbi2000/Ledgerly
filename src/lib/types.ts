export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date (yyyy-mm-dd)
  notes?: string;
  createdAt: number;
}

export type NewTransaction = Omit<Transaction, "id" | "createdAt">;

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail?: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  notes?: string;
  createdAt: number;
}

export type NewInvoice = Omit<Invoice, "id" | "createdAt">;

export function invoiceTotal(invoice: Pick<Invoice, "items">): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

export function isEffectivelyOverdue(invoice: Pick<Invoice, "status" | "dueDate">, today = new Date().toISOString().slice(0, 10)): boolean {
  return invoice.status === "overdue" || (invoice.status === "sent" && invoice.dueDate < today);
}

export type BusinessType = "freelance" | "retail" | "restaurant" | "ecommerce" | "services" | "other";

export interface BusinessProfile {
  businessType: BusinessType;
  businessName?: string;
  fiscalYearStartMonth: number; // 1-12, 1 = calendar year
}

export type RecurringFrequency = "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: RecurringFrequency;
  startDate: string; // ISO date
  nextRunDate: string; // ISO date
  endDate?: string; // ISO date
  active: boolean;
  createdAt: number;
}

export type NewRecurringTransaction = Omit<RecurringTransaction, "id" | "createdAt">;
