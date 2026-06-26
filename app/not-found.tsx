import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Page Not Found",
  description: "The memorial page you requested could not be found.",
  path: "/404",
  noindex: true,
});

export default function NotFound() {
  return (
    <main className="pageMain">
      <section className="pageHero narrowHero">
        <p className="kicker">Not Found</p>
        <h1>This memorial page could not be found</h1>
        <p>The link may have changed, or the page may no longer be publicly available.</p>
        <div className="pageHeroActions">
          <Link className="button" href="/">
            Return home
          </Link>
          <Link className="button ghost darkButton" href="/tributes">
            Browse tributes
          </Link>
        </div>
      </section>
    </main>
  );
}
