import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ReportRepository, DashboardStats } from "@/lib/domain/ReportRepository";
import { ReportStatus, ChecklistStatus } from "@/lib/domain/types";
import type {
  Report,
  Finding,
  ChecklistItem,
  ReportWithRelations,
  ReportFormValues,
  Template,
  TemplateItem,
} from "@/lib/domain/types";

export interface ReportFlowDB extends DBSchema {
  reports: {
    key: string;
    value: Report;
    indexes: {
      "by-date": string;
    };
  };
  findings: {
    key: string;
    value: Finding;
    indexes: {
      "by-report": string;
    };
  };
  checklist_items: {
    key: string;
    value: ChecklistItem;
    indexes: {
      "by-report": string;
    };
  };
  templates: {
    key: string;
    value: Template;
  };
  template_items: {
    key: string;
    value: TemplateItem;
    indexes: {
      "by-template": string;
    };
  };
}

const DB_NAME = "reportflow-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ReportFlowDB>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ReportFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("reports")) {
          const reportStore = db.createObjectStore("reports", { keyPath: "id" });
          reportStore.createIndex("by-date", "createdAt");
        }
        if (!db.objectStoreNames.contains("findings")) {
          const findingStore = db.createObjectStore("findings", { keyPath: "id" });
          findingStore.createIndex("by-report", "reportId");
        }
        if (!db.objectStoreNames.contains("checklist_items")) {
          const checklistStore = db.createObjectStore("checklist_items", {
            keyPath: "id",
          });
          checklistStore.createIndex("by-report", "reportId");
        }
        if (!db.objectStoreNames.contains("templates")) {
          db.createObjectStore("templates", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("template_items")) {
          const templateItemStore = db.createObjectStore("template_items", {
            keyPath: "id",
          });
          templateItemStore.createIndex("by-template", "templateId");
        }
      },
    });
  }
  return dbPromise;
}

export class IndexedDbReportRepository implements ReportRepository {
  async getDashboardData(): Promise<{ reports: ReportWithRelations[]; stats: DashboardStats }> {
    const db = await getDb();
    const reportsStore = db.transaction("reports", "readonly").objectStore("reports");
    const allReports = await reportsStore.getAll();

    allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentReports = allReports.slice(0, 5);

    const reportsWithRelations = await Promise.all(
      recentReports.map((r) => this.getReportRelations(r, db)),
    );

    const drafts = allReports.filter((r) => r.status === ReportStatus.DRAFT).length;
    const finalized = allReports.filter((r) => r.status === ReportStatus.FINALIZED).length;
    
    const pendingChecklist = reportsWithRelations.reduce(
      (sum, report) =>
        sum + report.checklistItems.filter((item) => item.status !== ChecklistStatus.DONE && item.status !== ChecklistStatus.NOT_APPLICABLE).length,
      0
    );

    return {
      reports: reportsWithRelations,
      stats: {
        total: allReports.length,
        drafts,
        finalized,
        pendingChecklist,
      },
    };
  }

  async listReports(): Promise<ReportWithRelations[]> {
    const db = await getDb();
    const reportsStore = db.transaction("reports", "readonly").objectStore("reports");
    const allReports = await reportsStore.getAll();

    allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Promise.all(allReports.map((r) => this.getReportRelations(r, db)));
  }

  async getReportById(id: string): Promise<ReportWithRelations | null> {
    const db = await getDb();
    const report = await db.get("reports", id);
    if (!report) return null;
    return this.getReportRelations(report, db);
  }

  async getReportForEdit(id: string): Promise<ReportFormValues | null> {
    const report = await this.getReportById(id);
    if (!report) return null;

    return {
      id: report.id,
      title: report.title,
      author: report.author,
      date: report.date,
      description: report.description ?? "",
      companyName: report.companyName ?? "",
      companyLogoPath: report.companyLogoPath,
      footerText: report.footerText ?? "",
      area: report.area ?? "",
      status: report.status,
      findings: report.findings.map((f) => ({
        caption: f.caption,
        note: f.note ?? "",
        imagePath: f.imagePath,
      })),
      checklistItems: report.checklistItems.map((c) => ({
        text: c.text,
        note: c.note ?? "",
        status: c.status,
      })),
    };
  }

  async saveReport(input: ReportFormValues): Promise<ReportWithRelations> {
    const db = await getDb();
    const isNew = !input.id;
    const id = input.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const report: Report = {
      id,
      title: input.title,
      author: input.author,
      date: input.date,
      description: input.description || null,
      companyName: input.companyName || null,
      companyLogoPath: input.companyLogoPath || null,
      footerText: input.footerText || null,
      area: input.area || null,
      status: input.status,
      createdAt: isNew ? now : (await db.get("reports", id))?.createdAt || now,
      updatedAt: now,
    };

    const findings: Finding[] = input.findings.map((f, i) => ({
      id: crypto.randomUUID(),
      reportId: id,
      caption: f.caption,
      note: f.note || null,
      imagePath: f.imagePath || null,
      sortOrder: i,
    }));

    const checklistItems: ChecklistItem[] = input.checklistItems.map((c, i) => ({
      id: crypto.randomUUID(),
      reportId: id,
      text: c.text,
      note: c.note || null,
      status: c.status,
      sortOrder: i,
    }));

    const tx = db.transaction(["reports", "findings", "checklist_items"], "readwrite");

    await tx.objectStore("reports").put(report);

    if (!isNew) {
      // Delete old relations
      const oldFindings = await tx.objectStore("findings").index("by-report").getAllKeys(id);
      for (const key of oldFindings) {
        await tx.objectStore("findings").delete(key);
      }
      const oldChecklists = await tx.objectStore("checklist_items").index("by-report").getAllKeys(id);
      for (const key of oldChecklists) {
        await tx.objectStore("checklist_items").delete(key);
      }
    }

    for (const f of findings) {
      await tx.objectStore("findings").put(f);
    }
    for (const c of checklistItems) {
      await tx.objectStore("checklist_items").put(c);
    }

    await tx.done;

    return {
      ...report,
      findings,
      checklistItems,
    };
  }

  async deleteReport(id: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction(["reports", "findings", "checklist_items"], "readwrite");

    await tx.objectStore("reports").delete(id);

    const findings = await tx.objectStore("findings").index("by-report").getAllKeys(id);
    for (const key of findings) {
      await tx.objectStore("findings").delete(key);
    }

    const checklists = await tx.objectStore("checklist_items").index("by-report").getAllKeys(id);
    for (const key of checklists) {
      await tx.objectStore("checklist_items").delete(key);
    }

    await tx.done;
  }

  private async getReportRelations(report: Report, db: IDBPDatabase<ReportFlowDB>): Promise<ReportWithRelations> {
    const findings = await db.getAllFromIndex("findings", "by-report", report.id);
    const checklistItems = await db.getAllFromIndex("checklist_items", "by-report", report.id);

    findings.sort((a, b) => a.sortOrder - b.sortOrder);
    checklistItems.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...report,
      findings,
      checklistItems,
    };
  }
}

// Singleton instance for the client
export const reportRepository = new IndexedDbReportRepository();
