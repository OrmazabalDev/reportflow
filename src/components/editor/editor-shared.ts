import { ChecklistStatus } from "@/lib/domain/types";
import type { ReportFormValues } from "@/lib/domain/types";

export type EditorStepProps = {
  values: ReportFormValues;
  onValuesChange: (updater: (current: ReportFormValues) => ReportFormValues) => void;
  onError: (message: string | null) => void;
  onMessage: (message: string) => void;
};

export const fieldLabelClass =
  "text-[13px] font-semibold text-slate-700 mb-1.5 block";
export const fieldClass =
  "h-[52px] w-full rounded-2xl bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none border border-[var(--rf-border)] transition-all placeholder:text-slate-400 focus:bg-white focus:border-[var(--rf-primary)] focus:ring-4 focus:ring-[var(--rf-primary-light)] shadow-sm";
export const textAreaClass =
  "w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base leading-6 text-slate-800 outline-none border border-[var(--rf-border)] transition-all placeholder:text-slate-400 focus:bg-white focus:border-[var(--rf-primary)] focus:ring-4 focus:ring-[var(--rf-primary-light)] shadow-sm";

export const emptyFinding = () => ({
  caption: "",
  note: "",
  imagePath: null as string | null,
});

export const emptyChecklistItem = () => ({
  text: "",
  note: "",
  status: ChecklistStatus.PENDING,
});

export type ValidationResult = {
  step: number;
  message: string;
} | null;

export function validateGeneralStep(values: ReportFormValues): ValidationResult {
  if (!values.title.trim()) {
    return { step: 0, message: "Completa el titulo antes de continuar." };
  }
  if (!values.author.trim()) {
    return { step: 0, message: "Completa el autor antes de continuar." };
  }
  if (!values.date.trim()) {
    return { step: 0, message: "Selecciona la fecha del reporte." };
  }
  return null;
}

export function validateFindingsStep(values: ReportFormValues): ValidationResult {
  const invalidIndex = values.findings.findIndex(
    (finding) => !finding.imagePath || !finding.caption.trim(),
  );

  if (invalidIndex >= 0) {
    const finding = values.findings[invalidIndex];
    if (!finding.imagePath) {
      return {
        step: 2,
        message: `Carga la imagen del hallazgo ${invalidIndex + 1} antes de continuar.`,
      };
    }
    return {
      step: 2,
      message: `Completa el pie de foto del hallazgo ${invalidIndex + 1}.`,
    };
  }
  return null;
}

export function validateChecklistStep(values: ReportFormValues): ValidationResult {
  const invalidIndex = values.checklistItems.findIndex((item) => !item.text.trim());
  if (invalidIndex >= 0) {
    return {
      step: 1,
      message: `Completa el texto del item ${invalidIndex + 1} para continuar.`,
    };
  }
  return null;
}

export function validateStep(values: ReportFormValues, step: number): ValidationResult {
  if (step === 0) return validateGeneralStep(values);
  if (step === 1) return validateChecklistStep(values);
  if (step === 2) return validateFindingsStep(values);
  return null;
}

export function validateForPreview(values: ReportFormValues): ValidationResult {
  return (
    validateGeneralStep(values) ??
    validateChecklistStep(values) ??
    validateFindingsStep(values)
  );
}
