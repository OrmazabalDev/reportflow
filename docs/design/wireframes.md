# Wireframes de Interfaz: ReportFlow Native UI

Este documento proporciona la estructura alámbrica textual (blueprints) de los flujos de pantalla clave diseñados para **ReportFlow Native UI** en dispositivos móviles.

---

## 1. Dashboard (Pantalla de Entrada)
```text
+-------------------------------------------------------------+
|  [Logo / RF] ReportFlow                🔒 Local & Secure   | (RFAppBar compacta)
+-------------------------------------------------------------+
|                                                             |
|  ¡Hola, Juan Doe!                                           |
|  Supervisor de Operaciones                                  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  [+] NUEVO REPORTE                                    |  | (Botón Héroe con degradado)
|  +-------------------------------------------------------+  |
|                                                             |
|  +-----------------------+ +--------------------------+     |
|  | 📁 5 Borradores       | | ✅ 12 Finalizados        |     | (Chips/Tarjetas de métricas)
|  +-----------------------+ +--------------------------+     |
|                                                             |
|  Actividad Reciente                                         |
|  +-------------------------------------------------------+  |
|  | 📄 Reporte Eléctrico Principal                         |  | (RFCard)
|  |   Hace 2 horas · Borrador · 12 checklist ítems        |  |
|  +-------------------------------------------------------+  |
|  | 📄 Inspección de Extintores                           |  |
|  |   Ayer · Finalizado · 5 checklist ítems               |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
|  [🏠 Inicio]     [📋 Plantillas]     [💾 Datos]     [⚙️ Ajustes] | (RFBottomNav de 44px de toque)
+-------------------------------------------------------------+
```

---

## 2. Asistente de Nuevo Reporte
```text
+-------------------------------------------------------------+
|  [<-] Nuevo Reporte                                         | (RFAppBar con retorno)
+-------------------------------------------------------------+
|  Paso 2 de 4: Checklist de Condiciones                      |
|  [===========================>----------------------------] | (Barra de progreso lineal)
|                                                             |
|  Plantilla Activa: Inspección General                       |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  [📖 Usar Plantilla]         [+ Agregar ítem manual]   |  | (Botones táctiles secundarios)
|  +-------------------------------------------------------+  |
|                                                             |
|  Puntos del Checklist (5 cargados)                           |
|  +-------------------------------------------------------+  |
|  | [=] 1. Limpieza y orden de pasillos                   |  | (Handle de arrastre)
|  |     Estado: [ Realizado (v) ]                         |  | (RFStateSelect segmentado)
|  |     Nota: Pasillos limpios y libres de obstáculos.    |  |
|  +-------------------------------------------------------+  |
|  | [=] 2. Estado de extintores                           |  |
|  |     Estado: [ Observado (!) ]                         |  | (Puntos observados tienen borde naranja)
|  |     Nota: Falta manómetro de presión.                 |  |
|  |     [ 📷 Adjuntar foto de hallazgo ]                  |  | (Botón sugerido rápido)
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
|  [ Atrás ]                                   [ Siguiente ]  | (Toolbar inferior)
+-------------------------------------------------------------+
```

---

## 3. Selector de Estado (RFStateSelect)
El selector se despliega como una hoja inferior (BottomSheet) para evitar los menús dropdown clásicos del sistema que dificultan el toque.
```text
+-------------------------------------------------------------+
|                                                             |
|                   ====================                      | (Foco de arrastre de hoja)
|  Seleccionar Estado de Condición                            |
|                                                             |
|  ( ) Realizado      (Icono check verde en badge)             | (Opciones de 48px de alto)
|  ---------------------------------------------------------  |
|  ( ) Observado      (Icono alerta naranja en badge)         |
|  ---------------------------------------------------------  |
|  ( ) Pendiente      (Icono reloj gris en badge)             |
|  ---------------------------------------------------------  |
|  ( ) No aplica      (Icono aspa gris en badge)              |
|                                                             |
|  [ Cancelar ]                                               |
+-------------------------------------------------------------+
```

---

## 4. Evidencia Fotográfica (Hallazgos)
```text
+-------------------------------------------------------------+
|  [<-] Nuevo Reporte                                         |
+-------------------------------------------------------------+
|  Paso 3 de 4: Evidencia Fotográfica                         |
|  [========================================>---------------] |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  [📷 Tomar Foto / Subir Imagen]                       |  | (Uploader de área grande táctil)
|  +-------------------------------------------------------+  |
|                                                             |
|  Evidencia Registrada (1 foto)                               |
|  +-------------------------------------------------------+  |
|  | +---------------------------------------------------+ |  |
|  | |                                                   | |  | (Visualización a lo ancho)
|  | |           [ IMAGEN DE EVIDENCIA ]                 | |  |
|  | |                                                   | |  |
|  | +---------------------------------------------------+ |  |
|  | Título: Extintor pasillo B vencido                    |  |
|  | Nota: Se observa carga vencida desde marzo de 2026.   |  |
|  | [ Eliminar Evidencia ]                                |  | (Botón de peligro)
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
|  [ Atrás ]                                   [ Siguiente ]  |
+-------------------------------------------------------------+
```

---

## 5. Biblioteca de Plantillas
```text
+-------------------------------------------------------------+
|  Plantillas Reutilizables                                [+]| (Botón + Nueva Plantilla)
+-------------------------------------------------------------+
|  Formatos guardados en este dispositivo                     |
|                                                             |
|  +-------------------------------------------------------+  |
|  | Inspección General de Oficina                         |  | (RFTemplateCard)
|  | 📝 8 ítems a evaluar                                  |  |
|  | 📊 Usada 15 veces en terreno                          |  |
|  |                                                       |  |
|  | [ Usar Formato ]  [ Editar ]  [ Duplicar ]  [Borrar]  |  | (Acciones directas táctiles)
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | Revisión de Extintores de Incendio                    |  |
|  | 📝 5 ítems a evaluar                                  |  |
|  | 📊 Usada 3 veces en terreno                           |  |
|  |                                                       |  |
|  | [ Usar Formato ]  [ Editar ]  [ Duplicar ]  [Borrar]  |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
|  [🏠 Inicio]     [📋 Plantillas]     [💾 Datos]     [⚙️ Ajustes] |
+-------------------------------------------------------------+
```
