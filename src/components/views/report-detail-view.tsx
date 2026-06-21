"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { ReportPreview } from "@/components/report-preview";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import { templateRepository } from "@/lib/infrastructure/IndexedDbTemplateRepository";
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

  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSaveAsTemplate = async () => {
    setModalError(null);
    if (!report) return;

    if (!newTemplateName.trim()) {
      setModalError("El nombre de la plantilla es obligatorio.");
      return;
    }

    if (report.checklistItems.length === 0) {
      setModalError("No puedes crear una plantilla con un checklist vacío.");
      return;
    }

    try {
      const itemsToSave = report.checklistItems.map((item) => ({
        text: item.text.trim(),
        note: (item.note || "").trim(),
      }));

      await templateRepository.saveTemplate({
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim(),
        items: itemsToSave,
      });

      toast(`Plantilla "${newTemplateName}" guardada con éxito.`, "success");
      setNewTemplateName("");
      setNewTemplateDesc("");
      setSaveAsTemplateOpen(false);
    } catch (err) {
      console.error(err);
      setModalError("Error al guardar la plantilla.");
    }
  };

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
            onClick={() => setSaveAsTemplateOpen(true)}
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--rf-border)] bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] shadow-sm"
          >
            <FileText className="size-4" />
            Guardar como plantilla
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

      {/* Save as Template Modal */}
      {saveAsTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <FileText className="size-5 text-[var(--rf-primary)]" />
              Guardar como Plantilla
            </h3>
            <p className="text-xs text-slate-500">
              Se creará una plantilla reutilizable con los {report.checklistItems.length} ítems de este reporte.
            </p>

            {modalError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-tpl-name">
                  Nombre de la Plantilla <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-tpl-name"
                  className="flex h-11 w-full rounded-xl border border-[var(--rf-border)] bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[var(--rf-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--rf-primary)]/10"
                  value={newTemplateName}
                  onChange={(e) => {
                    setModalError(null);
                    setNewTemplateName(e.target.value);
                  }}
                  placeholder="Ej. Inspección de Extintores..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-tpl-desc">
                  Descripción Opcional
                </label>
                <input
                  id="new-tpl-desc"
                  className="flex h-11 w-full rounded-xl border border-[var(--rf-border)] bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[var(--rf-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--rf-primary)]/10"
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Ej. Puntos a verificar para el control mensual..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                size="sm"
                onClick={() => {
                  setSaveAsTemplateOpen(false);
                  setNewTemplateName("");
                  setNewTemplateDesc("");
                  setModalError(null);
                }}
              >
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" size="sm" onClick={handleSaveAsTemplate}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
