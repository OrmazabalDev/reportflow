"use client";

import { ChecklistStatus } from "@/lib/domain/types";
import { Plus, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader, FieldLabel, EmptyComposer } from "@/components/editor/editor-ui";
import {
  fieldClass,
  fieldLabelClass,
  emptyChecklistItem,
  type EditorStepProps,
} from "@/components/editor/editor-shared";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { templateRepository } from "@/lib/infrastructure/IndexedDbTemplateRepository";
import type { TemplateWithRelations } from "@/lib/domain/types";

export function EditorStepChecklist({
  values,
  onValuesChange,
  onError,
  onMessage,
}: EditorStepProps) {
  const [templates, setTemplates] = useState<TemplateWithRelations[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  
  // Save template form
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");

  useEffect(() => {
    async function loadTemplates() {
      try {
        const list = await templateRepository.listTemplates();
        setTemplates(list);
      } catch (err) {
        console.error("Error loading templates in editor step", err);
      }
    }
    loadTemplates();
  }, []);

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

  const applyTemplate = (tpl: TemplateWithRelations) => {
    onError(null);
    const newItems = tpl.items.map((i) => ({
      text: i.text,
      note: i.note || "",
      status: ChecklistStatus.PENDING,
    }));

    onValuesChange((current) => ({
      ...current,
      checklistItems: [...current.checklistItems, ...newItems],
    }));

    setShowTemplateSelector(false);
    onMessage(`Se aplicó la plantilla "${tpl.name}".`);
  };

  const handleSaveAsTemplate = async () => {
    onError(null);

    if (!newTemplateName.trim()) {
      onError("El nombre de la plantilla es obligatorio.");
      return;
    }

    if (values.checklistItems.length === 0) {
      onError("No puedes crear una plantilla con un checklist vacío.");
      return;
    }

    const invalidIndex = values.checklistItems.findIndex((item) => !item.text.trim());
    if (invalidIndex >= 0) {
      onError(`Completa el texto del ítem ${invalidIndex + 1} antes de guardar la plantilla.`);
      return;
    }

    try {
      const itemsToSave = values.checklistItems.map((item) => ({
        text: item.text.trim(),
        note: item.note.trim(),
      }));

      await templateRepository.saveTemplate({
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim(),
        items: itemsToSave,
      });

      onMessage(`Plantilla "${newTemplateName}" guardada.`);
      setNewTemplateName("");
      setNewTemplateDesc("");
      setSaveAsTemplateOpen(false);

      // Refresh template lists
      const list = await templateRepository.listTemplates();
      setTemplates(list);
    } catch (err) {
      console.error(err);
      onError("Error al guardar la plantilla.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)] space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Puntos de verificación"
            description="Control final del recorrido con estado visible."
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-none min-h-[44px]"
              icon={<FileText />}
              onClick={() => setShowTemplateSelector(true)}
            >
              Usar plantilla
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-none min-h-[44px]"
              icon={<Plus />}
              onClick={addChecklistItem}
            >
              Añadir
            </Button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
          💡 Usa una plantilla para cargar ítems recurrentes automáticamente.
        </p>
      </div>

      {values.checklistItems.length === 0 ? (
        <EmptyComposer
          title="Aún no hay items"
          description="Carga una plantilla o agrega tu primer punto de verificación."
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

          {/* Save as template button */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText />}
              onClick={() => setSaveAsTemplateOpen(true)}
            >
              Guardar como plantilla
            </Button>
          </div>
        </div>
      )}

      {/* Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <FileText className="size-5 text-[var(--rf-primary)]" />
                Seleccionar Plantilla
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg font-bold"
                onClick={() => setShowTemplateSelector(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
              {templates.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-slate-500">No tienes plantillas guardadas.</p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setShowTemplateSelector(false);
                      window.location.href = "/templates";
                    }}
                  >
                    Crear plantilla
                  </Button>
                </div>
              ) : (
                templates.map((tpl) => (
                  <article
                    key={tpl.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-slate-950 text-sm leading-snug">{tpl.name}</p>
                      {tpl.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{tpl.description}</p>
                      )}
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--rf-primary)]">
                        {tpl.items.length} ítems
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full min-h-[38px] text-xs py-2"
                      onClick={() => applyTemplate(tpl)}
                    >
                      Usar plantilla
                    </Button>
                  </article>
                ))
              )}
            </div>

            <Button variant="secondary" size="sm" onClick={() => setShowTemplateSelector(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {saveAsTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <FileText className="size-5 text-[var(--rf-primary)]" />
              Guardar como Plantilla
            </h3>
            <p className="text-xs text-slate-500">
              Se creará una plantilla reutilizable con los {values.checklistItems.length} ítems actuales.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="new-tpl-name">
                  Nombre de la Plantilla <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-tpl-name"
                  className={fieldClass}
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Ej. Inspección de Extintores..."
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="new-tpl-desc">
                  Descripción Opcional
                </label>
                <input
                  id="new-tpl-desc"
                  className={fieldClass}
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Ej. Puntos a verificar para el control mensual..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" size="sm" onClick={() => setSaveAsTemplateOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" size="sm" onClick={handleSaveAsTemplate}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
