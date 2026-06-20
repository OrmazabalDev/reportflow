"use client";

import { useState } from "react";
import { Shield, User, Building2, Upload, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/editor/editor-shared";
import { profileRepository } from "@/lib/infrastructure/IndexedDbProfileRepository";
import { fileService } from "@/lib/infrastructure/BrowserFileService";
import { cn } from "@/lib/utils";

export function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [areaOrUnit, setAreaOrUnit] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [footerText, setFooterText] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const path = await fileService.saveImage(file);
      setLogoPath(path);
    } catch (err) {
      console.error("Error uploading logo in onboarding", err);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveAll = async (skipCompany = false) => {
    setLoading(true);
    try {
      // 1. Save Profile
      await profileRepository.saveProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role.trim() || undefined,
        email: email.trim() || undefined,
      });

      // 2. Save Company (if not skipped and name is provided)
      if (!skipCompany && companyName.trim()) {
        await profileRepository.saveCompany({
          id: crypto.randomUUID(),
          name: companyName.trim(),
          areaOrUnit: areaOrUnit.trim() || undefined,
          logo: logoPath,
          footerText: footerText.trim() || undefined,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      onComplete();
    } catch (err) {
      console.error("Error saving onboarding details", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="bg-[var(--rf-primary-light)] p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--rf-primary)] text-white shadow-sm shrink-0">
            <Shield className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[var(--rf-primary-dark)]">Bienvenido a ReportFlow</h2>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Configuración Inicial</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-5 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="size-4 text-[var(--rf-primary)]" />
                  Paso 1: Tu perfil de inspector
                </h3>
                <p className="text-xs text-slate-500">
                  Cuéntanos quién eres. Estos datos se utilizarán por defecto como autor de tus reportes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={fieldLabelClass} htmlFor="first-name">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldClass}
                    placeholder="Ej. Juan"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={fieldLabelClass} htmlFor="last-name">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldClass}
                    placeholder="Ej. Pérez"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="user-role">
                  Cargo o Rol <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. Inspector de Seguridad, Supervisor"
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="user-email">
                  Correo Electrónico <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. juan.perez@empresa.com"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-5 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="size-4 text-[var(--rf-primary)]" />
                  Paso 2: Branding de Empresa <span className="text-xs font-normal text-slate-400">(Opcional)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Agrega tu primera organización para autocompletar el branding de tus reportes con logos y pies de página.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="comp-name">
                  Nombre de Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  id="comp-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. Museo Histórico Nacional"
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="comp-area">
                  Área / Unidad / Unidad Técnica <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="comp-area"
                  value={areaOrUnit}
                  onChange={(e) => setAreaOrUnit(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. Conservación y Colecciones"
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass}>Logo de la Empresa <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <div className="flex items-center gap-3">
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100 cursor-pointer min-h-[44px]">
                    <Upload className="size-4" />
                    <span>{logoPath ? "Cambiar logo" : "Subir logo (PNG/JPG)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {logoUploading && <LoaderCircle className="size-5 animate-spin text-[var(--rf-primary)]" />}

                  {logoPath && !logoUploading && (
                    <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-emerald-600">✓ Cargado</span>
                      <button
                        type="button"
                        onClick={() => setLogoPath(null)}
                        className="text-xs text-red-500 font-semibold px-1"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="comp-footer">
                  Pie de página por defecto <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  id="comp-footer"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. Documento interno de carácter restringido."
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
          {step === 1 ? (
            <Button
              className="w-full"
              variant="primary"
              onClick={() => setStep(2)}
              disabled={!firstName.trim() || !lastName.trim()}
            >
              Continuar
            </Button>
          ) : (
            <>
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => handleSaveAll(true)}
                disabled={loading}
              >
                Omitir por ahora
              </Button>
              <Button
                className="flex-1"
                variant="primary"
                onClick={() => handleSaveAll(false)}
                disabled={loading || !companyName.trim()}
                loading={loading}
              >
                Guardar y empezar
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
