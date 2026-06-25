import Link from "next/link";
import { AdminBadge } from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminTable from "@/components/admin/AdminTable";
import { getAdminDashboardData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";
import { getVisibleAdminSections } from "@/lib/admin-data";
import { formatDateTime, formatMoney, QueryNotice, StatusBadge } from "@/app/admin/shared";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await requireAdminProfile();
  const dashboard = await getAdminDashboardData();
  const query = await searchParams;
  const sections = getVisibleAdminSections(profile);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Memorial administration dashboard"
        description="Track moderation queues, finance follow-up, programme changes and public publication from one place."
      />
      <QueryNotice searchParams={query} success="Welcome back to the memorial operations dashboard." />

      <div className="statsGrid">
        <AdminStatCard label="Pending tributes" value={dashboard.stats.pendingTributes} />
        <AdminStatCard label="Pending media" value={dashboard.stats.pendingMedia} />
        <AdminStatCard label="Approved tributes" value={dashboard.stats.approvedTributes} />
        <AdminStatCard label="Featured tributes" value={dashboard.stats.featuredTributes} />
        <AdminStatCard label="Pending registrations" value={dashboard.stats.pendingTeamRegistrations} />
        <AdminStatCard label="Approved volunteers" value={dashboard.stats.approvedVolunteers} />
        <AdminStatCard label="Unverified donations" value={dashboard.stats.unverifiedDonations} />
        <AdminStatCard
          label="Scheduled livestreams"
          value={dashboard.stats.scheduledLivestreams}
          detail={dashboard.stats.verifiedDonationTotals.length ? dashboard.stats.verifiedDonationTotals.map((item) => formatMoney(item.total, item.currency)).join(" · ") : "No verified totals yet"}
        />
      </div>

      <section className="adminPanelStack">
        <div className="adminSectionGrid">
          {sections.map((section) => (
          <article key={section.slug} className="adminCard">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <Link className="textLink" href={section.href}>
              Open section
            </Link>
          </article>
          ))}
        </div>
      </section>

      <section className="adminSplitGrid">
        <article className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Attention required</h2>
            <Link className="textLink" href="/admin/tributes">
              Review queues
            </Link>
          </div>
          <div className="adminQueue">
            {dashboard.attention.pendingTributes.map((item: any) => (
              <article key={item.id} className="adminQueueItem">
                <div className="adminQueueHeader">
                  <strong>{item.contributor_name}</strong>
                  <StatusBadge status="pending" />
                </div>
                <span>{item.relationship || "Tribute submission"}</span>
                <small>{formatDateTime(item.created_at)}</small>
              </article>
            ))}
            {dashboard.attention.pendingMedia.map((item: any) => (
              <article key={item.id} className="adminQueueItem">
                <div className="adminQueueHeader">
                  <strong>{item.contributor_name || item.title || "Media upload"}</strong>
                  <StatusBadge status="pending" />
                </div>
                <span>{item.media_type}</span>
                <small>{formatDateTime(item.created_at)}</small>
              </article>
            ))}
            {dashboard.attention.unverifiedDonations.map((item: any) => (
              <article key={item.id} className="adminQueueItem">
                <div className="adminQueueHeader">
                  <strong>{item.donor_name || "Donation record"}</strong>
                  <AdminBadge tone="warning">needs verification</AdminBadge>
                </div>
                <span>{formatMoney(item.amount, item.currency)} · {item.donation_method}</span>
                <small>{item.transaction_reference || "No external reference"}</small>
              </article>
            ))}
            {dashboard.attention.teamRegistrations.map((item: any) => (
              <article key={item.id} className="adminQueueItem">
                <div className="adminQueueHeader">
                  <strong>{item.applicant_name}</strong>
                  <StatusBadge status={item.status} />
                </div>
                <span>{item.primary_team_slug}</span>
                <small>{formatDateTime(item.created_at)}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="adminPanel">
          <div className="adminPanelHeader">
            <h2>Upcoming events</h2>
            <Link className="textLink" href="/admin/programme">
              Manage programme
            </Link>
          </div>
          <AdminTable
            columns={["Event", "Date", "Venue", "Livestream", "Action"]}
            rows={dashboard.upcomingEvents.map((item: any) => ({
              Event: item.title,
              Date: formatDateTime(item.start_time),
              Venue: item.venue || "TBC",
              Livestream: <StatusBadge status={item.livestream_state || "scheduled"} />,
              Action: (
                <Link className="textLink" href={`/admin/programme/${item.id}`}>
                  Edit event
                </Link>
              ),
            }))}
            emptyTitle="No programme events yet"
            emptyCopy="Create the first event in the Funeral Programme section."
          />
        </article>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <h2>Recent activity</h2>
          <Link className="textLink" href="/admin/audit-log">
            Open audit log
          </Link>
        </div>
        <AdminTable
          columns={["Administrator", "Action", "Entity", "Timestamp"]}
          rows={dashboard.recentAudit.map((entry: any) => ({
            Administrator: entry.actor || entry.actor_user_id || "Unknown admin",
            Action: entry.action,
            Entity: entry.summary || entry.entity_type,
            Timestamp: formatDateTime(entry.at || entry.created_at),
          }))}
          emptyTitle="No audit activity yet"
          emptyCopy="Actions will appear here once administrators begin making changes."
        />
      </section>
    </section>
  );
}
