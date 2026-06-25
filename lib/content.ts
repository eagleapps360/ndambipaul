import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import {
  demoAuditLog,
  demoBiographySections,
  demoCoordinatorGroups,
  demoLivestreams,
  demoMediaItems,
  demoProgrammeEvents,
  demoSiteSettings,
  demoTimeline,
  demoTributes,
  demoTeams,
} from "@/lib/demo-content";
import { getGalleryFallbackImage, normalizeImageUrl } from "@/lib/public-image-fallbacks";
import { adminSections } from "@/lib/ui-config";

const defaultLivestreamPoster = "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg";
const defaultTributeImage = "/images/pa-ndambi/pa-ndambi-close-portrait.jpg";
const defaultOpenGraphImage = "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg";

export type MediaKind = "image" | "video" | "document";
export type LivestreamState = "scheduled" | "live" | "ended" | "cancelled";
export type TeamStatus = "pending" | "approved" | "contacted" | "declined" | "completed";
export type DonationMethod = "cash" | "kind" | "mobile-money" | "card" | "bank-transfer";
export type AdminRole = "owner" | "administrator" | "moderator" | "finance" | "content_editor";

export type SiteSettings = typeof demoSiteSettings;
export type BiographySection = (typeof demoBiographySections)[number];
export type TimelineEntry = (typeof demoTimeline)[number];
export type Tribute = (typeof demoTributes)[number];
export type MediaItem = (typeof demoMediaItems)[number];
export type ProgrammeEvent = (typeof demoProgrammeEvents)[number];
export type Livestream = (typeof demoLivestreams)[number];
export type CoordinatorGroup = (typeof demoCoordinatorGroups)[number];
export type TeamDefinition = (typeof demoTeams)[number];

export const auditLog = demoAuditLog;

export function getDemoModeNotice() {
  return isDemoMode()
    ? "Supabase is not configured, so the site is using local demo content and non-persistent submissions."
    : null;
}

function logPublicLoaderError(context: string, error: unknown) {
  if (typeof error === "object" && error && "code" in error && "message" in error) {
    const safeError = error as { code?: string; message?: string };
    console.error(`${context}:`, {
      code: safeError.code,
      message: safeError.message,
    });
    return;
  }

  console.error(`${context}:`, error instanceof Error ? error.message : "Unknown error");
}

function cachedQuery<TArgs extends unknown[], TResult>(
  keyParts: string[],
  fn: (...args: TArgs) => Promise<TResult>,
  options: { revalidate: number; tags: string[] },
) {
  if (process.env.NODE_ENV === "test") {
    return fn;
  }
  return unstable_cache(fn, keyParts, options);
}

function assertConfiguredOrDemoSafe() {
  if (isSupabaseConfigured()) {
    return;
  }
  if (!isDemoMode()) {
    throw new Error("Supabase is expected to be configured in this environment.");
  }
}

