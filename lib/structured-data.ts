import { absoluteUrl, siteConfig, truncateDescription } from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
  };
}

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.personName,
    description: siteConfig.defaultDescription,
    birthDate: "1951-09-14",
    deathDate: "2026-06-07",
    homeLocation: {
      "@type": "Place",
      name: siteConfig.location,
    },
    image: absoluteUrl(siteConfig.defaultOgImage),
    url: siteConfig.url,
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildTributeJsonLd({
  name,
  relationship,
  location,
  path,
  description,
  image,
}: {
  name: string;
  relationship: string;
  location?: string | null;
  path: string;
  description: string;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Tribute from ${name}`,
    description: truncateDescription(description),
    author: {
      "@type": "Person",
      name,
    },
    about: {
      "@type": "Person",
      name: siteConfig.personName,
    },
    articleSection: relationship,
    contentLocation: location ? { "@type": "Place", name: location } : undefined,
    image: image ? [image] : [absoluteUrl(siteConfig.defaultOgImage)],
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function buildProgrammeEventJsonLd({
  title,
  description,
  path,
  startDate,
  locationName,
}: {
  title: string;
  description: string;
  path: string;
  startDate: string;
  locationName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description: truncateDescription(description),
    startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    location: {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
        addressCountry: "CM",
        addressLocality: "Mbengwi",
      },
    },
    image: [absoluteUrl(siteConfig.defaultOgImage)],
    organizer: {
      "@type": "Organization",
      name: "Pa Ndambi Memorial Family Committee",
    },
    about: {
      "@type": "Person",
      name: siteConfig.personName,
    },
    url: absoluteUrl(path),
  };
}
