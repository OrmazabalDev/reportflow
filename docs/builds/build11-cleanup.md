# Plan de Implementación: Limpieza Técnica y Estabilización (Build 11)

Este plan de implementación detalla la estrategia de limpieza y consolidación del proyecto ReportFlow para eliminar deuda técnica acumulada durante las Builds 1 a 10. El objetivo principal es mejorar el mantenimiento, reducir el peso de compilación y evitar duplicaciones sin introducir nuevas funcionalidades.

---

## Estrategia de Auditoría y Clasificación

Crearemos el reporte de auditoría técnica en [cleanup_audit_build11.md](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/docs/technical/cleanup_audit_build11.md) estructurando los hallazgos en cuatro clasificaciones de acción:

* **KEEP:** Código vivo, configs, checkers y código documental indispensable.
* **DELETE:** Rutas obsoletas, dependencias no importadas y componentes muertos.
* **REVIEW:** Código ambiguo (ej: configs de Next/Capacitor o dependencias con carga dinámica).
* **ARCHIVE DOCS:** Planes de implementación, notas de marca y auditorías visuales sueltas que deben guardarse en la carpeta `docs/`.

---

## Plan de Ejecución por Bloques

### 1. Auditoría Inicial
* Ejecutaremos `npm run lint` y `npm run build`.
* Corrernos la herramienta `npx knip` para detectar automáticamente archivos huérfanos, exports sin consumo y dependencias no utilizadas en `package.json`.
* Escribir el reporte inicial de hallazgos en la ruta [cleanup_audit_build11.md](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/docs/technical/cleanup_audit_build11.md).

### 2. Eliminación de Rutas y Backend Obsoleto
* **Rutas dinámicas Next.js:** Verificar la presencia de `/src/app/reports/[id]/` (o subdirectorios antiguos de edición/preview dinámicos) y eliminarlos si la app ahora se maneja completamente por parámetros de consulta (`?id=`).
* **Prisma y Backend Server-side:** Dado que ReportFlow es 100% local-first con IndexedDB y Capacitor, evaluaremos si dependencias como `@prisma/client`, `prisma/`, y archivos de migración deben eliminarse del árbol de producción de manera segura.

### 3. Consolidación de Tipos Duplicados
* **Tipos unificados:** Actualmente existen [lib/domain/types.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/domain/types.ts) y [lib/types.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/types.ts). Consolidaremos las referencias para evitar discrepancias e importar todas las definiciones principales (como `Report`, `Finding`, `Company`, `Template`) desde una única fuente de verdad: [lib/domain/types.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/domain/types.ts).

### 4. Limpieza de Componentes de UI Obsoletos
* Rastrear y borrar componentes UI obsoletos o duplicados de la carpeta `src/components/ui/` y `src/components/views/` que hayan sido reemplazados por componentes del nuevo sistema visual o versiones previas redundantes.

### 5. Reorganización Documental
* Crearemos la estructura de carpetas `docs/` en la raíz del proyecto para archivar la documentación histórica:
  * `docs/builds/` (Walkthroughs y planes de compilaciones anteriores).
  * `docs/planning/` (Auditorías visuales, evaluaciones de marca, etc.).
  * `docs/technical/` (Auditorías de limpieza, guías técnicas de backup y PDF).
* Actualizaremos el archivo [.gitignore](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/.gitignore) para asegurar que outputs locales de builds (`reportbeta.apk`, `*.apk`, `.next/`, `out/`, `android/app/build/`) no se integren accidentalmente a los commits.

---

## Plan de Verificación

* **Validación Linter:** `npm run lint` debe terminar con **0 errores**.
* **Prueba de Compilación Next.js:** `npm run build` debe compilar exitosamente la versión estática.
* **Capacitor Sync:** `npx cap sync android` para comprobar la sincronía de la plataforma nativa.
* **Android Build:** `./gradlew assembleDebug` en la carpeta `android` para certificar la compilación limpia del APK nativo.
