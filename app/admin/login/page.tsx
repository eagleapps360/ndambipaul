import type { Metadata } from "next";
import { loginAction } from "@/app/admin/actions";
import { getDemoModeNotice } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Login",
  description: "Protected login for memorial administrators.",
  path: "/admin/login",
  noindex: true,
});

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; sent?: string; email?: string }>;
}) {
  const params = await searchParams;
  const usesSupabaseAuth = isSupabaseConfigured();
  return (
    <section className="adminLoginCard">
      <p className="kicker">Protected Admin</p>
      <h1>Memorial administration</h1>
      <p>
        {usesSupabaseAuth
          ? "Enter an approved administrator email address and we will send a secure magic link."
          : "In local demo mode, the documented fallback password can be used to access the memorial administration area."}
      </p>
      {params.error ? <p className="errorBox">{params.error}</p> : null}
      {params.sent === "1" ? <p className="success">A sign-in link has been sent to {params.email || "your email address"}.</p> : null}
      {getDemoModeNotice() ? <p className="infoBox">{getDemoModeNotice()}</p> : null}
      <form action={loginAction} className="form">
        <input type="hidden" name="next" value={params.next || "/admin"} />
        <label>
          Email
          <input type="email" name="email" placeholder="family-admin@example.org" required={usesSupabaseAuth} />
        </label>
        {!usesSupabaseAuth ? (
          <label>
            Password
            <input type="password" name="password" required />
          </label>
        ) : null}
        <button className="button" type="submit">
          {usesSupabaseAuth ? "Send magic link" : "Enter admin area"}
        </button>
      </form>
    </section>
  );
}
