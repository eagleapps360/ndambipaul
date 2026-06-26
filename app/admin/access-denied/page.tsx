import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Access Denied",
  description: "Administrator access is restricted.",
  path: "/admin/access-denied",
  noindex: true,
});

export default function AdminAccessDeniedPage() {
  return (
    <section className="adminLoginCard">
      <p className="kicker">Access Denied</p>
      <h1>Administrator access is restricted</h1>
      <p>
        This memorial administration area is available only to approved family administrators whose email addresses are allowlisted
        and active in the memorial admin directory.
      </p>
      <div className="cardActions">
        <Link className="button" href="/admin/login">
          Return to sign in
        </Link>
        <Link className="button ghost darkButton" href="/">
          Go to memorial homepage
        </Link>
      </div>
    </section>
  );
}
