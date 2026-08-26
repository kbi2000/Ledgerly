export const EXPENSE_CATEGORIES = [
  "Software & Subscriptions",
  "Office Supplies",
  "Travel",
  "Meals & Entertainment",
  "Contractors & Payroll",
  "Rent & Utilities",
  "Marketing & Advertising",
  "Professional Services",
  "Equipment",
  "Taxes & Fees",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Client Revenue",
  "Product Sales",
  "Consulting",
  "Interest & Investments",
  "Refunds",
  "Other",
] as const;

export function categoriesFor(type: "income" | "expense"): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
