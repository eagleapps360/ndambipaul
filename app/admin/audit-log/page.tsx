import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { QueryNotice, formatDateTime, readStringParam } from "@/app/admin/shared";
import { getAuditLogAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "moderator", "finance", "content_editor"]);
  const query = await searchParams;
  const action = readStringParam(query.action);
  const page = Number(readStringParam(query.page, "1"));
  const pageSize = Number(readStringParam(query.pageSize, "20"));
  const rows = await getAuditLogAdminData({ action, page, pageSize });

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Audit log"
        title="Administrative activity"
        description="Read-only record of content, moderation, finance and access-control changes."
      />
      <QueryNotice searchParams={query} />

      <form className="form">
        <AdminFilterBar>
          <label>
            Action contains
            <input name="action" defaultValue={action} placeholder="tribute, donation, settings..." />
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
            Filter audit log
          </button>
        </AdminFilterBar>
      </form>

      <AdminTable
        columns={["Action", "Entity", "Summary", "Administrator", "Timestamp"]}
        rows={rows.rows.map((entry: any) => ({
          Action: entry.action,
          Entity: entry.entity_type || "entity",
          Summary: entry.summary || "No summary stored",
          Administrator: entry.actor_user_id || entry.actor || "Unknown admin",
          Timestamp: formatDateTime(entry.created_at || entry.at),
        }))}
        emptyTitle="No audit entries found"
        emptyCopy="This log fills automatically as admin actions are recorded."
      />
      <AdminPagination pathname="/admin/audit-log" searchParams={query} pagination={rows} />
    </section>
  );
}
