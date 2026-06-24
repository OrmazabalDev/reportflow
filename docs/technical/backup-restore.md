# Especificación de Respaldo y Restauración (Backup & Restore)

Este documento detalla la estructura y el mecanismo de serialización del archivo de copia de seguridad JSON utilizado para transferir datos de ReportFlow entre dispositivos sin conexión en la nube.

---

## 1. Esquema del Respaldo JSON (`BackupPayload`)

El archivo generado es un único archivo JSON codificado en UTF-8 con la siguiente estructura tipada:

```typescript
export type BackupPayload = {
  version: number;          // Versión del backup (para migraciones futuras)
  exportedAt: string;       // Fecha de exportación ISO String
  appVersion: string;       // Versión de la app (ej: v0.1.1)
  buildNumber: string;      // Compilación interna (ej: 11)
  profile: UserProfile | null;
  companies: Company[];
  templates: Template[];
  template_items: TemplateItem[];
  reports: Report[];
  findings: Finding[];
  checklist_items: ChecklistItem[];
  images: {
    id: string;             // Identificador de la imagen (ej: local-img-...)
    contentBase64: string;  // DataURL o bytes binarios codificados en Base64
    type: string;           // MIME type (ej: image/jpeg)
    createdAt: string;
  }[];
};
```

---

## 2. Flujo de Exportación

1. Se recupera el perfil del inspector, la lista de empresas, plantillas y reportes de la base de datos `reportflow-db`.
2. Se leen todas las imágenes (logos y fotos de hallazgos) en formato `Uint8Array` desde `reportflow-files-db`.
3. Se convierten los bytes de cada imagen a una cadena Base64 para poder integrarlos de forma segura en un campo de texto plano dentro del JSON.
4. Se empaqueta el payload y se genera la descarga (Web) o se invoca a `@capacitor/share` para desplegar el menú nativo de Android.

---

## 3. Flujo de Importación y Restauración

1. **Validación del JSON:** Se verifica la presencia de claves críticas (`profile`, `companies`, `reports`, `images`).
2. **Purgado de Datos:** Se ejecuta una purga masiva de todas las tiendas de IndexedDB en ambas bases de datos locales para asegurar un entorno de restauración limpio.
3. **Conversión Base64 a Binario:** Se recorren las imágenes, decodificando el Base64 de vuelta a `Uint8Array` e insertándolas en `reportflow-files-db`.
4. **Inserción de Metadata:** Se inserta el resto de los registros en `reportflow-db`.
5. **Recarga de Aplicación:** Se fuerza un refresco de pantalla (`window.location.reload()`) para sincronizar el estado global en tiempo real.
