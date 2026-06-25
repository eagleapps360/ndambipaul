import type { Metadata } from "next";
import DevImageProbe from "@/components/DevImageProbe";
import Header from "@/components/Header";
import { getPublicSiteSettings } from "@/lib/content";
import { assertEnvironmentReady } from "@/lib/env";
import { criticalMemorialImages } from "@/lib/public-image-fallbacks";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  assertEnvironmentReady();
  const site = await getPublicSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.title,
      template: `%s | ${site.shortTitle}`,
    },
    description: site.seo.description,
    keywords: site.seo.keywords,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/favicon.ico"],
    },
    openGraph: {
      title: site.title,
      description: site.seo.description,
      url: siteUrl,
      siteName: site.shortTitle,
      images: [{ url: site.openGraphImage, width: 1200, height: 630, alt: site.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.seo.description,
      images: [site.openGraphImage],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  assertEnvironmentReady();
  const site = await getPublicSiteSettings();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: site.title,
    description: site.seo.description,
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    image: [`${siteUrl}${site.openGraphImage}`],
    organizer: { "@type": "Organization", name: "Pa Ndambi Memorial Family Committee" },
  };

  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === "development" ? <DevImageProbe paths={criticalMemorialImages} /> : null}
        <Header brandLabel={site.shortTitle} />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
