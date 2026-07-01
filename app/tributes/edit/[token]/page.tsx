import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TributeEditForm from "@/components/TributeEditForm";
import { resolveStorageObjectUrl } from "@/lib/media/resolve-public-media";
import { getTributeEditTokenRecord } from "@/lib/tribute-edit";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Edit Tribute",
    description: "Secure tribute editing page.",
    path: "/tributes/edit",
    noindex: true,
  });
}

export default async function TributeEditPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isSupabaseConfigured()) {
    notFound();
  }

  const tokenRecord = await getTributeEditTokenRecord(token);
  if (!tokenRecord) {
    notFound();
  }

  const service = createServiceRoleSupabaseClient();
  const { data: tribute } = await service
    .from("tributes")
    .select("id, contributor_name, relationship, location, tribute_message, profile_image_path, profile_image_bucket, profile_image_position")
    .eq("id", tokenRecord.tribute_id)
    .maybeSingle();
  if (!tribute) {
    notFound();
  }

  const profileImageUrl =
    tribute.profile_image_bucket && tribute.profile_image_path
      ? (await resolveStorageObjectUrl(tribute.profile_image_path, tribute.profile_image_bucket))?.url || null
      : null;

  return (
    <main className="pageMain">
      <section className="pageHero narrowHero">
        <p className="kicker">Secure Tribute Update</p>
        <h1>Update your tribute</h1>
        <p>Your current approved tribute remains public while these changes wait for review.</p>
      </section>
      <section className="section splitLayout">
        <div>
          <div className="sectionHead">
            <span>Moderated edits</span>
            <h2>Submit changes safely</h2>
            <p>Text and media updates enter family review before replacing the currently approved public version.</p>
          </div>
        </div>
        <TributeEditForm
          token={token}
          tribute={{
            name: tribute.contributor_name || "",
            relationship: tribute.relationship || "",
            location: tribute.location || "",
            message: tribute.tribute_message || "",
            profileImageUrl,
            profileImagePosition: tribute.profile_image_position || "50% 50%",
          }}
        />
      </section>
    </main>
  );
}
