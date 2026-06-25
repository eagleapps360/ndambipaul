import AdminFilterBar from "@/components/admin/AdminFilterBar";
import { AdminBadge } from "@/components/admin/AdminBadge";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminMediaPreview from "@/components/admin/AdminMediaPreview";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { archiveMediaAction, updateMediaRecordAction } from "@/app/admin/actions";
import { QueryNotice, formatDateTime, readStringParam, StatusBadge } from "@/app/admin/shared";
import { getAdminMediaPreviewMap, getMediaAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "moderator"]);
  const query = await searchParams;
  const status = readStringParam(query.status, "all");
  const kind = readStringParam(query.kind, "all");
  const q = readStringParam(query.q);
  const page = Number(readStringParam(query.page, "1"));
  const pageSize = Number(readStringParam(query.pageSize, "20"));
  const items = await getMediaAdminData({ status, kind, q, page, pageSize });
  const previewMap = await getAdminMediaPreviewMap(items.rows as any);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Media library"
        title="Media review and metadata"
        description="Preview uploaded files, check moderation state and organise them into public albums."
      />
      <QueryNotice searchParams={query} />

      <form className="form">
        <AdminFilterBar>
          <label>
            Status
            <select name="status" defaultValue={status}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label>
            Media type
            <select name="kind" defaultValue={kind}>
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="video">Video</option>
              <option value="document">Documents</option>
            </select>
          </label>
          <label>
            Search contributor
            <input name="q" defaultValue={q} placeholder="Family archive, uploader..." />
          </label>
          <label>
            Page size
            <select name="pageSize" defaultValue={String(items.pageSize)}>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
          <button className="button" type="submit">
            Filter media
          </button>
        </AdminFilterBar>
      </form>

      <div className="adminRecordStack">
        {items.rows.map((item: any) => (
          <form key={item.id} action={updateMediaRecordAction} className="form adminMediaEditorCard">
            <input type="hidden" name="id" value={item.id} />
            <div className="adminMediaEditorLayout">
              <AdminMediaPreview
                kind={item.media_type || item.kind || "image"}
                url={previewMap.get(item.id) || item.publicUrl || null}
                alt={item.alt_text || item.altText || item.title || "Media preview"}
              />
              <div>
                <div className="adminMetaRow">
                  <StatusBadge status={item.moderation_status || (item.approved ? "approved" : "pending")} />
                  {item.featured ? <AdminBadge tone="info">featured</AdminBadge> : null}
                </div>
                <p className="subtle">Uploaded {formatDateTime(item.created_at || item.date)}</p>
                <AdminFormSection title={item.title || item.file_name || "Media record"} description={item.contributor_name || item.contributor || "Uploaded item"}>
                  <div className="formGrid">
                    <label>
                      Title
                      <input name="title" defaultValue={item.title || ""} />
                    </label>
                    <label>
                      Album slug
                      <input name="gallery_album_slug" defaultValue={item.gallery_album_slug || item.albumSlug || ""} />
                    </label>
                    <label>
                      Moderation status
                      <select name="moderation_status" defaultValue={item.moderation_status || "pending"}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </label>
                    <label>
                      Poster storage path
                      <input name="poster_storage_path" defaultValue={item.poster_storage_path || ""} />
                    </label>
                  </div>
                  <label>
                    Caption
                    <textarea name="caption" rows={3} defaultValue={item.caption || ""} />
                  </label>
                  <label>
                    Alt text
                    <textarea name="alt_text" rows={2} defaultValue={item.alt_text || item.altText || ""} />
                  </label>
                  <div className="adminCheckRow">
                    <label className="check">
                      <input name="featured" type="checkbox" defaultChecked={item.featured} />
                      Feature publicly
                    </label>
                    <label className="check">
                      <input name="thumbnail_pending" type="checkbox" defaultChecked={Boolean(item.thumbnail_pending)} />
                      Thumbnail still pending
                    </label>
                  </div>
                </AdminFormSection>
              </div>
            </div>
            <div className="adminSaveBar">
              <p>Signed preview URLs are generated for private media where available.</p>
              <div className="adminActionRow">
                <button className="button" type="submit">
                  Save media record
                </button>
                {item.archived_at ? (
                  <form action={archiveMediaAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="action" value="restore" />
                    <button className="button ghost darkButton" type="submit">
                      Restore media
                    </button>
                  </form>
                ) : (
                  <AdminConfirmDialog
                    title="Archive media"
                    description="Archived media is removed from public visibility and can be restored later."
                    recordLabel={item.title || item.file_name || item.id}
                    action={archiveMediaAction}
                    hiddenFields={[
                      { name: "id", value: item.id },
                      { name: "action", value: "archive" },
                    ]}
                    confirmLabel="Archive media"
                    triggerLabel="Archive media"
                  />
                )}
              </div>
            </div>
          </form>
        ))}
      </div>
      <AdminPagination pathname="/admin/media" searchParams={query} pagination={items} />
    </section>
  );
}
