import { getDb, type ReportFlowDB } from "./IndexedDbReportRepository";
import type {
  TemplateRepository,
  TemplateFormValues,
} from "@/lib/domain/TemplateRepository";
import type {
  Template,
  TemplateItem,
  TemplateWithRelations,
} from "@/lib/domain/types";
import { type IDBPDatabase } from "idb";

export class IndexedDbTemplateRepository implements TemplateRepository {
  async listTemplates(): Promise<TemplateWithRelations[]> {
    const db = await getDb();
    const templatesStore = db.transaction("templates", "readonly").objectStore("templates");
    let allTemplates = await templatesStore.getAll();

    if (allTemplates.length === 0) {
      // Autopopulate generic default template
      await this.populateDefaultTemplate(db);
      const readTx = db.transaction("templates", "readonly").objectStore("templates");
      allTemplates = await readTx.getAll();
    }

    allTemplates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Promise.all(allTemplates.map((t) => this.getTemplateRelations(t, db)));
  }

  async getTemplateById(id: string): Promise<TemplateWithRelations | null> {
    const db = await getDb();
    const template = await db.get("templates", id);
    if (!template) return null;
    return this.getTemplateRelations(template, db);
  }

  async saveTemplate(input: TemplateFormValues): Promise<TemplateWithRelations> {
    const db = await getDb();
    const isNew = !input.id;
    const id = input.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const template: Template = {
      id,
      name: input.name,
      description: input.description || null,
      createdAt: isNew ? now : (await db.get("templates", id))?.createdAt || now,
      updatedAt: now,
    };

    const items: TemplateItem[] = input.items.map((item, i) => ({
      id: crypto.randomUUID(),
      templateId: id,
      text: item.text,
      note: item.note || null,
      sortOrder: i,
    }));

    const tx = db.transaction(["templates", "template_items"], "readwrite");

    await tx.objectStore("templates").put(template);

    if (!isNew) {
      // Delete old template items
      const oldItems = await tx.objectStore("template_items").index("by-template").getAllKeys(id);
      for (const key of oldItems) {
        await tx.objectStore("template_items").delete(key);
      }
    }

    for (const item of items) {
      await tx.objectStore("template_items").put(item);
    }

    await tx.done;

    return {
      ...template,
      items,
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction(["templates", "template_items"], "readwrite");

    await tx.objectStore("templates").delete(id);

    const items = await tx.objectStore("template_items").index("by-template").getAllKeys(id);
    for (const key of items) {
      await tx.objectStore("template_items").delete(key);
    }

    await tx.done;
  }

  private async getTemplateRelations(
    template: Template,
    db: IDBPDatabase<ReportFlowDB>,
  ): Promise<TemplateWithRelations> {
    const items = await db.getAllFromIndex("template_items", "by-template", template.id);
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      ...template,
      items,
    };
  }

  private async populateDefaultTemplate(db: IDBPDatabase<ReportFlowDB>): Promise<void> {
    const templateId = crypto.randomUUID();
    const now = new Date().toISOString();

    const template: Template = {
      id: templateId,
      name: "Inspección General de Instalaciones",
      description: "Plantilla básica para revisión de orden, seguridad y estado general del área.",
      createdAt: now,
      updatedAt: now,
    };

    const itemsData = [
      { text: "Orden y limpieza general del área", note: "Verificar pasillos despejados y superficies limpias." },
      { text: "Estado de iluminación y CCTV", note: "Confirmar que todas las luminarias y cámaras operen correctamente." },
      { text: "Salidas de emergencia despejadas y señalizadas", note: "Revisar que los extintores estén vigentes y las vías libres." },
      { text: "Electricidad y conexiones", note: "Revisar que no haya cables expuestos ni enchufes en mal estado." },
      { text: "Climatización y ventilación", note: "Verificar que la ventilación opere a temperatura adecuada." },
    ];

    const items: TemplateItem[] = itemsData.map((item, i) => ({
      id: crypto.randomUUID(),
      templateId,
      text: item.text,
      note: item.note,
      sortOrder: i,
    }));

    const tx = db.transaction(["templates", "template_items"], "readwrite");
    await tx.objectStore("templates").put(template);
    for (const item of items) {
      await tx.objectStore("template_items").put(item);
    }
    await tx.done;
  }
}

export const templateRepository = new IndexedDbTemplateRepository();