async function readSingleSettingsRow() {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("public_site_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export const getPublicSiteSettings = cachedQuery(
  ["public-site-settings"],
  async (): Promise<SiteSettings> => {
    assertConfiguredOrDemoSafe();
    if (!isSupabaseConfigured()) {
      return demoSiteSettings;
    }
    try {
      const row = await readSingleSettingsRow();
      if (!row) {
        return demoSiteSettings;
      }
      return {
        ...demoSiteSettings,
        memorialName: row.memorial_name,
        title: row.seo_title || row.memorial_name,
        subtitle: row.subtitle,
        dates: {
          birth: row.birth_date || demoSiteSettings.dates.birth,
          passing: row.passing_date || demoSiteSettings.dates.passing,
          memorialWeekend: row.memorial_weekend || demoSiteSettings.dates.memorialWeekend,
        },
        hero: {
          kicker: demoSiteSettings.hero.kicker,
          heading: row.hero_heading,
          copy: row.hero_message,
          biographyExcerpt: row.biography_introduction || demoSiteSettings.hero.biographyExcerpt,
        },
        biographyIntroduction: row.biography_introduction || demoSiteSettings.biographyIntroduction,
        shareText: row.whatsapp_share_text || demoSiteSettings.shareText,
        seo: {
          ...demoSiteSettings.seo,
          title: row.seo_title || demoSiteSettings.seo.title,
          description: row.seo_description || demoSiteSettings.seo.description,
        },
        venueHighlights: Array.isArray(row.venue_information?.highlights)
          ? row.venue_information.highlights
          : demoSiteSettings.venueHighlights,
        venueInformation: Array.isArray(row.venue_information?.venues)
          ? row.venue_information.venues
          : demoSiteSettings.venueInformation,
        livestreamFallbackMessage: row.livestream_fallback_message || demoSiteSettings.livestreamFallbackMessage,
        socialLinks: typeof row.social_links === "object" && row.social_links ? row.social_links : demoSiteSettings.socialLinks,
        openGraphImage: normalizeImageUrl(row.open_graph_image || demoSiteSettings.openGraphImage, defaultOpenGraphImage),
        familyContacts:
          typeof row.public_family_contacts === "object" && row.public_family_contacts
            ? row.public_family_contacts
            : demoSiteSettings.familyContacts,
        mobileMoney:
          typeof row.mobile_money_settings === "object" && row.mobile_money_settings
            ? row.mobile_money_settings
            : demoSiteSettings.mobileMoney,
        shortTitle: demoSiteSettings.shortTitle,
      };
    } catch (error) {
      logPublicLoaderError("Failed to load public site settings", error);
      return demoSiteSettings;
    }
  },
  { revalidate: 300, tags: ["public-content", "site-settings"] },
);

export const getPublishedBiography = cachedQuery(
  ["public-biography"],
  async (): Promise<BiographySection[]> => {
    if (!isSupabaseConfigured()) {
      return demoBiographySections;
    }
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("biography_sections")
        .select("id, slug, title, body, display_order")
        .eq("publication_state", "published")
        .order("display_order");
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        body: row.body,
        displayOrder: row.display_order,
      }));
    } catch (error) {
      logPublicLoaderError("Failed to load published biography", error);
      return demoBiographySections;
    }
  },
  { revalidate: 300, tags: ["public-content", "biography"] },
);

export const getPublishedTimeline = cachedQuery(
  ["public-timeline"],
  async (): Promise<TimelineEntry[]> => {
    if (!isSupabaseConfigured()) {
      return demoTimeline;
    }
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("timeline_entries")
        .select("id, date_label, year, title, description, image_reference, display_order")
        .eq("publication_state", "published")
        .order("display_order");
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        dateLabel: row.date_label,
        year: row.year,
        title: row.title,
        description: row.description,
        imageUrl: row.image_reference,
        displayOrder: row.display_order,
      }));
    } catch (error) {
      logPublicLoaderError("Failed to load published timeline", error);
      return demoTimeline;
    }
  },
  { revalidate: 300, tags: ["public-content", "timeline"] },
);

async function createSignedUrls(items: MediaItem[]) {
  if (!isSupabaseConfigured()) {
    return items;
  }
  const service = createServiceRoleSupabaseClient();
  return Promise.all(
    items.map(async (item) => {
      if (!item.publicUrl?.startsWith("private:")) {
        return item;
      }
      const bucket = item.publicUrl.split(":")[1];
      const filePath = item.publicUrl.split(":").slice(2).join(":");
      const { data } = await service.storage.from(bucket).createSignedUrl(filePath, 60 * 60);
      return {
        ...item,
        publicUrl: data?.signedUrl || item.publicUrl,
      };
    }),
  );
}

export async function getApprovedTributesUncached(): Promise<Tribute[]> {
  if (!isSupabaseConfigured()) {
    return demoTributes.filter((tribute) => tribute.status === "approved");
  }
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("public_tributes")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      status: "approved",
      featured: row.featured,
      category: row.relationship_category,
      relationship: row.relationship,
      name: row.contributor_name,
      location: row.location,
      message: row.tribute_message,
      profileImageUrl: normalizeImageUrl(row.profile_media_url, defaultTributeImage),
      submittedAt: row.created_at,
      publishedAt: row.published_at,
      privateEmail: "",
      privatePhone: "",
      rejectionReason: null,
      archivedAt: null,
    }));
  } catch (error) {
    logPublicLoaderError("Failed to load approved tributes", error);
    return demoTributes.filter((tribute) => tribute.status === "approved");
  }
}

