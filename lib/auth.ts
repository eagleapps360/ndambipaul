import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createServerActionSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { getAppUrl, isAdminEmailAllowed, isDemoMode, isSupabaseConfigured } from "@/lib/env";
import type { AdminRole } from "@/lib/content";

const COOKIE_NAME = "memorial-admin-session";

type AdminDirectoryRecord = {
  authUserId: string | null;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
};

export type AdminProfile = {
  userId: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
};

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normaliseRole(role: string): AdminRole {
  if (role === "admin") return "administrator";
  if (role === "media") return "moderator";
  if (role === "coordinator") return "content_editor";
  if (role === "content_editor" || role === "owner" || role === "administrator" || role === "moderator" || role === "finance") {
    return role;
  }
  return "administrator";
}

function toAdminProfile(record: AdminDirectoryRecord): AdminProfile | null {
  if (!record.authUserId || !record.isActive) return null;
  return {
    userId: record.authUserId,
    email: record.email,
    displayName: record.displayName,
    role: normaliseRole(record.role),
    isActive: record.isActive,
  };
}

async function getAdminDirectoryRecordByUserId(userId: string, email?: string | null): Promise<AdminDirectoryRecord | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const service = createServiceRoleSupabaseClient();
  const adminUsers = await service
    .from("admin_users")
    .select("auth_user_id, email, display_name, role, is_active")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!adminUsers.error && adminUsers.data) {
    return {
      authUserId: adminUsers.data.auth_user_id,
      email: adminUsers.data.email,
      displayName: adminUsers.data.display_name || adminUsers.data.email,
      role: adminUsers.data.role,
      isActive: adminUsers.data.is_active,
    };
  }

  const adminProfiles = await service
    .from("admin_profiles")
    .select("user_id, display_name, role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminProfiles.error && adminProfiles.data && email) {
    return {
      authUserId: adminProfiles.data.user_id,
      email,
      displayName: adminProfiles.data.display_name,
      role: adminProfiles.data.role,
      isActive: adminProfiles.data.is_active,
    };
  }

  return null;
}

async function getAdminDirectoryRecordByEmail(email: string): Promise<AdminDirectoryRecord | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalisedEmail = email.trim().toLowerCase();
  const service = createServiceRoleSupabaseClient();
  const adminUsers = await service
    .from("admin_users")
    .select("auth_user_id, email, display_name, role, is_active")
    .eq("email", normalisedEmail)
    .maybeSingle();

  if (!adminUsers.error && adminUsers.data) {
    return {
      authUserId: adminUsers.data.auth_user_id,
      email: adminUsers.data.email,
      displayName: adminUsers.data.display_name || adminUsers.data.email,
      role: adminUsers.data.role,
      isActive: adminUsers.data.is_active,
    };
  }

  return null;
}

async function syncAdminDirectoryForUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  if (!isSupabaseConfigured() || !user.email) {
    return null;
  }

  const service = createServiceRoleSupabaseClient();
  const existing = await getAdminDirectoryRecordByEmail(user.email);
  if (!existing) {
    return null;
  }

  const displayName =
    existing.displayName ||
    (typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "") ||
    user.email;

  await service.from("admin_users").upsert(
    {
      auth_user_id: user.id,
      email: user.email.toLowerCase(),
      display_name: displayName,
      role: existing.role,
      is_active: existing.isActive,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  await service.from("admin_profiles").upsert(
    {
      user_id: user.id,
      display_name: displayName,
      role: normaliseRole(existing.role),
      is_active: existing.isActive,
      last_sign_in_at: new Date().toISOString(),
      invited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return {
    authUserId: user.id,
    email: user.email.toLowerCase(),
    displayName,
    role: existing.role,
    isActive: existing.isActive,
  } satisfies AdminDirectoryRecord;
}

export function hasLocalAdminFallbackConfigured() {
  return Boolean(process.env.MEMORIAL_ADMIN_PASSWORD) && process.env.NODE_ENV !== "production";
}

async function getLocalFallbackAdmin(): Promise<AdminProfile | null> {
  if (!hasLocalAdminFallbackConfigured() || !isDemoMode()) {
    return null;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value || value !== digest(process.env.MEMORIAL_ADMIN_PASSWORD as string)) {
    return null;
  }

  return {
    userId: "demo-owner",
    email: "demo-admin@example.org",
    displayName: "Demo Memorial Admin",
    role: "owner",
    isActive: true,
  };
}

export async function setLocalFallbackSession(password: string) {
  if (!hasLocalAdminFallbackConfigured() || password !== process.env.MEMORIAL_ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, digest(process.env.MEMORIAL_ADMIN_PASSWORD as string), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return true;
}

export async function clearLocalFallbackSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  if (!isSupabaseConfigured()) {
    return getLocalFallbackAdmin();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmailAllowed(user.email)) {
    return null;
  }

  const synced = await syncAdminDirectoryForUser(user);
  const profile = synced ? toAdminProfile(synced) : null;
  return profile;
}

export async function requireAdminProfile(roles?: AdminRole[]) {
  const profile = await getCurrentAdminProfile();
  if (!profile) {
    const headerStore = await headers();
    const current = headerStore.get("x-pathname") || "/admin";
    redirect(`/admin/login?next=${encodeURIComponent(current)}`);
  }
  if (roles && !roles.includes(profile.role)) {
    redirect("/admin/access-denied");
  }
  return profile;
}

export function canManageModeration(profile: AdminProfile) {
  return ["owner", "administrator", "moderator"].includes(profile.role);
}

export function canManageContent(profile: AdminProfile) {
  return ["owner", "administrator", "content_editor"].includes(profile.role);
}

export function canManageFinance(profile: AdminProfile) {
  return ["owner", "administrator", "finance"].includes(profile.role);
}

export function canManageAdminUsers(profile: AdminProfile) {
  return ["owner", "administrator"].includes(profile.role);
}

export async function signInAdminWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    const ok = await setLocalFallbackSession(password);
    return ok ? { error: null } : { error: "Invalid administrator password." };
  }

  return { error: "Password sign-in is disabled when Supabase authentication is active." };
}

export async function requestAdminMagicLink(email: string, next = "/admin") {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase authentication is not configured in this environment." };
  }

  const normalisedEmail = email.trim().toLowerCase();
  if (!isAdminEmailAllowed(normalisedEmail)) {
    return { error: "This email address is not approved for memorial administration." };
  }

  const record = await getAdminDirectoryRecordByEmail(normalisedEmail);
  if (!record?.isActive) {
    return { error: "This administrator account is inactive or missing from the memorial admin directory." };
  }

  const supabase = await createServerActionSupabaseClient();
  const callbackUrl = new URL("/admin/auth/callback", getAppUrl());
  callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email: normalisedEmail,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { error: "We could not send the administrator magic link. Please try again." };
  }

  return { error: null };
}

export async function finishAdminMagicLinkSignIn(code: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase authentication is not configured." };
  }

  const supabase = await createServerActionSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return { error: "The sign-in link is invalid or has expired." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmailAllowed(user.email)) {
    await supabase.auth.signOut();
    return { error: "This account is not authorised for memorial administration." };
  }

  const synced = await syncAdminDirectoryForUser(user);
  const profile = synced ? toAdminProfile(synced) : null;
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "This administrator account is inactive or missing from the memorial admin directory." };
  }

  return { error: null, profile };
}

export async function signOutAdmin() {
  if (!isSupabaseConfigured()) {
    await clearLocalFallbackSession();
    return;
  }

  const supabase = await createServerActionSupabaseClient();
  await supabase.auth.signOut();
}
