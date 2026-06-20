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

const getStatusStyles = (status: ChecklistStatus) => {
  switch (status) {
    case ChecklistStatus.PENDING:
      return "bg-slate-100 text-slate-700 border-slate-200 focus:ring-slate-300";
    case ChecklistStatus.DONE:
      return "bg-[var(--rf-success-bg)] text-[var(--rf-success-text)] border-[var(--rf-success-border)] focus:ring-[var(--rf-success-border)]";
    case ChecklistStatus.OBSERVED:
      return "bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-200";
    case ChecklistStatus.NOT_APPLICABLE:
      return "bg-slate-100 text-slate-500 border-slate-200 focus:ring-slate-300";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

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
              className="rounded-2xl bg-white p-3 ring-1 ring-[var(--rf-border)] shadow-sm space-y-2"
            >
              {/* Row 1: Text and Delete */}
              <div className="flex items-center gap-2">
                <input
                  id={`check-text-${index}`}
                  value={item.text}
                  onChange={(e) => updateChecklist(index, "text", e.target.value)}
                  className={cn(fieldClass, "flex-1 min-h-[40px] py-1.5 px-3 text-sm")}
                  placeholder="Punto de verificación..."
                />
                <button
                  type="button"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:bg-red-100 border border-slate-100"
                  onClick={() => removeChecklistItem(index)}
                  aria-label={`Eliminar item ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* Row 2: Status and Observation */}
              <div className="flex items-center gap-2">
                <select
                  id={`check-status-${index}`}
                  value={item.status}
                  onChange={(e) => updateChecklist(index, "status", e.target.value as ChecklistStatus)}
                  className={cn(
                    "w-[125px] shrink-0 min-h-[38px] rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:0.8em_0.8em] pr-6",
                    getStatusStyles(item.status)
                  )}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
                  }}
                >
                  <option value={ChecklistStatus.PENDING} className="bg-white text-slate-800">Pendiente</option>
                  <option value={ChecklistStatus.DONE} className="bg-white text-slate-800">Realizado</option>
                  <option value={ChecklistStatus.OBSERVED} className="bg-white text-slate-800">Observado</option>
                  <option value={ChecklistStatus.NOT_APPLICABLE} className="bg-white text-slate-800">No aplica</option>
                </select>

                <input
                  id={`check-note-${index}`}
                  value={item.note}
                  onChange={(e) => updateChecklist(index, "note", e.target.value)}
                  className={cn(fieldClass, "flex-1 min-h-[38px] py-1 px-3 text-xs")}
                  placeholder="Agregar observación..."
                />
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
