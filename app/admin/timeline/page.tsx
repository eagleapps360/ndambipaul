import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { saveTimelineEntryAction } from "@/app/admin/actions";
import { QueryNotice } from "@/app/admin/shared";
import { requireAdminProfile } from "@/lib/auth";
import { getTimelineAdminData } from "@/lib/admin-data";

export default async function AdminTimelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [entries, query] = await Promise.all([getTimelineAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Life timeline"
        title="Timeline editor"
        description="Manage the life milestones, their order and whether each item is visible on the public memorial timeline."
      />
      <QueryNotice searchParams={query} />

      <div className="adminRecordStack">
        <form action={saveTimelineEntryAction} className="form">
          <AdminFormSection title="Create a new timeline entry">
            <div className="formGrid">
              <label>
                Date label
                <input name="date_label" required />
              </label>
              <label>
                Year
                <input name="year" type="number" />
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
                </select>
              </label>
            </div>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Description
              <textarea name="description" rows={4} required />
            </label>
            <label>
              Image reference
              <input name="image_reference" />
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Create timeline entry" />
        </form>

        {entries.map((entry: any) => (
          <form key={entry.id} action={saveTimelineEntryAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={entry.id} />
            <AdminFormSection title={entry.title} description={entry.date_label || entry.dateLabel}>
              <div className="formGrid">
                <label>
                  Date label
                  <input name="date_label" defaultValue={entry.date_label || entry.dateLabel} required />
                </label>
                <label>
                  Year
                  <input name="year" type="number" defaultValue={String(entry.year || "")} />
                </label>
                <label>
                  Display order
                  <input name="display_order" type="number" defaultValue={String(entry.display_order ?? entry.displayOrder ?? 0)} />
                </label>
                <label>
                  Publication state
                  <select name="publication_state" defaultValue={entry.publication_state || "published"}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
              </div>
              <label>
                Title
                <input name="title" defaultValue={entry.title} required />
              </label>
              <label>
                Description
                <textarea name="description" rows={4} defaultValue={entry.description} required />
              </label>
              <label>
                Image reference
                <input name="image_reference" defaultValue={entry.image_reference || entry.imageUrl || ""} />
              </label>
            </AdminFormSection>
            <AdminSaveBar label="Save timeline entry" />
          </form>
        ))}
      </div>
    </section>
  );
}
