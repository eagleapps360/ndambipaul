import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicSupabaseClient: SupabaseClient | null = null;

export function createPublicSupabaseClient(): SupabaseClient {
  if (publicSupabaseClient) {
    return publicSupabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  publicSupabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return publicSupabaseClient;
}
