"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UpdateManifest } from "@/lib/update/update.types";
import { APP_VERSION } from "@/lib/version";

type UpdateAvailableDialogProps = {
  manifest: UpdateManifest;
  onDismiss: () => void;
  onDownload: () => void;
};

export function UpdateAvailableDialog({ manifest, onDismiss, onDownload }: UpdateAvailableDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    if (manifest.required) return; // Prevent closing if required
    setOpen(false);
    onDismiss();
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-[28px] border border-slate-200 bg-white p-0 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.5)] backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm"
      onCancel={(e) => {
        if (manifest.required) {
          e.preventDefault();
        } else {
          handleClose();
        }
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
              <Download className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                {manifest.required ? "Actualización Requerida" : "Nueva Versión Disponible"}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {manifest.appName} v{manifest.latestVersion}
              </p>
            </div>
          </div>
          {!manifest.required && (
            <button
              type="button"
              onClick={handleClose}
              className="flex size-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
            <Info className="size-4" />
            Novedades
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {manifest.releaseNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex gap-3">
          {!manifest.required && (
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Más tarde
            </button>
          )}
          <button
            type="button"
            onClick={onDownload}
            className={cn(
              "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold text-white transition",
              "border-[#314c69] bg-[linear-gradient(180deg,#446281_0%,#35506f_100%)] hover:bg-[linear-gradient(180deg,#4a6a8b_0%,#395677_100%)]"
            )}
          >
            Descargar actualización
          </button>
        </div>
      </div>
    </dialog>
  );
}
