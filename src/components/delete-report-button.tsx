"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { reportRepository } from "@/lib/infrastructure/IndexedDbReportRepository";

export function DeleteReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await reportRepository.deleteReport(reportId);
      router.push("/reports?deleted=1");
    } catch {
      router.push("/reports?deleteError=1");
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="danger"
        icon={<Trash2 className="size-4" />}
        onClick={() => setOpen(true)}
      >
        Eliminar
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Eliminar reporte"
        description="Esta accion no se puede deshacer. Se eliminaran todos los hallazgos, items de checklist e imagenes asociadas al reporte."
        confirmLabel="Eliminar definitivamente"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
