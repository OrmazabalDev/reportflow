"use client";

import Link from "next/link";
import type { ReportWithRelations } from "@/lib/domain/types";
import { useDeferredValue, useMemo, useState } from "react";
import { ChevronRight, Download, FileText, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { downloadReportPdf } from "@/lib/pdf";
import { useToast } from "@/components/ui/toast";

export function HistorySearch({ reports }: { reports: ReportWithRelations[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { toast } = useToast();

  const handleExportPdf = async (report: ReportWithRelations) => {
    try {
      await downloadReportPdf(report);
      toast("PDF generado y listo para compartir", "success");
    } catch (error) {
      toast("No se pudo exportar el PDF en este dispositivo.", "error");
    }
  };

  const filtered = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) {
      return reports;
    }

    return reports.filter((report) => {
      return (
        report.title.toLowerCase().includes(value) ||
        report.author.toLowerCase().includes(value)
      );
    });
  }, [deferredQuery, reports]);

  return (
    <div className="space-y-4">
      {/* ── Search bar ── */}
      <div className="flex items-center gap-3 rounded-[var(--rf-radius-input)] bg-white px-4 ring-1 ring-[var(--rf-border)]">
        <Search className="size-[18px] shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-[48px] w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Buscar por título o autor..."
          aria-label="Buscar reportes"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 text-xs font-medium text-[var(--rf-muted)]"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <p className="text-sm text-[var(--rf-muted)]">
        <span className="font-semibold text-slate-900">{filtered.length}</span> resultado
        {filtered.length === 1 ? "" : "s"}
      </p>

      {/* ── Report list ── */}
      <div className="overflow-hidden rounded-[var(--rf-radius-card)] bg-white shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)]">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-base font-semibold text-slate-900">
              No hay coincidencias
            </p>
            <p className="mt-1 text-sm text-[var(--rf-muted)]">
              Ajusta el término de búsqueda o crea un nuevo reporte.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--rf-border)]">
            {filtered.map((report) => (
              <div key={report.id} className="flex items-center">
                <Link
                  key={report.id}
                  href={`/reports/detail?id=${report.id}`}
                  prefetch={false}
                  className="flex items-start gap-4 px-4 py-4 transition-all active:scale-[0.99] active:bg-slate-50"
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
                      {formatDate(report.date)} · {report.author}
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      {report.findings.length} hallazgos · {report.checklistItems.length} checks
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportPdf(report);
                  }}
                  className="flex size-11 shrink-0 items-center justify-center mr-2 rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 active:bg-slate-100"
                  aria-label={`Descargar PDF de ${report.title}`}
                >
                  <Download className="size-[18px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
