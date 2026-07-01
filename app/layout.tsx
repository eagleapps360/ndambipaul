import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import DevImageProbe from "@/components/DevImageProbe";
import Header from "@/components/Header";
import LivestreamNotice from "@/components/LivestreamNotice";
import { getPublicSiteSettings, getPublishedLivestreams } from "@/lib/content";
import { assertEnvironmentReady } from "@/lib/env";
import { criticalMemorialImages } from "@/lib/public-image-fallbacks";
import { buildPersonJsonLd, buildWebsiteJsonLd } from "@/lib/structured-data";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import "./globals.css";

const verification = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Pa Ndambi Paul Angemba | Life and Legacy",
    template: "%s | Pa Ndambi Paul Angemba",
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.shortName,
  referrer: "origin-when-cross-origin",
  category: siteConfig.category,
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  keywords: [
    "Pa Ndambi Paul Angemba",
    "Pa Ndambi memorial",
    "memorial website",
    "tributes",
    "funeral programme",
    "livestreams",
    "Cameroon memorial",
  ],
  alternates: {
    canonical: siteConfig.url,
  },
  manifest: "/manifest.webmanifest",
  verification,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  creator: "Pa Ndambi Memorial Family Committee",
  publisher: "Pa Ndambi Memorial Family Committee",
  openGraph: {
    type: "website",
    siteName: siteConfig.shortName,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: "Pa Ndambi Paul Angemba | Life and Legacy",
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.defaultOgImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pa Ndambi Paul Angemba | Life and Legacy",
    description: siteConfig.description,
    images: [siteConfig.defaultOgImage],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  assertEnvironmentReady();
  const [site, livestreams] = await Promise.all([getPublicSiteSettings(), getPublishedLivestreams()]);

  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === "development" ? <DevImageProbe paths={criticalMemorialImages} /> : null}
        <Header brandLabel={site.shortTitle} />
        <LivestreamNotice streams={livestreams} />
        {children}
        <JsonLd
          data={[
            buildWebsiteJsonLd(),
            buildPersonJsonLd(),
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: siteConfig.name,
              url: absoluteUrl("/"),
              description: siteConfig.description,
            },
          ]}
        />
      </body>
    </html>
  );
}
