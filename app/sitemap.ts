import type { MetadataRoute } from "next";
import { getApprovedTributesUncached, getPublishedProgrammeEventsUncached } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmeEvents, tributes] = await Promise.all([getPublishedProgrammeEventsUncached(), getApprovedTributesUncached()]);
  const staticRoutes = ["/", "/biography", "/tributes", "/gallery", "/programme", "/livestreams", "/teams", "/donations", "/coordinators"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));
  const programmeRoutes = programmeEvents.map((event) => ({
    url: absoluteUrl(`/programme/${event.slug}`),
    lastModified: new Date(event.startTime),
  }));
  const tributeRoutes = tributes.map((tribute) => ({ url: absoluteUrl(`/tributes/${tribute.slug}`), lastModified: new Date(tribute.publishedAt || tribute.submittedAt) }));

  return [...staticRoutes, ...programmeRoutes, ...tributeRoutes];
}
