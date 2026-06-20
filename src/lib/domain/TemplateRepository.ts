import type { TemplateWithRelations } from "./types";

export type TemplateItemFormValues = {
  text: string;
  note: string;
};

export type TemplateFormValues = {
  id?: string;
  name: string;
  description: string;
  items: TemplateItemFormValues[];
};

export interface TemplateRepository {
  /**
   * Lista todas las plantillas del usuario.
   */
  listTemplates(): Promise<TemplateWithRelations[]>;

  /**
   * Obtiene una plantilla por su ID con todos sus ítems de checklist asociados.
   */
  getTemplateById(id: string): Promise<TemplateWithRelations | null>;

  /**
   * Guarda o actualiza una plantilla y sus ítems.
   */
  saveTemplate(input: TemplateFormValues): Promise<TemplateWithRelations>;

  /**
   * Elimina una plantilla y todos sus ítems asociados.
   */
  deleteTemplate(id: string): Promise<void>;
}
