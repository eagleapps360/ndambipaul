import { RoleBadge } from "@/components/admin/AdminBadge";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { inviteAdminUserAction, saveAdminUserAction, updateAdminInvitationAction } from "@/app/admin/actions";
import { QueryNotice, formatDateTime, readStringParam } from "@/app/admin/shared";
import { getAdminInvitations, getUsersAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireAdminProfile(["owner", "administrator"]);
  const query = await searchParams;
  const page = Number(readStringParam(query.page, "1"));
  const pageSize = Number(readStringParam(query.pageSize, "20"));
  const [users, invitations] = await Promise.all([getUsersAdminData({ page, pageSize }), getAdminInvitations()]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Admin users"
        title="Access control"
        description="Manage active administrator profiles and keep at least one active owner assigned to the memorial."
      />
      <QueryNotice searchParams={query} />

      <form action={inviteAdminUserAction} className="form">
        <AdminFormSection title="Invite administrator" description="Create a pending admin invitation and send setup email through Supabase when delivery is available.">
          <div className="formGrid">
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Display name
              <input name="display_name" required />
            </label>
            <label>
              Role
              <select name="role" defaultValue="moderator">
                {profile.role === "owner" ? <option value="owner">Owner</option> : null}
                <option value="administrator">Administrator</option>
                <option value="moderator">Moderator</option>
                <option value="finance">Finance</option>
                <option value="content_editor">Content editor</option>
              </select>
            </label>
          </div>
        </AdminFormSection>
        <AdminSaveBar label="Send invitation" helper="Owner role invitations are restricted to active owners." />
      </form>

      {invitations.length ? (
        <div className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Recent invitations</h2>
          </div>
          <div className="adminRecordStack">
            {invitations.map((invitation: any) => (
              <div key={invitation.id} className="adminRecordCard">
                <div className="adminPanelHeader">
                  <div>
                    <h3>{invitation.display_name}</h3>
                    <p className="subtle">{invitation.email}</p>
                  </div>
                  <RoleBadge role={invitation.role} />
                </div>
                <p className="subtle">
                  State: {invitation.invitation_state} · Sent {formatDateTime(invitation.sent_at || invitation.created_at)}
                </p>
                <div className="adminActionRow">
                  <form action={updateAdminInvitationAction}>
                    <input type="hidden" name="id" value={invitation.id} />
                    <input type="hidden" name="action" value="resend" />
                    <button className="button ghost darkButton" type="submit">
                      Resend
                    </button>
                  </form>
                  <form action={updateAdminInvitationAction}>
                    <input type="hidden" name="id" value={invitation.id} />
                    <input type="hidden" name="action" value="revoke" />
                    <button className="button ghost darkButton" type="submit">
                      Revoke
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <form className="form">
        <AdminFormSection title="Browse administrators" description={`Total admin users: ${users.total}`}>
          <div className="adminFilterBar">
            <label>
              Page size
              <select name="pageSize" defaultValue={String(users.pageSize)}>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <button className="button" type="submit">
              Update list
            </button>
          </div>
        </AdminFormSection>
      </form>

      <div className="adminRecordStack">
        {users.rows.map((user: any) => (
          <form key={user.id} action={saveAdminUserAction} className="form adminRecordCard">
            <input type="hidden" name="admin_user_id" value={user.id} />
            <input type="hidden" name="auth_user_id" value={user.auth_user_id || ""} />
            <input type="hidden" name="email" value={user.email || ""} />
            <input type="hidden" name="current_role" value={user.role} />
            <AdminFormSection title={user.display_name || user.email} description={user.email || user.auth_user_id || user.id}>
              <div className="adminMetaRow">
                <RoleBadge role={user.role} />
              </div>
              <div className="formGrid">
                <label>
                  Display name
                  <input name="display_name" defaultValue={user.display_name || ""} />
                </label>
                <label>
                  Role
                  <select name="role" defaultValue={user.role}>
                    {profile.role === "owner" || user.role === "owner" ? <option value="owner">Owner</option> : null}
                    <option value="administrator">Administrator</option>
                    <option value="moderator">Moderator</option>
                    <option value="finance">Finance</option>
                    <option value="content_editor">Content editor</option>
                  </select>
                </label>
              </div>
              <div className="adminSummaryList">
                <div><span>Invited</span><strong>{formatDateTime(user.invited_at || user.created_at)}</strong></div>
                <div><span>Last sign in</span><strong>{formatDateTime(user.last_sign_in_at)}</strong></div>
              </div>
              <label className="check">
                <input name="is_active" type="checkbox" defaultChecked={Boolean(user.is_active)} />
                Active administrator
              </label>
            </AdminFormSection>
            <AdminSaveBar label="Save admin profile" />
            <div className="adminActionRow">
              <AdminConfirmDialog
                title="Confirm administrator deactivation"
                description="Use this when you need to deactivate an administrator after first saving the role or display-name changes above."
                recordLabel={user.display_name}
                action={saveAdminUserAction}
                hiddenFields={[
                  { name: "admin_user_id", value: user.id },
                  { name: "auth_user_id", value: user.auth_user_id || "" },
                  { name: "email", value: user.email || "" },
                  { name: "current_role", value: user.role },
                  { name: "display_name", value: user.display_name || user.email || "" },
                  { name: "role", value: user.role },
                  { name: "is_active", value: "" },
                ]}
                confirmLabel="Deactivate administrator"
                triggerLabel="Deactivate"
              />
            </div>
          </form>
        ))}
      </div>
      <AdminPagination pathname="/admin/users" searchParams={query} pagination={users} />
    </section>
  );
}
