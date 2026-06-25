import type { Route } from "next";
import { demoDonationOptions, demoNavigation, demoUploadRules } from "@/lib/demo-content";
import type { AdminRole } from "@/lib/content";

export const navigation: Array<{ href: Route; label: string }> = demoNavigation;
export const donationOptions = demoDonationOptions;
export const uploadRules = demoUploadRules;

export type AdminSectionConfig = {
  slug: string;
  title: string;
  description: string;
  href: Route;
  roles: AdminRole[];
};

export const adminSections: AdminSectionConfig[] = [
  { slug: "settings", title: "Memorial Settings", description: "Memorial identity, SEO, venue, share and footer settings.", href: "/admin/settings", roles: ["owner", "administrator", "content_editor"] },
  { slug: "biography", title: "Biography", description: "Edit biography sections, summaries and publication states.", href: "/admin/biography", roles: ["owner", "administrator", "content_editor"] },
  { slug: "timeline", title: "Life Timeline", description: "Manage the life timeline and display order.", href: "/admin/timeline", roles: ["owner", "administrator", "content_editor"] },
  { slug: "tributes", title: "Tributes", description: "Moderate tribute submissions and public publication.", href: "/admin/tributes", roles: ["owner", "administrator", "moderator"] },
  { slug: "media", title: "Media Library", description: "Preview, moderate and organise uploaded media.", href: "/admin/media", roles: ["owner", "administrator", "moderator"] },
  { slug: "gallery", title: "Gallery Albums", description: "Manage gallery albums and featured public media.", href: "/admin/gallery", roles: ["owner", "administrator", "content_editor", "moderator"] },
  { slug: "programme", title: "Funeral Programme", description: "Create and edit programme events and ordered items.", href: "/admin/programme", roles: ["owner", "administrator", "content_editor"] },
  { slug: "livestreams", title: "Livestreams", description: "Schedule, preview and update livestream states.", href: "/admin/livestreams", roles: ["owner", "administrator", "content_editor"] },
  { slug: "coordinators", title: "Coordinators", description: "Departments, public/private contacts and visibility.", href: "/admin/coordinators", roles: ["owner", "administrator", "content_editor"] },
  { slug: "teams", title: "Volunteer Teams", description: "Manage team definitions and public signup availability.", href: "/admin/teams", roles: ["owner", "administrator", "content_editor"] },
  { slug: "team-registrations", title: "Team Registrations", description: "Review, contact and assign volunteers.", href: "/admin/team-registrations", roles: ["owner", "administrator", "content_editor", "moderator"] },
  { slug: "donations", title: "Donations", description: "Finance-only donation ledger, verification and payment events.", href: "/admin/donations", roles: ["owner", "administrator", "finance"] },
  { slug: "users", title: "Admin Users", description: "Admin profile access, roles and active state.", href: "/admin/users", roles: ["owner", "administrator"] },
  { slug: "audit-log", title: "Audit Log", description: "Read-only record of content, moderation and finance actions.", href: "/admin/audit-log", roles: ["owner", "administrator", "moderator", "finance", "content_editor"] },
];

export const adminSectionAliases: Record<string, Route> = {
  "site-settings": "/admin/settings",
  "admin-users": "/admin/users",
  "gallery-albums": "/admin/gallery",
};
