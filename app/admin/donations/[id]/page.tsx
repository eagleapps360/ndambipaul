import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import AdminTable from "@/components/admin/AdminTable";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { ownerDonationOverrideAction, verifyDonationAction } from "@/app/admin/actions";
import { AdminBackLink, QueryNotice, formatDateTime, formatMoney, StatusBadge } from "@/app/admin/shared";
import { getDonationAdminDetail } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminDonationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireAdminProfile(["owner", "administrator", "finance"]);
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getDonationAdminDetail(id);
  if (!detail) notFound();
  const donation = detail.donation as any;

  return (
    <section className="adminPage">
      <AdminBackLink href="/admin/donations" label="Back to donations" />
      <AdminPageHeader
        eyebrow="Donation detail"
        title={donation.donor_name || "Donation record"}
        description={`${formatMoney(donation.amount, donation.currency)} · ${donation.donation_method}`}
      />
      <QueryNotice searchParams={query} />

      <div className="adminSplitGrid">
        <form action={verifyDonationAction} className="form">
          <input type="hidden" name="id" value={donation.id} />
          <AdminFormSection title="Verification workflow" description="Finance-only changes for receipts, collection and manual reconciliation.">
            <div className="adminMetaRow">
              <StatusBadge status={donation.verification_state} />
              <StatusBadge status={donation.internal_status} />
            </div>
            <div className="formGrid">
              <label>
                Verification state
                <select name="verification_state" defaultValue={donation.verification_state || "unverified"}>
                  <option value="unverified">Unverified</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                Internal status
                <select name="internal_status" defaultValue={donation.internal_status || "received"}>
                  <option value="received">Received</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label>
                Collector
                <input name="collector" defaultValue={donation.collector || ""} />
              </label>
              <label>
                Receipt reference
                <input name="receipt_reference" defaultValue={donation.receipt_reference || ""} />
              </label>
              <label>
                In-kind delivery state
                <input name="in_kind_delivery_state" defaultValue={donation.in_kind_delivery_state || ""} />
              </label>
            </div>
            <label>
              Finance notes
              <textarea name="finance_notes" rows={5} defaultValue={donation.finance_notes || ""} />
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Save donation review" helper="Finance administrators can verify and annotate records, but owner-only provider overrides are handled separately." />
        </form>

        <article className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Record summary</h2>
          </div>
          <div className="adminSummaryList">
            <div><span>Created</span><strong>{formatDateTime(donation.created_at)}</strong></div>
            <div><span>External reference</span><strong>{donation.transaction_reference || "Not provided"}</strong></div>
            <div><span>Donor email</span><strong>{donation.donor_email || "Not provided"}</strong></div>
            <div><span>Donor phone</span><strong>{donation.donor_phone || "Not provided"}</strong></div>
            <div><span>Acknowledged</span><strong>{donation.acknowledgement_sent_at ? formatDateTime(donation.acknowledgement_sent_at) : "Not yet"}</strong></div>
          </div>
          {profile.role === "owner" ? (
            <div className="adminActionRow">
              <AdminConfirmDialog
                title="Owner-only financial override"
                description="This changes only the memorial website record. It does not alter Stripe or provider data."
                recordLabel={donation.donor_name || donation.id}
                action={ownerDonationOverrideAction}
                hiddenFields={[
                  { name: "id", value: donation.id },
                  { name: "provider_payment_status", value: donation.provider_payment_status || "pending" },
                  { name: "verification_state", value: donation.verification_state || "unverified" },
                  { name: "internal_status", value: donation.internal_status || "pending" },
                ]}
                confirmLabel="Confirm owner override"
                requireReason
                reasonLabel="Mandatory override reason"
                triggerLabel="Open owner override"
              />
            </div>
          ) : null}
        </article>
      </div>

      {profile.role === "owner" ? (
        <form action={ownerDonationOverrideAction} className="form">
          <input type="hidden" name="id" value={donation.id} />
          <AdminFormSection title="Owner-only override controls" description="Use only when provider reconciliation needs a memorial-side override.">
            <div className="formGrid">
              <label>
                Provider payment status
                <select name="provider_payment_status" defaultValue={donation.provider_payment_status || "pending"}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="expired">Expired</option>
                </select>
              </label>
              <label>
                Verification state
                <select name="verification_state" defaultValue={donation.verification_state || "unverified"}>
                  <option value="unverified">Unverified</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                Internal status
                <select name="internal_status" defaultValue={donation.internal_status || "pending"}>
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
            <label className="check">
              <input name="confirmed" type="checkbox" value="yes" required />
              I understand this does not change the Stripe or provider record.
            </label>
            <label>
              Override reason
              <textarea name="reason" rows={4} required defaultValue={donation.manual_override_reason || ""} />
            </label>
          </AdminFormSection>
          <AdminSaveBar label="Apply owner override" helper="Previous and new states are written to the audit log with the owner identity and timestamp." />
        </form>
      ) : null}

      <AdminTable
        columns={["Event type", "Reference", "Payload summary", "Timestamp"]}
        rows={detail.events.map((event: any) => ({
          "Event type": event.event_type || event.source || "payment_event",
          Reference: event.provider_reference || event.id,
          "Payload summary": event.summary || JSON.stringify(event.payload || {}).slice(0, 120),
          Timestamp: formatDateTime(event.created_at),
        }))}
        emptyTitle="No payment events found"
        emptyCopy="Some offline donations will not have provider payment events."
      />
    </section>
  );
}
