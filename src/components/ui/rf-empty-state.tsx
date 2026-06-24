import { type ReactNode } from "react";
import { RFButton } from "./rf-button";
import { RFCard } from "./rf-card";

type RFEmptyStateProps = {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
};

export function RFEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionIcon,
}: RFEmptyStateProps) {
  return (
    <RFCard className="flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50/30">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100/80 text-slate-400 mb-4 shadow-sm border border-white">
        {icon}
      </div>
      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 max-w-xs leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <RFButton
          variant="secondary"
          size="sm"
          onClick={onAction}
          icon={actionIcon}
          className="mt-5 shadow-sm border border-slate-200"
        >
          {actionLabel}
        </RFButton>
      )}
    </RFCard>
  );
}
