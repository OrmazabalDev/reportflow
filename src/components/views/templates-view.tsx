"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Copy, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { templateRepository } from "@/lib/infrastructure/IndexedDbTemplateRepository";
import type { TemplateWithRelations } from "@/lib/domain/types";
import { fieldClass, fieldLabelClass, textAreaClass } from "@/components/editor/editor-shared";
import { cn } from "@/lib/utils";

export function TemplatesView() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Navigation states
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithRelations | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<{ text: string; note: string }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const handleProcessBulkItems = () => {
    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast("No se ingresaron ítems válidos", "error");
      return;
    }

    const newItems = lines.map((line) => ({ text: line, note: "" }));
    
    setItems((current) => {
      if (current.length === 1 && current[0].text.trim() === "" && current[0].note.trim() === "") {
        return newItems;
      }
      return [...current, ...newItems];
    });

    toast(`${lines.length} ítems agregados`, "success");
    setBulkText("");
    setShowBulkInput(false);
  };

  // Confirm delete states
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      const data = await templateRepository.listTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Error loading templates", err);
      toast("No se pudieron cargar las plantillas", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setName("");
    setDescription("");
    setItems([{ text: "", note: "" }]);
    setFormError(null);
    setShowBulkInput(false);
    setBulkText("");
    setIsEditing(true);
  };

  const handleEdit = (template: TemplateWithRelations) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || "");
    setItems(template.items.map((i) => ({ text: i.text, note: i.note || "" })));
    setFormError(null);
    setShowBulkInput(false);
    setBulkText("");
    setIsEditing(true);
  };

  const handleDuplicate = (template: TemplateWithRelations) => {
    startTransition(async () => {
      try {
        const duplicatedName = `Copia de ${template.name}`;
        await templateRepository.saveTemplate({
          name: duplicatedName,
          description: template.description || "",
          items: template.items.map((i) => ({ text: i.text, note: i.note || "" })),
        });
        toast("Plantilla duplicada", "success");
        await loadTemplates();
      } catch (err) {
        console.error(err);
        toast("Error al duplicar plantilla", "error");
      }
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await templateRepository.deleteTemplate(deleteId);
      toast("Plantilla eliminada", "success");
      setDeleteId(null);
      await loadTemplates();
    } catch (err) {
      console.error(err);
      toast("Error al eliminar plantilla", "error");
    }
  };

  const handleAddItem = () => {
    setItems((current) => [...current, { text: "", note: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: "text" | "note", value: string) => {
    setFormError(null);
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError("El nombre de la plantilla es obligatorio.");
      return;
    }

    if (items.length === 0) {
      setFormError("La plantilla debe tener al menos un ítem.");
      return;
    }

    const emptyItemIndex = items.findIndex((i) => !i.text.trim());
    if (emptyItemIndex >= 0) {
      setFormError(`El texto del ítem ${emptyItemIndex + 1} no puede estar vacío.`);
      return;
    }

    startTransition(async () => {
      try {
        await templateRepository.saveTemplate({
          id: editingTemplate?.id,
          name: name.trim(),
          description: description.trim(),
          items: items.map((i) => ({ text: i.text.trim(), note: i.note.trim() })),
        });

        toast(editingTemplate ? "Plantilla actualizada" : "Plantilla guardada", "success");
        setIsEditing(false);
        await loadTemplates();
      } catch (err) {
        console.error(err);
        setFormError("Error al guardar la plantilla.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-[var(--rf-muted)]">Cargando plantillas...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <section className="bg-white p-5 rounded-2xl shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition border border-slate-200/60 shadow-sm active:scale-[0.95]"
              aria-label="Volver"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase text-[var(--rf-primary)]">
                {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">
                {editingTemplate ? editingTemplate.name : "Nueva checklist plantilla"}
              </h2>
            </div>
          </div>
        </section>

        {formError && (
          <div className="flex items-start gap-3 rounded-[var(--rf-radius-card)] bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* General Data */}
        <section className="bg-white p-5 rounded-[var(--rf-radius-card)] shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)] space-y-4">
          <div className="space-y-2">
            <label className={fieldLabelClass} htmlFor="template-name">
              Nombre de la Plantilla <span className="text-red-500">*</span>
            </label>
            <input
              id="template-name"
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Inspección de Extintores, Control de Bodega..."
            />
          </div>

          <div className="space-y-2">
            <label className={fieldLabelClass} htmlFor="template-desc">
              Descripción Opcional
            </label>
            <textarea
              id="template-desc"
              className={textAreaClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Checklist quincenal de seguridad del área de carga..."
              rows={3}
            />
          </div>
        </section>

        {/* Items list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Puntos del Checklist ({items.length})
            </h3>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBulkInput(!showBulkInput)}
              >
                Carga masiva
              </Button>
              <Button variant="secondary" size="sm" icon={<Plus />} onClick={handleAddItem}>
                Añadir item
              </Button>
            </div>
          </div>

          {showBulkInput && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  Agregar múltiples ítems (uno por línea)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkInput(false);
                    setBulkText("");
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                >
                  Ocultar
                </button>
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Ej:&#10;Verificar cableado eléctrico&#10;Probar el generador de respaldo&#10;Limpiar filtros de aire"
                className={cn(textAreaClass, "min-h-[120px] font-mono text-xs")}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-[38px] py-1 px-3 text-xs"
                  onClick={() => {
                    setShowBulkInput(false);
                    setBulkText("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="min-h-[38px] py-1 px-3 text-xs"
                  onClick={handleProcessBulkItems}
                >
                  Añadir ítems
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, index) => (
              <article
                key={`item-${index}`}
                className="rounded-[var(--rf-radius-card)] bg-white p-4 ring-1 ring-[var(--rf-border)] flex items-start gap-3"
              >
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <label className={fieldLabelClass} htmlFor={`item-text-${index}`}>
                      Punto del Checklist <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`item-text-${index}`}
                      className={fieldClass}
                      value={item.text}
                      onChange={(e) => handleUpdateItem(index, "text", e.target.value)}
                      placeholder="Ej. Verificar presión del manómetro..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={fieldLabelClass} htmlFor={`item-note-${index}`}>
                      Indicaciones / Descripción Opcional
                    </label>
                    <input
                      id={`item-note-${index}`}
                      className={fieldClass}
                      value={item.note}
                      onChange={(e) => handleUpdateItem(index, "note", e.target.value)}
                      placeholder="Ej. Debe estar en rango verde (12-15 bar)..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:bg-red-100 mt-6"
                  onClick={() => handleRemoveItem(index)}
                  aria-label={`Eliminar punto ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Toolbar */}
        <div className="flex gap-3 bg-white p-4 rounded-2xl border border-[var(--rf-border)] shadow-md">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1" loading={isPending} onClick={handleSave}>
            Guardar plantilla
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Plantillas personalizadas
          </h2>
          <p className="mt-1 text-sm text-[var(--rf-muted)]">
            {templates.length} plantilla{templates.length === 1 ? "" : "s"} guardada{templates.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus />} onClick={handleCreateNew} className="h-[44px] rounded-2xl shadow-sm px-4">
          Nueva plantilla
        </Button>
      </div>

      {/* Grid List */}
      {templates.length === 0 ? (
        <div className="rounded-[var(--rf-radius-card)] bg-white p-10 text-center shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)]">
          <FileText className="mx-auto size-10 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-950">No tienes plantillas</h3>
          <p className="mt-1 text-sm text-[var(--rf-muted)]">
            Crea formatos de checklist reutilizables para ahorrar tiempo.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={handleCreateNew} className="mt-6 mx-auto">
            Crear plantilla
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((template) => (
            <article
              key={template.id}
              className="rounded-[var(--rf-radius-card)] bg-white p-5 shadow-[var(--rf-shadow-sm)] border border-[var(--rf-border)] flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-slate-950 truncate max-w-[80%]">
                    {template.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500 border border-slate-200">
                    {template.items.length} ítems
                  </span>
                </div>
                {template.description ? (
                  <p className="text-sm text-slate-600 line-clamp-2">{template.description}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sin descripción.</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleDuplicate(template)}
                  disabled={isPending}
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95 transition"
                  title="Duplicar"
                >
                  <Copy className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(template)}
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition"
                  title="Editar"
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(template.id)}
                  className="flex size-9 items-center justify-center rounded-lg border border-transparent text-red-500 hover:bg-red-50 active:scale-95 transition"
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar plantilla?"
        description="Esta acción es permanente. No afectará los reportes que ya fueron creados usando esta plantilla."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
