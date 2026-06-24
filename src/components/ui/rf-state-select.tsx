import { ChecklistStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, HelpCircle, Ban } from "lucide-react";

type RFStateSelectProps = {
  value: ChecklistStatus;
  onChange: (value: ChecklistStatus) => void;
  disabled?: boolean;
};

const states = [
  {
    status: ChecklistStatus.DONE,
    label: "Realizado",
    icon: Check,
    activeClass: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-100",
    inactiveClass: "bg-white hover:bg-emerald-50/40 border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200",
  },
  {
    status: ChecklistStatus.OBSERVED,
    label: "Observado",
    icon: AlertTriangle,
    activeClass: "bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-100",
    inactiveClass: "bg-white hover:bg-amber-50/40 border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-200",
  },
  {
    status: ChecklistStatus.PENDING,
    label: "Pendiente",
    icon: HelpCircle,
    activeClass: "bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-200",
    inactiveClass: "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300",
  },
  {
    status: ChecklistStatus.NOT_APPLICABLE,
    label: "No aplica",
    icon: Ban,
    activeClass: "bg-slate-100 text-slate-700 border-slate-400 ring-2 ring-slate-200",
    inactiveClass: "bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300",
  },
];

export function RFStateSelect({ value, onChange, disabled = false }: RFStateSelectProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {states.map((item) => {
        const Icon = item.icon;
        const isActive = value === item.status;
        return (
          <button
            key={item.status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all select-none min-h-[38px] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed",
              isActive ? item.activeClass : item.inactiveClass
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
