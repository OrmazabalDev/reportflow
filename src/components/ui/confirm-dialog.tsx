"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  icon?: ReactNode;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  icon,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-[28px] border border-slate-200 bg-white p-0 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.5)] backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            {icon ?? (
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl border",
                  variant === "danger"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-slate-200 bg-slate-50 text-slate-600",
                )}
              >
                <AlertCircle className="size-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                {title}
              </h3>
              {description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50",
              variant === "danger"
                ? "border-red-300 bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
                : "border-[#314c69] bg-[linear-gradient(180deg,#446281_0%,#35506f_100%)] text-white hover:bg-[linear-gradient(180deg,#4a6a8b_0%,#395677_100%)]",
            )}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
