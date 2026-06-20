import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldLabelClass } from "@/components/editor/editor-shared";

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-[var(--rf-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

export function FieldLabel({
  label,
  htmlFor,
  required = false,
  optional = false,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {optional ? (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Opcional
        </span>
      ) : null}
    </div>
  );
}

export function EmptyComposer({
  title,
  description,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-[var(--rf-radius-card)] bg-slate-50 px-6 py-10 text-center ring-1 ring-dashed ring-[var(--rf-border)]">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-[var(--rf-muted)]">{description}</p>
      <div className="mt-4">
        <Button variant="secondary" size="sm" icon={<Plus />} onClick={onClick}>
          {cta}
        </Button>
      </div>
    </div>
  );
}
