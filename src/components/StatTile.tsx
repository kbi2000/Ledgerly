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
  deltaPct,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "bad";
  icon?: React.ReactNode;
  /** % change vs. the prior comparable period; positive is up, negative is down. */
  deltaPct?: number | null;
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
      {typeof deltaPct === "number" && Number.isFinite(deltaPct) && (
        <p
          className="mt-1.5 text-xs font-medium"
          style={{ color: deltaPct >= 0 ? "var(--success-text)" : "var(--status-critical)" }}
        >
          {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}% vs. prior period
        </p>
      )}
    </div>
  );
}
