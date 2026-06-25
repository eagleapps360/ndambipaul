import { notFound, redirect } from "next/navigation";
import { adminSectionAliases, adminSections } from "@/lib/ui-config";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  await requireAdminProfile();
  const alias = adminSectionAliases[section];
  if (alias) redirect(alias);
  if (adminSections.some((item) => item.slug === section)) notFound();
  notFound();
}
