# Arquitectura de Almacenamiento Local (IndexedDB)

Este documento detalla el esquema y organización de las bases de datos de IndexedDB utilizadas en ReportFlow para lograr persistencia local-first absoluta sin dependencias cloud.

---

## 1. Bases de Datos de la Aplicación

Para separar la metadata de los archivos binarios pesados (imágenes), ReportFlow mantiene dos bases de datos IndexedDB independientes:

1. **`reportflow-db` (Versión 3):** Contiene la información estructurada, configuraciones y registros relacionales del negocio.
2. **`reportflow-files-db` (Versión 1):** Almacén clave-valor dedicado únicamente a almacenar imágenes en formato binario raw (`Uint8Array`/`Blob`).

---

## 2. Tiendas de Datos (Stores) en `reportflow-db`

| Tienda (Store) | Tipo de Clave | KeyPath / Esquema | Descripción |
| :--- | :--- | :--- | :--- |
| **`profile`** | Out-of-line | Ninguno (clave fija `"user"`) | Almacena el perfil del inspector (`UserProfile`). |
| **`companies`** | In-line | `"id"` (UUID) | Empresas creadas por el usuario para branding. |
| **`templates`** | In-line | `"id"` (UUID) | Cabeceras de plantillas de inspección. |
| **`template_items`** | In-line | `"id"` (UUID) | Ítems individuales pertenecientes a cada plantilla. |
| **`reports`** | In-line | `"id"` (UUID) | Cabeceras de reportes generados. |
| **`findings`** | In-line | `"id"` (UUID) | Hallazgos con imágenes asociados a un reporte. |
| **`checklist_items`** | In-line | `"id"` (UUID) | Puntos de inspección contestados en un reporte. |

---

## 3. Versionamiento y Migraciones

El ciclo de vida de la base de datos se administra mediante el wrapper `idb` en [IndexedDbReportRepository.ts](file:///c:/Users/Pancito/Documents/proyectos/portafolio/reportflow/src/lib/infrastructure/IndexedDbReportRepository.ts):

* **Versión 1 & 2:** Creación inicial de las tablas de `reports`, `findings`, `checklist_items`, `templates` y `template_items`.
* **Versión 3 (Build 8):** Introducción de las tablas `profile` y `companies`. Se implementó lógica defensiva utilizando `db.objectStoreNames.contains("...")` para asegurar que las actualizaciones de base de datos no eliminen ni alteren información histórica del usuario durante actualizaciones locales.
