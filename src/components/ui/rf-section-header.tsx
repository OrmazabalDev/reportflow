import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RFSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function RFSectionHeader({
  title,
  description,
  actions,
  className,
}: RFSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100",
        className
      )}
    >
      <div className="space-y-0.5">
        <h3 className="text-sm font-extrabold text-slate-950 leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 select-none">
          {actions}
        </div>
      )}
    </div>
  );
}
