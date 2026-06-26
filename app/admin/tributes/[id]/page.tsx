import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminMediaPreview from "@/components/admin/AdminMediaPreview";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { moderateTributeAction, reviewTributeRevisionAction, updateTributeDetailsAction } from "@/app/admin/actions";
import { AdminBackLink, QueryNotice, formatDateTime } from "@/app/admin/shared";
import { getAdminMediaPreviewMap, getTributeAdminDetail } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminTributeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "moderator"]);
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getTributeAdminDetail(id);
  if (!detail) notFound();
  const previewMap = await getAdminMediaPreviewMap(detail.media as any);
  const tribute = detail.tribute as any;

  return (
    <section className="adminPage">
      <AdminBackLink href="/admin/tributes" label="Back to tributes" />
      <AdminPageHeader
        eyebrow="Tribute detail"
        title={tribute.contributor_name || tribute.name}
        description={`Submitted ${formatDateTime(tribute.created_at || tribute.submittedAt)} · ${tribute.relationship || "Tribute"}`}
      />
      <QueryNotice searchParams={query} />

      <div className="adminSplitGrid">
        <form action={updateTributeDetailsAction} className="form">
          <input type="hidden" name="id" value={tribute.id} />
          <AdminFormSection title="Submission details" description="Edit contributor details and the tribute body before publication.">
            <div className="formGrid">
              <label>
                Contributor name
                <input name="contributor_name" defaultValue={tribute.contributor_name || tribute.name} />
              </label>
              <label>
                Relationship
                <input name="relationship" defaultValue={tribute.relationship} />
              </label>
              <label>
                Category
                <input name="relationship_category" defaultValue={tribute.relationship_category || tribute.category} />
              </label>
              <label>
                Location
                <input name="location" defaultValue={tribute.location || ""} />
              </label>
              <label>
                Private email
                <input name="private_email" defaultValue={tribute.private_email || tribute.privateEmail || ""} />
              </label>
              <label>
                Private phone
                <input name="private_phone" defaultValue={tribute.private_phone || tribute.privatePhone || ""} />
              </label>
            </div>
            <label className="check">
              <input name="featured" type="checkbox" defaultChecked={tribute.featured} />
              Feature this tribute publicly
            </label>
            <label>
              Tribute message
              <textarea name="tribute_message" rows={8} defaultValue={tribute.tribute_message || tribute.message} />
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Save tribute details" />
        </form>

        <article className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Moderation</h2>
          </div>
          <div className="adminActionStack">
            <form action={moderateTributeAction} className="form">
              <input type="hidden" name="id" value={tribute.id} />
              <input type="hidden" name="action" value="approve" />
              <input type="hidden" name="slug" value={tribute.slug || `tribute-${tribute.id.slice(0, 8)}`} />
              <label className="check">
                <input name="featured" type="checkbox" defaultChecked={tribute.featured} />
                Mark as featured on approval
              </label>
              <button className="button" type="submit">
                Approve tribute
              </button>
            </form>

            <div className="form">
              <AdminConfirmDialog
                title="Reject tribute"
                description="Rejected tributes stay private and require a clear reason for the family review team."
                recordLabel={tribute.contributor_name || tribute.name}
                action={moderateTributeAction}
                hiddenFields={[
                  { name: "id", value: tribute.id },
                  { name: "action", value: "reject" },
                ]}
                confirmLabel="Reject tribute"
                requireReason
                reasonLabel="Rejection reason"
                triggerLabel="Reject tribute"
              />
            </div>

            {tribute.moderation_status === "archived" ? (
              <form action={moderateTributeAction} className="form">
                <input type="hidden" name="id" value={tribute.id} />
                <input type="hidden" name="action" value="restore" />
                <button className="button ghost darkButton" type="submit">
                  Restore to pending
                </button>
              </form>
            ) : (
              <div className="form">
                <AdminConfirmDialog
                  title="Archive tribute"
                  description="Archived tributes disappear from public view but remain available for future restoration."
                  recordLabel={tribute.contributor_name || tribute.name}
                  action={moderateTributeAction}
                  hiddenFields={[
                    { name: "id", value: tribute.id },
                    { name: "action", value: "archive" },
                  ]}
                  confirmLabel="Archive tribute"
                  requireReason
                  reasonLabel="Archive note"
                  triggerLabel="Archive tribute"
                />
              </div>
            )}
          </div>
        </article>
      </div>

      <section className="adminPanelStack">
        {detail.revisions?.length ? (
          <article className="adminPanel">
            <div className="adminPanelHeader">
              <h2>Pending and past revisions</h2>
            </div>
            <div className="adminRecordStack">
              {detail.revisions.map((revision: any) => (
                <article key={revision.id} className="adminRecordCard">
                  <p>
                    <strong>{revision.proposed_name || tribute.contributor_name || tribute.name}</strong> · {revision.status} ·{" "}
                    {formatDateTime(revision.created_at)}
                  </p>
                  <p>{revision.proposed_message || "No message supplied."}</p>
                  {revision.status === "pending" ? (
                    <div className="adminActionRow">
                      <form action={reviewTributeRevisionAction}>
                        <input type="hidden" name="revision_id" value={revision.id} />
                        <input type="hidden" name="tribute_id" value={tribute.id} />
                        <input type="hidden" name="action" value="approve" />
                        <button className="button" type="submit">
                          Approve revision
                        </button>
                      </form>
                      <form action={reviewTributeRevisionAction}>
                        <input type="hidden" name="revision_id" value={revision.id} />
                        <input type="hidden" name="tribute_id" value={tribute.id} />
                        <input type="hidden" name="action" value="reject" />
                        <button className="button ghost darkButton" type="submit">
                          Reject revision
                        </button>
                      </form>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </article>
        ) : null}

        <article className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Attached media</h2>
          </div>
          <div className="adminMediaGrid">
            {detail.media.map((item: any) => (
              <div key={item.id} className="adminMediaCard">
                <AdminMediaPreview
                  kind={item.media_type || item.kind || "image"}
                  url={previewMap.get(item.id) || item.publicUrl || null}
                  alt={item.title || item.alt_text || "Tribute media"}
                />
                <div>
                  <strong>{item.title || item.file_name || item.original_file_name || "Untitled media"}</strong>
                  <p>{item.caption || item.media_type || item.kind || "Attached record"}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
