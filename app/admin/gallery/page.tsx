import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import AdminTable from "@/components/admin/AdminTable";
import { saveGalleryAlbumAction } from "@/app/admin/actions";
import { QueryNotice, StatusBadge } from "@/app/admin/shared";
import { getGalleryAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor", "moderator"]);
  const [{ albums, media }, query] = await Promise.all([getGalleryAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Gallery albums"
        title="Album publishing"
        description="Organise approved media into albums, choose covers and decide which albums appear on the public gallery."
      />
      <QueryNotice searchParams={query} />

      <div className="adminSplitGrid">
        <form action={saveGalleryAlbumAction} className="form">
          <AdminFormSection title="Create album" description="New albums can be drafted before they are published publicly.">
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
                Category
                <input name="category" />
              </label>
              <label>
                Display order
                <input name="display_order" type="number" defaultValue="0" />
              </label>
              <label>
                Cover media ID
                <input name="cover_media_id" />
              </label>
            </div>
            <label>
              Description
              <textarea name="description" rows={4} />
            </label>
            <div className="adminCheckRow">
              <label className="check">
                <input name="is_published" type="checkbox" />
                Published publicly
              </label>
              <label className="check">
                <input name="is_active" type="checkbox" defaultChecked />
                Active album
              </label>
            </div>
          </AdminFormSection>
          <AdminSaveBar label="Create album" />
        </form>

        <article className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Approved media inventory</h2>
          </div>
          <AdminTable
            columns={["Title", "Album", "Status", "Featured"]}
            rows={media.map((item: any) => ({
              Title: item.title || item.id,
              Album: item.gallery_album_slug || "Unassigned",
              Status: <StatusBadge status={item.moderation_status || "approved"} />,
              Featured: item.featured ? "Yes" : "No",
            }))}
            emptyTitle="No approved media yet"
            emptyCopy="Approve files in the Media Library before assigning them to albums."
          />
        </article>
      </div>

      <div className="adminRecordStack">
        {albums.map((album: any) => (
          <form key={album.id} action={saveGalleryAlbumAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={album.id} />
            <AdminFormSection title={album.title} description={album.slug}>
              <div className="formGrid">
                <label>
                  Title
                  <input name="title" defaultValue={album.title} required />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={album.slug} required />
                </label>
                <label>
                  Category
                  <input name="category" defaultValue={album.category || ""} />
                </label>
                <label>
                  Display order
                  <input name="display_order" type="number" defaultValue={String(album.display_order ?? 0)} />
                </label>
                <label>
                  Cover media ID
                  <input name="cover_media_id" defaultValue={album.cover_media_id || ""} />
                </label>
              </div>
              <label>
                Description
                <textarea name="description" rows={4} defaultValue={album.description || ""} />
              </label>
              <div className="adminCheckRow">
                <label className="check">
                  <input name="is_published" type="checkbox" defaultChecked={Boolean(album.is_published)} />
                  Published publicly
                </label>
                <label className="check">
                  <input name="is_active" type="checkbox" defaultChecked={album.is_active !== false} />
                  Active album
                </label>
              </div>
            </AdminFormSection>
            <AdminSaveBar label="Save album" />
          </form>
        ))}
      </div>
    </section>
  );
}
