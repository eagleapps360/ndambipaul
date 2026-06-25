import Link from "next/link";
import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import AdminTable from "@/components/admin/AdminTable";
import { saveProgrammeEventAction } from "@/app/admin/actions";
import { QueryNotice, formatDateTime, StatusBadge } from "@/app/admin/shared";
import { getProgrammeAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminProgrammePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [events, query] = await Promise.all([getProgrammeAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Funeral programme"
        title="Programme schedule"
        description="Create ceremony events, manage publication states and open each event to maintain the running order."
      />
      <QueryNotice searchParams={query} />

      <div className="adminSplitGrid">
        <form action={saveProgrammeEventAction} className="form">
          <AdminFormSection title="Create event">
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
                Event type
                <input name="event_type" defaultValue="Memorial service" />
              </label>
              <label>
                Timezone
                <input name="timezone" defaultValue="Africa/Douala" />
              </label>
              <label>
                Start time
                <input name="start_time" type="datetime-local" required />
              </label>
              <label>
                End time
                <input name="end_time" type="datetime-local" />
              </label>
              <label>
                Venue
                <input name="venue" />
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
              Description
              <textarea name="description" rows={4} />
            </label>
            <div className="formGrid">
              <label>
                Address
                <input name="address" />
              </label>
              <label>
                Map URL
                <input name="map_url" />
              </label>
              <label>
                PDF URL
                <input name="pdf_url" />
              </label>
            </div>
          </AdminFormSection>
          <AdminSaveBar label="Create event" />
        </form>

        <AdminTable
          columns={["Event", "Start", "Venue", "State", "Action"]}
          rows={events.map((item: any) => ({
            Event: item.title,
            Start: formatDateTime(item.start_time || item.startTime),
            Venue: item.venue || "TBC",
            State: <StatusBadge status={item.publication_state || "draft"} />,
            Action: (
              <Link className="textLink" href={`/admin/programme/${item.id}`}>
                Edit order
              </Link>
            ),
          }))}
          emptyTitle="No programme events yet"
          emptyCopy="Create the first event to start building the public schedule."
        />
      </div>
    </section>
  );
}
