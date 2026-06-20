import { ChecklistStatus, ReportStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type BadgeValue = ReportStatus | ChecklistStatus;

const styles: Record<BadgeValue, string> = {
  DRAFT: "bg-blue-50 text-blue-700",
  FINALIZED: "bg-[var(--rf-success-bg)] text-[var(--rf-success-text)]",
  DONE: "bg-[var(--rf-success-bg)] text-[var(--rf-success-text)]",
  PENDING: "bg-slate-100 text-slate-600",
  OBSERVED: "bg-amber-50 text-amber-700",
};

const labels: Record<BadgeValue, string> = {
  DRAFT: "Borrador",
  FINALIZED: "Finalizado",
  DONE: "Realizado",
  PENDING: "Pendiente",
  OBSERVED: "Observado",
};

export function StatusBadge({
  status,
  className,
}: {
  status: BadgeValue;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[11px] font-semibold",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
