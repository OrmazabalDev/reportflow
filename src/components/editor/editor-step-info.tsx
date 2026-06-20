"use client";

import { useId } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SectionHeader, FieldLabel } from "@/components/editor/editor-ui";
import { fieldClass, textAreaClass, type EditorStepProps } from "@/components/editor/editor-shared";
import type { ReportFormValues } from "@/lib/types";

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
        <SectionHeader
          title="Branding del documento"
          description="Personaliza la portada y el pie del PDF."
        />

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel label="Nombre de empresa" htmlFor={ids.companyName} optional />
              <input
                id={ids.companyName}
                value={values.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                className={fieldClass}
                placeholder="Ej: Empresa Andina"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel label="Área o unidad" htmlFor={ids.area} optional />
              <input
                id={ids.area}
                value={values.area}
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
                  className="w-full"
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
                value={values.footerText}
                onChange={(e) => setField("footerText", e.target.value)}
                className={`${textAreaClass} min-h-28`}
                placeholder="Ej: Documento emitido por Empresa Andina · Uso interno"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
