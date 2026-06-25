import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

// Session-aware server client for authenticated admin work only.
// This client reads request cookies and must never be used inside unstable_cache().
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured for server usage.");
  }

  const cookieStore = await cookies();
  const env = getSupabaseEnv();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

// Server-action variant that can both read and write auth cookies.
// Keep this limited to auth flows, protected mutations, and admin-only work.
export async function createServerActionSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured for server actions.");
  }

  const cookieStore = await cookies();
  const env = getSupabaseEnv();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as never);
        });
      },
    },
  });
}
