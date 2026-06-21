import type { Metadata } from "next";
import { ReportStatus } from "@/lib/domain/types";
import { ReportEditor } from "@/components/report-editor";

export const metadata: Metadata = {
  title: "Nuevo reporte",
};

export default function NewReportPage() {
  return (
    <ReportEditor
      mode="create"
      initialValues={{
        title: "",
        author: "",
        date: new Date().toISOString().split("T")[0] ?? "",
        description: "",
        companyName: "",
        companyLogoPath: null,
        footerText: "",
        area: "",
        status: ReportStatus.DRAFT,
        includeSignatures: false,
        findings: [],
        checklistItems: [],
      }}
    />
  );
}
