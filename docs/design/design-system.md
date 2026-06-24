# Sistema de Diseño: ReportFlow Native UI

Este documento establece las directrices visuales, variables CSS y fichas técnicas de experiencia táctil para el sistema de diseño **ReportFlow Native UI**.

---

## 1. Colores y Branding

El esquema de color está optimizado para legibilidad bajo condiciones de sol intenso (terreno) y contraste accesible (WCAG AA).

### Colores de Marca (CSS Variables)
```css
:root {
  /* Identidad Primaria (Azul Corporativo Intenso) */
  --rf-primary: #1e3a5f;
  --rf-primary-light: #2c548a;
  --rf-primary-dark: #12253f;
  --rf-primary-rgb: 30, 58, 95;

  /* Fondo de Aplicación */
  --rf-background: #f8fafc;
  --rf-surface: #ffffff;
  
  /* Textos */
  --rf-text-main: #0f172a;
  --rf-text-muted: #64748b;
  --rf-text-light: #94a3b8;

  /* Bordes */
  --rf-border: #e2e8f0;
  --rf-border-hover: #cbd5e1;

  /* Estados de Negocio */
  --rf-success: #10b981;
  --rf-success-bg: #ecfdf5;
  --rf-success-border: #a7f3d0;

  --rf-warning: #f59e0b;
  --rf-warning-bg: #fffbeb;
  --rf-warning-border: #fef3c7;

  --rf-error: #ef4444;
  --rf-error-bg: #fef2f2;
  --rf-error-border: #fee2e2;

  --rf-info: #3b82f6;
  --rf-info-bg: #eff6ff;
  --rf-info-border: #bfdbfe;
}
```

---

## 2. Tipografía y Escalas

Utilizamos tipografía del sistema para máximo rendimiento nativo (Roboto en Android, San Francisco en iOS, Segoe UI en Windows).

| Rol Visual | Peso de Fuente | Tamaño (px / rem) | Espaciado entre Líneas |
| :--- | :--- | :--- | :--- |
| **Título AppBar** | Bold (700) | `18px` / `1.125rem` | `1.25` |
| **Título Sección** | ExtraBold (800) | `16px` / `1rem` | `1.3` |
| **Texto de Tarjeta** | SemiBold (600) | `14px` / `0.875rem` | `1.35` |
| **Texto de Cuerpo** | Regular (400) | `14px` / `0.875rem` | `1.4` |
| **Texto Secundario / Nota** | Medium (500) | `12px` / `0.75rem` | `1.4` |
| **Insignias / Badges** | Bold (700) | `11px` / `0.6875rem` | `1` |

---

## 3. Radios y Sombras (Premium Feel)

Para alejarse de plantillas genéricas, combinamos curvas pronunciadas con sombras muy tenues y elegantes.

* **Radios de Botones (`--rf-radius-btn`):** `12px` (`rounded-xl`).
* **Radios de Tarjetas (`--rf-radius-card`):** `18px` (`rounded-[18px]`).
* **Radios de Diálogos / Sheets (`--rf-radius-sheet`):** `24px` (`rounded-t-[24px]` o `rounded-[24px]`).

### Sombras
* **Sombra de Tarjeta (`--rf-shadow-sm`):** `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)`
* **Sombra de Contenedores (`--rf-shadow-md`):** `0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)`
* **Sombra de Hojas Inferiores (`--rf-shadow-lg`):** `0 -10px 15px -3px rgba(0, 0, 0, 0.05), 0 -4px 6px -2px rgba(0, 0, 0, 0.02)`

---

## 4. Touch Targets (UX Móvil Adaptativa)

En condiciones operativas de terreno, el usuario no debe errar el toque.

* **Objetivo de Toque Mínimo:** Todos los elementos interactivos (botones, checks, inputs, selects, botones de borrado) deben medir como mínimo **`44px` x `44px`** de área táctil.
* **Separación de Objetivos:** Margen mínimo de `8px` entre botones adyacentes para evitar toques accidentales.

---

## 5. Estados Visuales Interactivos

1. **Estado Activo (Active State):**
   * Botones y tarjetas al presionarse deben aplicar una transición sutil de escala: `active:scale-[0.97]` o `active:scale-[0.98]`.
   * Ofrece feedback inmediato de que el sistema recibió el clic nativo.
2. **Estado Enfocado (Focus State):**
   * Los inputs en foco deben destacar con un borde de `var(--rf-primary)` y un anillo de brillo transparente: `focus:ring-4 focus:ring-[var(--rf-primary)]/10`.
3. **Estado Deshabilitado (Disabled):**
   * Opacidad al `50%`, cursor `not-allowed`.
