"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/transactions", label: "Transactions", icon: TransactionsIcon },
  { href: "/invoices", label: "Invoices", icon: InvoicesIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <aside
      className="flex h-screen w-60 shrink-0 flex-col justify-between border-r px-3 py-4"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <Logo />
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--sidebar-fg)" }}>
            Ledgerly
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--sidebar-fg)" : "var(--sidebar-fg-muted)",
                  background: active ? "var(--sidebar-active)" : "transparent",
                }}
              >
                <Icon active={active} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="flex items-center gap-2.5 rounded-[10px] border px-2.5 py-2.5"
        style={{ borderColor: "var(--sidebar-border)", background: "var(--sidebar-surface)" }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "var(--brand-gradient)", color: "#fff" }}
        >
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium" style={{ color: "var(--sidebar-fg)" }}>
            {user?.email}
          </p>
          <button
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
            className="text-xs"
            style={{ color: "var(--sidebar-fg-muted)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity={active ? 1 : 0.8}>
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1.5" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="7.5" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9.5" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TransactionsIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity={active ? 1 : 0.8}>
      <path d="M2 5.5h9M8 3l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10.5H5M8 13l-3-2.5L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InvoicesIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" opacity={active ? 1 : 0.8}>
      <path
        d="M3.5 1.5h6l3 3v10a.5.5 0 0 1-.5.5h-8.5a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5.5 8h5M5.5 10.5h5M5.5 5.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
