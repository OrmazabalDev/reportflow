"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { HistorySearch } from "@/components/history-search";
import { Button } from "@/components/ui/button";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import type { ReportWithRelations } from "@/lib/domain/types";

export function ReportsView() {
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const deleted = searchParams.get("deleted");
  const deleteError = searchParams.get("deleteError");

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await reportRepository.listReports();
        setReports(data);
      } catch (error) {
        console.error("Error loading reports", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [deleted]); // Reload if deleted changes

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-[var(--rf-muted)]">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {deleted === "1" ? (
        <div className="rounded-[var(--rf-radius-card)] bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          Reporte eliminado correctamente.
        </div>
      ) : null}

      {deleteError === "1" ? (
        <div className="rounded-[var(--rf-radius-card)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          No se pudo eliminar el reporte. Intenta nuevamente.
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Reportes registrados
          </h2>
          <p className="mt-1 text-sm text-[var(--rf-muted)]">
            {reports.length} reporte{reports.length === 1 ? "" : "s"} en total
          </p>
        </div>
        <Button href="/reports/new" icon={<PlusCircle />} className="h-[44px] rounded-2xl shadow-sm px-4">
          Nuevo reporte
        </Button>
      </div>

      <HistorySearch reports={reports} />
    </div>
  );
}
