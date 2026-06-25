import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { getCurrentAdminProfile } from "@/lib/auth";
import { getVisibleAdminSections } from "@/lib/admin-data";
import { RoleBadge } from "@/components/admin/AdminBadge";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentAdminProfile();
  const sections = profile ? getVisibleAdminSections(profile) : [];

  return (
    <main className="adminShell">
      {profile ? (
        <aside className="adminSidebar">
          <div className="adminSidebarHeader">
            <p className="kicker">Family Operations</p>
            <h2>{profile.displayName}</h2>
            <p>{profile.email}</p>
            <RoleBadge role={profile.role} />
          </div>
          <nav className="adminNav">
            <Link href="/admin">Dashboard</Link>
            {sections.map((section) => (
              <Link key={section.slug} href={section.href}>
                {section.title}
              </Link>
            ))}
          </nav>
          <div className="adminSidebarMeta">
            <p>All edits write to the database, add an audit record, and revalidate the public memorial pages.</p>
          </div>
          <form action={logoutAction}>
            <button className="button ghost darkButton" type="submit">
              Sign out
            </button>
          </form>
        </aside>
      ) : null}
      <div className="adminContent">{children}</div>
    </main>
  );
}
