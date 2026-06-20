"use client";

import { useEffect, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { ReportEditor } from "@/components/report-editor";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import type { ReportFormValues } from "@/lib/domain/types";

export function EditReportView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [report, setReport] = useState<ReportFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        if (!id) {
          notFound();
          return;
        }
        const data = await reportRepository.getReportForEdit(id);
        if (!data) {
          notFound();
          return;
        }
        setReport(data);
      } catch (error) {
        console.error("Error loading report for edit", error);
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
        <p className="text-[var(--rf-muted)]">Cargando reporte...</p>
      </div>
    );
  }

  if (!report) return null;

  return <ReportEditor initialValues={report} mode="edit" />;
}
