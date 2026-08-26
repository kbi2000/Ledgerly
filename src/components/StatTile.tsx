const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function StatTile({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "bad";
  icon?: React.ReactNode;
}) {
  const color =
    tone === "good"
      ? "var(--success-text)"
      : tone === "bad"
      ? "var(--status-critical)"
      : "var(--text-primary)";

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "var(--page)", color: "var(--text-muted)" }}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className="mt-3 text-[28px] leading-none font-semibold tracking-tight"
        style={{ color, fontVariantNumeric: "tabular-nums" }}
      >
        {currency.format(value)}
      </p>
    </div>
  );
}
