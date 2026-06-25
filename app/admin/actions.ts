"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerActionSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase";
import { requireAdminProfile, requestAdminMagicLink, signInAdminWithPassword, signOutAdmin } from "@/lib/auth";
import { canManageAdminUsers, canManageContent, canManageFinance, canManageModeration } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

function revalidateAdminAndPublic(...tags: string[]) {
  const merged = new Set(["public-content", ...tags]);
  merged.forEach((tag) => revalidateTag(tag, "max"));
}

async function insertAudit(profile: Awaited<ReturnType<typeof requireAdminProfile>>, action: string, entityType: string, entityId: string, summary: string, previousValue?: unknown, newValue?: unknown) {
  if (!isSupabaseConfigured()) return;
  const service = await createServerActionSupabaseClient();
  await service.from("audit_log").insert({
    actor_user_id: profile.userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    previous_value: previousValue ?? null,
    new_value: newValue ?? null,
  });
}

function requireCheckedConfirmation(formData: FormData) {
  return formData.get("confirmed") === "yes";
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");
  if (!isSupabaseConfigured()) {
    const result = await signInAdminWithPassword(email, password);
    if (result.error) {
      redirect(`/admin/login?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
    }
    redirect(next);
  }

  const result = await requestAdminMagicLink(email, next);
  if (result.error) {
    redirect(`/admin/login?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/admin/login?sent=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

export async function logoutAction() {
  await signOutAdmin();
  redirect("/admin/login");
}

export async function updateSiteSettingsAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const service = await createServerActionSupabaseClient();
  const id = String(formData.get("id"));
  const payload = {
    memorial_name: String(formData.get("memorial_name") || ""),
    subtitle: String(formData.get("subtitle") || ""),
    birth_date: String(formData.get("birth_date") || ""),
    passing_date: String(formData.get("passing_date") || ""),
    memorial_weekend: String(formData.get("memorial_weekend") || ""),
    hero_heading: String(formData.get("hero_heading") || ""),
    hero_message: String(formData.get("hero_message") || ""),
    homepage_biography_excerpt: String(formData.get("homepage_biography_excerpt") || ""),
    biography_introduction: String(formData.get("biography_introduction") || ""),
    seo_title: String(formData.get("seo_title") || ""),
    seo_description: String(formData.get("seo_description") || ""),
    whatsapp_share_text: String(formData.get("whatsapp_share_text") || ""),
    public_website_url: String(formData.get("public_website_url") || ""),
    default_timezone: String(formData.get("default_timezone") || "Africa/Douala"),
    open_graph_image: String(formData.get("open_graph_image") || ""),
    donation_instructions: String(formData.get("donation_instructions") || ""),
    livestream_fallback_message: String(formData.get("livestream_fallback_message") || ""),
    footer_message: String(formData.get("footer_message") || ""),
    family_whatsapp_contact: String(formData.get("family_whatsapp_contact") || ""),
    public_family_contacts: {
      primaryEmail: String(formData.get("family_contact_email") || ""),
      primaryPhone: String(formData.get("family_contact_phone") || ""),
    },
    mobile_money_settings: {
      visible: formData.get("mobile_money_visible") === "on",
      mtnDisplayName: String(formData.get("mtn_display_name") || ""),
      mtnDisplayNumber: String(formData.get("mtn_display_number") || ""),
      orangeDisplayName: String(formData.get("orange_display_name") || ""),
      orangeDisplayNumber: String(formData.get("orange_display_number") || ""),
    },
    venue_information: {
      overview: String(formData.get("venue_overview") || ""),
    },
    updated_at: new Date().toISOString(),
  };
  await service.from("site_settings").update(payload).eq("id", id);
  await insertAudit(profile, "settings.updated", "site_settings", id, "Memorial settings updated", null, payload);
  revalidateAdminAndPublic("site-settings");
  redirect("/admin/settings?saved=1");
}

export async function saveBiographySectionAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const service = await createServerActionSupabaseClient();
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    summary: String(formData.get("summary") || ""),
    body: String(formData.get("body") || ""),
    body_format: "markdown",
    display_order: Number(formData.get("display_order") || 0),
    publication_state: String(formData.get("publication_state") || "draft"),
  };
  if (id) {
    await service.from("biography_sections").update(payload).eq("id", id);
    await insertAudit(profile, "biography.updated", "biography_section", id, `Biography section ${payload.title} updated`, null, payload);
  } else {
    const { data } = await service.from("biography_sections").insert(payload).select("id").single();
    await insertAudit(profile, "biography.created", "biography_section", data?.id || payload.slug, `Biography section ${payload.title} created`, null, payload);
  }
  revalidateAdminAndPublic("biography");
  redirect("/admin/biography?saved=1");
}

export async function archiveBiographySectionAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const service = await createServerActionSupabaseClient();
  await service.from("biography_sections").update({ publication_state: "archived" }).eq("id", id);
  await insertAudit(profile, "biography.archived", "biography_section", id, "Biography section archived");
  revalidateAdminAndPublic("biography");
  redirect("/admin/biography?saved=1");
}

