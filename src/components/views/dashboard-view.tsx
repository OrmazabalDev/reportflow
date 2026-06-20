"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, PlusCircle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import type { DashboardStats } from "@/lib/domain/ReportRepository";
import type { ReportWithRelations } from "@/lib/domain/types";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { APP_VERSION, APP_BUILD_NUMBER, APP_NAME, APP_STAGE } from "@/lib/version";
import { updateService } from "@/lib/update/update.service";
import type { UpdateManifest } from "@/lib/update/update.types";
import { UpdateAvailableDialog } from "@/components/update/update-available-dialog";

export function DashboardView() {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    drafts: 0,
    finalized: 0,
    pendingChecklist: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [updateManifest, setUpdateManifest] = useState<UpdateManifest | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await reportRepository.getDashboardData();
        setReports(data.reports);
        setStats(data.stats);
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Check for updates
    async function checkUpdate() {
      if (sessionStorage.getItem("update_dismissed")) return;
      const manifest = await updateService.checkForUpdate();
      if (manifest) {
        setUpdateManifest(manifest);
      }
    }
    checkUpdate();
  }, []);

  const latest = reports[0];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-[var(--rf-muted)]">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Hero ── */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Reportes listos para revisar
        </h2>
        <p className="mt-2 text-sm text-[var(--rf-muted)]">
          {stats.total} reportes · Última actividad{" "}
          {latest ? formatRelativeDate(latest.createdAt) : "sin registrar"}
        </p>
        <div className="mt-6">
          <Button href="/reports/new" icon={<PlusCircle />} className="w-full md:w-auto h-[52px] rounded-2xl shadow-sm text-base">
            Nuevo reporte
          </Button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--rf-radius-card)] bg-white p-5 shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)]">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-[var(--rf-muted)]">Total</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-950">{stats.total}</p>
        </div>
        <div className="rounded-[var(--rf-radius-card)] bg-white p-5 shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)]">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-[var(--rf-muted)]">Borradores</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-950">{stats.drafts}</p>
        </div>
        <div className="rounded-[var(--rf-radius-card)] bg-white p-5 shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)] sm:col-span-1 col-span-2">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-[var(--rf-muted)]">Finalizados</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-950">{stats.finalized}</p>
        </div>
      </section>

      {/* ── Recent reports as native list ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-900">Actividad reciente</h3>
          <Link
            href="/reports"
            prefetch={false}
            className="flex items-center gap-1 text-sm font-medium text-[var(--rf-primary)] active:opacity-70"
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[var(--rf-radius-card)] bg-white shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)]">
          {reports.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-base font-semibold text-slate-900">
                Todavía no hay reportes
              </p>
              <p className="mt-1 text-sm text-[var(--rf-muted)]">
                Crea el primero para empezar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--rf-border)]">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/detail?id=${report.id}`}
                  prefetch={false}
                  className="flex items-center gap-3.5 px-4 py-3.5 transition-all active:scale-[0.98] active:bg-slate-50"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FileText className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {report.title}
                      </p>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="mt-0.5 text-[13px] text-[var(--rf-muted)]">
                      {formatRelativeDate(report.createdAt)} · {report.author}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {report.findings.length} hallazgos · {report.checklistItems.length} checks
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Quick reference card ── */}
      <section className="rounded-[var(--rf-radius-card)] bg-white p-5 shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)] mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--rf-muted)]">Referencia rápida</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Última actividad</span>
            <span className="text-sm font-semibold text-slate-900">
              {latest ? formatDate(latest.createdAt) : "Sin datos"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Último autor</span>
            <span className="text-sm font-semibold text-slate-900">
              {latest?.author ?? "Sin datos"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Checks pendientes</span>
            <span className="text-sm font-semibold text-slate-900">{stats.pendingChecklist}</span>
          </div>
        </div>
      </section>

      {/* ── Version ── */}
      <p className="text-center text-[11px] text-slate-400 pb-2">
        {APP_NAME} {APP_STAGE} — v{APP_VERSION} build {APP_BUILD_NUMBER}
      </p>

      {updateManifest && (
        <UpdateAvailableDialog
          manifest={updateManifest}
          onDismiss={() => {
            sessionStorage.setItem("update_dismissed", "1");
            setUpdateManifest(null);
          }}
          onDownload={() => {
            // Usa el comportamiento por defecto de window.open que Capacitor o el browser manejan
            window.open(updateManifest.apkUrl, "_system");
            if (!updateManifest.required) {
              setUpdateManifest(null);
            }
          }}
        />
      )}
    </div>
  );
}
