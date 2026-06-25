import Link from "next/link";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { QueryNotice, formatDateTime, readStringParam, StatusBadge } from "@/app/admin/shared";
import { requireAdminProfile } from "@/lib/auth";
import { getTributesAdminData } from "@/lib/admin-data";

export default async function AdminTributesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "moderator"]);
  const query = await searchParams;
  const status = readStringParam(query.status, "all");
  const q = readStringParam(query.q);
  const page = Number(readStringParam(query.page, "1"));
  const pageSize = Number(readStringParam(query.pageSize, "20"));
  const tributes = await getTributesAdminData({ status, q, page, pageSize });

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Tributes"
        title="Tribute moderation"
        description="Search tribute submissions, check their moderation state and open each one for approval, editing or rejection."
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
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Search contributor
            <input name="q" defaultValue={q} placeholder="Name or family branch" />
          </label>
          <label>
            Page size
            <select name="pageSize" defaultValue={String(tributes.pageSize)}>
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

      <AdminTable
        columns={["Contributor", "Relationship", "Status", "Submitted", "Featured", "Action"]}
        rows={tributes.rows.map((item: any) => ({
          Contributor: item.contributor_name || item.name,
          Relationship: item.relationship || item.category || "Tribute",
          Status: <StatusBadge status={item.moderation_status || item.status} />,
          Submitted: formatDateTime(item.created_at || item.submittedAt),
          Featured: item.featured ? "Yes" : "No",
          Action: (
            <Link className="textLink" href={`/admin/tributes/${item.id}`}>
              Review tribute
            </Link>
          ),
        }))}
        emptyTitle="No tributes found"
        emptyCopy="Adjust the filters or wait for new tribute submissions."
      />
      <AdminPagination pathname="/admin/tributes" searchParams={query} pagination={tributes} />
    </section>
  );
}
