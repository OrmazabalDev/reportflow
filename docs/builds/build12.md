# Plan de Implementación: Pruebas Automáticas y Orden de Proyecto (Build 12)

Este plan de implementación define las tareas necesarias para dotar al proyecto ReportFlow de una suite de pruebas automatizadas (pruebas unitarias con Vitest y pruebas E2E con Playwright), reestructurar los scripts de calidad y mantenimiento en `package.json`, y ordenar la base de documentación del repositorio.

El objetivo principal es asegurar la estabilidad del producto y prevenir regresiones a medida que se implementan futuros cambios visuales o de seguridad.

---

## Cambios Propuestos

### 1. Configuración y Scripts de Calidad

#### package.json
Actualizaremos la sección de scripts y agregaremos dependencias de desarrollo:
* **Scripts a configurar:**
  * `"dev": "next dev"` (Desarrollo local)
  * `"build": "next build"` (Compilación Next.js)
  * `"lint": "eslint"` (Análisis estático)
  * `"typecheck": "tsc --noEmit"` (Verificación de tipos TypeScript)
  * `"test": "vitest run"` (Pruebas unitarias de una sola corrida)
  * `"test:watch": "vitest"` (Pruebas unitarias en modo interactivo)
  * `"e2e": "playwright test"` (Pruebas End-to-End)
  * `"audit:deps": "npm audit"` (Auditoría de vulnerabilidades)
  * `"audit:deadcode": "knip"` (Auditoría de código muerto)
  * `"android:sync": "npx cap sync android"` (Sincronización Capacitor)
  * `"android:debug": "cd android && .\\gradlew assembleDebug"` (Compilación de APK debug local)
* **Nuevas Dependencias de Desarrollo:**
  * `vitest`
  * `fake-indexeddb`
  * `@playwright/test`
  * `jsdom` (entorno de pruebas en navegador para Vitest)

---

### 2. Refactorización para Testeo Unitario

#### utils.ts
Añadiremos dos helpers puros extraídos para que puedan ser probados unitariamente:
1. `parseBulkItems(text: string): { text: string; note: string }[]`
   * Recibe texto multilínea, realiza split, limpia espacios, elimina líneas vacías y mapea a objetos de ítems.
2. `convertReportToChecklistItems(reportItems: { text: string; note?: string | null }[]): { text: string; note: string }[]`
   * Mapea y limpia el checklist del reporte para guardarlo como plantilla independiente.

#### templates-view.tsx
* Modificar `handleProcessBulkItems` para que consuma `parseBulkItems` desde `@/lib/utils`.

#### report-detail-view.tsx
* Modificar el flujo de guardado de plantilla para consumir `convertReportToChecklistItems` de `@/lib/utils`.

---

### 3. Suite de Pruebas Unitarias (Vitest)

#### vitest.config.ts
* Configuración básica de Vitest definiendo el entorno de pruebas `jsdom` y los aliases de TypeScript.

#### utils.test.ts
* Pruebas para `parseBulkItems` (validando saltos de línea múltiples, espacios al inicio/fin e inputs vacíos).
* Pruebas para `convertReportToChecklistItems` (validando el recorte de textos y el fallback de notas vacías).

#### BackupService.test.ts
* Pruebas para exportar e importar datos locales usando `fake-indexeddb`.
* Verificará que al exportar se genere el payload correcto en JSON, y al importar se limpie la base de datos previa y se carguen exactamente las tablas de reportes, empresas y fotos binarias restauradas.

#### pdf.test.ts
* Prueba unitaria para la generación de reportes en PDF:
  * Validar firmas opcionales: verificar que el PDF resultante no incluya el bloque de firmas si `includeSignatures === false`.
  * Validar grilla de imágenes: alimentar `buildReportPdf` con 1 hallazgo vs 3 hallazgos y validar que compile sin errores en el flujo de escala y coordenadas del renderizador.

---

### 4. Pruebas End-to-End (Playwright)

#### playwright.config.ts
* Configuración estándar de Playwright para correr en Chromium/Firefox sin interfaz (headless) apuntando a `http://localhost:3000`.

#### onboarding-flow.spec.ts
* Flujo 1 E2E:
  * Arranca la aplicación (limpia).
  * Verifica el modal de Onboarding.
  * Configura el perfil e ingresa la primera empresa por defecto.
  * Verifica el dashboard cargado y que el menú muestre las iniciales del perfil.
  * Crea un nuevo reporte autocompletando los datos de la empresa recién creada.

#### template-to-pdf.spec.ts
* Flujo 2 E2E:
  * Crea una plantilla de inspección usando inserción masiva de ítems.
  * Inicia un reporte a partir de esa plantilla.
  * Completa el checklist con estados (Realizado, Observado, No aplica).
  * Simula el guardado de ese reporte como una nueva plantilla.
  * Genera el PDF y comprueba que se descargue el archivo final.

---

### 5. Reorganización de Documentos

Moveremos y crearemos una estructura de carpetas limpia y coherente bajo `docs/`:

* **`docs/builds/`** (Historial):
  * `build08.md`
  * `build09.md`
  * `build10.md`
  * `build11-cleanup.md`
  * `build12.md` [NEW] (este documento)
* **`docs/design/`** (Diseño):
  * `design-system.md`
  * `wireframes.md`
  * `ui-audit.md`
* **`docs/technical/`** (Guías técnicas):
  * `cleanup-audit-build11.md`
  * `architecture.md`
  * `indexeddb.md`
  * `pdf-generation.md`
  * `backup-restore.md`
* **`docs/product/`** (Comercial y Roadmap):
  * `competitive-analysis.md`
  * `roadmap.md`
* **`CHANGELOG.md`** [NEW]: Registro comercial e histórico de hitos desde la Build 1 hasta la 11.
* **`README.md`** [MODIFY]: Rediseño enfocado en la descripción de producto local-first y guías de desarrollo nativo.
