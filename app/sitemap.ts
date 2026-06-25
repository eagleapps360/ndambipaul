import type { MetadataRoute } from "next";
import { getApprovedTributes, getPublishedProgrammeEvents } from "@/lib/content";
import { navigation } from "@/lib/ui-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [programmeEvents, tributes] = await Promise.all([getPublishedProgrammeEvents(), getApprovedTributes()]);
  const staticRoutes = navigation.map((item) => ({
    url: `${base}${item.href}`,
    lastModified: new Date(),
  }));
  const programmeRoutes = programmeEvents.map((event) => ({
    url: `${base}/programme/${event.slug}`,
    lastModified: new Date(event.startTime),
  }));
  const tributeRoutes = tributes.map((tribute) => ({ url: `${base}/tributes/${tribute.slug}`, lastModified: new Date(tribute.submittedAt) }));

  return [...staticRoutes, ...programmeRoutes, ...tributeRoutes];
}
