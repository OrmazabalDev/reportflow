# Plan de Implementación: Productividad y PDF Profesional (Build 10)

Este plan de implementación detalla el diseño de las mejoras de usabilidad operativa, la compactación del reporte PDF final y la opción de incluir firmas dinámicamente para la **Build 10**.

---

## Análisis de Impacto y Requisitos

### 1. Guardar reporte como plantilla
* **Ubicación:** [report-detail-view.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/views/report-detail-view.tsx)
* **Comportamiento:** Añadiremos un botón en la barra de herramientas del detalle de un reporte. Al hacer clic, se abrirá un modal de entrada de datos (Nombre de Plantilla y Descripción). Al confirmar, se guardará el nuevo registro en las tiendas de IndexedDB `templates` y `template_items` copiando la lista del checklist del reporte original.
* **Aislamiento:** La plantilla queda completamente desacoplada; cambios futuros en la plantilla no alteran el reporte del que proviene, ni viceversa.

### 2. Creación masiva de ítems en plantillas
* **Ubicación:** [templates-view.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/views/templates-view.tsx)
* **Comportamiento:** Junto al botón "Añadir item" en el editor de plantillas, agregaremos una sección colapsable o botón de alternancia que muestre un `textarea` titulado *"Agregar múltiples ítems (uno por línea)"*.
* **Procesamiento:** Separaremos la entrada usando saltos de línea (`\n`), ignoraremos líneas que solo contengan espacios vacíos, y agregaremos cada línea como un nuevo registro al final del array de ítems de la plantilla en edición.

### 3. PDF compacto y profesional
* **Ubicación:** [pdf.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/pdf.ts)
* **Cambios visuales:**
  * **Cabecera compacta:** Rediseñaremos el encabezado utilizando una cuadrícula horizontal de dos columnas para reducir el uso de espacio vertical.
  * **Contraste de estados:** Delinearemos el contorno y contraste de los estados (*Realizado*, *Observado*, *Pendiente*, *No aplica*) en la tabla de checks.
  * **Grilla inteligente de fotos:**
    * Si hay **1 sola foto**: Se dibuja en una sola columna centrada a ancho completo (`width: pageWidth - margin * 2 = 499px`, `height: 240px`).
    * Si hay **2 o más fotos**: Se utiliza el formato actual de 2 columnas de ancho medio (`width: 240px`).
  * **Paddings y espaciado:** Reduciremos los saltos verticales (`cursorY` decrements) y el relleno interno de las celdas del checklist para lograr un reporte más condensado.

### 4. Firmas opcionales simples
* **Estructura de datos (sin migración IndexedDB):**
  * Agregaremos `includeSignatures?: boolean` en la definición de la entidad `Report` y `ReportFormValues` en [types.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/domain/types.ts).
  * Dado que las bases de datos de IndexedDB no son estrictas relacionales, no requerimos elevar `DB_VERSION` ni aplicar script de migración destructivo; guardaremos la propiedad directamente al objeto JavaScript persistido.
* **Interfaz de edición:**
  * Añadiremos un checkbox/switch en la sección de branding en [editor-step-info.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/editor/editor-step-info.tsx) etiquetado como *"Incluir líneas de firma en el PDF"*.
  * **Valores por defecto:**
    * Reportes nuevos: `false` (por defecto desmarcado).
    * Reportes históricos (donde la propiedad no existe): fallback automático en `true` para asegurar retrocompatibilidad y no alterar PDFs de reportes ya existentes.

---

## Cambios Propuestos por Componente

### [Domain Model & Repository]

#### [MODIFY] [types.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/domain/types.ts)
* Añadir la propiedad opcional a los tipos de reportes:
  ```typescript
  export type Report = {
    ...
    includeSignatures?: boolean;
  };
  export type ReportFormValues = {
    ...
    includeSignatures: boolean;
  };
  ```

#### [MODIFY] [IndexedDbReportRepository.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/infrastructure/IndexedDbReportRepository.ts)
* Ajustar `getReportForEdit` para retornar la propiedad:
  ```typescript
  includeSignatures: report.includeSignatures ?? true, // Fallback en true para antiguos
  ```
* Ajustar `saveReport` para persistir la propiedad:
  ```typescript
  includeSignatures: input.includeSignatures ?? false, // Default false para nuevos
  ```

---

### [Views & Interfaz]

#### [MODIFY] [report-detail-view.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/views/report-detail-view.tsx)
* Agregar botón *"Guardar como plantilla"* en la barra de acciones.
* Agregar estado de React para controlar un modal con campos `templateName` y `templateDescription`.
* Al confirmar, mapear los `report.checklistItems` a un array de objetos con `{ text: item.text, note: item.note || "" }` y enviarlos a `templateRepository.saveTemplate()`.

#### [MODIFY] [editor-step-info.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/editor/editor-step-info.tsx)
* Renderizar checkbox de firmas en el primer paso del editor:
  ```tsx
  <label className="flex items-center gap-2 cursor-pointer pt-2">
    <input
      type="checkbox"
      checked={watchSignatures} // Vinculado a react-hook-form
      onChange={(e) => setValue("includeSignatures", e.target.checked)}
      className="rounded border-slate-300 text-[var(--rf-primary)]"
    />
    <span className="text-xs font-semibold text-slate-700">Incluir líneas de firma en el PDF</span>
  </label>
  ```

#### [MODIFY] [templates-view.tsx](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/components/views/templates-view.tsx)
* Agregar un modal o sección de texto para inserción masiva.
* Al procesar:
  ```typescript
  const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
  const newItems = lines.map(line => ({ text: line, note: "" }));
  setItems(current => [...current, ...newItems]);
  ```

---

### [PDF Compilation Engine]

#### [MODIFY] [pdf.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/pdf.ts)
* **Encabezado horizontal compacto:**
  Remplazar el dibujo en cascada vertical de metadatos por una distribución tabular:
  * Columna 1: Nombre de Empresa y Área/Unidad.
  * Columna 2: Título del Reporte, Autor y Fecha.
* **Condicional de firmas:**
  ```typescript
  if (report.includeSignatures !== false) {
    // Dibujar bloque de firmas actual
  }
  ```
* **Redefinir grilla de fotos:**
  ```typescript
  if (report.findings.length === 1) {
    // Dibujar 1 sola imagen a ancho completo (e.g. width: pageWidth - margin * 2)
  } else {
    // Dibujar grilla actual de 2 columnas
  }
  ```

---

## Plan de Verificación

### Pruebas Automatizadas
* Ejecutar compilación Next.js (`npm run build`).
* Ejecutar análisis estático linter (`npm run lint`).

### Verificación Manual
1. **Flujo de Copiado:** Crear un reporte real, ir al detalle, presionar "Guardar como plantilla", ingresar nombre, y comprobar en `/templates` que aparezca la plantilla nueva y que se pueda usar al crear un nuevo reporte.
2. **Pegado Masivo:** Abrir el creador de plantillas, pegar una lista de 5 ítems uno por línea en la caja masiva, confirmar y verificar que la grilla cree 5 ítems individuales de forma inmediata.
3. **Formatos PDF:**
   - Exportar reporte con firmas activadas y desactivadas, comprobando la presencia o ausencia del bloque inferior.
   - Exportar reporte con 1 foto y verificar que se expanda a ancho completo.
   - Exportar reporte con 3 fotos y verificar que mantenga la grilla de dos columnas.