export const getApprovedTributes = cachedQuery(["public-tributes"], getApprovedTributesUncached, {
  revalidate: 300,
  tags: ["public-content", "tributes"],
});

export const getFeaturedTributes = cachedQuery(
  ["public-featured-tributes"],
  async (): Promise<Tribute[]> => {
    const tributes = await getApprovedTributes();
    return tributes.filter((tribute) => tribute.featured);
  },
  { revalidate: 300, tags: ["public-content", "tributes"] },
);

export async function getTributeBySlug(slug: string): Promise<Tribute | null> {
  if (!isSupabaseConfigured()) {
    return demoTributes.find((tribute) => tribute.slug === slug && tribute.status === "approved") || null;
  }
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.from("public_tributes").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      slug: data.slug,
      status: "approved",
      featured: data.featured,
      category: data.relationship_category,
      relationship: data.relationship,
      name: data.contributor_name,
      location: data.location,
      message: data.tribute_message,
      profileImageUrl: normalizeImageUrl(data.profile_media_url, defaultTributeImage),
      submittedAt: data.created_at,
      publishedAt: data.published_at,
      privateEmail: "",
      privatePhone: "",
      rejectionReason: null,
      archivedAt: null,
    };
  } catch (error) {
    logPublicLoaderError("Failed to load tribute by slug", error);
    return demoTributes.find((tribute) => tribute.slug === slug && tribute.status === "approved") || null;
  }
}

export async function getPublishedGalleryUncached(): Promise<MediaItem[]> {
  if (!isSupabaseConfigured()) {
    return demoMediaItems.filter((item) => item.approved);
  }
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("public_media_gallery")
      .select("*")
      .order("featured", { ascending: false })
      .order("display_order", { ascending: true });
    if (error) throw error;
    const mapped = (data || []).map((row, index) => ({
      id: row.id,
      tributeId: row.tribute_id,
      albumSlug: row.gallery_album_slug,
      albumTitle: row.gallery_album_title,
      category: row.media_category,
      kind: row.media_type,
      title: row.title || row.caption || row.gallery_album_title,
      caption: row.caption,
      altText: row.alt_text || row.caption || row.title || "",
      contributor: row.contributor_name,
      date: row.published_at || row.created_at,
      posterUrl: normalizeImageUrl(row.poster_url || row.thumbnail_url || row.original_url, getGalleryFallbackImage(index)),
      publicUrl: normalizeImageUrl(row.original_url || row.poster_url || row.thumbnail_url, getGalleryFallbackImage(index)),
      approved: true,
      featured: row.featured,
      mimeType: row.mime_type,
      sizeBytes: row.file_size,
    })) as MediaItem[];
    return createSignedUrls(mapped);
  } catch (error) {
    logPublicLoaderError("Failed to load published gallery", error);
    return demoMediaItems.filter((item) => item.approved);
  }
}

export const getPublishedGallery = cachedQuery(["public-gallery"], getPublishedGalleryUncached, {
  revalidate: 300,
  tags: ["public-content", "gallery"],
});

export async function getApprovedGalleryItems() {
  return getPublishedGallery();
}

