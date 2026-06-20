"use client";

import { AlertCircle } from "lucide-react";
import { ReportStatus } from "@/lib/domain/types";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { profileRepository } from "@/lib/infrastructure/IndexedDbProfileRepository";
import { fileService } from "@/lib/infrastructure/BrowserFileService";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";
import { reportInputSchema } from "@/lib/report-schema";
import { z } from "zod";
import { EditorStepInfo } from "@/components/editor/editor-step-info";
import { EditorStepFindings } from "@/components/editor/editor-step-findings";
import { EditorStepChecklist } from "@/components/editor/editor-step-checklist";
import { EditorStepSummary } from "@/components/editor/editor-step-summary";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import {
  validateStep,
  validateForPreview,
} from "@/components/editor/editor-shared";
import type { ReportFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Información general", short: "Info" },
  { label: "Checklist", short: "Checklist" },
  { label: "Hallazgos", short: "Hallazgos" },
  { label: "Resumen", short: "Resumen" },
];

export function ReportEditor({
  initialValues,
  mode,
}: {
  initialValues: ReportFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ReportFormValues>(initialValues);

  useEffect(() => {
    if (mode === "create") {
      async function loadDefaults() {
        try {
          const profile = await profileRepository.getProfile();
          const companies = await profileRepository.listCompanies();
          const defaultCompany = companies.find((c) => c.isDefault);

          setValues((current) => {
            const updated = { ...current };
            if (profile) {
              updated.author = `${profile.firstName} ${profile.lastName}`.trim();
            } else {
              updated.author = "";
            }
            if (defaultCompany) {
              updated.companyName = defaultCompany.name;
              updated.companyLogoPath = defaultCompany.logo || null;
              updated.area = defaultCompany.areaOrUnit || "";
              updated.footerText = defaultCompany.footerText || "";
            }
            return updated;
          });
        } catch (err) {
          console.error("Error loading onboarding defaults in editor", err);
        }
      }
      loadDefaults();
    }
  }, [mode]);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [pending, startSaveTransition] = useTransition();

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const path = await fileService.saveImage(file);

      if (!path) {
        throw new Error("No se pudo subir la imagen.");
      }

      setValues((current) => ({
        ...current,
        findings: current.findings.map((finding, i) =>
          i === index ? { ...finding, imagePath: path } : finding,
        ),
      }));
      toast("Imagen subida", "success");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la imagen.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingIndex(-1);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const path = await fileService.saveImage(file);

      if (!path) {
        throw new Error("No se pudo subir el logo.");
      }

      setValues((current) => ({ ...current, companyLogoPath: path }));
      toast("Logo cargado", "success");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el logo.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const save = ({
    status,
    destination,
    validationMode,
  }: {
    status: ReportStatus;
    destination: "detail" | "preview" | "stay";
    validationMode: "draft" | "final";
  }) => {
    setError(null);

    if (validationMode === "final") {
      const validation = validateForPreview(values);
      if (validation) {
        setStep(validation.step);
        setError(validation.message);
        return;
      }
    }

    startSaveTransition(async () => {
      try {
        const payload = { ...values, status };
        
        if (validationMode === "final") {
          reportInputSchema.parse(payload);
        }

        const saved = await reportRepository.saveReport(payload);

        setValues((current) => ({
          ...current,
          id: saved.id,
          status,
          title: saved.title ?? current.title,
        }));

        if (destination === "preview") {
          router.push(`/reports/preview?id=${saved.id}`);
          return;
        }

        if (destination === "detail") {
          router.push(`/reports/detail?id=${saved.id}`);
          return;
        }

        toast(
          status === ReportStatus.DRAFT ? "Borrador guardado" : "Reporte actualizado",
          "success",
        );
        router.refresh();
      } catch (err) {
        if (err instanceof z.ZodError) {
          const firstIssue = err.issues[0];
          const field = firstIssue?.path?.join(".") || "";
          const msg = firstIssue?.message || "Datos inválidos";
          setError(`${msg}${field ? ` (${field})` : ""}`);
        } else {
          setError(err instanceof Error ? err.message : "No se pudo guardar el reporte. Revisa los datos e inténtalo nuevamente.");
        }
      }
    });
  };

  const goToNextStep = () => {
    const validation = validateStep(values, step);
    if (validation) {
      setError(validation.message);
      return;
    }
    setError(null);
    setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  const goToStep = (nextStep: number) => {
    if (nextStep <= step) {
      setError(null);
      setStep(nextStep);
      return;
    }

    for (let currentStep = step; currentStep < nextStep; currentStep += 1) {
      const validation = validateStep(values, currentStep);
      if (validation) {
        setStep(validation.step);
        setError(validation.message);
        return;
      }
    }

    setError(null);
    setStep(nextStep);
  };

  const progressPercent = ((step + 1) / steps.length) * 100;

  return (
    <div className="space-y-5">
      {/* ── Progress header ── */}
      <section className="bg-white p-5 rounded-2xl shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase text-[var(--rf-primary)]">
                Paso {step + 1} de {steps.length}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {step === 1 && values.checklistItems.length > 0
                  ? `${steps[step].label} (${values.checklistItems.length} ${
                      values.checklistItems.length === 1 ? "ítem" : "ítems"
                    })`
                  : steps[step].label}
              </h2>
            </div>
            {values.id ? (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-amber-700 ring-1 ring-amber-200">
                Borrador
              </span>
            ) : null}
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[var(--rf-primary)] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {steps.map((s, index) => {
              let label = s.short;
              if (index === 1 && values.checklistItems.length > 0) {
                label = `${s.short} (${values.checklistItems.length})`;
              }
              return (
                <button
                  key={s.short}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1 text-[11px] font-bold transition-all active:scale-[0.98]",
                    index === step
                      ? "bg-[var(--rf-primary)] text-white shadow-sm"
                      : index < step
                        ? "bg-[var(--rf-primary-light)] text-[var(--rf-primary-dark)]"
                        : "bg-slate-50 text-slate-400 ring-1 ring-[var(--rf-border)]",
                  )}
                >
                  {label}
                </button>
              );
            })}
            <div className="w-4 shrink-0" />
          </div>
        </div>
      </section>

      {/* Error banner */}
      {error ? (
        <div className="flex items-start gap-3 rounded-[var(--rf-radius-card)] bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Step content */}
      {step === 0 ? (
        <EditorStepInfo
          values={values}
          onValuesChange={setValues}
          onError={setError}
          onMessage={(msg) => toast(msg, "info")}
          uploadingLogo={uploadingIndex === -1}
          onLogoUpload={handleLogoUpload}
        />
      ) : null}

      {step === 1 ? (
        <EditorStepChecklist
          values={values}
          onValuesChange={setValues}
          onError={setError}
          onMessage={(msg) => toast(msg, "info")}
        />
      ) : null}

      {step === 2 ? (
        <EditorStepFindings
          values={values}
          onValuesChange={setValues}
          onError={setError}
          onMessage={(msg) => toast(msg, "info")}
          uploadingIndex={uploadingIndex}
          onImageUpload={handleImageUpload}
        />
      ) : null}

      {step === 3 ? <EditorStepSummary values={values} /> : null}

      {/* Bottom toolbar */}
      <EditorToolbar
        step={step}
        totalSteps={steps.length}
        reportId={values.id}
        pending={pending}
        onSaveDraft={() =>
          save({
            status: ReportStatus.DRAFT,
            destination: "stay",
            validationMode: "draft",
          })
        }
        onFinalize={() =>
          save({
            status: ReportStatus.FINALIZED,
            destination: "preview",
            validationMode: "final",
          })
        }
        onNext={goToNextStep}
        onPrev={() => {
          setError(null);
          setStep((current) => Math.max(0, current - 1));
        }}
      />
    </div>
  );
}
