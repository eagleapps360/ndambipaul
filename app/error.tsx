"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="pageMain">
      <section className="pageHero narrowHero">
        <p className="kicker">Something went wrong</p>
        <h1>We could not load this memorial page</h1>
        <p>Please try again, or return to the main memorial pages below.</p>
        <div className="pageHeroActions">
          <button className="button" type="button" onClick={() => reset()}>
            Try again
          </button>
          <Link className="button ghost darkButton" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
