import { Suspense, use } from "react";
import { PreviewReportView } from "@/components/views/preview-report-view";

export default function ReportPreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <PreviewReportView />
    </Suspense>
  );
}
