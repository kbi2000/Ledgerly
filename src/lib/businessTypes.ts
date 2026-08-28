import type { BusinessType } from "@/lib/types";

export const BUSINESS_TYPES: { key: BusinessType; label: string }[] = [
  { key: "other", label: "General / Other" },
  { key: "freelance", label: "Freelance / Consulting" },
  { key: "services", label: "Professional Services" },
  { key: "retail", label: "Retail / Product Sales" },
  { key: "restaurant", label: "Restaurant / Food Service" },
  { key: "ecommerce", label: "E-commerce" },
];

export function businessTypeLabel(businessType: BusinessType): string {
  return BUSINESS_TYPES.find((b) => b.key === businessType)?.label ?? "General / Other";
}
