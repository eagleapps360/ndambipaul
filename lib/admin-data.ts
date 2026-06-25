import { cache } from "react";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase";
import { demoAuditLog, demoBiographySections, demoCoordinatorGroups, demoLivestreams, demoMediaItems, demoProgrammeEvents, demoSiteSettings, demoTeams, demoTimeline, demoTributes } from "@/lib/demo-content";
import { canManageAdminUsers, canManageContent, canManageFinance, canManageModeration, type AdminProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { adminSections } from "@/lib/ui-config";

export type DashboardData = {
  stats: {
    pendingTributes: number;
    pendingMedia: number;
    approvedTributes: number;
    featuredTributes: number;
    pendingTeamRegistrations: number;
    approvedVolunteers: number;
    unverifiedDonations: number;
    verifiedDonationTotals: Array<{ currency: string; total: number }>;
    scheduledLivestreams: number;
  };
  attention: {
    pendingTributes: any[];
    pendingMedia: any[];
    unverifiedDonations: any[];
    teamRegistrations: any[];
  };
  recentAudit: any[];
  upcomingEvents: any[];
};

export type AdminPaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginatedAdminResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function clampPage(page?: number) {
  return Math.max(1, Number(page || 1));
}

function clampPageSize(pageSize?: number) {
  return [20, 50, 100].includes(Number(pageSize)) ? Number(pageSize) : 20;
}

function paginateArray<T>(rows: T[], input?: AdminPaginationInput): PaginatedAdminResult<T> {
  const page = clampPage(input?.page);
  const pageSize = clampPageSize(input?.pageSize);
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount,
  };
}

