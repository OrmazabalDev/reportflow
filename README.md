# ReportFlow - Inspecciones y Auditorías Local-First

ReportFlow es una aplicación de inspecciones y auditorías **local-first** y **offline-first** diseñada para profesionales en terreno (prevencionistas de riesgos, inspectores de calidad e ingenieros de obra). Permite capturar hallazgos con imágenes, responder listas de control (checklists) y generar reportes profesionales en formato PDF de manera 100% autónoma y sin dependencias de red en la nube.

---

## 🚀 Características Principales

* **Local-First & Offline-First:** Toda la metadata de reportes y las imágenes de evidencia se guardan localmente en IndexedDB. No se requiere conexión a internet para usar la app ni para generar archivos PDF.
* **Privacidad Absoluta (Zero-Cloud):** Ningún dato personal, firma o hallazgo técnico es enviado a servidores externos. Cumple por defecto con normativas de secreto industrial y privacidad de datos.
* **Generación de PDF Ultra-Rápida:** El motor de PDF integrado compila el reporte final directo en la memoria del dispositivo en menos de 2 segundos.
* **Branding Flexible:** Guarda múltiples empresas con su logo e inyéctalas dinámicamente en tus reportes para cambiar de identidad visual en segundos.
* **Portabilidad mediante Respaldos:** Exporta toda tu base de datos local y fotos integradas a un único archivo JSON para compartirlo, enviarlo por WhatsApp o restaurarlo en otro dispositivo.
* **Compacto & Profesional:** Cabecera horizontal compacta, marcas corporativas personalizadas, firmas opcionales y grilla de fotos inteligente (1 foto a ancho completo o 2+ fotos en doble columna).

---

## 🛠️ Stack Tecnológico

* **Core Framework:** Next.js 16 (React 19) compilado como Static Page Application (SPA).
* **Diseño Visual:** CSS Vanilla y TailwindCSS con soporte responsivo móvil y modo oscuro.
* **Base de Datos Local:** IndexedDB estructurada mediante el wrapper `idb`.
* **Almacén de Archivos:** IndexedDB dedicada (`reportflow-files-db`) que guarda imágenes binarias como `Uint8Array`.
* **Motor PDF:** `pdf-lib` (Compilador de PDF nativo en JS ejecutado en el cliente).
* **Compilación Nativa:** Capacitor.js (v6) para empaquetado híbrido nativo en Android.

---

## ⚙️ Scripts de Desarrollo y Calidad

El proyecto incluye un flujo de mantenimiento estructurado para el control de calidad técnica:

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar exportación estática de Next.js
npm run build

# Ejecutar el linter estático de código
npm run lint

# Validar los tipos de TypeScript en el código fuente
npm run typecheck

# Ejecutar la suite de pruebas unitarias (Vitest)
npm run test

# Ejecutar pruebas End-to-End (Playwright)
npm run e2e

# Ejecutar auditoría de vulnerabilidades de paquetes
npm run audit:deps

# Auditar archivos huérfanos o código muerto (Knip)
npm run audit:deadcode

# Sincronizar assets estáticos con el proyecto Android
npm run android:sync

# Compilar el APK debug nativo (Android)
npm run android:debug
```

---

## 📖 Estructura de Documentación (`docs/`)

La documentación oficial del proyecto está organizada de la siguiente manera:

* **`docs/builds/`:** Historial de walkthroughs y planes de implementación de cada build.
* **`docs/design/`:** Especificaciones del sistema visual de diseño, wireframes y auditorías de interfaz.
* **`docs/technical/`:** Guías de arquitectura, modelo IndexedDB, motores de generación de PDF y guías de Gradle.
* **`docs/product/`:** Hojas de ruta del roadmap y ficha comparativa comercial contra competidores del mercado.
* **`docs/compliance/`:** Planificación legal de protección de datos personales offline.
