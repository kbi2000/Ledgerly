"use client";

import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SettingsPage() {
  const { profile, loading, updateProfile } = useBusinessProfile();
  const [businessName, setBusinessName] = useState(profile.businessName ?? "");
  const [nameDirty, setNameDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayName = nameDirty ? businessName : profile.businessName ?? "";

  async function handleBusinessTypeChange(businessType: BusinessType) {
    await updateProfile({ businessType });
  }

  async function handleFiscalMonthChange(fiscalYearStartMonth: number) {
    await updateProfile({ fiscalYearStartMonth });
  }

  async function handleNameSave() {
    await updateProfile({ businessName: businessName.trim() || undefined });
    setNameDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Tell us about your business so categories, dates, and AI features are tailored to it.
        </p>
      </div>

      <div
        className="flex flex-col gap-5 rounded-[var(--radius-lg)] border p-5"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Business name (optional)</span>
          <div className="flex gap-2">
            <input
              value={displayName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setNameDirty(true);
              }}
              placeholder="e.g. Acme Consulting"
              className="flex-1 rounded-[10px] border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(42,86,214,0.15)]"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
            />
            <button
              type="button"
              onClick={handleNameSave}
              disabled={loading}
              className="shrink-0 rounded-[10px] border px-3.5 py-2.5 text-xs font-medium transition-colors disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--brand-1)" }}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Business type</span>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Drives the transaction categories and AI suggestions you see across the app.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.key}
                type="button"
                onClick={() => handleBusinessTypeChange(bt.key)}
                disabled={loading}
                className="rounded-[10px] border px-3.5 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-50"
                style={
                  profile.businessType === bt.key
                    ? { background: "var(--brand-gradient)", color: "#ffffff", borderColor: "transparent" }
                    : { borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }
                }
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Fiscal year start month</span>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Used to compute &quot;This fiscal year&quot; and &quot;Last fiscal year&quot; date ranges.
          </p>
          <select
            value={profile.fiscalYearStartMonth}
            onChange={(e) => handleFiscalMonthChange(Number(e.target.value))}
            disabled={loading}
            className="w-fit rounded-[10px] border px-3.5 py-2.5 text-sm outline-none disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--page)" }}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