export async function saveTimelineEntryAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const payload = {
    date_label: String(formData.get("date_label") || ""),
    year: Number(formData.get("year") || 0) || null,
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    image_reference: String(formData.get("image_reference") || "") || null,
    display_order: Number(formData.get("display_order") || 0),
    publication_state: String(formData.get("publication_state") || "draft"),
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("timeline_entries").update(payload).eq("id", id);
    await insertAudit(profile, "timeline.updated", "timeline_entry", id, `Timeline entry ${payload.title} updated`, null, payload);
  } else {
    const { data } = await service.from("timeline_entries").insert(payload).select("id").single();
    await insertAudit(profile, "timeline.created", "timeline_entry", data?.id || payload.title, `Timeline entry ${payload.title} created`, null, payload);
  }
  revalidateAdminAndPublic("timeline");
  redirect("/admin/timeline?saved=1");
}

export async function moderateTributeAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageModeration(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  if (["reject", "archive"].includes(action) && !String(formData.get("reason") || "").trim()) {
    redirect(`/admin/tributes/${id}?error=reason-required`);
  }
  if (action === "archive" && !requireCheckedConfirmation(formData)) {
    redirect(`/admin/tributes/${id}?error=confirmation-required`);
  }
  const service = await createServerActionSupabaseClient();
  const patch =
    action === "approve"
      ? {
          moderation_status: "approved",
          published_at: new Date().toISOString(),
          rejection_reason: null,
          featured: formData.get("featured") === "on",
          slug: String(formData.get("slug") || `tribute-${id.slice(0, 8)}`),
        }
        : action === "reject"
        ? { moderation_status: "rejected", rejection_reason: String(formData.get("reason") || "Rejected by administrator.") }
        : action === "restore"
          ? { moderation_status: "pending", archived_at: null }
          : { moderation_status: "archived", archived_at: new Date().toISOString(), rejection_reason: String(formData.get("reason") || "Archived by administrator.") };
  await service.from("tributes").update(patch).eq("id", id);
  await insertAudit(profile, `tribute.${action}`, "tribute", id, `Tribute ${action}d`);
  revalidateAdminAndPublic("tributes", "gallery");
  redirect(`/admin/tributes/${id}?saved=1`);
}

export async function updateTributeDetailsAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageModeration(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const payload = {
    contributor_name: String(formData.get("contributor_name") || ""),
    relationship: String(formData.get("relationship") || ""),
    relationship_category: String(formData.get("relationship_category") || ""),
    location: String(formData.get("location") || ""),
    tribute_message: String(formData.get("tribute_message") || ""),
    private_email: String(formData.get("private_email") || ""),
    private_phone: String(formData.get("private_phone") || ""),
    featured: formData.get("featured") === "on",
  };
  const service = await createServerActionSupabaseClient();
  await service.from("tributes").update(payload).eq("id", id);
  await insertAudit(profile, "tribute.updated", "tribute", id, "Tribute details updated");
  revalidateAdminAndPublic("tributes");
  redirect(`/admin/tributes/${id}?saved=1`);
}

export async function updateMediaRecordAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageModeration(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const payload = {
    title: String(formData.get("title") || ""),
    caption: String(formData.get("caption") || ""),
    alt_text: String(formData.get("alt_text") || ""),
    gallery_album_slug: String(formData.get("gallery_album_slug") || "") || null,
    featured: formData.get("featured") === "on",
    poster_storage_path: String(formData.get("poster_storage_path") || "") || null,
    moderation_status: String(formData.get("moderation_status") || "pending"),
    thumbnail_pending: formData.get("thumbnail_pending") === "on",
  };
  const service = await createServerActionSupabaseClient();
  await service.from("media_items").update(payload).eq("id", id);
  await insertAudit(profile, "media.updated", "media_item", id, "Media metadata updated");
  revalidateAdminAndPublic("gallery", "tributes");
  redirect("/admin/media?saved=1");
}

