"use client";

import Image, { type ImageProps } from "next/image";
import { isUnsplashImage, normalizeImageUrl } from "@/lib/image-url";

type Props = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * Shared product/media image. Normalizes Drive share links and avoids
 * Next optimizer issues with Google Drive by using unoptimized loading.
 */
export function ProductImage({ src, alt, ...rest }: Props) {
  const url = normalizeImageUrl(src);
  const unsplash = isUnsplashImage(url);

  return (
    <Image
      {...rest}
      src={url}
      alt={alt}
      unoptimized={!unsplash}
    />
  );
}
