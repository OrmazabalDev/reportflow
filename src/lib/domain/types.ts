export enum ReportStatus {
  DRAFT = "DRAFT",
  FINALIZED = "FINALIZED",
}

export enum ChecklistStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  OBSERVED = "OBSERVED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

export type Finding = {
  id: string;
  reportId: string;
  caption: string;
  note: string | null;
  imagePath: string | null;
  sortOrder: number;
};

export type ChecklistItem = {
  id: string;
  reportId: string;
  text: string;
  note: string | null;
  status: ChecklistStatus;
  sortOrder: number;
};

export type Report = {
  id: string;
  title: string;
  author: string;
  date: string; // ISO String for dates in local domain
  description: string | null;
  companyName: string | null;
  companyLogoPath: string | null;
  footerText: string | null;
  area: string | null;
  status: ReportStatus;
  includeSignatures?: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type ReportWithRelations = Report & {
  findings: Finding[];
  checklistItems: ChecklistItem[];
};

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
  includeSignatures: boolean;
  findings: EditableFinding[];
  checklistItems: EditableChecklistItem[];
};

export type SaveReportResult = {
  ok: boolean;
  reportId?: string;
  title?: string;
  error?: string;
};

export type TemplateItem = {
  id: string;
  templateId: string;
  text: string;
  note: string | null;
  sortOrder: number;
};

export type Template = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TemplateWithRelations = Template & {
  items: TemplateItem[];
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  role?: string;
  email?: string;
};

export type Company = {
  id: string;
  name: string;
  areaOrUnit?: string;
  logo?: string | null;
  footerText?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
};