export async function archiveMediaAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageModeration(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const service = await createServerActionSupabaseClient();
  const action = String(formData.get("action") || "archive");
  const patch =
    action === "restore"
      ? { moderation_status: "pending", archived_at: null }
      : { moderation_status: "archived", archived_at: new Date().toISOString() };
  await service.from("media_items").update(patch).eq("id", id);
  await insertAudit(profile, `media.${action}`, "media_item", id, `Media ${action}d`);
  revalidateAdminAndPublic("gallery", "tributes");
  redirect("/admin/media?saved=1");
}

export async function saveGalleryAlbumAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || ""),
    cover_media_id: String(formData.get("cover_media_id") || "") || null,
    display_order: Number(formData.get("display_order") || 0),
    is_published: formData.get("is_published") === "on",
    is_active: formData.get("is_active") !== "off",
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("gallery_albums").update(payload).eq("id", id);
    await insertAudit(profile, "gallery.updated", "gallery_album", id, "Gallery album updated");
  } else {
    const { data } = await service.from("gallery_albums").insert(payload).select("id").single();
    await insertAudit(profile, "gallery.created", "gallery_album", data?.id || payload.slug, "Gallery album created");
  }
  revalidateAdminAndPublic("gallery");
  redirect("/admin/gallery?saved=1");
}

export async function saveProgrammeEventAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    event_type: String(formData.get("event_type") || "Other"),
    description: String(formData.get("description") || ""),
    start_time: String(formData.get("start_time") || ""),
    end_time: String(formData.get("end_time") || ""),
    timezone: String(formData.get("timezone") || "Africa/Douala"),
    venue: String(formData.get("venue") || ""),
    address: String(formData.get("address") || ""),
    map_url: String(formData.get("map_url") || ""),
    publication_state: String(formData.get("publication_state") || "draft"),
    pdf_url: String(formData.get("pdf_url") || "") || null,
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("programme_events").update(payload).eq("id", id);
    await insertAudit(profile, "programme.updated", "programme_event", id, "Programme event updated");
  } else {
    const { data } = await service.from("programme_events").insert(payload).select("id").single();
    await insertAudit(profile, "programme.created", "programme_event", data?.id || payload.slug, "Programme event created");
  }
  revalidateAdminAndPublic("programme", "livestreams");
  redirect("/admin/programme?saved=1");
}

export async function saveProgrammeItemAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const eventId = String(formData.get("programme_event_id"));
  const payload = {
    programme_event_id: eventId,
    time_label: String(formData.get("time_label") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    participant_name: String(formData.get("participant_name") || ""),
    display_order: Number(formData.get("display_order") || 0),
    label: String(formData.get("title") || ""),
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("programme_items").update(payload).eq("id", id);
  } else {
    await service.from("programme_items").insert(payload);
  }
  await insertAudit(profile, "programme.item.saved", "programme_event", eventId, "Programme item saved");
  revalidateAdminAndPublic("programme");
  redirect(`/admin/programme/${eventId}?saved=1`);
}

export async function saveLivestreamAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const payload = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    event_slug: String(formData.get("event_slug") || "") || null,
    platform: String(formData.get("platform") || "YouTube"),
    embed_url: String(formData.get("embed_url") || ""),
    external_url: String(formData.get("external_url") || ""),
    backup_url: String(formData.get("backup_url") || ""),
    scheduled_start: String(formData.get("scheduled_start") || ""),
    actual_start: String(formData.get("actual_start") || "") || null,
    end_time: String(formData.get("end_time") || "") || null,
    status: String(formData.get("status") || "scheduled"),
    manual_status_override: String(formData.get("manual_status_override") || "") || null,
    recording_url: String(formData.get("recording_url") || "") || null,
    backup_message: String(formData.get("backup_message") || ""),
    publication_state: String(formData.get("publication_state") || "draft"),
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("livestreams").update(payload).eq("id", id);
  } else {
    await service.from("livestreams").insert(payload);
  }
  await insertAudit(profile, "livestream.saved", "livestream", id || payload.slug, "Livestream saved");
  revalidateAdminAndPublic("livestreams", "programme");
  redirect("/admin/livestreams?saved=1");
}

