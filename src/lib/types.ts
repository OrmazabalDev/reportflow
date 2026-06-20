import type { ChecklistStatus, ReportStatus } from "@/lib/domain/types";

export type EditableFinding = {
  caption: string;
  note: string;
  imagePath: string | null;
};

export type EditableChecklistItem = {
  text: string;
  note: string;
  status: ChecklistStatus;
};

export type ReportFormValues = {
  id?: string;
  title: string;
  author: string;
  date: string;
  description: string;
  companyName: string;
  companyLogoPath: string | null;
  footerText: string;
  area: string;
  status: ReportStatus;
  findings: EditableFinding[];
  checklistItems: EditableChecklistItem[];
};

export type SaveReportResult = {
  ok: boolean;
  reportId?: string;
  title?: string;
  error?: string;
};
