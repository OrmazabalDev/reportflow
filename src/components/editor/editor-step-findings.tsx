"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SectionHeader, FieldLabel, EmptyComposer } from "@/components/editor/editor-ui";
import {
  fieldClass,
  textAreaClass,
  emptyFinding,
  type EditorStepProps,
} from "@/components/editor/editor-shared";
import { cn } from "@/lib/utils";

export function EditorStepFindings({
  values,
  onValuesChange,
  onError,
  onMessage,
  uploadingIndex,
  onImageUpload,
}: EditorStepProps & {
  uploadingIndex: number | null;
  onImageUpload: (index: number, file: File) => void;
}) {
  const addFinding = () => {
    onError(null);
    onValuesChange((current) => ({
      ...current,
      findings: [...current.findings, emptyFinding()],
    }));
  };

  const removeFinding = (index: number) => {
    onError(null);
    onValuesChange((current) => ({
      ...current,
      findings: current.findings.filter((_, i) => i !== index),
    }));
    onMessage("Hallazgo eliminado.");
  };

  const updateFinding = (
    index: number,
    field: "caption" | "note" | "imagePath",
    value: string | null,
  ) => {
    onError(null);
    onValuesChange((current) => ({
      ...current,
      findings: current.findings.map((finding, i) =>
        i === index ? { ...finding, [field]: value } : finding,
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Evidencias con imagen"
          description="Documenta cada observación con imagen y pie de foto."
        />
        <Button variant="secondary" size="sm" icon={<Plus />} onClick={addFinding}>
          Añadir
        </Button>
      </div>

      {values.findings.length === 0 ? (
        <EmptyComposer
          title="Aún no hay hallazgos"
          description="Agrega el primero cuando necesites documentar una evidencia."
          cta="Añadir hallazgo"
          onClick={addFinding}
        />
      ) : (
        <div className={cn("grid gap-4", values.findings.length > 1 && "xl:grid-cols-2")}>
          {values.findings.map((finding, index) => (
            <article
              key={`finding-${index}`}
              className="space-y-4 rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Hallazgo {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeFinding(index)}
                  className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                  aria-label={`Eliminar hallazgo ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <ImageUploader
                imagePath={finding.imagePath}
                alt={finding.caption || `Hallazgo ${index + 1}`}
                uploading={uploadingIndex === index}
                onUpload={(file) => onImageUpload(index, file)}
                placeholder="Carga una evidencia visual"
              />

              <div className="space-y-2">
                <FieldLabel
                  label="Pie de foto"
                  htmlFor={`finding-caption-${index}`}
                  required
                />
                <input
                  id={`finding-caption-${index}`}
                  value={finding.caption}
                  onChange={(e) => updateFinding(index, "caption", e.target.value)}
                  className={fieldClass}
                  placeholder="Ej: Estado general del tablero principal"
                />
              </div>

              <div className="space-y-2">
                <FieldLabel
                  label="Observación"
                  htmlFor={`finding-note-${index}`}
                  optional
                />
                <textarea
                  id={`finding-note-${index}`}
                  value={finding.note}
                  onChange={(e) => updateFinding(index, "note", e.target.value)}
                  className={`${textAreaClass} min-h-24`}
                  placeholder="Detalle técnico o contexto adicional..."
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
