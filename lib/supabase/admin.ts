import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

function noopCookieMethods() {
  return {
    getAll() {
      return [];
    },
    setAll() {},
  };
}

// Trusted server-only client for service-role operations.
// This client is cookie-free and must never be exposed to browser code.
export function createAdminSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured for service-role usage.");
  }

  const env = getSupabaseEnv();

  return createServerClient(env.url, env.serviceRoleKey, {
    cookies: noopCookieMethods(),
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const createServiceRoleSupabaseClient = createAdminSupabaseClient;
