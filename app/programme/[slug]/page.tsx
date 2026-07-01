import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getProgrammeAnchorBySlug } from "@/lib/programme-content";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Programme",
    description: "Legacy programme routes redirect to the canonical funeral programme page.",
    path: "/programme",
    noindex: true,
  });
}

export default async function ProgrammeDetailRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/programme#${getProgrammeAnchorBySlug(slug)}`);
}
