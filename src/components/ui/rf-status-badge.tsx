import { ChecklistStatus, ReportStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type BadgeValue = ReportStatus | ChecklistStatus;

const styles: Record<BadgeValue, { badge: string; dot: string }> = {
  DRAFT: {
    badge: "bg-blue-50/70 text-blue-700 border-blue-200/60",
    dot: "bg-blue-600",
  },
  FINALIZED: {
    badge: "bg-emerald-50/70 text-emerald-800 border-emerald-200/60",
    dot: "bg-emerald-600",
  },
  DONE: {
    badge: "bg-emerald-50/70 text-emerald-800 border-emerald-200/60",
    dot: "bg-emerald-600",
  },
  PENDING: {
    badge: "bg-slate-50 text-slate-600 border-slate-200/80",
    dot: "bg-slate-400",
  },
  OBSERVED: {
    badge: "bg-amber-50/70 text-amber-800 border-amber-200/60",
    dot: "bg-amber-600",
  },
  NOT_APPLICABLE: {
    badge: "bg-slate-50 text-slate-500 border-slate-200/80",
    dot: "bg-slate-400",
  },
};

const labels: Record<BadgeValue, string> = {
  DRAFT: "Borrador",
  FINALIZED: "Finalizado",
  DONE: "Realizado",
  PENDING: "Pendiente",
  OBSERVED: "Observado",
  NOT_APPLICABLE: "No aplica",
};

export function RFStatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: BadgeValue;
  className?: string;
  showDot?: boolean;
}) {
  const style = styles[status] || styles.PENDING;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase shadow-[0_1px_2px_rgba(0,0,0,0.01)]",
        style.badge,
        className
      )}
    >
      {showDot && (
        <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      )}
      {labels[status] || status}
    </span>
  );
}
