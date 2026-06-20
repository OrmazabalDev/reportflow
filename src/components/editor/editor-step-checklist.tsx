"use client";

import { ChecklistStatus } from "@/lib/domain/types";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader, FieldLabel, EmptyComposer } from "@/components/editor/editor-ui";
import {
  fieldClass,
  emptyChecklistItem,
  type EditorStepProps,
} from "@/components/editor/editor-shared";
import { cn } from "@/lib/utils";

export function EditorStepChecklist({
  values,
  onValuesChange,
  onError,
  onMessage,
}: EditorStepProps) {
  const addChecklistItem = () => {
    onError(null);
    onValuesChange((current) => ({
      ...current,
      checklistItems: [...current.checklistItems, emptyChecklistItem()],
    }));
  };

  const removeChecklistItem = (index: number) => {
    onError(null);
    onValuesChange((current) => ({
      ...current,
      checklistItems: current.checklistItems.filter((_, i) => i !== index),
    }));
    onMessage("Item eliminado.");
  };

  const updateChecklist = (
    index: number,
    field: "text" | "note" | "status",
    value: string | ChecklistStatus,
  ) => {
    onError(null);
    onValuesChange((current) => ({
      ...current,
      checklistItems: current.checklistItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Estado de verificación"
          description="Control final del recorrido con estado visible."
        />
        <Button variant="secondary" size="sm" icon={<Plus />} onClick={addChecklistItem}>
          Añadir
        </Button>
      </div>

      {values.checklistItems.length === 0 ? (
        <EmptyComposer
          title="Aún no hay items"
          description="Agrega el primer punto de verificación."
          cta="Añadir item"
          onClick={addChecklistItem}
        />
      ) : (
        <div className="space-y-3">
          {values.checklistItems.map((item, index) => (
            <article
              key={`check-${index}`}
              className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-2">
                    <FieldLabel
                      label="Item"
                      htmlFor={`check-text-${index}`}
                      required
                    />
                    <input
                      id={`check-text-${index}`}
                      value={item.text}
                      onChange={(e) => updateChecklist(index, "text", e.target.value)}
                      className={fieldClass}
                      placeholder="Punto de verificación..."
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel
                      label="Observación"
                      htmlFor={`check-note-${index}`}
                      optional
                    />
                    <input
                      id={`check-note-${index}`}
                      value={item.note}
                      onChange={(e) => updateChecklist(index, "note", e.target.value)}
                      className={fieldClass}
                      placeholder="Observación opcional..."
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel label="Estado" />
                    <div className="flex gap-2">
                      {[
                        {
                          label: "Pendiente",
                          value: ChecklistStatus.PENDING,
                          active: "bg-slate-200 text-slate-800 ring-slate-300",
                        },
                        {
                          label: "Realizado",
                          value: ChecklistStatus.DONE,
                          active: "bg-[var(--rf-success-bg)] text-[var(--rf-success-text)] ring-[var(--rf-success-border)]",
                        },
                        {
                          label: "Observado",
                          value: ChecklistStatus.OBSERVED,
                          active: "bg-amber-50 text-amber-800 ring-amber-200",
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateChecklist(index, "status", option.value)}
                          className={cn(
                            "min-h-[44px] flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-[0.97]",
                            item.status === option.value
                              ? `${option.active} ring-1`
                              : "bg-slate-50 text-slate-500 ring-1 ring-[var(--rf-border)] hover:bg-slate-100",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                  onClick={() => removeChecklistItem(index)}
                  aria-label={`Eliminar item ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
