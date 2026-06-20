"use client";

import { LocalImage } from "@/components/ui/local-image";
import { ChecklistStatus, ReportStatus } from "@/lib/domain/types";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { SectionHeader } from "@/components/editor/editor-ui";
import type { ReportFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EditorStepSummary({ values }: { values: ReportFormValues }) {
  const completedChecks = values.checklistItems.filter(
    (item) => item.status === ChecklistStatus.DONE,
  ).length;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Revisión previa al PDF"
        description="Valida el contenido antes de exportar."
      />

      {/* Info summary */}
      <div className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)]">
        <p className="text-lg font-bold text-slate-950">
          {values.title || "Sin título definido"}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--rf-muted)]">
          <span>{values.author || "Sin autor"}</span>
          <span>{values.date || "Sin fecha"}</span>
        </div>
        {values.description ? (
          <p className="mt-3 text-sm text-slate-700">{values.description}</p>
        ) : null}
        {values.companyName ? (
          <div className="mt-3 flex items-center gap-3">
            {values.companyLogoPath ? (
              <div className="relative h-10 w-20 overflow-hidden rounded-lg bg-slate-50">
                <LocalImage
                  src={values.companyLogoPath}
                  alt={values.companyName}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : null}
            <span className="text-sm font-medium text-slate-700">
              {values.companyName}
              {values.area ? ` · ${values.area}` : ""}
            </span>
          </div>
        ) : null}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[var(--rf-radius-card)] bg-white p-3 text-center ring-1 ring-[var(--rf-border)]">
          <p className="text-2xl font-bold text-slate-950">{values.findings.length}</p>
          <p className="text-[11px] text-[var(--rf-muted)]">Hallazgos</p>
        </div>
        <div className="rounded-[var(--rf-radius-card)] bg-white p-3 text-center ring-1 ring-[var(--rf-border)]">
          <p className="text-2xl font-bold text-slate-950">
            {completedChecks}/{values.checklistItems.length}
          </p>
          <p className="text-[11px] text-[var(--rf-muted)]">Checklist OK</p>
        </div>
        <div className="rounded-[var(--rf-radius-card)] bg-white p-3 text-center ring-1 ring-[var(--rf-border)]">
          <StatusBadge
            status={
              completedChecks === values.checklistItems.length && values.checklistItems.length > 0
                ? ReportStatus.FINALIZED
                : ReportStatus.DRAFT
            }
          />
          <p className="mt-1 text-[11px] text-[var(--rf-muted)]">Estado</p>
        </div>
      </div>

      {/* Findings preview */}
      {values.findings.length > 0 ? (
        <div className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)]">
          <h4 className="text-sm font-semibold text-slate-900">Hallazgos</h4>
          <div className={cn("mt-3 grid gap-3", values.findings.length > 1 && "md:grid-cols-2")}>
            {values.findings.map((finding, index) => (
              <div
                key={`summary-finding-${index}`}
                className="overflow-hidden rounded-xl bg-slate-50 ring-1 ring-[var(--rf-border)]"
              >
                {finding.imagePath ? (
                  <div className="relative aspect-[4/3]">
                    <LocalImage
                      src={finding.imagePath}
                      alt={finding.caption || `Hallazgo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-400">
                    Sin imagen
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {finding.caption || `Hallazgo ${index + 1}`}
                  </p>
                  {finding.note ? (
                    <p className="mt-1 text-xs text-[var(--rf-muted)]">{finding.note}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Checklist preview */}
      {values.checklistItems.length > 0 ? (
        <div className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)]">
          <h4 className="text-sm font-semibold text-slate-900">Checklist</h4>
          <div className="mt-3 divide-y divide-[var(--rf-border)]">
            {values.checklistItems.map((item, index) => (
              <div
                key={`summary-check-${index}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {item.status === ChecklistStatus.DONE ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                ) : item.status === ChecklistStatus.OBSERVED ? (
                  <AlertCircle className="size-5 shrink-0 text-amber-500" />
                ) : (
                  <Circle className="size-5 shrink-0 text-slate-300" />
                )}
                <span className="flex-1 text-sm text-slate-800">
                  {item.text || `Item ${index + 1}`}
                </span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
