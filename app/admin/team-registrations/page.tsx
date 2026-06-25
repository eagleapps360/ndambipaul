import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { updateTeamRegistrationAction } from "@/app/admin/actions";
import { QueryNotice, formatDateTime, readStringParam, StatusBadge } from "@/app/admin/shared";
import { getTeamRegistrationsAdminData, getTeamsAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminTeamRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor", "moderator"]);
  const query = await searchParams;
  const status = readStringParam(query.status, "all");
  const team = readStringParam(query.team, "all");
  const q = readStringParam(query.q);
  const page = Number(readStringParam(query.page, "1"));
  const pageSize = Number(readStringParam(query.pageSize, "20"));
  const [rows, teams] = await Promise.all([
    getTeamRegistrationsAdminData({ status, team, q, page, pageSize }),
    getTeamsAdminData(),
  ]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Team registrations"
        title="Volunteer intake review"
        description="Triage new volunteer signups, assign teams, capture notes and update the internal workflow state."
      />
      <QueryNotice searchParams={query} />

      <form className="form">
        <AdminFilterBar>
          <label>
            Status
            <select name="status" defaultValue={status}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            Team
            <select name="team" defaultValue={team}>
              <option value="all">All teams</option>
              {teams.map((item: any) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input name="q" defaultValue={q} placeholder="Name or phone" />
          </label>
          <label>
            Page size
            <select name="pageSize" defaultValue={String(rows.pageSize)}>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
          <button className="button" type="submit">
            Apply filters
          </button>
        </AdminFilterBar>
      </form>

      <div className="adminRecordStack">
        {rows.rows.map((item: any) => (
          <form key={item.id} action={updateTeamRegistrationAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={item.id} />
            <div className="adminPanelHeader">
              <div>
                <h2>{item.applicant_name}</h2>
                <p className="subtle">{item.phone || item.email || "No direct contact on file"}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="subtle">Submitted {formatDateTime(item.created_at)}</p>
            <div className="formGrid">
              <label>
                Workflow status
                <select name="status" defaultValue={item.status || "pending"}>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label>
                Assigned team
                <select name="primary_team_slug" defaultValue={item.primary_team_slug || ""}>
                  <option value="">Not assigned</option>
                  {teams.map((teamItem: any) => (
                    <option key={teamItem.slug} value={teamItem.slug}>
                      {teamItem.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Internal notes
              <textarea name="private_admin_notes" rows={4} defaultValue={item.private_admin_notes || ""} />
            </label>
            <label className="check">
              <input name="mark_contacted" type="checkbox" defaultChecked={Boolean(item.contacted_at)} />
              Mark as contacted now
            </label>
            <div className="adminSaveBar">
              <p>Public team pages update after approved registrations are saved.</p>
              <button className="button" type="submit">
                Save registration
              </button>
            </div>
          </form>
        ))}
      </div>
      <AdminPagination pathname="/admin/team-registrations" searchParams={query} pagination={rows} />
    </section>
  );
}
