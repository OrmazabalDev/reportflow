import { getDb as getReportDb } from "./IndexedDbReportRepository";
import { openDB } from "idb";
import type { UserProfile, Company, Template, TemplateItem, Report, Finding, ChecklistItem } from "@/lib/domain/types";

export type BackupPayload = {
  version: number;
  exportedAt: string;
  appVersion: string;
  buildNumber: string;
  data: {
    profile: UserProfile | null;
    companies: Company[];
    templates: Template[];
    template_items: TemplateItem[];
    reports: Report[];
    findings: Finding[];
    checklist_items: ChecklistItem[];
    images: {
      id: string;
      contentBase64: string;
      type: string;
      createdAt: string;
    }[];
  };
};

const FILES_DB_NAME = "reportflow-files-db";

// Safe conversion of large Uint8Array to base64
function uint8ArrayToBase64(uint8: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 0xffff; // 64k chunks
  for (let i = 0; i < uint8.length; i += chunkSize) {
    chunks.push(
      String.fromCharCode.apply(
        null,
        uint8.subarray(i, i + chunkSize) as unknown as number[]
      )
    );
  }
  return window.btoa(chunks.join(""));
}

// Convert Base64 back to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export class BackupService {
  async exportBackup(appVersion: string, buildNumber: string): Promise<string> {
    const reportDb = await getReportDb();
    
    // Fetch all data from reportflow-db
    const profile = (await reportDb.get("profile", "user")) || null;
    const companies = await reportDb.getAll("companies");
    const templates = await reportDb.getAll("templates");
    const template_items = await reportDb.getAll("template_items");
    const reports = await reportDb.getAll("reports");
    const findings = await reportDb.getAll("findings");
    const checklist_items = await reportDb.getAll("checklist_items");

    // Fetch images from reportflow-files-db
    const filesDb = await openDB(FILES_DB_NAME, 1);
    const rawFiles = await filesDb.getAll("files");

    const images = rawFiles.map((file) => {
      // file.content is a Uint8Array
      const contentBase64 = uint8ArrayToBase64(file.content);
      return {
        id: file.id,
        contentBase64,
        type: file.type,
        createdAt: file.createdAt || new Date().toISOString(),
      };
    });

    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appVersion,
      buildNumber,
      data: {
        profile,
        companies,
        templates,
        template_items,
        reports,
        findings,
        checklist_items,
        images,
      },
    };

    return JSON.stringify(payload, null, 2);
  }

  async importBackup(jsonString: string): Promise<void> {
    const payload = JSON.parse(jsonString) as BackupPayload;

    if (!payload || payload.version === undefined || !payload.data) {
      throw new Error("El archivo de respaldo no tiene un formato válido");
    }

    const { data } = payload;

    // Clean current databases first
    await this.purgeAllLocalData();

    // Import into reportflow-db
    const reportDb = await getReportDb();
    
    // Restore profile
    if (data.profile) {
      await reportDb.put("profile", data.profile, "user");
    }

    // Restore companies
    if (Array.isArray(data.companies)) {
      const tx = reportDb.transaction("companies", "readwrite");
      for (const company of data.companies) {
        await tx.objectStore("companies").put(company);
      }
      await tx.done;
    }

    // Restore templates
    if (Array.isArray(data.templates)) {
      const tx = reportDb.transaction("templates", "readwrite");
      for (const template of data.templates) {
        await tx.objectStore("templates").put(template);
      }
      await tx.done;
    }

    // Restore template items
    if (Array.isArray(data.template_items)) {
      const tx = reportDb.transaction("template_items", "readwrite");
      for (const item of data.template_items) {
        await tx.objectStore("template_items").put(item);
      }
      await tx.done;
    }

    // Restore reports
    if (Array.isArray(data.reports)) {
      const tx = reportDb.transaction("reports", "readwrite");
      for (const report of data.reports) {
        await tx.objectStore("reports").put(report);
      }
      await tx.done;
    }

    // Restore findings
    if (Array.isArray(data.findings)) {
      const tx = reportDb.transaction("findings", "readwrite");
      for (const finding of data.findings) {
        await tx.objectStore("findings").put(finding);
      }
      await tx.done;
    }

    // Restore checklist items
    if (Array.isArray(data.checklist_items)) {
      const tx = reportDb.transaction("checklist_items", "readwrite");
      for (const item of data.checklist_items) {
        await tx.objectStore("checklist_items").put(item);
      }
      await tx.done;
    }

    // Restore files to reportflow-files-db
    if (Array.isArray(data.images)) {
      const filesDb = await openDB(FILES_DB_NAME, 1);
      const tx = filesDb.transaction("files", "readwrite");
      for (const img of data.images) {
        const content = base64ToUint8Array(img.contentBase64);
        await tx.objectStore("files").put({
          id: img.id,
          content,
          type: img.type,
          createdAt: img.createdAt,
        });
      }
      await tx.done;
    }
  }

  async purgeAllLocalData(): Promise<void> {
    const reportDb = await getReportDb();
    
    // Clear all stores in reportflow-db
    const reportStores: ("reports" | "findings" | "checklist_items" | "templates" | "template_items" | "profile" | "companies")[] = [
      "reports",
      "findings",
      "checklist_items",
      "templates",
      "template_items",
      "profile",
      "companies"
    ];
    const tx = reportDb.transaction(reportStores, "readwrite");
    for (const storeName of reportStores) {
      await tx.objectStore(storeName).clear();
    }
    await tx.done;

    // Clear all files in reportflow-files-db
    const filesDb = await openDB(FILES_DB_NAME, 1);
    const filesTx = filesDb.transaction("files", "readwrite");
    await filesTx.objectStore("files").clear();
    await filesTx.done;
  }
}

export const backupService = new BackupService();
