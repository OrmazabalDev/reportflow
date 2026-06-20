"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { startTransition } from "react";
import { cn } from "@/lib/utils";
import { useLocalImage } from "@/lib/hooks/use-local-image";

type ImageUploaderProps = {
  imagePath: string | null;
  alt: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  aspectClass?: string;
  placeholder?: string;
  uploadLabel?: string;
  changeLabel?: string;
  acceptTypes?: string;
};

export function ImageUploader({
  imagePath,
  alt,
  uploading = false,
  onUpload,
  aspectClass = "aspect-[4/3]",
  placeholder = "Carga una imagen",
  uploadLabel = "JPG, PNG o WEBP hasta 8 MB.",
  changeLabel = "Cambiar imagen",
  acceptTypes = "image/png,image/jpeg,image/webp",
}: ImageUploaderProps) {
  const resolvedImagePath = useLocalImage(imagePath);

  return (
    <div>
      <label
        className={cn(
          "block cursor-pointer overflow-hidden rounded-xl ring-1 ring-dashed ring-[var(--rf-border)] bg-slate-50 transition active:scale-[0.99]",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        {resolvedImagePath ? (
          <div className={cn("relative w-full", aspectClass)}>
            <Image
              src={resolvedImagePath}
              alt={alt}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-xs font-semibold text-white">
              {changeLabel}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 px-4 text-center",
              aspectClass,
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-white ring-1 ring-[var(--rf-border)]">
              <Camera className="size-5 text-[var(--rf-muted)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {placeholder}
              </p>
              <p className="mt-0.5 text-xs text-[var(--rf-muted)]">
                {uploadLabel}
              </p>
            </div>
          </div>
        )}
        <input
          type="file"
          accept={acceptTypes}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              startTransition(() => onUpload(file));
            }
            event.target.value = "";
          }}
        />
      </label>
      {uploading ? (
        <p className="mt-2 text-xs font-medium text-[var(--rf-primary)]">
          Procesando imagen...
        </p>
      ) : null}
    </div>
  );
}
