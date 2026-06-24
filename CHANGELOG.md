# Changelog - ReportFlow

Todos los cambios notables e hitos del proyecto ReportFlow serán documentados en este archivo.

---

## [v0.1.2] - 2026-06-24
### Added (Build 12 - Pruebas Automáticas y Calidad)
* Suite de pruebas unitarias implementada con **Vitest** y **fake-indexeddb** en [utils.test.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/utils.test.ts), [BackupService.test.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/infrastructure/BackupService.test.ts), y [pdf.test.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/pdf.test.ts).
* Pruebas de integración de extremo a extremo (E2E) con **Playwright** en [onboarding-flow.spec.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/e2e/onboarding-flow.spec.ts) y [template-to-pdf.spec.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/e2e/template-to-pdf.spec.ts).
* Documentación técnica formal estructurada en `docs/` (`architecture.md`, `indexeddb.md`, `pdf-generation.md`, `backup-restore.md`, `android-gradle-warnings.md`, `roadmap.md`).
* Configuración de scripts de ciclo de vida (`test`, `e2e`, `typecheck`, `lint`, `android:sync`, `android:debug`) en `package.json`.

### Changed
* Refactorización de funciones puras de procesamiento (`parseBulkItems` y `convertReportToChecklistItems`) a [src/lib/utils.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/utils.ts) para facilitar su testeo unitario.
* Corrección del selector de templates en el flujo E2E para interactuar directamente con el botón de carga.

---

## [v0.1.2-build11] - 2026-06-24
### Added (Build 11 - Finalización y Estabilización)
* Estructura de documentación formal bajo `docs/` organizada en builds, diseño, especificaciones técnicas y legales.
* Reporte de auditoría técnica de limpieza de código en `docs/technical/cleanup-audit-build11.md`.
* Scripts mejorados para testing, auditorías de dependencias, Capacitor sync y compilación Gradle en `package.json`.

### Changed
* Consolidación de modelos de tipo: se eliminó `src/lib/types.ts` y se unificaron todos los modelos a [src/lib/domain/types.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/domain/types.ts).
* Modificados [report-editor.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/report-editor.tsx), [editor-step-summary.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/editor/editor-step-summary.tsx) y [editor-step-info.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/editor/editor-step-info.tsx) para importar tipos desde la ubicación unificada del dominio.

### Removed
* Carpeta obsoleta de base de datos relacional y ORM `prisma/`.
* Dependencias innecesarias `@prisma/client`, `prisma` y `react-hook-form` de `package.json`.
* Carpeta vacía de endpoints API backend `src/app/api/`.
* Componente de interfaz en desuso `src/components/delete-report-button.tsx`.
* Binarios locales `.apk` de la raíz del repositorio.

---

## [v0.1.1] - 2026-06-21
### Added (Build 10 - Productividad y PDF Compacto)
* Función *"Guardar como plantilla"* en el detalle de reportes para clonar checklists de forma independiente en IndexedDB.
* Sección de *"Carga Masiva"* en el creador de plantillas para ingresar ítems uno por línea de forma rápida.
* Opción de checkbox *"Incluir líneas de firma en el PDF"* en el paso de branding del editor (por defecto desactivado en nuevos reportes; compatible en true con antiguos).
* Grilla de fotos inteligente en PDF: 1 foto a ancho completo (499px), 2 o más fotos en grilla de doble columna (240px).
* Badges de color claro con bordes sólidos para los estados en la tabla de checklist del PDF.

### Changed
* Rediseño de cabecera de PDF a dos columnas horizontales compactas (Área y Empresa a la izquierda; Título, autor y fecha a la derecha) reduciendo la altura vertical a 45px.

---

## [v0.1.1] - 2026-06-20
### Added (Build 9 - Privacidad y Copias de Seguridad)
* Clase de servicio `BackupService.ts` para serializar la base de datos de IndexedDB e imágenes binarias en Base64 en un único JSON y restaurarla con limpieza total previa.
* Panel estructurado por pestañas en `/settings` (Perfil & Empresas, Datos & Respaldos, Acerca de con Changelog interactivo).
* Modales legales offline para consultar la Política de Privacidad Local-First y los Términos de Uso.
* Advertencias destructivas con confirmación doble antes de restaurar o purgar información.

### Changed
* Integración nativa de Capacitor con `Filesystem` y `Share` para activar el menú compartir nativo en Android al exportar backups, cayendo a descargas HTML5 en la web.

---

## [v0.1.1] - 2026-06-18
### Added (Build 8 - Corrección de Legibilidad y QA)
* Propiedad de estilo `!text-white` en botones primarios en `button.tsx` para forzar legibilidad clara de textos e iconos contra el color azul institucional.
* Optimización de anchos fluidos y scrolls en el onboarding móvil para evitar desbordamientos.

---

## [v0.1.1] - 2026-06-18
### Added (Build 7 - Perfil Local, Empresas y Onboarding)
* Base de datos local actualizada a versión 3 para incorporar almacenes de perfil de inspector y empresas.
* Pantalla bloqueante de Onboarding inicial para configurar los datos del inspector y la primera empresa corporativa.
* Autocompletado del autor del reporte basado en los datos del perfil local.
* Dropdown *"Autocompletar desde Empresa"* para inyectar logotipos corporativos y marcas de pie de página en los reportes en edición.

---

## [v0.1.0] - 2026-06-01
### Added (Builds 5 y 6 - Checklists y Ordenamiento)
* Selector de estados de checklist mobile (Pendiente, Realizado, Observado, No aplica).
* Ordenamiento por drag and drop en checklists manuales y fotos de hallazgos en IndexedDB.

---

## [v0.1.0] - 2026-05-15
### Added (Builds 1 a 4 - Cimientos y PDF local)
* Generación nativa y offline de PDFs corporativos.
* Empaquetamiento del motor Next.js a APK nativo vía Capacitor.
* Notificador automático de actualizaciones desde servidor en la nube.
