"use client";

import { useId, useState, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SectionHeader, FieldLabel } from "@/components/editor/editor-ui";
import { fieldClass, textAreaClass, type EditorStepProps } from "@/components/editor/editor-shared";
import type { ReportFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { profileRepository } from "@/lib/infrastructure/IndexedDbProfileRepository";
import type { Company } from "@/lib/domain/types";

export function EditorStepInfo({
  values,
  onValuesChange,
  onError,
  onMessage,
  uploadingLogo,
  onLogoUpload,
}: EditorStepProps & {
  uploadingLogo: boolean;
  onLogoUpload: (file: File) => void;
}) {
  const [showBranding, setShowBranding] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("custom");

  useEffect(() => {
    async function loadCompanies() {
      try {
        const list = await profileRepository.listCompanies();
        setCompanies(list);
      } catch (err) {
        console.error("Error loading companies in editor info step", err);
      }
    }
    loadCompanies();
  }, []);

  const handleSelectCompany = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);

    if (companyId === "custom") {
      onValuesChange((current) => ({
        ...current,
        companyName: "",
        companyLogoPath: null,
        area: "",
        footerText: "",
      }));
    } else {
      const comp = companies.find((c) => c.id === companyId);
      if (comp) {
        onValuesChange((current) => ({
          ...current,
          companyName: comp.name,
          companyLogoPath: comp.logo || null,
          area: comp.areaOrUnit || "",
          footerText: comp.footerText || "",
        }));
        onMessage(`Datos de "${comp.name}" cargados.`);
      }
    }
  };

  const ids = {
    title: useId(),
    author: useId(),
    date: useId(),
    description: useId(),
    companyName: useId(),
    area: useId(),
    footerText: useId(),
  };

  const setField = (
    field: keyof Pick<
      ReportFormValues,
      "title" | "author" | "date" | "description" | "companyName" | "footerText" | "area"
    >,
    value: string,
  ) => {
    onError(null);
    onValuesChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)] md:p-5">
        <SectionHeader
          title="Portada del reporte"
          description="Define el contexto principal del documento."
        />

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <FieldLabel label="Título" htmlFor={ids.title} required />
            <input
              id={ids.title}
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              className={fieldClass}
              placeholder="Ej: Revisión operativa de área técnica"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel label="Autor" htmlFor={ids.author} required />
              <input
                id={ids.author}
                value={values.author}
                onChange={(e) => setField("author", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel label="Fecha" htmlFor={ids.date} required />
              <input
                id={ids.date}
                type="date"
                value={values.date}
                onChange={(e) => setField("date", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel label="Descripción" htmlFor={ids.description} optional />
            <textarea
              id={ids.description}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              className={`${textAreaClass} min-h-32`}
              placeholder="Alcance, ubicación, objetivo de la visita..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)] md:p-5">
        <button
          type="button"
          onClick={() => {
            onError(null);
            setShowBranding(!showBranding);
          }}
          className="flex w-full items-center justify-between text-left focus:outline-none"
        >
          <div>
            <h3 className="text-base font-bold text-slate-950">Personalizar PDF / Branding</h3>
            <p className="mt-0.5 text-xs text-[var(--rf-muted)]">
              Personaliza la portada, logo y pie del PDF (Opcional).
            </p>
          </div>
          <span className="text-slate-400 p-1">
            {showBranding ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </span>
        </button>

        {showBranding && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Autocompletar desde Empresa */}
            {companies.length > 0 ? (
              <div className="space-y-2">
                <FieldLabel label="Autocompletar desde Empresa" />
                <select
                  value={selectedCompanyId}
                  onChange={handleSelectCompany}
                  className={cn(
                    fieldClass,
                    "w-full appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1em_1em] pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--rf-primary)]/20"
                  )}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
                  }}
                >
                  <option value="custom">-- Personalizado / Ninguna --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isDefault ? " (Predeterminada)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 flex justify-between items-center gap-2 border border-slate-200/50">
                <span>No tienes empresas guardadas para autocompletar.</span>
                <Link href="/settings" className="text-[var(--rf-primary)] font-bold hover:underline shrink-0 px-2 py-1 bg-white rounded-lg border border-slate-200 text-[11px] leading-tight">
                  Crear empresa
                </Link>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel label="Nombre de empresa" htmlFor={ids.companyName} optional />
                <input
                  id={ids.companyName}
                  value={values.companyName || ""}
                  onChange={(e) => setField("companyName", e.target.value)}
                  className={fieldClass}
                  placeholder="Ej: Empresa Andina"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel label="Área o unidad" htmlFor={ids.area} optional />
                <input
                  id={ids.area}
                  value={values.area || ""}
                  onChange={(e) => setField("area", e.target.value)}
                  className={fieldClass}
                  placeholder="Ej: Operaciones técnicas"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel label="Logo de empresa" optional />
                <ImageUploader
                  imagePath={values.companyLogoPath}
                  alt={values.companyName || "Logo de empresa"}
                  uploading={uploadingLogo}
                  onUpload={onLogoUpload}
                  aspectClass="aspect-[16/10]"
                  placeholder="Carga el logo"
                  uploadLabel="Se mostrará en la portada del PDF."
                  changeLabel="Cambiar logo"
                />
                {values.companyLogoPath ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    icon={<Trash2 />}
                    onClick={() => {
                      onError(null);
                      onValuesChange((c) => ({ ...c, companyLogoPath: null }));
                      onMessage("Logo eliminado.");
                    }}
                  >
                    Quitar logo
                  </Button>
                ) : null}
              </div>

              <div className="space-y-2">
                <FieldLabel label="Texto de pie de página" htmlFor={ids.footerText} optional />
                <textarea
                  id={ids.footerText}
                  value={values.footerText || ""}
                  onChange={(e) => setField("footerText", e.target.value)}
                  className={`${textAreaClass} min-h-28`}
                  placeholder="Ej: Documento emitido por Empresa Andina · Uso interno"
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
