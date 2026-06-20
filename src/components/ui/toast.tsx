"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="size-4 shrink-0" />,
  error: <AlertCircle className="size-4 shrink-0" />,
  info: <Info className="size-4 shrink-0" />,
};

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200/60 bg-emerald-900 text-emerald-50",
  error: "border-red-200/60 bg-red-900 text-red-50",
  info: "border-slate-200/60 bg-[#2f4866] text-white",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, variant }]);

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-[0_22px_44px_-24px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 fade-in duration-300",
              variantStyles[t.variant],
            )}
          >
            {icons[t.variant]}
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="ml-2 flex size-6 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