export const getAdminDashboardData = cache(async (): Promise<DashboardData> => {
  if (!isSupabaseConfigured()) {
    return {
      stats: {
        pendingTributes: demoTributes.filter((item) => item.status === "pending").length,
        pendingMedia: 0,
        approvedTributes: demoTributes.filter((item) => item.status === "approved").length,
        featuredTributes: demoTributes.filter((item) => item.featured).length,
        pendingTeamRegistrations: 0,
        approvedVolunteers: 0,
        unverifiedDonations: 0,
        verifiedDonationTotals: [],
        scheduledLivestreams: demoLivestreams.filter((stream) => stream.status === "scheduled").length,
      },
      attention: {
        pendingTributes: demoTributes.filter((item) => item.status === "pending"),
        pendingMedia: [],
        unverifiedDonations: [],
        teamRegistrations: [],
      },
      recentAudit: demoAuditLog,
      upcomingEvents: demoProgrammeEvents,
    };
  }

  const supabase = await createServerSupabaseClient();
  const [
    pendingTributesRes,
    pendingMediaRes,
    approvedTributesRes,
    featuredTributesRes,
    pendingTeamRegistrationsRes,
    approvedVolunteersRes,
    unverifiedDonationsRes,
    verifiedDonationTotalsRes,
    scheduledLivestreamsRes,
    pendingTributesRows,
    pendingMediaRows,
    unverifiedDonationRows,
    teamRegistrationRows,
    auditRows,
    upcomingEventsRows,
  ] = await Promise.all([
    supabase.from("tributes").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
    supabase.from("tributes").select("*", { count: "exact", head: true }).eq("moderation_status", "approved"),
    supabase.from("tributes").select("*", { count: "exact", head: true }).eq("featured", true),
    supabase.from("team_registrations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("team_registrations").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("donations").select("*", { count: "exact", head: true }).eq("verification_state", "unverified"),
    supabase.from("donations").select("currency, amount").eq("verification_state", "verified"),
    supabase.from("livestreams").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
    supabase.from("tributes").select("id, contributor_name, created_at, relationship").eq("moderation_status", "pending").order("created_at", { ascending: false }).limit(5),
    supabase.from("media_items").select("id, contributor_name, media_type, created_at, gallery_album_slug").eq("moderation_status", "pending").order("created_at", { ascending: false }).limit(5),
    supabase.from("donations").select("id, donor_name, donation_method, amount, currency, transaction_reference, verification_state, created_at").eq("verification_state", "unverified").order("created_at", { ascending: false }).limit(5),
    supabase.from("team_registrations").select("id, applicant_name, primary_team_slug, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
    supabase.from("audit_log").select("id, action, entity_type, summary, created_at, actor_user_id").order("created_at", { ascending: false }).limit(8),
    supabase.from("programme_events").select("id, title, start_time, venue").eq("publication_state", "published").order("start_time").limit(5),
  ]);

  const totals = new Map<string, number>();
  (verifiedDonationTotalsRes.data || []).forEach((row) => {
    totals.set(row.currency || "unknown", (totals.get(row.currency || "unknown") || 0) + Number(row.amount || 0));
  });

  return {
    stats: {
      pendingTributes: pendingTributesRes.count || 0,
      pendingMedia: pendingMediaRes.count || 0,
      approvedTributes: approvedTributesRes.count || 0,
      featuredTributes: featuredTributesRes.count || 0,
      pendingTeamRegistrations: pendingTeamRegistrationsRes.count || 0,
      approvedVolunteers: approvedVolunteersRes.count || 0,
      unverifiedDonations: unverifiedDonationsRes.count || 0,
      verifiedDonationTotals: [...totals.entries()].map(([currency, total]) => ({ currency, total })),
      scheduledLivestreams: scheduledLivestreamsRes.count || 0,
    },
    attention: {
      pendingTributes: pendingTributesRows.data || [],
      pendingMedia: pendingMediaRows.data || [],
      unverifiedDonations: unverifiedDonationRows.data || [],
      teamRegistrations: teamRegistrationRows.data || [],
    },
    recentAudit: auditRows.data || [],
    upcomingEvents: upcomingEventsRows.data || [],
  };
});

export function getVisibleAdminSections(profile: AdminProfile) {
  return adminSections.filter((section) => section.roles.includes(profile.role));
}

export async function getAdminMediaPreviewUrl(bucket: string | null, path: string | null) {
  if (!isSupabaseConfigured() || !bucket || !path) return null;
  const service = createServiceRoleSupabaseClient();
  const { data } = await service.storage.from(bucket).createSignedUrl(path, 60 * 10);
  return data?.signedUrl || null;
}

export async function getAdminMediaPreviewMap(records: Array<{ id: string; storage_bucket?: string | null; original_storage_path?: string | null; poster_storage_path?: string | null }>) {
  const entries = await Promise.all(
    records.map(async (record) => {
      const preview =
        (await getAdminMediaPreviewUrl(record.storage_bucket || null, record.poster_storage_path || null)) ||
        (await getAdminMediaPreviewUrl(record.storage_bucket || null, record.original_storage_path || null));
      return [record.id, preview] as const;
    }),
  );
  return new Map(entries);
}

export async function getSettingsEditorData() {
  if (!isSupabaseConfigured()) {
    return [{ id: "demo-settings", ...demoSiteSettings }];
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1);
  return data || [];
}

export async function getBiographyAdminData() {
  if (!isSupabaseConfigured()) {
    return demoBiographySections;
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("biography_sections").select("*").order("display_order");
  return data || [];
}

export async function getTimelineAdminData() {
  if (!isSupabaseConfigured()) {
    return demoTimeline;
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("timeline_entries").select("*").order("display_order");
  return data || [];
}

export async function getTributesAdminData(filters?: { status?: string; q?: string } & AdminPaginationInput) {
  if (!isSupabaseConfigured()) {
    return paginateArray(demoTributes, filters);
  }
  const supabase = await createServerSupabaseClient();
  const page = clampPage(filters?.page);
  const pageSize = clampPageSize(filters?.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from("tributes").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filters?.status && filters.status !== "all") query = query.eq("moderation_status", filters.status);
  if (filters?.q) query = query.ilike("contributor_name", `%${filters.q}%`);
  const { data, count } = await query.range(from, to);
  return {
    rows: data || [],
    total: count || 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count || 0) / pageSize)),
  };
}

export async function getTributeAdminDetail(id: string) {
  if (!isSupabaseConfigured()) {
    const tribute = demoTributes.find((item) => item.id === id || item.slug === id);
    return tribute ? { tribute, media: demoMediaItems.filter((item) => item.tributeId === tribute.id) } : null;
  }
  const supabase = await createServerSupabaseClient();
  const [{ data: tribute }, { data: media }] = await Promise.all([
    supabase.from("tributes").select("*").eq("id", id).maybeSingle(),
    supabase.from("media_items").select("*").eq("tribute_id", id).order("display_order"),
  ]);
  if (!tribute) return null;
  return { tribute, media: media || [] };
}

export async function getMediaAdminData(filters?: { status?: string; kind?: string; q?: string } & AdminPaginationInput) {
  if (!isSupabaseConfigured()) {
    return paginateArray(demoMediaItems, filters);
  }
  const supabase = await createServerSupabaseClient();
  const page = clampPage(filters?.page);
  const pageSize = clampPageSize(filters?.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from("media_items").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filters?.status && filters.status !== "all") query = query.eq("moderation_status", filters.status);
  if (filters?.kind && filters.kind !== "all") query = query.eq("media_type", filters.kind);
  if (filters?.q) query = query.ilike("contributor_name", `%${filters.q}%`);
  const { data, count } = await query.range(from, to);
  return {
    rows: data || [],
    total: count || 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count || 0) / pageSize)),
  };
}

export async function getGalleryAdminData() {
  if (!isSupabaseConfigured()) {
    return { albums: [], media: demoMediaItems };
  }
  const supabase = await createServerSupabaseClient();
  const [{ data: albums }, { data: media }] = await Promise.all([
    supabase.from("gallery_albums").select("*").order("display_order"),
    supabase.from("media_items").select("id, title, gallery_album_slug, moderation_status, featured").eq("moderation_status", "approved"),
  ]);
  return { albums: albums || [], media: media || [] };
}

