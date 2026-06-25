import Link from "next/link";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { QueryNotice, formatDateTime, formatMoney, readStringParam, StatusBadge } from "@/app/admin/shared";
import { getDonationsAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "finance"]);
  const query = await searchParams;
  const method = readStringParam(query.method, "all");
  const verification = readStringParam(query.verification, "all");
  const page = Number(readStringParam(query.page, "1"));
  const pageSize = Number(readStringParam(query.pageSize, "20"));
  const rows = await getDonationsAdminData({ method, verification, page, pageSize });

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Donations"
        title="Donation ledger"
        description="Review donation methods, verify offline records and inspect the details or payment events of each contribution."
      />
      <QueryNotice searchParams={query} />

      <form className="form">
        <AdminFilterBar>
          <label>
            Donation method
            <select name="method" defaultValue={method}>
              <option value="all">All methods</option>
              <option value="cash">Cash</option>
              <option value="kind">In kind</option>
              <option value="mobile-money">Mobile money</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank transfer</option>
            </select>
          </label>
          <label>
            Verification
            <select name="verification" defaultValue={verification}>
              <option value="all">All states</option>
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
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
            Filter donations
          </button>
        </AdminFilterBar>
      </form>

      <AdminTable
        columns={["Donor", "Method", "Amount", "Verification", "Created", "Action"]}
        rows={rows.rows.map((item: any) => ({
          Donor: item.donor_name || "Anonymous donor",
          Method: item.donation_method,
          Amount: formatMoney(item.amount, item.currency),
          Verification: <StatusBadge status={item.verification_state} />,
          Created: formatDateTime(item.created_at),
          Action: (
            <Link className="textLink" href={`/admin/donations/${item.id}`}>
              Review donation
            </Link>
          ),
        }))}
        emptyTitle="No donations found"
        emptyCopy="Adjust the filters or wait for new donation records."
      />
      <AdminPagination pathname="/admin/donations" searchParams={query} pagination={rows} />
    </section>
  );
}
