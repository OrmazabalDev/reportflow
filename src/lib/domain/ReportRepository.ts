import type { ReportFormValues, ReportWithRelations } from "./types";

export type DashboardStats = {
  total: number;
  drafts: number;
  finalized: number;
  pendingChecklist: number;
};

export interface ReportRepository {
  /**
   * Obtiene la información para el dashboard (reportes recientes y métricas)
   */
  getDashboardData(): Promise<{
    reports: ReportWithRelations[];
    stats: DashboardStats;
  }>;

  /**
   * Lista todos los reportes (útil para el historial)
   */
  listReports(): Promise<ReportWithRelations[]>;

  /**
   * Obtiene un reporte por su ID con todas sus relaciones
   */
  getReportById(id: string): Promise<ReportWithRelations | null>;

  /**
   * Obtiene la estructura necesaria para poblar el formulario de edición
   */
  getReportForEdit(id: string): Promise<ReportFormValues | null>;

  /**
   * Guarda o actualiza un reporte a partir de los datos del formulario
   * @param input Los valores del formulario
   * @returns El reporte guardado con sus relaciones
   */
  saveReport(input: ReportFormValues): Promise<ReportWithRelations>;

  /**
   * Elimina permanentemente un reporte y sus recursos asociados
   */
  deleteReport(id: string): Promise<void>;
}
