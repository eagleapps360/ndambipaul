import type { Metadata } from "next";

const productionUrl = "https://ndambi.org";

export const siteConfig = {
  name: "Celebrating the Life and Legacy of Pa Ndambi Paul Angemba",
  shortName: "Pa Ndambi Memorial",
  personName: "Pa Ndambi Paul Angemba",
  url: productionUrl,
  locale: "en_CM",
  language: "en",
  description:
    "A memorial website celebrating the life, faith, family, service and enduring legacy of Pa Ndambi Paul Angemba.",
  defaultDescription:
    "Celebrating the life, faith, family, service and enduring legacy of Pa Ndambi Paul Angemba, teacher, father, mentor, Scout leader and Christian servant.",
  lifeDates: "14 September 1951 - 7 June 2026",
  location: "Oshie, Njikwa Subdivision, Momo Division, North-West Region, Cameroon",
  defaultOgImage: "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg",
  defaultOgImageAlt: "Pa Ndambi Paul Angemba memorial portrait",
  category: "memorial",
} as const;

function getValidatedBaseUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL;
  if (!candidate) {
    return productionUrl;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return productionUrl;
    }
    return url.origin;
  } catch {
    return productionUrl;
  }
}

export function getSiteUrl() {
  return getValidatedBaseUrl();
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function truncateDescription(description: string, maxLength = 160) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, Math.max(maxLength - 3, 1));
  const safeCut = truncated.lastIndexOf(" ");
  const clipped = (safeCut > Math.floor(maxLength * 0.6) ? truncated.slice(0, safeCut) : truncated).trim();
  return `${clipped}...`.slice(0, maxLength);
}

type PageMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: string[];
  noindex?: boolean;
};

export function buildPageMetadata({
  title,
  description = siteConfig.defaultDescription,
  path = "/",
  image = siteConfig.defaultOgImage,
  imageAlt = siteConfig.defaultOgImageAlt,
  type = "website",
  keywords,
  noindex = false,
}: PageMetadataOptions = {}): Metadata {
  const pageTitle = title || "Life and Legacy";
  const pageDescription = truncateDescription(description);
  const canonical = absoluteUrl(path);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    alternates: {
      canonical,
    },
    category: siteConfig.category,
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            "max-image-preview": "none",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : undefined,
    openGraph: {
      type,
      url: canonical,
      title: title ? `${title} | ${siteConfig.personName}` : `${siteConfig.personName} | Life and Legacy`,
      description: pageDescription,
      siteName: siteConfig.shortName,
      locale: siteConfig.locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${siteConfig.personName}` : `${siteConfig.personName} | Life and Legacy`,
      description: pageDescription,
      images: [image],
    },
  };
}
