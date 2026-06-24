# Plan de Implementación: Privacidad, Respaldo y Datos Locales (Build 9)

Este plan detalla el diseño técnico y los cambios necesarios para dotar a ReportFlow de funciones de confianza, privacidad y control total de datos locales-first. Permitiremos que el usuario exporte un respaldo completo con todas sus fotos y datos codificados en un único archivo JSON, lo importe para restaurar sus datos en cualquier dispositivo, elimine todos los datos locales para reiniciar la app, y revise los términos y políticas legales de manera offline.

---

## User Review Required

> [!WARNING]
> **Políticas de Sobrescritura en Restauración:**
> Al importar un respaldo, se realizará una **limpieza total previa** de la base de datos local para evitar duplicados, conflictos de IDs o inconsistencias. Mostraremos un modal con una advertencia destructiva muy clara que requiera confirmación doble antes de iniciar la restauración.

> [!NOTE]
> **Compatibilidad Mobile (Capacitor) y Web:**
> El flujo de exportación detectará si la app corre en dispositivo móvil o en web:
> - **En Android (nativo):** Se usará `@capacitor/filesystem` para guardar temporalmente el JSON y `@capacitor/share` para abrir la hoja de compartir nativa (para enviar a Google Drive, WhatsApp, Correo, etc.).
> - **En Web (dev):** Generará una descarga directa de archivo en el navegador usando un elemento `<a>` temporal.
> El flujo de importación utilizará un `<input type="file">` invisible estándar, que es completamente compatible y robusto tanto en la web como en el selector de archivos nativo de Android.

---

## Proposed Changes

### [Backup Component]

#### [NEW] [BackupService.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/infrastructure/BackupService.ts)
Crearemos un servicio dedicado para serializar e importar todos los datos de IndexedDB.

* **Esquema de Respaldo JSON (`BackupPayload`):**
  ```typescript
  export type BackupPayload = {
    version: number;          // Versión del backup para futuras migraciones
    exportedAt: string;       // Fecha de exportación
    appVersion: string;       // Versión de la app
    buildNumber: string;      // Número de build
    profile: UserProfile | null;
    companies: Company[];
    templates: Template[];
    template_items: TemplateItem[];
    reports: Report[];
    findings: Finding[];
    checklist_items: ChecklistItem[];
    images: {
      id: string;             // ID original (ej: local-img-...)
      contentBase64: string;  // Imagen codificada en Base64
      type: string;           // MIME type (ej: image/jpeg)
      createdAt: string;
    }[];
  };
  ```

* **Operaciones Principales:**
  1. `exportBackup(): Promise<string>`
     - Obtiene datos de `reportflow-db` (todas las tiendas de datos).
     - Obtiene registros de `reportflow-files-db` (imágenes de la empresa y hallazgos).
     - Convierte los campos de tipo `Uint8Array` (contenido binario de imágenes) a Base64.
     - Retorna el JSON completo formateado como string.
  2. `importBackup(jsonString: string): Promise<void>`
     - Parsea y valida el formato del JSON (verifica campos requeridos).
     - Abre transacciones en ambas bases de datos.
     - Limpia todas las tablas (vacía el almacenamiento local de IndexedDB).
     - Convierte las imágenes Base64 de vuelta a `Uint8Array` y las inserta en `reportflow-files-db`.
     - Inserta los registros correspondientes en cada tienda de `reportflow-db`.
  3. `purgeAllLocalData(): Promise<void>`
     - Vacía por completo todas las tiendas de ambas bases de datos locales.

---

### [Settings & UI Components]

#### [MODIFY] [settings-view.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/views/settings-view.tsx)
Expandiremos la vista de ajustes existente con un diseño estructurado por pestañas o secciones claras.

* **Sección "Seguridad y Datos":**
  - **Exportar Respaldo:** Botón que ejecuta `BackupService.exportBackup()`. En móviles, abre el Share Sheet nativo. En web, descarga `reportflow-backup-AAAA-MM-DD.json`.
  - **Importar Respaldo:** Botón que abre el selector de archivos, lee el archivo JSON, muestra advertencia de sobrescritura de datos, restaura la base de datos y fuerza un `window.location.reload()` para refrescar el estado global de la app.
  - **Eliminar todos los datos locales:** Botón destructivo con doble confirmación (con modal) que limpia todo y recarga la app (lo que forzará que aparezca el onboarding inicial automáticamente).
* **Sección "Legal y Privacidad":**
  - Botón **Política de privacidad** y **Términos de uso** que abrirán diálogos/modals atractivos con textos estándar para una aplicación móvil offline-first (resaltando que no se recopilan datos en servidores externos y todo reside localmente).
* **Sección "Acerca de":**
  - Muestra el logotipo de ReportFlow, el estado actual (`Beta`), la versión (`v0.1.1 build 8`), y un listado interactivo con el **Changelog** (historial de cambios) detallando los hitos de las builds 1 a 8.

---

## Verification Plan

### Automated Tests
- Ejecutar `npm run build` para asegurar la compilación completa de Next.js y los tipos de TypeScript del esquema de respaldo.
- Ejecutar `npm run lint` para garantizar 0 errores de sintaxis y estilos.

### Manual Verification
- **Prueba de Exportación (Navegador/Dev):** Hacer clic en "Exportar Respaldo" y verificar que se descargue un archivo `.json` legible con la estructura de perfiles, reportes y Base64.
- **Prueba de Purga:** Hacer clic en "Eliminar Datos", confirmar y verificar que la app redirija al Onboarding de primer uso con las tablas vacías.
- **Prueba de Importación:** Cargar el archivo exportado anteriormente y comprobar que se restauren el perfil del usuario, las empresas (incluyendo sus logos), las plantillas creadas y los reportes con sus respectivas fotos de hallazgos.
- **Prueba en Dispositivo Móvil:** Compilar la versión de prueba y verificar que "Exportar Respaldo" active el Share Sheet nativo del dispositivo (Android) permitiendo guardarlo en Google Drive o compartirlo por chat.
