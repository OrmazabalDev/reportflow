# Guía de Compilación y Advertencias de Android Gradle

Este documento describe la resolución de advertencias de compilación Gradle recurrentes en el entorno Android y las configuraciones sugeridas para Windows.

---

## 1. Advertencia de Repositorios FlatDir

### Mensaje:
`WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.`

### Contexto:
Capacitor utiliza `flatDir` para buscar dependencias de plugins locales (`capacitor-cordova-android-plugins`) en lugar de repositorios Maven estructurados.

### Resolución:
Esta advertencia la emite el compilador Gradle nativo de Android Studio y no bloquea ni rompe la compilación. Para silenciarla o resolverla, se debe esperar a que las APIs de empaquetado de plugins de Capacitor sean actualizadas por el equipo de Ionic. Se puede compilar con seguridad ignorando este mensaje.

---

## 2. Bloqueos de Archivos en Windows (Directory Locking)

### Mensaje:
`java.io.IOException: Unable to delete directory .../build/intermediates/...`

### Contexto:
Ocurre en Windows porque el Daemon de Gradle, la JVM o el IDE mantienen bloqueados los ficheros temporales e intermedios creados durante la compilación.

### Soluciones recomendadas:
1. **Desactivar el Daemon:** Asegurar la línea `org.gradle.daemon=false` en `android/gradle.properties`.
2. **Detener Daemons Activos:**
   ```bash
   cd android
   .\gradlew --stop
   ```
3. **Borrado Forzado de Temporales:** Si Gradle clean sigue fallando, ejecute en PowerShell:
   ```powershell
   Remove-Item -Recurse -Force android/build, android/app/build
   ```
   Y luego proceda con la compilación normal.
