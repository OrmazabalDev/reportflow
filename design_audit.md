# Auditoría de Diseño: ReportFlow

Este documento analiza el estado visual y de experiencia de usuario (UX) actual de ReportFlow en su fase de transición hacia un producto híbrido móvil premium (Android con Capacitor).

---

## 1. Dashboard (Vista Principal)

### Estado Actual
* Se compone de un saludo, un resumen numérico superior (Contadores: Borradores, Finalizados, Pendientes) y una lista de reportes recientes con tarjetas de acción rápida.

### Fricciones de UX y Problemas de UI
1. **Acción Principal Comprimida:** El botón de "Nuevo Reporte" no resalta lo suficiente en el diseño móvil; compite visualmente con el botón de "Ajustes" e historial.
2. **Falta de Promesa Local-First:** El usuario abre la app y no recibe confirmación visual explícita de que sus datos están 100% seguros y guardados de forma local (offline-first).
3. **Consumo de Altura Vertical:** En pantallas móviles compactas de 360px, la cabecera del saludo y los contadores se desplazan demasiado hacia abajo, obligando a hacer scroll inmediato para ver el historial.

### Oportunidades de Rediseño
* **Héroe de Acción Centralizada:** Colocar un gran botón de acción principal con gradiente e icono claro para "Crear Reporte".
* **Chip de Seguridad Local:** Inyectar una insignia compacta: `🔒 Datos Guardados en el Dispositivo (Offline)`.
* **Diseño Compacto de Métricas:** Formatear los contadores en una fila horizontal estilizada de chips de colores en lugar de bloques independientes altos.

---

## 2. Editor de Reporte (Flujo Paso a Paso)

### Estado Actual
* Un asistente de pasos en cascada: Portada/Branding, Puntos del Checklist, Evidencia Fotográfica y Guardado.

### Fricciones de UX y Problemas de UI
1. **Paso Indicador Alto:** La barra de progresión de pasos ocupa demasiado espacio en la zona superior y distrae de los formularios reales.
2. **Selector de Empresa Abrupto:** El botón de "Personalizar PDF / Branding" despliega un acordeón muy largo con múltiples inputs que desbordan la página móvil.
3. **Botones de Navegación Flotantes:** Los botones de anterior y siguiente se sitúan en un toolbar flotante inferior que a veces se solapa con el teclado nativo de Android.

### Oportunidades de Rediseño
* **Header de Paso Minimalista:** Reemplazar los grandes círculos de pasos por un indicador de texto superior del tipo: `Paso 2 de 4: Checklist (50%)` con una barra de progreso lineal de `2px` de alto.
* **Branding en BottomSheet:** Mover la selección de logotipo y firmas a una hoja inferior (`BottomSheet`) que solo aparezca al solicitar personalizar, despejando la pantalla principal del editor.

---

## 3. Checklist de Condiciones

### Estado Actual
* Lista vertical con filas que contienen el texto del ítem, una descripción, un selector desplegable de estado (Pendiente, Realizado, Observado, No aplica) y un campo de nota opcional.

### Fricciones de UX y Problemas de UI
1. **Selectores de Estado Genéricos:** El uso de dropdowns (`select`) nativos de HTML requiere múltiples clics y abre diálogos del sistema muy invasivos para cambiar un simple estado.
2. **Reordenación Compleja:** Falta un indicador de arrastre (`handle`) claro para reordenar ítems con `dnd-kit`, lo que confunde al usuario que intenta ordenar su lista.
3. **Falta de Foco en Observados:** Un ítem en estado "Observado" debería resaltar fuertemente para incentivar la captura de una foto de hallazgo posterior.

### Oportunidades de Rediseño
* **Selector Segmentado Táctil:** Reemplazar el `select` por chips segmentados de colores o un BottomSheet rápido con opciones táctiles grandes.
* **Contorno e Indicadores Visuales:** Aplicar un borde izquierdo de color grueso correspondiente al estado (Verde = Realizado, Naranja = Observado, Gris = No aplica) en la tarjeta del ítem.
* **Botón de Vinculación Rápida:** Si un ítem se marca como "Observado", mostrar un botón rápido `[+ Agregar Foto]` directamente debajo para adjuntar evidencia de inmediato.

---

## 4. Hallazgos (Evidencia Fotográfica)

### Estado Actual
* Un listado que permite adjuntar una foto de la galería/cámara, asignarle un título y una descripción de la observación.

### Fricciones de UX y Problemas de UI
1. **Previsualización de Imagen Pequeña:** La imagen cargada se ve muy reducida en el editor, dificultando verificar detalles antes de guardar.
2. **Formulario Repetitivo:** Los inputs de título y descripción consumen espacio valioso si hay múltiples hallazgos.

### Oportunidades de Rediseño
* **Card de Foto Tipo Galería:** Colocar la imagen en un contenedor amplio, y sobreponer el título e icono de borrado en una franja de cristal translúcido (Glassmorphism).

---

## 5. Biblioteca de Plantillas (`/templates`)

### Estado Actual
* Cuadrícula con las plantillas del usuario, indicando cantidad de ítems y botones de duplicar, editar y eliminar.

### Fricciones de UX y Problemas de UI
1. **Flujo de Uso Indirecto:** Para usar una plantilla, actualmente el usuario debe ir a "Nuevo Reporte" y seleccionarla desde allí. No hay un botón directo de "Usar Formato" desde la pantalla de plantillas.

### Oportunidades de Rediseño
* **Acción Directa de Creación:** Añadir un botón principal `[Usar]` en la tarjeta de plantilla que dispare la creación de un nuevo reporte directamente precargado con esa checklist.

---

## 6. Ajustes (`/settings`)

### Estado Actual
* Tres secciones divididas por pestañas: Perfil/Empresas, Respaldos y Acerca de.

### Fricciones de UX y Problemas de UI
1. **Pestañas de Ancho Fijo:** En pantallas Android estrechas, las pestañas de navegación superior se cortan o requieren scrolls incómodos.
2. **Opciones Legales Ocultas:** El enlace a la Política de Privacidad local está mezclado con la purga de datos.

### Oportunidades de Rediseño
* **Diseño Tipo Tarjeta Android:** Estructurar las configuraciones en grupos visuales limpios con iconos descriptivos a la izquierda y botones de alternancia (`switches`) en el extremo derecho.
