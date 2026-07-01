import type { MetadataRoute } from "next";
import { getApprovedTributesUncached } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tributes = await getApprovedTributesUncached();
  const staticRoutes = ["/", "/biography", "/tributes", "/gallery", "/programme", "/livestreams", "/teams", "/donations", "/coordinators"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));
  const tributeRoutes = tributes.map((tribute) => ({ url: absoluteUrl(`/tributes/${tribute.slug}`), lastModified: new Date(tribute.publishedAt || tribute.submittedAt) }));

  return [...staticRoutes, ...tributeRoutes];
}
