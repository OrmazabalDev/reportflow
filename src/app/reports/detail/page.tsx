import { Suspense } from "react";
import { ReportDetailView } from "@/components/views/report-detail-view";

export default function ReportDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <ReportDetailView />
    </Suspense>
  );
}