export async function getProgrammeAdminData() {
  if (!isSupabaseConfigured()) {
    return demoProgrammeEvents;
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("programme_events").select("*").order("start_time");
  return data || [];
}

export async function getProgrammeAdminDetail(id: string) {
  if (!isSupabaseConfigured()) {
    return demoProgrammeEvents.find((event) => event.id === id || event.slug === id) || null;
  }
  const supabase = await createServerSupabaseClient();
  const [{ data: event }, { data: items }] = await Promise.all([
    supabase.from("programme_events").select("*").eq("id", id).maybeSingle(),
    supabase.from("programme_items").select("*").eq("programme_event_id", id).order("display_order"),
  ]);
  return event ? { ...event, items: items || [] } : null;
}

export async function getLivestreamAdminData() {
  if (!isSupabaseConfigured()) return demoLivestreams;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("livestreams").select("*").order("scheduled_start");
  return data || [];
}

export async function getCoordinatorsAdminData() {
  if (!isSupabaseConfigured()) return demoCoordinatorGroups;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("coordinators").select("*").order("department_order").order("display_order");
  return data || [];
}

export async function getTeamsAdminData() {
  if (!isSupabaseConfigured()) return demoTeams;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("team_definitions").select("*").order("display_order");
  return data || [];
}

export async function getTeamRegistrationsAdminData(filters?: { status?: string; team?: string; q?: string } & AdminPaginationInput) {
  if (!isSupabaseConfigured()) return paginateArray([], filters);
  const supabase = await createServerSupabaseClient();
  const page = clampPage(filters?.page);
  const pageSize = clampPageSize(filters?.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from("team_registrations").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.team && filters.team !== "all") query = query.eq("primary_team_slug", filters.team);
  if (filters?.q) query = query.or(`applicant_name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%`);
  const { data, count } = await query.range(from, to);
  return {
    rows: data || [],
    total: count || 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count || 0) / pageSize)),
  };
}

export async function getDonationsAdminData(filters?: { method?: string; verification?: string } & AdminPaginationInput) {
  if (!isSupabaseConfigured()) return paginateArray([], filters);
  const supabase = await createServerSupabaseClient();
  const page = clampPage(filters?.page);
  const pageSize = clampPageSize(filters?.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from("donations").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filters?.method && filters.method !== "all") query = query.eq("donation_method", filters.method);
  if (filters?.verification && filters.verification !== "all") query = query.eq("verification_state", filters.verification);
  const { data, count } = await query.range(from, to);
  return {
    rows: data || [],
    total: count || 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count || 0) / pageSize)),
  };
}

export async function getDonationAdminDetail(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const [{ data: donation }, { data: events }] = await Promise.all([
    supabase.from("donations").select("*").eq("id", id).maybeSingle(),
    supabase.from("donation_payment_events").select("*").eq("donation_id", id).order("created_at", { ascending: false }),
  ]);
  return donation ? { donation, events: events || [] } : null;
}

export async function getUsersAdminData(input?: AdminPaginationInput) {
  if (!isSupabaseConfigured()) return paginateArray([], input);
  const supabase = await createServerSupabaseClient();
  const page = clampPage(input?.page);
  const pageSize = clampPageSize(input?.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase.from("admin_users").select("*", { count: "exact" }).order("created_at").range(from, to);
  const authUserIds = (data || []).map((row) => row.auth_user_id).filter(Boolean);
  const { data: profiles } = authUserIds.length
    ? await supabase.from("admin_profiles").select("user_id, invited_at, last_sign_in_at").in("user_id", authUserIds)
    : { data: [] as Array<{ user_id: string; invited_at: string | null; last_sign_in_at: string | null }> };
  const profilesById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
  return {
    rows: (data || []).map((row) => ({
      ...row,
      invited_at: profilesById.get(row.auth_user_id || "")?.invited_at || row.created_at,
      last_sign_in_at: profilesById.get(row.auth_user_id || "")?.last_sign_in_at || null,
    })),
    total: count || 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count || 0) / pageSize)),
  };
}

export async function getAdminInvitations() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("admin_invitations").select("*").order("created_at", { ascending: false }).limit(20);
  return data || [];
}

export async function getAuditLogAdminData(filters?: { action?: string } & AdminPaginationInput) {
  if (!isSupabaseConfigured()) return paginateArray(demoAuditLog, filters);
  const supabase = await createServerSupabaseClient();
  const page = clampPage(filters?.page);
  const pageSize = clampPageSize(filters?.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from("audit_log").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filters?.action) query = query.ilike("action", `%${filters.action}%`);
  const { data, count } = await query.range(from, to);
  return {
    rows: data || [],
    total: count || 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count || 0) / pageSize)),
  };
}

export function getAdminSectionPermissions(section: string, profile: AdminProfile) {
  if (["tributes", "media"].includes(section)) return canManageModeration(profile);
  if (["donations"].includes(section)) return canManageFinance(profile);
  if (["users"].includes(section)) return canManageAdminUsers(profile);
  if (["settings", "biography", "timeline", "programme", "livestreams", "coordinators", "teams", "gallery"].includes(section)) {
    return canManageContent(profile);
  }
  return section === "audit-log" || section === "team-registrations";
}
