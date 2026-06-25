import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { archiveBiographySectionAction, saveBiographySectionAction } from "@/app/admin/actions";
import { QueryNotice } from "@/app/admin/shared";
import { requireAdminProfile } from "@/lib/auth";
import { getBiographyAdminData } from "@/lib/admin-data";

export default async function AdminBiographyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [sections, query] = await Promise.all([getBiographyAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Biography"
        title="Biography editor"
        description="Draft, reorder, publish and archive the narrative sections shown on the public biography page."
      />
      <QueryNotice searchParams={query} />

      <div className="adminRecordStack">
        <form action={saveBiographySectionAction} className="form">
          <AdminFormSection title="Create a new section" description="Add a new biography block with a slug, summary and publication state.">
            <div className="formGrid">
              <label>
                Title
                <input name="title" required />
              </label>
              <label>
                Slug
                <input name="slug" required />
              </label>
              <label>
                Display order
                <input name="display_order" type="number" defaultValue="0" />
              </label>
              <label>
                Publication state
                <select name="publication_state" defaultValue="draft">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <label>
              Summary
              <textarea name="summary" rows={2} />
            </label>
            <label>
              Body
              <textarea name="body" rows={6} required />
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Create biography section" />
        </form>

        {sections.map((section: any) => (
          <article key={section.id} className="adminRecordCard">
            <form action={saveBiographySectionAction} className="form">
              <input type="hidden" name="id" value={section.id} />
              <AdminFormSection title={section.title} description={`Slug: ${section.slug}`}>
                <div className="formGrid">
                  <label>
                    Title
                    <input name="title" defaultValue={section.title} required />
                  </label>
                  <label>
                    Slug
                    <input name="slug" defaultValue={section.slug} required />
                  </label>
                  <label>
                    Display order
                    <input name="display_order" type="number" defaultValue={String(section.display_order ?? section.displayOrder ?? 0)} />
                  </label>
                  <label>
                    Publication state
                    <select name="publication_state" defaultValue={section.publication_state || "published"}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </div>
                <label>
                  Summary
                  <textarea name="summary" rows={2} defaultValue={section.summary || ""} />
                </label>
                <label>
                  Body
                  <textarea name="body" rows={7} defaultValue={section.body} required />
                </label>
              </AdminFormSection>
              <div className="adminActionRow">
                <AdminSaveBar label="Save biography section" />
              </div>
            </form>
            <form action={archiveBiographySectionAction} className="adminInlineForm">
              <input type="hidden" name="id" value={section.id} />
              <button className="button ghost darkButton" type="submit">
                Archive section
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
