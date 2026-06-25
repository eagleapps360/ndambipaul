import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import AdminTable from "@/components/admin/AdminTable";
import { saveProgrammeEventAction, saveProgrammeItemAction } from "@/app/admin/actions";
import { AdminBackLink, QueryNotice, formatDateTime } from "@/app/admin/shared";
import { getProgrammeAdminDetail } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminProgrammeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const event = await getProgrammeAdminDetail(id);
  if (!event) notFound();

  return (
    <section className="adminPage">
      <AdminBackLink href="/admin/programme" label="Back to programme" />
      <AdminPageHeader
        eyebrow="Programme detail"
        title={event.title}
        description={`Event start: ${formatDateTime((event as any).start_time || (event as any).startTime)}`}
      />
      <QueryNotice searchParams={query} />

      <div className="adminSplitGrid">
        <form action={saveProgrammeEventAction} className="form">
          <input type="hidden" name="id" value={(event as any).id} />
          <AdminFormSection title="Event settings">
            <div className="formGrid">
              <label>
                Title
                <input name="title" defaultValue={event.title} required />
              </label>
              <label>
                Slug
                <input name="slug" defaultValue={(event as any).slug || ""} required />
              </label>
              <label>
                Event type
                <input name="event_type" defaultValue={(event as any).event_type || ""} />
              </label>
              <label>
                Timezone
                <input name="timezone" defaultValue={(event as any).timezone || "Africa/Douala"} />
              </label>
              <label>
                Start time
                <input name="start_time" defaultValue={(event as any).start_time || ""} type="datetime-local" />
              </label>
              <label>
                End time
                <input name="end_time" defaultValue={(event as any).end_time || ""} type="datetime-local" />
              </label>
              <label>
                Venue
                <input name="venue" defaultValue={(event as any).venue || ""} />
              </label>
              <label>
                Publication state
                <select name="publication_state" defaultValue={(event as any).publication_state || "draft"}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea name="description" rows={4} defaultValue={(event as any).description || ""} />
            </label>
            <div className="formGrid">
              <label>
                Address
                <input name="address" defaultValue={(event as any).address || ""} />
              </label>
              <label>
                Map URL
                <input name="map_url" defaultValue={(event as any).map_url || ""} />
              </label>
              <label>
                PDF URL
                <input name="pdf_url" defaultValue={(event as any).pdf_url || ""} />
              </label>
            </div>
          </AdminFormSection>
          <AdminSaveBar label="Save event" />
        </form>

        <form action={saveProgrammeItemAction} className="form">
          <input type="hidden" name="programme_event_id" value={(event as any).id} />
          <AdminFormSection title="Add running-order item">
            <div className="formGrid">
              <label>
                Time label
                <input name="time_label" />
              </label>
              <label>
                Display order
                <input name="display_order" type="number" defaultValue="0" />
              </label>
            </div>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Participant
              <input name="participant_name" />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Add programme item" />
        </form>
      </div>

      <div className="adminRecordStack">
        {(event as any).items?.map((item: any) => (
          <form key={item.id} action={saveProgrammeItemAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="programme_event_id" value={(event as any).id} />
            <AdminFormSection title={item.title} description={`Order ${item.display_order ?? 0}`}>
              <div className="formGrid">
                <label>
                  Time label
                  <input name="time_label" defaultValue={item.time_label || ""} />
                </label>
                <label>
                  Display order
                  <input name="display_order" type="number" defaultValue={String(item.display_order ?? 0)} />
                </label>
              </div>
              <label>
                Title
                <input name="title" defaultValue={item.title} required />
              </label>
              <label>
                Participant
                <input name="participant_name" defaultValue={item.participant_name || ""} />
              </label>
              <label>
                Description
                <textarea name="description" rows={3} defaultValue={item.description || ""} />
              </label>
            </AdminFormSection>
            <AdminSaveBar label="Save programme item" />
          </form>
        ))}
      </div>

      <AdminTable
        columns={["Time", "Title", "Participant"]}
        rows={((event as any).items || []).map((item: any) => ({
          Time: item.time_label || "TBC",
          Title: item.title,
          Participant: item.participant_name || "Not set",
        }))}
        emptyTitle="No programme items yet"
        emptyCopy="Add items above to build the running order for this event."
      />
    </section>
  );
}
