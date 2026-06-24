import { vi, describe, it, expect } from "vitest";
import { buildReportPdf } from "./pdf";
import { ChecklistStatus, ReportStatus, type ReportWithRelations } from "@/lib/domain/types";

// Mock the file service to avoid accessing actual IndexedDB in Node/Vitest
vi.mock("@/lib/infrastructure/BrowserFileService", () => {
  return {
    fileService: {
      readImage: vi.fn().mockImplementation(async (path: string) => {
        return {
          id: path,
          content: new Uint8Array([1, 2, 3, 4]),
          type: "image/jpeg",
          createdAt: "",
        };
      }),
    },
  };
});

const baseReport: ReportWithRelations = {
  id: "r1",
  title: "Reporte de Prueba de PDF",
  author: "Inspector Juan",
  date: "2026-06-24",
  description: "Descripción de prueba para verificar el espaciado del PDF.",
  companyName: "Mi Empresa S.A.",
  companyLogoPath: "local-img-logo",
  footerText: "Pie de página personalizado",
  area: "Área de Inspección",
  status: ReportStatus.DRAFT,
  includeSignatures: true,
  createdAt: "2026-06-24T12:00:00.000Z",
  updatedAt: "2026-06-24T12:00:00.000Z",
  checklistItems: [
    { id: "c1", reportId: "r1", text: "Ítem 1", note: "Nota 1", status: ChecklistStatus.DONE, sortOrder: 0 },
    { id: "c2", reportId: "r1", text: "Ítem 2", note: null, status: ChecklistStatus.OBSERVED, sortOrder: 1 },
  ],
  findings: [],
};

describe("buildReportPdf", () => {
  it("debería compilar un PDF básico con firmas de forma exitosa", async () => {
    const bytes = await buildReportPdf(baseReport);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it("debería compilar un PDF sin el bloque de firmas si includeSignatures es false", async () => {
    const reportWithoutSigs = {
      ...baseReport,
      includeSignatures: false,
    };
    const bytes = await buildReportPdf(reportWithoutSigs);
    expect(bytes).toBeInstanceOf(Uint8Array);
  });

  it("debería compilar un PDF con 1 sola imagen de hallazgo (ancho completo)", async () => {
    const reportWithOneFinding = {
      ...baseReport,
      findings: [
        { id: "f1", reportId: "r1", caption: "Evidencia 1", note: "Nota de evidencia 1", imagePath: "local-img-f1", sortOrder: 0 },
      ],
    };
    const bytes = await buildReportPdf(reportWithOneFinding);
    expect(bytes).toBeInstanceOf(Uint8Array);
  });

  it("debería compilar un PDF con múltiples imágenes de hallazgos (grilla doble columna)", async () => {
    const reportWithMultipleFindings = {
      ...baseReport,
      findings: [
        { id: "f1", reportId: "r1", caption: "Evidencia 1", note: null, imagePath: "local-img-f1", sortOrder: 0 },
        { id: "f2", reportId: "r1", caption: "Evidencia 2", note: "Nota de evidencia 2", imagePath: "local-img-f2", sortOrder: 1 },
        { id: "f3", reportId: "r1", caption: "Evidencia 3", note: "", imagePath: "local-img-f3", sortOrder: 2 },
      ],
    };
    const bytes = await buildReportPdf(reportWithMultipleFindings);
    expect(bytes).toBeInstanceOf(Uint8Array);
  });
});
