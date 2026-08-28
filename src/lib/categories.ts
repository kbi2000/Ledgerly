import type { BusinessType, TransactionType } from "@/lib/types";

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

const EXTRA_EXPENSE_CATEGORIES: Partial<Record<BusinessType, string[]>> = {
  retail: ["Inventory & COGS", "Point-of-Sale Fees", "Shipping & Fulfillment", "Store Supplies"],
  ecommerce: [
    "Inventory & COGS",
    "Shipping & Fulfillment",
    "Platform & Marketplace Fees",
    "Payment Processing Fees",
    "Returns & Refunds",
  ],
  restaurant: [
    "Food & Beverage Inventory",
    "Kitchen Equipment",
    "Tips Payout",
    "Licenses & Permits",
    "Delivery & Third-party Fees",
  ],
  services: ["Insurance & Licensing"],
};

const EXTRA_INCOME_CATEGORIES: Partial<Record<BusinessType, string[]>> = {
  retail: ["In-store Sales", "Online Sales"],
  ecommerce: ["Marketplace Sales", "Shipping Charged to Customer"],
  restaurant: ["Dine-in Sales", "Delivery & Takeout Revenue", "Tips Received"],
  services: ["Retainer Revenue"],
};

function mergeCategories(base: readonly string[], extras: string[] | undefined): string[] {
  if (!extras || extras.length === 0) return [...base];
  const withoutOther = base.filter((c) => c !== "Other");
  const merged = [...withoutOther, ...extras.filter((c) => !withoutOther.includes(c))];
  merged.push("Other");
  return merged;
}

export function categoriesFor(type: TransactionType, businessType: BusinessType = "other"): string[] {
  if (type === "income") {
    return mergeCategories(INCOME_CATEGORIES, EXTRA_INCOME_CATEGORIES[businessType]);
  }
  return mergeCategories(EXPENSE_CATEGORIES, EXTRA_EXPENSE_CATEGORIES[businessType]);
}
