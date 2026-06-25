const galleryFallbackImages = [
  "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg",
  "/images/pa-ndambi/pa-ndambi-close-portrait.jpg",
  "/images/pa-ndambi/pa-ndambi-beach.jpg",
  "/images/pa-ndambi/pa-ndambi-airport-profile.jpg",
  "/images/pa-ndambi/pa-ndambi-street.jpg",
  "/images/pa-ndambi/pa-ndambi-car-snow.jpg",
  "/images/pa-ndambi/pa-ndambi-olympic-stadium.jpg",
  "/images/pa-ndambi/pa-ndambi-traditional-blue.jpg",
  "/images/pa-ndambi/pa-ndambi-scout-memory.jpg",
] as const;

const placeholderNeedles = [
  "/placeholders/",
  "gallery-1.svg",
  "gallery-2.svg",
  "gallery-3.svg",
  "live-poster.svg",
  "social-preview.svg",
  "portrait.svg",
  "pa-ndambi-main-portrait.png",
] as const;

export const criticalMemorialImages = [
  "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg",
  "/images/pa-ndambi/pa-ndambi-blue-cutout.png",
  ...galleryFallbackImages,
] as const;

function isLocalPath(value: string) {
  return value.startsWith("/");
}

export function isPlaceholderImageUrl(value: string | null | undefined) {
  if (!value) return true;
  return placeholderNeedles.some((needle) => value.includes(needle));
}

export function normalizeImageUrl(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  if (value.startsWith("private:")) return value;
  if (!isLocalPath(value) && /^https?:\/\//i.test(value)) return value;
  if (isPlaceholderImageUrl(value)) return fallback;
  return value;
}

export function getGalleryFallbackImage(index: number) {
  return galleryFallbackImages[index % galleryFallbackImages.length];
}
