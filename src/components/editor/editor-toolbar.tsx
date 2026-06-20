"use client";

import { ArrowLeft, ArrowRight, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type EditorToolbarProps = {
  step: number;
  totalSteps: number;
  reportId?: string;
  pending: boolean;
  onSaveDraft: () => void;
  onFinalize: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export function EditorToolbar({
  step,
  totalSteps,
  reportId,
  pending,
  onSaveDraft,
  onFinalize,
  onNext,
  onPrev,
}: EditorToolbarProps) {
  const isSummary = step === totalSteps - 1;

  return (
    <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 -mx-4 bg-white/95 px-4 py-3 backdrop-blur-lg border-t border-[var(--rf-border)] md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:border-0 md:backdrop-blur-0">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Guardar Borrador */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={pending}
            className="text-[13px] font-bold text-slate-500 hover:text-slate-800 active:scale-[0.98] transition-all py-2 text-left"
          >
            Borrador
          </button>
        </div>

        {/* Navegación */}
        <div className="flex gap-2 items-center">
          {step > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrev}
              className="shadow-sm font-bold min-h-[44px]"
            >
              Anterior
            </Button>
          ) : null}
          {!isSummary ? (
            <Button
              size="sm"
              onClick={onNext}
              className="shadow-sm font-bold min-h-[44px]"
            >
              Continuar
            </Button>
          ) : (
            <Button
              size="sm"
              loading={pending}
              onClick={onFinalize}
              className="shadow-sm font-bold min-h-[44px]"
            >
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
