import { openDB, type IDBPDatabase } from "idb";
import type { FileService } from "@/lib/domain/FileService";

interface FileStoreDB {
  files: {
    key: string;
    value: {
      id: string;
      content: Uint8Array;
      type: string;
      createdAt: string;
    };
  };
}

const DB_NAME = "reportflow-files-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FileStoreDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<FileStoreDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export class BrowserFileService implements FileService {
  async saveImage(file: File): Promise<string> {
    const compressedBlob = await this.compressImage(file);
    const arrayBuffer = await compressedBlob.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    
    const id = `local-img-${crypto.randomUUID()}`;
    const db = await getDb();
    
    await db.put("files", {
      id,
      content,
      type: "image/jpeg",
      createdAt: new Date().toISOString(),
    });

    // Return a URI-like string that our UI can intercept or we can use to load it later
    return `local://${id}`;
  }

  async readImage(path: string): Promise<{ content: Uint8Array; type: string }> {
    const id = path.replace("local://", "");
    const db = await getDb();
    const fileRecord = await db.get("files", id);
    
    if (!fileRecord) {
      throw new Error("Imagen no encontrada en almacenamiento local");
    }

    return {
      content: fileRecord.content,
      type: fileRecord.type,
    };
  }

  async deleteImage(path: string): Promise<void> {
    if (!path.startsWith("local://")) return;
    
    const id = path.replace("local://", "");
    const db = await getDb();
    await db.delete("files", id);
  }

  /**
   * Comprime la imagen usando un Canvas HTML, imitando el comportamiento de Sharp
   */
  private compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        let width = img.width;
        let height = img.height;
        const maxWidth = 1800;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del canvas"));
          return;
        }

        // Fill with white background in case of transparent PNGs to JPG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Error al convertir el canvas a blob"));
            }
          },
          "image/jpeg",
          0.84 // 84% quality matching previous Sharp settings
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Error al cargar la imagen para compresión"));
      };

      img.src = url;
    });
  }
}

export const fileService = new BrowserFileService();