export async function saveCoordinatorAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const payload = {
    department: String(formData.get("department") || ""),
    department_slug: String(formData.get("department_slug") || ""),
    department_description: String(formData.get("department_description") || ""),
    department_order: Number(formData.get("department_order") || 0),
    name: String(formData.get("name") || ""),
    role_title: String(formData.get("role_title") || ""),
    photo_url: String(formData.get("photo_url") || "") || null,
    private_phone: String(formData.get("private_phone") || "") || null,
    private_email: String(formData.get("private_email") || "") || null,
    public_phone: String(formData.get("public_phone") || "") || null,
    public_email: String(formData.get("public_email") || "") || null,
    public_phone_flag: formData.get("public_phone_flag") === "on",
    public_email_flag: formData.get("public_email_flag") === "on",
    display_order: Number(formData.get("display_order") || 0),
    is_active: formData.get("is_active") !== "off",
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("coordinators").update(payload).eq("id", id);
  } else {
    await service.from("coordinators").insert(payload);
  }
  await insertAudit(profile, "coordinator.saved", "coordinator", id || payload.department_slug, "Coordinator record saved");
  revalidateAdminAndPublic("coordinators");
  redirect("/admin/coordinators?saved=1");
}

export async function saveTeamDefinitionAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageContent(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id") || "");
  const payload = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    coordinator_name: String(formData.get("coordinator_name") || ""),
    capacity: Number(formData.get("capacity") || 0) || null,
    is_active: formData.get("is_active") !== "off",
    public_signup_available: formData.get("public_signup_available") === "on",
    display_order: Number(formData.get("display_order") || 0),
  };
  const service = await createServerActionSupabaseClient();
  if (id) {
    await service.from("team_definitions").update(payload).eq("id", id);
  } else {
    await service.from("team_definitions").insert(payload);
  }
  await insertAudit(profile, "team.saved", "team_definition", id || payload.slug, "Team definition saved");
  revalidateAdminAndPublic("teams");
  redirect("/admin/teams?saved=1");
}

export async function updateTeamRegistrationAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!(canManageContent(profile) || canManageModeration(profile)) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const payload = {
    status: String(formData.get("status") || "pending"),
    primary_team_slug: String(formData.get("primary_team_slug") || "") || null,
    private_admin_notes: String(formData.get("private_admin_notes") || "") || null,
    contacted_at: formData.get("mark_contacted") === "on" ? new Date().toISOString() : null,
    approved_at: formData.get("status") === "approved" ? new Date().toISOString() : null,
    completed_at: formData.get("status") === "completed" ? new Date().toISOString() : null,
  };
  const service = await createServerActionSupabaseClient();
  await service.from("team_registrations").update(payload).eq("id", id);
  await insertAudit(profile, "team_registration.updated", "team_registration", id, "Team registration updated");
  revalidateAdminAndPublic("team-registrations");
  redirect("/admin/team-registrations?saved=1");
}

export async function verifyDonationAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageFinance(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const payload = {
    verification_state: String(formData.get("verification_state") || "verified"),
    internal_status: String(formData.get("internal_status") || "completed"),
    collector: String(formData.get("collector") || "") || null,
    receipt_reference: String(formData.get("receipt_reference") || "") || null,
    finance_notes: String(formData.get("finance_notes") || "") || null,
    in_kind_delivery_state: String(formData.get("in_kind_delivery_state") || "") || null,
    updated_at: new Date().toISOString(),
  };
  const service = await createServerActionSupabaseClient();
  await service.from("donations").update(payload).eq("id", id);
  await insertAudit(profile, "donation.updated", "donation", id, "Donation verification updated");
  revalidateAdminAndPublic("donations");
  redirect(`/admin/donations/${id}?saved=1`);
}

