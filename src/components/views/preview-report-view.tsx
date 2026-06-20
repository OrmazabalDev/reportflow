"use client";

import { useEffect, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { ReportPreview } from "@/components/report-preview";
import { Button } from "@/components/ui/button";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import type { ReportWithRelations } from "@/lib/domain/types";
import { downloadReportPdf } from "@/lib/pdf";
import { useToast } from "@/components/ui/toast";

export function PreviewReportView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [report, setReport] = useState<ReportWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        console.error("Error loading report for preview", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-[var(--rf-muted)]">Cargando vista previa...</p>
      </div>
    );
  }

  const handleExportPdf = async () => {
    if (!report) return;
    try {
      await downloadReportPdf(report);
      toast("PDF generado y listo para compartir", "success");
    } catch (error) {
      toast("No se pudo exportar el PDF en este dispositivo.", "error");
    }
  };

  if (!report) return null;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-950">
          Documento listo para exportar
        </h2>
        <div className="flex gap-2">
          <Button
            href={`/reports/edit?id=${report.id}`}
            variant="secondary"
            size="sm"
            icon={<Pencil />}
          >
            Editar
          </Button>
          <button
            onClick={handleExportPdf}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--rf-border)] bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] shadow-sm"
          >
            <Download className="size-4" />
            Compartir PDF
          </button>
        </div>
      </div>

      <ReportPreview report={report} />
    </div>
  );
}
