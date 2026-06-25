import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { saveLivestreamAction } from "@/app/admin/actions";
import { QueryNotice, formatDateTime, StatusBadge } from "@/app/admin/shared";
import { getLivestreamAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminLivestreamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [streams, query] = await Promise.all([getLivestreamAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Livestreams"
        title="Broadcast scheduling"
        description="Prepare broadcast links, backup destinations and status overrides for live memorial coverage."
      />
      <QueryNotice searchParams={query} />

      <div className="adminRecordStack">
        <form action={saveLivestreamAction} className="form">
          <AdminFormSection title="Create livestream">
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
                Event slug
                <input name="event_slug" />
              </label>
              <label>
                Platform
                <input name="platform" defaultValue="YouTube" />
              </label>
              <label>
                Scheduled start
                <input name="scheduled_start" type="datetime-local" />
              </label>
              <label>
                Status
                <select name="status" defaultValue="scheduled">
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
            <label>
              Embed URL
              <input name="embed_url" />
            </label>
            <label>
              External URL
              <input name="external_url" />
            </label>
            <label>
              Backup URL
              <input name="backup_url" />
            </label>
            <label>
              Backup message
              <textarea name="backup_message" rows={3} />
            </label>
            <label>
              Publication state
              <select name="publication_state" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Create livestream" />
        </form>

        {streams.map((stream: any) => (
          <form key={stream.id} action={saveLivestreamAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={stream.id} />
            <AdminFormSection title={stream.title} description={formatDateTime(stream.scheduled_start || stream.scheduledStart)}>
              <div className="adminMetaRow">
                <StatusBadge status={stream.status} />
                <StatusBadge status={stream.publication_state || "draft"} />
              </div>
              <div className="formGrid">
                <label>
                  Title
                  <input name="title" defaultValue={stream.title} required />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={stream.slug} required />
                </label>
                <label>
                  Event slug
                  <input name="event_slug" defaultValue={stream.event_slug || stream.eventSlug || ""} />
                </label>
                <label>
                  Platform
                  <input name="platform" defaultValue={stream.platform || "YouTube"} />
                </label>
                <label>
                  Scheduled start
                  <input name="scheduled_start" type="datetime-local" defaultValue={stream.scheduled_start || ""} />
                </label>
                <label>
                  Actual start
                  <input name="actual_start" type="datetime-local" defaultValue={stream.actual_start || ""} />
                </label>
                <label>
                  End time
                  <input name="end_time" type="datetime-local" defaultValue={stream.end_time || ""} />
                </label>
                <label>
                  Status
                  <select name="status" defaultValue={stream.status || "scheduled"}>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
              </div>
              <label>
                Embed URL
                <input name="embed_url" defaultValue={stream.embed_url || stream.embedUrl || ""} />
              </label>
              <label>
                External URL
                <input name="external_url" defaultValue={stream.external_url || stream.externalUrl || ""} />
              </label>
              <label>
                Backup URL
                <input name="backup_url" defaultValue={stream.backup_url || ""} />
              </label>
              <div className="formGrid">
                <label>
                  Manual status override
                  <input name="manual_status_override" defaultValue={stream.manual_status_override || ""} />
                </label>
                <label>
                  Recording URL
                  <input name="recording_url" defaultValue={stream.recording_url || ""} />
                </label>
                <label>
                  Publication state
                  <select name="publication_state" defaultValue={stream.publication_state || "draft"}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
              </div>
              <label>
                Backup message
                <textarea name="backup_message" rows={3} defaultValue={stream.backup_message || ""} />
              </label>
            </AdminFormSection>
            <AdminSaveBar label="Save livestream" />
          </form>
        ))}
      </div>
    </section>
  );
}
