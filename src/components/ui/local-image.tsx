"use client";

import Image, { ImageProps } from "next/image";
import { useLocalImage } from "@/lib/hooks/use-local-image";

interface LocalImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
}

export function LocalImage({ src, alt, ...props }: LocalImageProps) {
  const resolvedSrc = useLocalImage(src);

  if (!resolvedSrc) {
    return null;
  }

  return <Image src={resolvedSrc} alt={alt || ""} {...props} unoptimized />;
}
