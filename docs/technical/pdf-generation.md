# Generación de Reportes PDF en Cliente

Este documento describe la lógica de generación del documento de reporte final en formato PDF, administrada directamente en el procesador del dispositivo mediante la librería JS `pdf-lib` en [src/lib/pdf.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/pdf.ts).

---

## 1. Diseño del Documento (A4 / 595.28 x 841.89 pt)

La maquetación se realiza de forma programática calculando coordenadas relativas `cursorY` desde el margen superior al inferior en formato de puntos (72 pt = 1 pulgada).

### A. Encabezado de Dos Columnas Compacto (45px de altura)
* **Columna Izquierda:** Nombre de la empresa asociada y el Área o Unidad inspeccionada. A la izquierda se inserta el logotipo de la corporación escalado a un ancho máximo de 70px.
* **Columna Derecha:** Título del reporte (con saltos de línea automáticos), fecha de creación formateada en formato local, autor del reporte y badge de estado del reporte.

### B. Tabla del Checklist de Inspección
Se dibuja una cuadrícula con anchos de columna fijos:
* **Nº:** 25px
* **Ítem & Nota:** Ancho variable restante
* **Badge de Estado:** 70px de ancho y 14px de alto.
* Los estados del checklist (*Realizado*, *Observado*, *Pendiente*, *No aplica*) se colorean con bordes sólidos y fondos de contraste sutil para garantizar la legibilidad en impresiones blanco y negro.

### C. Distribución Inteligente de Fotos
* **1 sola foto:** Se renderiza centrada a ancho completo de la página (`pageWidth - margin * 2 = 499px`) con una altura de `240px` para destacar la evidencia visual.
* **2 o más fotos:** Se renderizan en una cuadrícula simétrica de dos columnas, de `240px` de ancho y `160px` de alto cada una.

### D. Bloque de Firmas Opcional
Si la propiedad `includeSignatures` del reporte está marcada como `true` (o está ausente), se dibuja una sección inferior de 120px de altura con dos líneas horizontales para firmas: *Firma Responsable* y *Firma Revisión / Aprobación*. Si es `false`, esta sección no se dibuja, ahorrando espacio vertical.

---

## 2. Paginación y Saltos de Página Dinámicos

La app utiliza la función `checkPageBreak(neededSpace)` para calcular de forma predictiva si un elemento (fila de la tabla, imagen de hallazgo o bloque de firmas) desbordará el margen inferior de la página actual. En caso afirmativo, añade una página nueva al documento y restablece `cursorY` al inicio superior de la hoja.
Al final de la generación, se recorren todas las páginas para inyectar la numeración de página dinámica (*Página X / Y*) y la línea de separación del pie de página.
