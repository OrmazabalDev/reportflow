import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type RFBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function RFBottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: RFBottomSheetProps) {
  // Disable body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-[24px] bg-white p-5 border-t border-slate-200 shadow-2xl animate-in slide-in-from-bottom duration-250 ease-out focus:outline-none max-h-[90vh] overflow-y-auto flex flex-col pb-8",
          className
        )}
      >
        {/* Handle bar */}
        <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-200 mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
          {title ? (
            <h3 className="text-[17px] font-extrabold text-slate-950 leading-tight">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition active:scale-95"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
