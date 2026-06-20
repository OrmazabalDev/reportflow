import { ChecklistStatus, ReportStatus } from "@/lib/domain/types";
import { z } from "zod";

export const findingInputSchema = z.object({
  caption: z.string().trim().min(1, "El pie de foto es obligatorio."),
  note: z.string().trim().max(500).optional().default(""),
  imagePath: z.string().trim().nullable().optional(),
});

export const checklistInputSchema = z.object({
  text: z.string().trim().min(1, "El texto del item es obligatorio."),
  note: z.string().trim().max(500).optional().default(""),
  status: z.nativeEnum(ChecklistStatus),
});

export const reportInputSchema = z.object({
  id: z.string().min(1, "ID requerido").optional(),
  title: z.string().trim().min(1, "El titulo es obligatorio."),
  author: z.string().trim().min(1, "El autor es obligatorio."),
  date: z.string().date("La fecha no es valida."),
  description: z.string().trim().max(5000).optional().default(""),
  companyName: z.string().trim().max(180).optional().default(""),
  companyLogoPath: z.string().trim().nullable().optional(),
  footerText: z.string().trim().max(240).optional().default(""),
  area: z.string().trim().max(180).optional().default(""),
  status: z.nativeEnum(ReportStatus).default(ReportStatus.DRAFT),
  findings: z.array(findingInputSchema),
  checklistItems: z.array(checklistInputSchema),
});

export type ReportInput = z.infer<typeof reportInputSchema>;
