"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home, PlusCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/reports/new", label: "Nuevo", icon: PlusCircle },
  { href: "/reports", label: "Historial", icon: History },
];

function getPageTitle(pathname: string) {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/reports/new") return "Nuevo reporte";
  if (pathname === "/reports/edit") return "Editar reporte";
  if (pathname === "/reports/preview") return "Vista previa";
  if (pathname === "/reports/detail") return "Detalle";
  if (pathname === "/reports") return "Historial";
  return "ReportFlow";
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/reports/new") {
    return pathname === "/reports/new" || pathname === "/reports/edit";
  }
  if (href === "/reports") {
    if (pathname === "/reports/new" || pathname === "/reports/edit") return false;
    return pathname === "/reports" || pathname === "/reports/detail" || pathname === "/reports/preview";
  }
  return pathname === href;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-[var(--rf-bg)] text-[var(--rf-text)] pb-[calc(100px+env(safe-area-inset-bottom))] md:pb-0">
      {/* ── Mobile App Bar ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[var(--rf-border)] md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--rf-muted)]">ReportFlow</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              {pageTitle}
            </h1>
          </div>
          <Link
            href="/"
            prefetch={false}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-[0.98] transition border border-slate-200/60 shadow-sm"
            aria-label="Configuración"
          >
            <Shield className="size-5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-0 md:px-6 md:pt-6 md:pb-8">
        {/* ── Desktop sidebar ── */}
        <aside className="sticky top-6 hidden h-fit w-64 flex-col rounded-[var(--rf-radius-card)] bg-white p-5 ring-1 ring-[var(--rf-border)] md:flex">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--rf-primary)] text-white">
              <Shield className="size-5" />
            </span>
            <div>
              <p className="text-base font-bold tracking-tight">ReportFlow</p>
              <p className="text-[10px] font-medium text-[var(--rf-muted)]">
                Reportes + PDF
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                    active
                      ? "bg-[var(--rf-primary-light)] text-[var(--rf-primary-dark)] font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon className="size-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[var(--rf-primary-light)] text-xs font-bold text-[var(--rf-primary)]">
                  DO
                </span>
                <div>
                  <p className="text-sm font-semibold">Diego O.</p>
                  <p className="text-[11px] text-[var(--rf-muted)]">Uso interno</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 flex-1 px-4 pt-4 pb-12 md:px-0 md:pt-0 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white/90 backdrop-blur-2xl border-t border-[var(--rf-border)]" style={{ height: "calc(72px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex h-[72px] max-w-md items-center justify-around px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex flex-col items-center justify-center py-2 transition-all active:scale-95",
                  active ? "text-[var(--rf-primary)]" : "text-slate-500",
                )}
              >
                <span
                  className={cn(
                    "flex h-[32px] w-[64px] items-center justify-center rounded-full transition-colors",
                    active ? "bg-[var(--rf-primary-light)] text-[var(--rf-primary-dark)]" : "",
                  )}
                >
                  <Icon className="size-[22px]" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="text-[11px] font-semibold tracking-wide truncate max-w-full px-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
