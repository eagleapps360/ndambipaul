import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isAdminEmailAllowed, isSupabaseConfigured } from "@/lib/env";

type AdminLookupResult = {
  isActive: boolean;
};

async function readAdminStatus(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<AdminLookupResult | null> {
  const adminUsers = await supabase
    .from("admin_users")
    .select("is_active")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!adminUsers.error && adminUsers.data) {
    return { isActive: Boolean(adminUsers.data.is_active) };
  }

  const adminProfiles = await supabase
    .from("admin_profiles")
    .select("is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminProfiles.error && adminProfiles.data) {
    return { isActive: Boolean(adminProfiles.data.is_active) };
  }

  return null;
}

export async function handleSupabaseAdminProxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  response.headers.set("x-pathname", request.nextUrl.pathname);

  if (!isSupabaseConfigured()) {
    return response;
  }

  const env = getSupabaseEnv();
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminCallback = pathname.startsWith("/admin/auth/callback");
  const isAccessDenied = pathname === "/admin/access-denied";

  if (!isAdminRoute) {
    return response;
  }

  if (!user) {
    if (isAdminLogin || isAdminCallback) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const isAllowedEmail = isAdminEmailAllowed(user.email || "");
  const adminStatus = await readAdminStatus(supabase, user.id);
  const isAuthorized = Boolean(isAllowedEmail && adminStatus?.isActive);

  if (!isAuthorized) {
    if (isAccessDenied) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/access-denied";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminLogin || isAccessDenied) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