export function buildCalendarLink(event: ProgrammeEvent) {
  const start = new Date(event.startTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const end = new Date(event.endTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: `${event.venue}${event.address ? `, ${event.address}` : ""}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const getPublishedProgrammeEvents = cachedQuery(
  ["public-programme"],
  async (): Promise<ProgrammeEvent[]> => {
    if (!isSupabaseConfigured()) {
      return demoProgrammeEvents;
    }
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("public_programme_events")
        .select("*, programme_items:public_programme_items(label, display_order)")
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        eventType: row.event_type,
        startTime: row.start_time,
        endTime: row.end_time,
        timezone: row.timezone,
        venue: row.venue,
        address: row.address,
        description: row.description,
        pdfUrl: row.pdf_signed_url || row.pdf_url,
        mapUrl: row.map_url,
        isPublished: true,
        items: (row.programme_items || []).sort((a: any, b: any) => a.display_order - b.display_order).map((item: any) => item.label),
      }));
    } catch (error) {
      logPublicLoaderError("Failed to load published programme events", error);
      return demoProgrammeEvents;
    }
  },
  { revalidate: 300, tags: ["public-content", "programme"] },
);

export async function getProgramme(slug: string) {
  const events = await getPublishedProgrammeEvents();
  return events.find((event) => event.slug === slug) || null;
}

export function deriveLivestreamState(stream: Livestream, now = Date.now()) {
  if (stream.status === "cancelled") return "cancelled";
  const starts = new Date(stream.actualStartAt || stream.startsAt).getTime();
  const ends = stream.endsAt ? new Date(stream.endsAt).getTime() : null;
  if (stream.recordingUrl && ends && now > ends) return "ended";
  if (stream.status === "live") return "live";
  if (ends && now > ends) return "ended";
  if (now >= starts && (!ends || now <= ends)) return "live";
  return "scheduled";
}

export const getPublishedLivestreams = cachedQuery(
  ["public-livestreams"],
  async (): Promise<Livestream[]> => {
    if (!isSupabaseConfigured()) {
      return demoLivestreams;
    }
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("public_livestreams")
        .select("*")
        .order("scheduled_start", { ascending: true });
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        eventSlug: row.event_slug,
        status: deriveLivestreamState({
          id: row.id,
          slug: row.slug,
          title: row.title,
          eventSlug: row.event_slug,
          status: row.status,
          startsAt: row.scheduled_start,
          actualStartAt: row.actual_start,
          endsAt: row.end_time,
          platform: row.platform,
          embedUrl: row.embed_url,
          externalUrl: row.external_url,
          recordingUrl: row.recording_url,
          backupMessage: row.backup_message,
          posterUrl: normalizeImageUrl(row.poster_url, defaultLivestreamPoster),
        }),
        startsAt: row.scheduled_start,
        actualStartAt: row.actual_start,
        endsAt: row.end_time,
        platform: row.platform,
        embedUrl: row.embed_url,
        externalUrl: row.external_url,
        recordingUrl: row.recording_url,
        backupMessage: row.backup_message,
        posterUrl: normalizeImageUrl(row.poster_url, defaultLivestreamPoster),
      }));
    } catch (error) {
      logPublicLoaderError("Failed to load published livestreams", error);
      return demoLivestreams;
    }
  },
  { revalidate: 120, tags: ["public-content", "livestreams"] },
);

export const getPublicCoordinators = cachedQuery(
  ["public-coordinators"],
  async (): Promise<CoordinatorGroup[]> => {
    if (!isSupabaseConfigured()) {
      return demoCoordinatorGroups;
    }
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase.from("public_coordinators").select("*").order("department_order");
      if (error) throw error;
      const grouped = new Map<string, CoordinatorGroup>();
      (data || []).forEach((row) => {
        const existing = grouped.get(row.department_slug);
        const contact = {
          id: row.contact_id,
          name: row.name,
          role: row.role_title,
          phone: row.public_phone || "",
          email: row.public_email || "",
          publicPhone: Boolean(row.public_phone),
          publicEmail: Boolean(row.public_email),
          photoUrl: row.photo_url,
        };
        if (existing) {
          existing.contacts.push(contact);
        } else {
          grouped.set(row.department_slug, {
            id: row.department_slug,
            title: row.department,
            description: row.department_description,
            contacts: [contact],
          });
        }
      });
      return [...grouped.values()];
    } catch (error) {
      logPublicLoaderError("Failed to load public coordinators", error);
      return demoCoordinatorGroups;
    }
  },
  { revalidate: 300, tags: ["public-content", "coordinators"] },
);

export const getActiveTeams = cachedQuery(
  ["public-teams"],
  async (): Promise<TeamDefinition[]> => {
    if (!isSupabaseConfigured()) {
      return demoTeams.filter((team) => team.active);
    }
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from("team_definitions")
        .select("id, name, slug, description, coordinator_name, capacity, is_active, display_order")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        coordinator: row.coordinator_name,
        capacity: row.capacity,
        active: row.is_active,
        displayOrder: row.display_order,
      }));
    } catch (error) {
      logPublicLoaderError("Failed to load active teams", error);
      return demoTeams.filter((team) => team.active);
    }
  },
  { revalidate: 300, tags: ["public-content", "teams"] },
);

export function getAdminSection(slug: string) {
  return adminSections.find((section) => section.slug === slug);
}
