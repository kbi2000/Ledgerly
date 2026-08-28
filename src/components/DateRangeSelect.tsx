"use client";

import { DATE_RANGE_PRESETS, type DateRangePreset } from "@/lib/dateRanges";

export function DateRangeSelect({
  value,
  onChange,
}: {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DateRangePreset)}
      className="rounded-full border px-3.5 py-1.5 text-xs font-medium outline-none"
      style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface-1)" }}
    >
      {DATE_RANGE_PRESETS.map((p) => (
        <option key={p.key} value={p.key}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
