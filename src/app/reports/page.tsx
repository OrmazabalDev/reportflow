import { Suspense } from "react";
import { ReportsView } from "@/components/views/reports-view";

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <ReportsView />
    </Suspense>
  );
}
