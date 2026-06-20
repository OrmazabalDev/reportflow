import { Button } from "@/components/ui/button";

export default function ReportNotFound() {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
        Reporte
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        No encontrado
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        El reporte solicitado no existe o fue eliminado.
      </p>
      <div className="mt-6">
        <Button href="/reports">Volver al historial</Button>
      </div>
    </div>
  );
}
