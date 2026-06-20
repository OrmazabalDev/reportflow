import { LocalImage } from "@/components/ui/local-image";
import type { ReportWithRelations } from "@/lib/domain/types";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";

function getFooterCopy(report: ReportWithRelations) {
  if (report.footerText) {
    return report.footerText;
  }

  if (report.companyName) {
    return `Autor: ${report.author} / ${report.companyName}`;
  }

  return `Autor: ${report.author}`;
}

export function ReportPreview({ report }: { report: ReportWithRelations }) {
  const hasBranding = Boolean(report.companyName || report.companyLogoPath);

  return (
    <div className="space-y-4">
      {/* ── Cover ── */}
      <section className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)] md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {hasBranding ? (
              <div className="flex items-center gap-3 mb-3">
                {report.companyLogoPath ? (
                  <div className="relative h-12 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                    <LocalImage
                      src={report.companyLogoPath}
                      alt={report.companyName || "Logo"}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-medium text-[var(--rf-muted)]">
                    {report.companyName || "Reporte institucional"}
                  </p>
                  {report.area ? (
                    <p className="text-xs text-slate-400">{report.area}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <h1 className="text-xl font-bold tracking-tight text-slate-950 md:text-2xl">
              {report.title}
            </h1>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--rf-muted)]">
          <span>{report.author}</span>
          <span>{formatDate(report.date)}</span>
          <span>{report.companyName || "Sin empresa"}</span>
        </div>

        {report.description ? (
          <p className="mt-4 text-sm leading-6 text-slate-700 border-t border-[var(--rf-border)] pt-4">
            {report.description}
          </p>
        ) : null}
      </section>

      {/* ── Findings ── */}
      <section className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)] md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Hallazgos</h2>
          <span className="text-sm text-[var(--rf-muted)]">
            {report.findings.length} evidencia{report.findings.length === 1 ? "" : "s"}
          </span>
        </div>

        {report.findings.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--rf-muted)]">
            Este reporte no incluye hallazgos visuales.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {report.findings.map((finding, index) => (
              <article
                key={finding.id}
                className="overflow-hidden rounded-xl ring-1 ring-[var(--rf-border)]"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  {finding.imagePath ? (
                    <LocalImage
                      src={finding.imagePath}
                      alt={finding.caption}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-[var(--rf-muted)]">Hallazgo {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{finding.caption}</p>
                  {finding.note ? (
                    <p className="mt-2 text-sm text-slate-600">{finding.note}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Checklist ── */}
      <section className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)] md:p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Checklist</h2>
        {report.checklistItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--rf-muted)]">
            No hay items de checklist registrados.
          </p>
        ) : (
          <div className="divide-y divide-[var(--rf-border)]">
            {report.checklistItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {item.status === "DONE" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                ) : item.status === "OBSERVED" ? (
                  <AlertCircle className="size-5 shrink-0 text-amber-500" />
                ) : (
                  <Circle className="size-5 shrink-0 text-slate-300" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {index + 1}. {item.text}
                  </p>
                  {item.note ? (
                    <p className="mt-0.5 text-xs text-[var(--rf-muted)]">{item.note}</p>
                  ) : null}
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <p className="text-sm text-[var(--rf-muted)] px-1">{getFooterCopy(report)}</p>
    </div>
  );
}
