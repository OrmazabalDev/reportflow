import { Suspense } from "react";
import { EditReportView } from "@/components/views/edit-report-view";

export default function EditReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <EditReportView />
    </Suspense>
  );
}
