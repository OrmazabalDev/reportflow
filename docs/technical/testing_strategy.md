# Estrategia de Testing y Calidad

Este documento define la estructura, frameworks y políticas de pruebas automatizadas adoptadas para el proyecto ReportFlow a partir de la Build 12.

---

## 1. Niveles de Pruebas Adoptados

ReportFlow utiliza dos niveles de pruebas automatizadas complementarias para asegurar la estabilidad offline-first:

```mermaid
graph TD
    subgraph Pruebas Unitarias (Vitest)
        Units[Helpers de Utilidad]
        Backup[Mecanismos de Backup/Restore]
        PDF[Compilador PDF-Lib Layouts]
    end
    subgraph Pruebas E2E (Playwright)
        Onboard[Flujo de Onboarding & Perfiles]
        CheckTpl[Flujo de Plantillas, Reporte & Descargas]
    end
```

### A. Pruebas Unitarias (Vitest + JSDOM)
* **Objetivo:** Validar lógica de negocio, parsing, serializaciones Base64 y dibujo estructural en memoria de PDF sin dependencias de red ni montado de componentes React.
* **IndexedDB Mocking:** Se utiliza `fake-indexeddb/auto` para levantar bases de datos IndexedDB en memoria idénticas a las de producción antes de cada prueba. Esto permite validar los flujos de exportación, importación y purga del `BackupService` de forma rápida y reproducible.
* **Mocking de Archivos:** Se simula la lectura de imágenes de la galería/cámara interceptando `fileService.readImage`.

### B. Pruebas End-to-End (Playwright)
* **Objetivo:** Simular interacciones completas y reales de usuarios sobre un navegador Chromium real.
* **Flujos Cubiertos:**
  1. Onboarding inicial bloqueante, persistencia del perfil y empresa, y redirección al Dashboard con iniciales correctas.
  2. Creación masiva de ítems de plantillas, carga del checklist en un reporte nuevo, modificación de estados del checklist, guardado del reporte como plantilla y validación de descarga de archivo PDF.

---

## 2. Scripts y Comandos de Calidad

Los comandos configurados en `package.json` para control de calidad son:

```bash
# Correr pruebas unitarias (Vitest)
npm run test

# Correr pruebas unitarias en modo watcher interactivo
npm run test:watch

# Ejecutar pruebas E2E (Playwright) en segundo plano (headless)
npm run e2e

# Verificar tipado de TypeScript en todo el proyecto
npm run typecheck

# Validar sintaxis y buenas prácticas de React/Next.js
npm run lint

# Auditar dependencias en package.json en busca de vulnerabilidades
npm run audit:deps

# Identificar código muerto y exports huérfanos
npm run audit:deadcode
```
