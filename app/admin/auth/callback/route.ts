import { NextResponse } from "next/server";
import { finishAdminMagicLinkSignIn } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/admin";
  const code = url.searchParams.get("code");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=Supabase%20authentication%20is%20not%20configured.", url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=The%20sign-in%20link%20is%20missing%20its%20code.", url));
  }

  const result = await finishAdminMagicLinkSignIn(code);
  if (result.error) {
    const redirectTarget = result.error.includes("not authorised") || result.error.includes("inactive")
      ? "/admin/access-denied"
      : `/admin/login?error=${encodeURIComponent(result.error)}`;
    return NextResponse.redirect(new URL(redirectTarget, url));
  }

  const safeNext = next.startsWith("/admin") ? next : "/admin";
  return NextResponse.redirect(new URL(safeNext, url));
}
