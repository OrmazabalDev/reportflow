import { useState, useEffect } from "react";
import { fileService } from "@/lib/infrastructure/BrowserFileService";

export function useLocalImage(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    if (!path.startsWith("local://")) {
      setUrl(path);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    fileService
      .readImage(path)
      .then((data) => {
        if (!isMounted) return;
        const blob = new Blob([data.content as unknown as BlobPart], { type: data.type });
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((error) => {
        console.error("Error loading local image:", error);
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [path]);

  return url;
}
