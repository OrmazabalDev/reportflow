"use client";

import { useEffect, useState, use } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { ReportPreview } from "@/components/report-preview";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import type { ReportWithRelations } from "@/lib/domain/types";
import { downloadReportPdf } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function ReportDetailView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [report, setReport] = useState<ReportWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function loadReport() {
      try {
        if (!id) {
          notFound();
          return;
        }
        const data = await reportRepository.getReportById(id);
        if (!data) {
          notFound();
          return;
        }
        setReport(data);
      } catch (error) {
        console.error("Error loading report:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleDelete = async () => {
    if (!report || !confirm("¿Seguro que deseas eliminar este reporte?")) return;
    await reportRepository.deleteReport(report.id);
    router.push("/reports");
  };

  const handleExportPdf = async () => {
    if (!report) return;
    try {
      await downloadReportPdf(report);
      toast("PDF generado y listo para compartir", "success");
    } catch (error) {
      toast("No se pudo exportar el PDF en este dispositivo.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-[var(--rf-muted)]">Cargando reporte...</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <section>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              {report.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--rf-muted)]">
              {formatDate(report.date)} · {report.author}
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            href={`/reports/edit?id=${report.id}`}
            variant="secondary"
            size="sm"
            icon={<Pencil />}
          >
            Editar
          </Button>
          <Button
            href={`/reports/preview?id=${report.id}`}
            variant="secondary"
            size="sm"
            icon={<Eye />}
          >
            Preview
          </Button>
          <button
            onClick={handleExportPdf}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--rf-border)] bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] shadow-sm"
          >
            <Download className="size-4" />
            Compartir PDF
          </button>
          <button
            onClick={handleDelete}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98]"
          >
            <Trash2 className="size-4" />
            Eliminar
          </button>
        </div>
      </section>

      <ReportPreview report={report} />
    </div>
  );
}
