"use client";

import { useEffect, useState } from "react";
import { User, Building2, Edit2, Trash2, Plus, Star, Upload, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalImage } from "@/components/ui/local-image";
import { useToast } from "@/components/ui/toast";
import { fieldClass, fieldLabelClass, textAreaClass } from "@/components/editor/editor-shared";
import { profileRepository } from "@/lib/infrastructure/IndexedDbProfileRepository";
import { fileService } from "@/lib/infrastructure/BrowserFileService";
import type { UserProfile, Company } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Active items for editing/deletion
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  // Profile Form States
  const [pFirstName, setPFirstName] = useState("");
  const [pLastName, setPLastName] = useState("");
  const [pRole, setPRole] = useState("");
  const [pEmail, setPEmail] = useState("");

  // Company Form States
  const [cName, setCName] = useState("");
  const [cArea, setCArea] = useState("");
  const [cLogo, setCLogo] = useState<string | null>(null);
  const [cFooter, setCFooter] = useState("");
  const [cIsDefault, setCIsDefault] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const fetchData = async () => {
    try {
      const p = await profileRepository.getProfile();
      setProfile(p);
      const list = await profileRepository.listCompanies();
      setCompanies(list);
    } catch (err) {
      console.error("Error loading settings data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Profile management
  const openEditProfile = () => {
    if (profile) {
      setPFirstName(profile.firstName);
      setPLastName(profile.lastName);
      setPRole(profile.role || "");
      setPEmail(profile.email || "");
    } else {
      setPFirstName("");
      setPLastName("");
      setPRole("");
      setPEmail("");
    }
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!pFirstName.trim() || !pLastName.trim()) {
      toast("Nombre y Apellido son obligatorios", "error");
      return;
    }

    try {
      const updated: UserProfile = {
        firstName: pFirstName.trim(),
        lastName: pLastName.trim(),
        role: pRole.trim() || undefined,
        email: pEmail.trim() || undefined,
      };
      await profileRepository.saveProfile(updated);
      setProfile(updated);
      setProfileModalOpen(false);
      toast("Perfil actualizado con éxito", "success");
      // Reload shell info if needed (automatically dynamic in client)
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast("Error al guardar el perfil", "error");
    }
  };

  // Company management
  const openCreateCompany = () => {
    setActiveCompany(null);
    setCName("");
    setCArea("");
    setCLogo(null);
    setCFooter("");
    setCIsDefault(companies.length === 0); // First company is default by default
    setCompanyModalOpen(true);
  };

  const openEditCompany = (company: Company) => {
    setActiveCompany(company);
    setCName(company.name);
    setCArea(company.areaOrUnit || "");
    setCLogo(company.logo || null);
    setCFooter(company.footerText || "");
    setCIsDefault(company.isDefault || false);
    setCompanyModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const path = await fileService.saveImage(file);
      setCLogo(path);
    } catch (err) {
      console.error(err);
      toast("Error al subir logo", "error");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!cName.trim()) {
      toast("El nombre de la empresa es obligatorio", "error");
      return;
    }

    try {
      const companyData: Company = {
        id: activeCompany?.id || crypto.randomUUID(),
        name: cName.trim(),
        areaOrUnit: cArea.trim() || undefined,
        logo: cLogo,
        footerText: cFooter.trim() || undefined,
        isDefault: cIsDefault,
        createdAt: activeCompany?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await profileRepository.saveCompany(companyData);
      await fetchData();
      setCompanyModalOpen(false);
      toast(activeCompany ? "Empresa actualizada" : "Empresa creada", "success");
    } catch (err) {
      console.error(err);
      toast("Error al guardar la empresa", "error");
    }
  };

  const confirmDeleteCompany = (company: Company) => {
    setActiveCompany(company);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!activeCompany) return;

    try {
      await profileRepository.deleteCompany(activeCompany.id);
      if (activeCompany.logo) {
        await fileService.deleteImage(activeCompany.logo);
      }
      await fetchData();
      setDeleteConfirmOpen(false);
      toast("Empresa eliminada", "success");
    } catch (err) {
      console.error(err);
      toast("Error al eliminar la empresa", "error");
    }
  };

  const handleSetDefault = async (company: Company) => {
    try {
      await profileRepository.setDefaultCompany(company.id);
      await fetchData();
      toast(`Empresa "${company.name}" marcada por defecto`, "success");
    } catch (err) {
      console.error(err);
      toast("Error al cambiar empresa por defecto", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-[var(--rf-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ── Perfil de Usuario ── */}
      <section className="bg-white p-5 rounded-3xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="size-5 text-[var(--rf-primary)]" />
            Mi Perfil Local
          </h2>
          <Button variant="secondary" size="sm" icon={<Edit2 />} onClick={openEditProfile}>
            Editar Perfil
          </Button>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{profile.firstName} {profile.lastName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo / Rol</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.role || "No definido"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.email || "No definido"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay un perfil configurado.</p>
        )}
      </section>

      {/* ── Organizaciones / Empresas ── */}
      <section className="bg-white p-5 rounded-3xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="size-5 text-[var(--rf-primary)]" />
            Mis Empresas / Clientes
          </h2>
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={openCreateCompany}>
            Agregar Empresa
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          Registra las empresas para las que creas reportes. Podrás elegir el branding automáticamente al iniciar un nuevo documento.
        </p>

        {companies.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30">
            <Building2 className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aún no tienes empresas agregadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((comp) => (
              <article key={comp.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between transition hover:border-slate-300">
                <div className="flex items-start gap-4">
                  {/* Company Logo Preview */}
                  <div className="relative size-12 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                    {comp.logo ? (
                      <LocalImage src={comp.logo} alt={comp.name} fill className="object-contain p-1" />
                    ) : (
                      <Building2 className="size-5 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 text-sm leading-none">{comp.name}</p>
                      {comp.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 ring-1 ring-amber-200">
                          <Star className="size-2.5 fill-amber-500 text-amber-500" />
                          PREDETERMINADA
                        </span>
                      )}
                    </div>
                    {comp.areaOrUnit && (
                      <p className="text-xs text-slate-500">{comp.areaOrUnit}</p>
                    )}
                    {comp.footerText && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{comp.footerText}"</p>
                    )}
                  </div>
                </div>

                {/* Company Row Actions */}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 md:pt-0 md:border-0 shrink-0">
                  {!comp.isDefault && (
                    <button
                      type="button"
                      title="Establecer por defecto"
                      onClick={() => handleSetDefault(comp)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 active:scale-95 transition-all"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => openEditCompany(comp)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Eliminar"
                    onClick={() => confirmDeleteCompany(comp)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:scale-95 transition-all animate-none"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── MODAL: Editar Perfil ── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <User className="size-5 text-[var(--rf-primary)]" />
              Editar Perfil Inspector
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={fieldLabelClass} htmlFor="m-first-name">Nombre</label>
                  <input
                    id="m-first-name"
                    value={pFirstName}
                    onChange={(e) => setPFirstName(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={fieldLabelClass} htmlFor="m-last-name">Apellido</label>
                  <input
                    id="m-last-name"
                    value={pLastName}
                    onChange={(e) => setPLastName(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="m-role">Cargo / Rol</label>
                <input
                  id="m-role"
                  value={pRole}
                  onChange={(e) => setPRole(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="m-email">Correo Electrónico</label>
                <input
                  id="m-email"
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" size="sm" onClick={() => setProfileModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" size="sm" onClick={handleSaveProfile}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Crear/Editar Empresa ── */}
      {companyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2 shrink-0">
              <Building2 className="size-5 text-[var(--rf-primary)]" />
              {activeCompany ? "Editar Empresa" : "Nueva Empresa"}
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="mc-name">Nombre de Empresa <span className="text-red-500">*</span></label>
                <input
                  id="mc-name"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. Empresa Andina"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="mc-area">Área / Unidad</label>
                <input
                  id="mc-area"
                  value={cArea}
                  onChange={(e) => setCArea(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. Operaciones"
                />
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass}>Logo corporativo</label>
                <div className="flex items-center gap-3">
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100 cursor-pointer min-h-[44px]">
                    <Upload className="size-4" />
                    <span>{cLogo ? "Cambiar logo" : "Subir logo"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>

                  {logoUploading && <LoaderCircle className="size-5 animate-spin text-[var(--rf-primary)]" />}

                  {cLogo && !logoUploading && (
                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-emerald-600">✓ Cargado</span>
                      <button type="button" onClick={() => setCLogo(null)} className="text-xs text-red-500 font-semibold px-1">
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={fieldLabelClass} htmlFor="mc-footer">Pie de página por defecto</label>
                <textarea
                  id="mc-footer"
                  value={cFooter}
                  onChange={(e) => setCFooter(e.target.value)}
                  className={`${textAreaClass} min-h-20`}
                  placeholder="Ej. Documento confidencial."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={cIsDefault}
                  onChange={(e) => setCIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-[var(--rf-primary)] focus:ring-[var(--rf-primary)]"
                />
                <span className="text-xs font-semibold text-slate-700">Establecer como predeterminada</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
              <Button variant="secondary" className="flex-1" size="sm" onClick={() => setCompanyModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" size="sm" onClick={handleSaveCompany} disabled={logoUploading}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Confirmar Borrado de Empresa ── */}
      {deleteConfirmOpen && activeCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">¿Eliminar empresa?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la empresa **{activeCompany.name}**? Esta acción no se puede deshacer y no modificará los reportes antiguos ya guardados.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1 text-red-600 bg-red-50 hover:bg-red-100/80 active:bg-red-200 border border-red-200 shadow-none min-h-[44px]"
                size="sm"
                onClick={handleDeleteCompany}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
