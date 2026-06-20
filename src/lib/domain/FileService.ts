export interface FileService {
  /**
   * Procesa, comprime y guarda una imagen (ej. cámara o galería)
   * @param file El archivo Blob/File subido
   * @returns La ruta o URI única generada
   */
  saveImage(file: File): Promise<string>;

  /**
   * Obtiene los bytes (ArrayBuffer) de un archivo previamente guardado
   * @param path La ruta o URI
   */
  readImage(path: string): Promise<{ content: Uint8Array; type: string }>;

  /**
   * Elimina una imagen del almacenamiento
   */
  deleteImage(path: string): Promise<void>;
}
