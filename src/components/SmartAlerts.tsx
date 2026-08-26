import { computeAlerts } from "@/lib/alerts";
import type { Transaction } from "@/lib/types";

export function SmartAlerts({ transactions }: { transactions: Transaction[] }) {
  const alerts = computeAlerts(transactions);
  if (alerts.length === 0) return null;

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-5"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        <AlertIcon />
        Smart alerts
      </h2>
      <ul className="flex flex-col gap-2.5">
        {alerts.map((alert) => (
          <li key={alert.id} className="flex items-start gap-2.5 text-sm">
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background: alert.severity === "serious" ? "var(--status-serious)" : "var(--status-warning)",
              }}
            />
            <span style={{ color: "var(--text-secondary)" }}>{alert.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5 1 12h12L7 1.5Z"
        stroke="var(--status-warning)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M7 5.5v3" stroke="var(--status-warning)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.7" fill="var(--status-warning)" />
    </svg>
  );
}