export async function ownerDonationOverrideAction(formData: FormData) {
  const profile = await requireAdminProfile(["owner"]);
  if (!isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") || "").trim();
  if (!reason) {
    redirect(`/admin/donations/${id}?error=reason-required`);
  }
  if (!requireCheckedConfirmation(formData)) {
    redirect(`/admin/donations/${id}?error=confirmation-required`);
  }
  const service = await createServerActionSupabaseClient();
  const { data: before } = await service
    .from("donations")
    .select("provider_payment_status, verification_state, internal_status")
    .eq("id", id)
    .maybeSingle();
  const payload = {
    provider_payment_status: String(formData.get("provider_payment_status") || "pending"),
    verification_state: String(formData.get("verification_state") || "unverified"),
    internal_status: String(formData.get("internal_status") || "pending"),
    manual_override_reason: reason,
    updated_at: new Date().toISOString(),
  };
  await service.from("donations").update(payload).eq("id", id);
  await insertAudit(
    profile,
    "donation.owner_override",
    "donation",
    id,
    "Owner manually overrode provider-facing donation state",
    before,
    payload,
  );
  revalidateAdminAndPublic("donations");
  redirect(`/admin/donations/${id}?saved=1`);
}

export async function inviteAdminUserAction(formData: FormData) {
  const profile = await requireAdminProfile(["owner", "administrator"]);
  if (!isSupabaseConfigured()) {
    redirect("/admin/users?error=supabase-not-configured");
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") || "").trim();
  const role = String(formData.get("role") || "moderator");
  if (!email.includes("@") || displayName.length < 2) {
    redirect("/admin/users?error=invalid-invitation");
  }
  if (role === "owner" && profile.role !== "owner") {
    redirect("/admin/users?error=owner-only");
  }

  const service = createServiceRoleSupabaseClient();
  await service.from("admin_users").upsert(
    {
      email,
      display_name: displayName,
      role,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  const { data: existingInvite } = await service
    .from("admin_invitations")
    .select("id")
    .eq("email", email)
    .in("invitation_state", ["pending", "sent"])
    .maybeSingle();
  if (existingInvite) {
    redirect("/admin/users?error=duplicate-invitation");
  }

  const { data: invitedUser, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName, requested_role: role },
  });
  const invitationState = inviteError ? "failed" : "sent";
  await service.from("admin_invitations").insert({
    email,
    display_name: displayName,
    role,
    invited_by_user_id: profile.userId,
    invited_user_id: invitedUser.user?.id || null,
    invitation_state: invitationState,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    sent_at: inviteError ? null : new Date().toISOString(),
    failure_reason: inviteError ? "Invitation delivery is unavailable in this environment." : null,
  });
  await insertAudit(profile, "admin_invitation.created", "admin_invitation", email, `Admin invitation created for ${email}`);
  redirect(`/admin/users?${inviteError ? "error=invite-delivery-unavailable" : "saved=1"}`);
}

export async function updateAdminInvitationAction(formData: FormData) {
  const profile = await requireAdminProfile(["owner", "administrator"]);
  if (!isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const service = createServiceRoleSupabaseClient();
  if (action === "revoke") {
    await service
      .from("admin_invitations")
      .update({ invitation_state: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", id);
  } else if (action === "resend") {
    const { data: invitation } = await service.from("admin_invitations").select("*").eq("id", id).maybeSingle();
    if (!invitation) redirect("/admin/users?error=invite-not-found");
    const { error } = await service.auth.admin.inviteUserByEmail(invitation.email, {
      data: { display_name: invitation.display_name, requested_role: invitation.role },
    });
    await service
      .from("admin_invitations")
      .update({
        invitation_state: error ? "failed" : "sent",
        sent_at: error ? invitation.sent_at : new Date().toISOString(),
        failure_reason: error ? "Invitation delivery is unavailable in this environment." : null,
      })
      .eq("id", id);
  }
  await insertAudit(profile, `admin_invitation.${action}`, "admin_invitation", id, `Admin invitation ${action}d`);
  redirect("/admin/users?saved=1");
}

export async function saveAdminUserAction(formData: FormData) {
  const profile = await requireAdminProfile();
  if (!canManageAdminUsers(profile) || !isSupabaseConfigured()) redirect("/admin?error=forbidden");
  const id = String(formData.get("admin_user_id"));
  const authUserId = String(formData.get("auth_user_id") || "") || null;
  const currentRole = String(formData.get("current_role") || "");
  const role = String(formData.get("role"));
  const isActive = formData.get("is_active") === "on";
  const displayName = String(formData.get("display_name") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const service = await createServerActionSupabaseClient();
  if (profile.role !== "owner" && (role === "owner" || currentRole === "owner")) {
    redirect("/admin/users?error=owner-only");
  }
  const { data: owners } = await service.from("admin_users").select("id, auth_user_id").eq("role", "owner").eq("is_active", true);
  if (authUserId === profile.userId && (!isActive || role !== profile.role)) {
    redirect("/admin/users?error=self-change");
  }
  if (owners && owners.length === 1 && owners[0].id === id && (!isActive || role !== "owner")) {
    redirect("/admin/users?error=last-owner");
  }
  await service
    .from("admin_users")
    .update({ display_name: displayName, role, is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (authUserId) {
    await service
      .from("admin_profiles")
      .upsert(
        {
          user_id: authUserId,
          display_name: displayName || email,
          role,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
  }

  await insertAudit(profile, "admin_user.updated", "admin_user", id, "Admin directory record updated");
  revalidateAdminAndPublic("users");
  redirect("/admin/users?saved=1");
}
