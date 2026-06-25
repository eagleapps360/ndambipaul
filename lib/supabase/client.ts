import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured for browser usage.");
  }

  if (!browserClient) {
    const env = getSupabaseEnv();
    browserClient = createBrowserClient(env.url, env.anonKey);
  }

  return browserClient;
}
