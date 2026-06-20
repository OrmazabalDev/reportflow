import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function exportAndSharePdf(blob: Blob, fileName: string): Promise<boolean> {
  console.log("[PDF] export button clicked");
  console.log("[PDF] native platform:", Capacitor.isNativePlatform());

  if (Capacitor.isNativePlatform()) {
    try {
      // Convert Blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            const b64 = reader.result.split(",")[1];
            resolve(b64);
          } else {
            reject(new Error("Failed to convert blob to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Guardar el PDF temporalmente usando @capacitor/filesystem
      const savedFile = await Filesystem.writeFile({
        path: `reportflow/${fileName}`,
        data: base64,
        directory: Directory.Cache,
        recursive: true,
      });

      // Compartir con @capacitor/share
      await Share.share({
        title: "Reporte PDF",
        text: "Reporte generado por ReportFlow",
        url: savedFile.uri,
        dialogTitle: "Compartir PDF",
      });
      return true;
    } catch (error) {
      console.error("[PDF] Error exporting natively:", error);
      throw new Error("No se pudo exportar el PDF en este dispositivo.");
    }
  } else {
    // Web fallback con anchor download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return true;
  }
}
