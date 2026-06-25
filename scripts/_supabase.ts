import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnvironmentReport } from "../lib/env";

export type CheckResult = {
  status: "PASS" | "FAIL" | "WARN" | "ACTION";
  message: string;
};

export const REQUIRED_TABLES = [
  "site_settings",
  "admin_profiles",
  "admin_users",
  "admin_invitations",
  "tributes",
  "media_items",
  "gallery_albums",
  "programme_events",
  "programme_items",
  "livestreams",
  "coordinators",
  "team_definitions",
  "team_registrations",
  "donations",
  "donation_payment_events",
  "audit_log",
] as const;

export const REQUIRED_PUBLIC_VIEWS = [
  "public_site_settings",
  "public_tributes",
  "public_media_gallery",
  "public_programme_events",
  "public_programme_items",
  "public_livestreams",
  "public_coordinators",
] as const;

export const REQUIRED_BUCKETS = [
  { name: "memorial-private-submissions", public: false },
  { name: "memorial-public-media", public: true },
  { name: "memorial-documents", public: false },
] as const;

export function getScriptArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    dryRun: args.has("--dry-run"),
    withSeed: args.has("--with-seed"),
  };
}

export function requireSupabaseScriptEnv() {
  const report = getEnvironmentReport();
  const requiredKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required Supabase environment variables: ${missing.join(", ")}`);
  }
  return {
    report,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  };
}

export function createSupabaseClients() {
  const env = requireSupabaseScriptEnv();
  const anon = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const service = createClient(env.url, env.serviceRoleKey, { auth: { persistSession: false } });
  return { ...env, anon, service };
}

export function printResults(results: CheckResult[]) {
  results.forEach((result) => {
    console.log(`${result.status} ${result.message}`);
  });
}

export async function ensureConnectivity(service: SupabaseClient, results: CheckResult[]) {
  const { error } = await service.from("site_settings").select("id", { head: true, count: "exact" });
  if (error) {
    results.push({ status: "FAIL", message: "Supabase connectivity check failed." });
    throw new Error(error.message);
  }
  results.push({ status: "PASS", message: "Supabase project reachable." });
}

export async function verifyTables(service: SupabaseClient, results: CheckResult[]) {
  for (const table of REQUIRED_TABLES) {
    const { error } = await service.from(table).select("*", { head: true, count: "exact" });
    if (error) {
      results.push({ status: "FAIL", message: `Required table missing or inaccessible: ${table}.` });
    } else {
      results.push({ status: "PASS", message: `${table} table available.` });
    }
  }
}

export async function verifyViews(anon: SupabaseClient, results: CheckResult[]) {
  for (const view of REQUIRED_PUBLIC_VIEWS) {
    const { error } = await anon.from(view).select("*", { head: true, count: "exact" });
    if (error) {
      results.push({ status: "FAIL", message: `Required public view missing or inaccessible: ${view}.` });
    } else {
      results.push({ status: "PASS", message: `${view} view available.` });
    }
  }
}

export async function verifyRoleHelpers(anon: SupabaseClient, results: CheckResult[]) {
  const roleCheck = await anon.rpc("current_admin_role");
  results.push(
    roleCheck.error
      ? { status: "FAIL", message: "current_admin_role() helper is missing or failing." }
      : { status: "PASS", message: "current_admin_role() helper available." },
  );

  const activeCheck = await anon.rpc("is_active_admin");
  results.push(
    activeCheck.error
      ? { status: "FAIL", message: "is_active_admin() helper is missing or failing." }
      : { status: "PASS", message: "is_active_admin() helper available." },
  );

  const rolesCheck = await anon.rpc("has_admin_role", { roles: ["owner"] });
  results.push(
    rolesCheck.error
      ? { status: "FAIL", message: "has_admin_role(text[]) helper is missing or failing." }
      : { status: "PASS", message: "has_admin_role(text[]) helper available." },
  );
}

export async function verifyAnonymousAccess(anon: SupabaseClient, results: CheckResult[]) {
  const rawTributes = await anon.from("tributes").select("id").limit(1);
  results.push(
    rawTributes.error
      ? { status: "PASS", message: "Anonymous raw tribute access denied." }
      : { status: "FAIL", message: "Anonymous raw tribute access unexpectedly succeeded." },
  );

  const privateFields = await anon.from("tributes").select("private_email, private_phone").limit(1);
  results.push(
    privateFields.error
      ? { status: "PASS", message: "Anonymous tribute private contact access denied." }
      : { status: "FAIL", message: "Anonymous tribute private contact access unexpectedly succeeded." },
  );

  const donations = await anon.from("donations").select("id").limit(1);
  results.push(
    donations.error
      ? { status: "PASS", message: "Anonymous donation access denied." }
      : { status: "FAIL", message: "Anonymous donation access unexpectedly succeeded." },
  );
}

export async function verifyAdminTables(service: SupabaseClient, results: CheckResult[]) {
  const adminUsers = await service.from("admin_users").select("id", { head: true, count: "exact" });
  results.push(
    adminUsers.error
      ? { status: "FAIL", message: "Service role cannot access admin_users." }
      : { status: "PASS", message: "Service role can access admin_users." },
  );
}

export async function verifyBucketInventory(service: SupabaseClient, results: CheckResult[]) {
  const { data: buckets, error } = await service.storage.listBuckets();
  if (error) {
    results.push({ status: "FAIL", message: "Storage bucket listing failed." });
    return;
  }

  for (const bucket of REQUIRED_BUCKETS) {
    const match = buckets.find((item) => item.name === bucket.name);
    if (!match) {
      results.push({ status: "FAIL", message: `${bucket.name} bucket missing.` });
      results.push({ status: "ACTION", message: "Run npm run setup:supabase to create missing buckets." });
      continue;
    }

    if (match.public !== bucket.public) {
      results.push({
        status: "FAIL",
        message: `${bucket.name} bucket privacy mismatch. Expected public=${String(bucket.public)}.`,
      });
      results.push({ status: "ACTION", message: "Run npm run setup:supabase to reconcile bucket privacy." });
      continue;
    }

    results.push({ status: "PASS", message: `${bucket.name} bucket present with expected privacy.` });
  }
}
