"use client";

import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Edit2,
  Trash2,
  Plus,
  Star,
  Upload,
  LoaderCircle,
  Database,
  Info,
  ShieldAlert,
  Download,
  FileText,
  X,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalImage } from "@/components/ui/local-image";
import { useToast } from "@/components/ui/toast";
import { fieldClass, fieldLabelClass, textAreaClass } from "@/components/editor/editor-shared";
import { profileRepository } from "@/lib/infrastructure/IndexedDbProfileRepository";
import { fileService } from "@/lib/infrastructure/BrowserFileService";
import { backupService } from "@/lib/infrastructure/BackupService";
import { APP_VERSION, APP_BUILD_NUMBER, APP_NAME, APP_STAGE } from "@/lib/version";
import type { UserProfile, Company } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import changelogData from "@/lib/changelog.json";

export function SettingsView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "backup" | "about">("profile");
  
  // Base states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Backup & Restore states
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);

  // Legal modals
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

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

  // Backup & Restore Actions
  const handleExportBackup = async () => {
    try {
      const jsonString = await backupService.exportBackup(APP_VERSION, APP_BUILD_NUMBER);
      const fileName = `reportflow-backup-${new Date().toISOString().split("T")[0]}.json`;

      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: "Respaldo ReportFlow",
          text: "Mi copia de seguridad de ReportFlow",
          url: writeResult.uri,
          dialogTitle: "Guardar Copia de Seguridad",
        });
      } else {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      toast("Respaldo exportado exitosamente", "success");
    } catch (err) {
      console.error("Export error", err);
      toast("Error al exportar respaldo", "error");
    }
  };

  const handleImportFileSelector = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      setPendingImportFile(file);
      setImportConfirmOpen(true);
    };
    input.click();
  };

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return;

    setImportLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonString = event.target?.result as string;
          await backupService.importBackup(jsonString);
          toast("Copia de seguridad restaurada", "success");
          setImportConfirmOpen(false);
          setPendingImportFile(null);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Archivo de respaldo no compatible";
          console.error(err);
          toast(errMsg, "error");
          setImportLoading(false);
        }
      };
      reader.readAsText(pendingImportFile);
    } catch (err) {
      console.error(err);
      toast("Error al leer archivo de respaldo", "error");
      setImportLoading(false);
    }
  };

  const handlePurgeAll = async () => {
    setPurgeLoading(true);
    try {
      await backupService.purgeAllLocalData();
      toast("Base de datos local eliminada", "success");
      setPurgeConfirmOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast("Error al purgar los datos locales", "error");
      setPurgeLoading(false);
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
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      {/* ── TABS SELECTOR ── */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "profile"
              ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/40"
              : "text-slate-500 hover:text-slate-900 active:scale-[0.97]"
          )}
        >
          <User className="size-4" />
          <span>Perfil & Empresas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("backup")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "backup"
              ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/40"
              : "text-slate-500 hover:text-slate-900 active:scale-[0.97]"
          )}
        >
          <Database className="size-4" />
          <span>Datos & Respaldos</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "about"
              ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/40"
              : "text-slate-500 hover:text-slate-900 active:scale-[0.97]"
          )}
        >
          <Info className="size-4" />
          <span>Acerca de</span>
        </button>
      </div>

      {/* ── TAB: PROFILE & COMPANIES ── */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Perfil de Usuario */}
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

          {/* Organizaciones / Empresas */}
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
                          <p className="text-[10px] text-slate-400 line-clamp-1 italic">&quot;{comp.footerText}&quot;</p>
                        )}
                      </div>
                    </div>

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
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:scale-95 transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── TAB: DATA & BACKUP ── */}
      {activeTab === "backup" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Respaldos locales */}
          <section className="bg-white p-5 rounded-3xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)] space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="size-5 text-[var(--rf-primary)]" />
              Copia de Seguridad (Backup)
            </h2>
            <p className="text-xs leading-relaxed text-slate-500">
              ReportFlow opera bajo una filosofía local-first: todos tus reportes, firmas, checklists, fotos y empresas residen de forma 100% segura en tu dispositivo. **Exporta un respaldo periódico** en formato JSON para no perder tu historial si reinstalas la app o cambias de celular.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleExportBackup}
                icon={Capacitor.isNativePlatform() ? <Share2 /> : <Download />}
                className="w-full text-sm font-semibold rounded-2xl h-12"
              >
                {Capacitor.isNativePlatform() ? "Compartir Respaldo" : "Descargar Respaldo"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleImportFileSelector}
                icon={<Upload />}
                className="w-full text-sm font-semibold rounded-2xl h-12 border-slate-300 text-slate-700 bg-white"
              >
                Restaurar Respaldo
              </Button>
            </div>
          </section>

          {/* Zona Peligrosa */}
          <section className="bg-white p-5 rounded-3xl border border-red-200/80 shadow-[var(--rf-shadow-sm)] bg-red-50/10 space-y-4">
            <h2 className="text-base font-bold text-red-700 flex items-center gap-2">
              <ShieldAlert className="size-5 text-red-600" />
              Zona de Peligro
            </h2>
            <p className="text-xs leading-relaxed text-red-900/75">
              Esta sección contiene acciones destructivas que no se pueden deshacer de ninguna manera. Asegúrate de tener copias de seguridad de tu información antes de proceder.
            </p>
            <div className="pt-2">
              <Button
                variant="danger"
                onClick={() => setPurgeConfirmOpen(true)}
                icon={<Trash2 />}
                className="w-full sm:w-auto text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-none h-12 rounded-2xl px-5"
              >
                Eliminar todos los datos locales
              </Button>
            </div>
          </section>

          {/* Legal and Privacy list */}
          <section className="bg-white p-4 rounded-3xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)]">
            <div className="divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="w-full text-left py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 active:opacity-60 transition"
              >
                <span>Términos de Uso y Licencia</span>
                <span className="text-slate-400 font-bold">➔</span>
              </button>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(true)}
                className="w-full text-left py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 active:opacity-60 transition"
              >
                <span>Política de Privacidad Local-First</span>
                <span className="text-slate-400 font-bold">➔</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ── TAB: ABOUT ── */}
      {activeTab === "about" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <section className="bg-white p-6 rounded-3xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)] text-center space-y-4">
            <div className="mx-auto size-16 bg-[linear-gradient(135deg,#446281_0%,#273b52_100%)] text-white font-black text-2xl flex items-center justify-center rounded-3xl shadow-md">
              RF
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">{APP_NAME}</h2>
              <p className="text-xs font-semibold text-[var(--rf-primary)] mt-0.5">Etapa {APP_STAGE}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Versión {APP_VERSION} · Build {APP_BUILD_NUMBER}</p>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Herramienta profesional offline-first para la generación y gestión de reportes de inspección técnica, auditorías y control de calidad con checklists y fotos de hallazgos.
            </p>
          </section>

          {/* Changelog */}
          <section className="bg-white p-5 rounded-3xl border border-[var(--rf-border)] shadow-[var(--rf-shadow-sm)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="size-4" />
              Historial de Cambios (Changelog)
            </h3>
            
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 pl-8">
              {changelogData.map((entry, index) => {
                const isCurrent = entry.build.toLowerCase().includes(`build ${APP_BUILD_NUMBER}`);
                return (
                  <div key={index} className="relative">
                    <div
                      className={cn(
                        "absolute size-3 rounded-full border-2 border-white ring-4 -left-8 top-1",
                        isCurrent
                          ? "bg-[var(--rf-primary)] ring-slate-100"
                          : "bg-slate-300 ring-slate-50"
                      )}
                    ></div>
                    <h4 className={cn("text-xs font-bold", isCurrent ? "text-slate-900" : "text-slate-800")}>
                      {entry.build} {isCurrent && "(Versión Actual)"}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{entry.date}</p>
                    <ul className="list-disc list-inside text-xs text-slate-600 mt-2 space-y-1 pl-1">
                      {entry.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

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

      {/* ── MODAL: Confirmar Restauración / Importar ── */}
      {importConfirmOpen && pendingImportFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Sobrescribir datos locales?</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Vas a restaurar los datos del archivo **{pendingImportFile.name}**. 
                </p>
                <p className="mt-1 text-xs font-bold text-red-600 leading-relaxed">
                  ⚠️ ¡Atención! Esta acción borrará permanentemente todos tus reportes, checklists, empresas y fotos actuales para reemplazarlos con los del respaldo.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                variant="secondary"
                className="flex-1 rounded-2xl h-11"
                disabled={importLoading}
                onClick={() => {
                  setImportConfirmOpen(false);
                  setPendingImportFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1 rounded-2xl h-11 text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-none"
                disabled={importLoading}
                onClick={handleConfirmImport}
              >
                {importLoading ? (
                  <LoaderCircle className="size-4 animate-spin text-red-600" />
                ) : (
                  "Importar y Sobrescribir"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Confirmar Purgado de Datos locales ── */}
      {purgeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-905">¿Eliminar todos tus datos locales?</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Estás a punto de borrar toda la base de datos de ReportFlow en este dispositivo.
                </p>
                <p className="mt-1 text-xs font-black text-red-700 leading-relaxed">
                  Esta acción es destructiva y definitiva. Perderás tus plantillas, perfiles, reportes históricos y todas las fotos adjuntas sin posibilidad de recuperación.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                variant="secondary"
                className="flex-1 rounded-2xl h-11"
                disabled={purgeLoading}
                onClick={() => setPurgeConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1 rounded-2xl h-11 text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-none"
                disabled={purgeLoading}
                onClick={handlePurgeAll}
              >
                {purgeLoading ? (
                  <LoaderCircle className="size-4 animate-spin text-red-600" />
                ) : (
                  "Confirmar eliminación"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Política de Privacidad ── */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-black text-slate-905">Política de Privacidad</h3>
              <button type="button" onClick={() => setPrivacyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
              <p className="font-bold text-slate-800">Última actualización: Junio de 2026</p>
              <p>
                ReportFlow se ha desarrollado bajo el principio de **Privacidad por Diseño y Almacenamiento Local (Local-First)**. A continuación, te informamos cómo funciona la privacidad de tu información:
              </p>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">1. Recopilación de Datos</h4>
                <p>
                  ReportFlow no cuenta con servidores centralizados en la nube para procesar, guardar o analizar tus datos. Toda la información que ingresas (perfil de inspector, nombres de empresas, logotipos, checklist de inspección, comentarios y fotografías tomadas con la cámara) se almacena únicamente dentro del almacenamiento aislado de la aplicación en tu propio dispositivo móvil o navegador (IndexedDB).
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">2. Transmisión a Terceros</h4>
                <p>
                  No compartimos, vendemos ni enviamos tus datos locales a ningún servidor externo. El único canal de salida de información es la exportación de archivos que tú mismo inicias voluntariamente:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                  <li>Exportación de reportes a PDF nativo local.</li>
                  <li>Compartición de copias de respaldo JSON mediante la hoja de compartir nativa de tu teléfono móvil.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">3. Seguridad y Archivos locales</h4>
                <p>
                  Tus datos están protegidos por el sandboxing del sistema operativo Android y el navegador. Si eliminas la aplicación o borras sus datos en la configuración del sistema operativo, el almacenamiento local de la app se destruirá por completo de forma permanente.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">4. Actualizaciones y Conexión de Red</h4>
                <p>
                  La aplicación realiza peticiones HTTPS periódicas únicamente al repositorio oficial de código abierto en GitHub para revisar si existe una versión compilada más reciente (Build superior), sin enviar datos privados en dicha consulta.
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 text-right shrink-0">
              <Button variant="secondary" size="sm" className="rounded-xl px-5" onClick={() => setPrivacyModalOpen(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Términos y Condiciones ── */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-black text-slate-905">Términos de Uso y Licencia</h3>
              <button type="button" onClick={() => setTermsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
              <p className="font-bold text-slate-800">Última actualización: Junio de 2026</p>
              <p>
                Por favor, lee detalladamente los términos que rigen la utilización de la aplicación ReportFlow en este dispositivo:
              </p>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">1. Licencia de Uso Personal</h4>
                <p>
                  ReportFlow te otorga una licencia de uso personal, local, limitada y no transferible para operar la herramienta de generación de reportes e inspecciones bajo tu propia responsabilidad.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">2. Responsabilidad de la Información</h4>
                <p>
                  Dado que no poseemos almacenamiento en la nube, **tú eres el único responsable** de resguardar y mantener respaldadas las copias de seguridad de tus reportes. ReportFlow no se hace responsable por la pérdida de datos derivada de la desinstalación de la app, daños físicos en el dispositivo móvil, corrupción del almacenamiento o formateos del sistema operativo.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">3. Limitación de Garantía y Responsabilidad</h4>
                <p>
                  La aplicación se entrega &quot;tal cual&quot;, sin garantías implícitas o explícitas sobre su desempeño, precisión de las inspecciones realizadas o el correcto diseño final del PDF exportado. En ningún caso el desarrollador responderá por pérdidas económicas, reclamos laborales o daños directos e indirectos derivados de fallos en los reportes generados.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">4. Modificaciones del Servicio</h4>
                <p>
                  El proyecto de código abierto está sujeto a cambios en sus esquemas de base de datos e interfaz gráfica en futuras compilaciones (Builds), las cuales se ofrecerán de manera local para optimizar el producto.
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 text-right shrink-0">
              <Button variant="secondary" size="sm" className="rounded-xl px-5" onClick={() => setTermsModalOpen(false)}>
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
