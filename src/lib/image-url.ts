/**
 * Convert common image host share links into a URL usable in <img>/next/image.
 * Google Drive "share" links are not direct image URLs until rewritten.
 */
export function normalizeImageUrl(input: string): string {
  const raw = input.trim();
  if (!raw) return raw;

  try {
    const url = new URL(raw);

    if (
      url.hostname === "drive.google.com" ||
      url.hostname === "www.drive.google.com"
    ) {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const idFromUc = url.searchParams.get("id");
      const id =
        fileMatch?.[1] ||
        idFromUc ||
        url.searchParams.get("ids");

      if (id) {
        // Thumbnail endpoint embeds more reliably than /uc?export=view
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
      }
    }

    return raw;
  } catch {
    return raw;
  }
}

export function isUnsplashImage(url: string) {
  try {
    return new URL(url).hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export function isDriveImage(url: string) {
  try {
    const host = new URL(url).hostname;
    return (
      host === "drive.google.com" ||
      host.endsWith(".googleusercontent.com")
    );
  } catch {
    return false;
  }
}

export function isRemoteImage(url: string) {
  return /^https?:\/\//i.test(url.trim());
}
