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
    <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 -mx-4 bg-white/95 px-4 py-4 backdrop-blur-lg border-t border-[var(--rf-border)] md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:border-0 md:backdrop-blur-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 w-full md:w-auto md:order-2">
          {step > 0 ? (
            <Button
              variant="secondary"
              onClick={onPrev}
              className="flex-1 md:flex-none h-[52px] rounded-2xl shadow-sm"
            >
              Anterior
            </Button>
          ) : null}
          {!isSummary ? (
            <Button
              onClick={onNext}
              className="flex-1 md:flex-none h-[52px] rounded-2xl shadow-sm"
            >
              Continuar
            </Button>
          ) : (
            <Button
              loading={pending}
              onClick={onFinalize}
              className="flex-1 md:flex-none h-[52px] rounded-2xl shadow-sm"
            >
              Finalizar
            </Button>
          )}
        </div>

        <div className="flex justify-center md:order-1">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={pending}
            className="text-sm font-semibold text-[var(--rf-muted)] active:scale-[0.98] active:text-slate-900 transition-all p-2"
          >
            Guardar como borrador
          </button>
        </div>
      </div>
    </div>
  );
}
