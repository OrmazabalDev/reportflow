import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { openDB } from "idb";
import { BackupService } from "./BackupService";
import { getDb as getReportDb } from "./IndexedDbReportRepository";
import { ReportStatus } from "../domain/types";

const FILES_DB_NAME = "reportflow-files-db";

describe("BackupService", () => {
  let backupService: BackupService;

  beforeEach(async () => {
    backupService = new BackupService();
    
    // Initialize reportflow-db and clear stores
    const reportDb = await getReportDb();
    const tx = reportDb.transaction(["profile", "companies", "reports", "findings", "checklist_items", "templates", "template_items"], "readwrite");
    await tx.objectStore("profile").clear();
    await tx.objectStore("companies").clear();
    await tx.objectStore("reports").clear();
    await tx.objectStore("findings").clear();
    await tx.objectStore("checklist_items").clear();
    await tx.objectStore("templates").clear();
    await tx.objectStore("template_items").clear();
    await tx.done;

    // Initialize reportflow-files-db and clear files
    const filesDb = await openDB(FILES_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "id" });
        }
      },
    });
    const filesTx = filesDb.transaction("files", "readwrite");
    await filesTx.objectStore("files").clear();
    await filesTx.done;
  });

  it("debería exportar e importar un respaldo vacío correctamente", async () => {
    const backupJson = await backupService.exportBackup("v0.1.2", "12");
    const payload = JSON.parse(backupJson);
    
    expect(payload.appVersion).toBe("v0.1.2");
    expect(payload.buildNumber).toBe("12");
    expect(payload.data.profile).toBeNull();
    expect(payload.data.reports).toEqual([]);
    
    await expect(backupService.importBackup(backupJson)).resolves.not.toThrow();
  });

  it("debería exportar y restaurar datos complejos con imágenes en base64", async () => {
    const reportDb = await getReportDb();
    await reportDb.put("profile", { firstName: "Juan", lastName: "Doe" }, "user");
    await reportDb.put("companies", { id: "c1", name: "Empresa Test", isDefault: true, createdAt: "", updatedAt: "" });
    await reportDb.put("reports", {
      id: "r1",
      title: "Reporte Test",
      author: "Juan Doe",
      date: "2026-06-24",
      description: null,
      companyName: null,
      companyLogoPath: null,
      footerText: null,
      area: null,
      status: ReportStatus.DRAFT,
      createdAt: "",
      updatedAt: ""
    });
    
    const filesDb = await openDB(FILES_DB_NAME, 1);
    const dummyBytes = new Uint8Array([1, 2, 3, 4, 5]);
    await filesDb.put("files", { id: "local-img-1", content: dummyBytes, type: "image/jpeg", createdAt: "" });

    const backupJson = await backupService.exportBackup("v0.1.2", "12");
    const payload = JSON.parse(backupJson);
    
    expect(payload.data.profile).toEqual({ firstName: "Juan", lastName: "Doe" });
    expect(payload.data.companies.length).toBe(1);
    expect(payload.data.images.length).toBe(1);
    expect(payload.data.images[0].contentBase64).toBe("AQIDBAU=");

    await backupService.purgeAllLocalData();
    
    const profileAfterPurge = await reportDb.get("profile", "user");
    expect(profileAfterPurge).toBeUndefined();
    const filesAfterPurge = await filesDb.getAll("files");
    expect(filesAfterPurge.length).toBe(0);

    await backupService.importBackup(backupJson);

    const profileAfterRestore = await reportDb.get("profile", "user");
    expect(profileAfterRestore).toEqual({ firstName: "Juan", lastName: "Doe" });
    
    const fileRecord = await filesDb.get("files", "local-img-1");
    expect(fileRecord).toBeDefined();
    expect(Array.from(fileRecord!.content)).toEqual([1, 2, 3, 4, 5]);
  });
});
