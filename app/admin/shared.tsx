import Link from "next/link";
import { AdminBadge } from "@/components/admin/AdminBadge";
import AdminNotice from "@/components/admin/AdminNotice";

export function readStringParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatMoney(value: number | string | null | undefined, currency: string | null | undefined) {
  const amount = Number(value || 0);
  const code = currency || "XAF";
  try {
    return new Intl.NumberFormat("en-CM", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "XAF" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

export function statusTone(status: string | null | undefined): "neutral" | "success" | "warning" | "danger" | "info" {
  const normalised = String(status || "").toLowerCase();
  if (["approved", "published", "verified", "completed", "active", "live"].includes(normalised)) return "success";
  if (["pending", "scheduled", "draft", "contacted", "unverified"].includes(normalised)) return "warning";
  if (["rejected", "archived", "declined", "cancelled", "inactive"].includes(normalised)) return "danger";
  if (["featured", "owner", "administrator"].includes(normalised)) return "info";
  return "neutral";
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  return <AdminBadge tone={statusTone(status)}>{status || "unknown"}</AdminBadge>;
}

export function QueryNotice({
  searchParams,
  success = "Changes saved successfully.",
}: {
  searchParams: Record<string, string | string[] | undefined>;
  success?: string;
}) {
  const saved = readStringParam(searchParams.saved);
  const error = readStringParam(searchParams.error);

  if (saved === "1") {
    return <AdminNotice tone="success">{success}</AdminNotice>;
  }

  if (!error) return null;

  const copy =
    error === "forbidden"
      ? "You do not have permission to access that section."
      : error === "self-change"
        ? "Your own administrator role or active state cannot be changed here."
        : error === "last-owner"
          ? "At least one active owner account must remain."
          : error === "reason-required"
            ? "Please provide a reason before continuing."
            : error === "confirmation-required"
              ? "Please confirm the action before continuing."
              : error === "supabase-not-configured"
                ? "Supabase is not configured in this environment, so invitations cannot be delivered."
                : error === "invalid-invitation"
                  ? "Enter a valid invite email and display name."
                  : error === "duplicate-invitation"
                    ? "There is already a pending invitation for that email address."
                    : error === "owner-only"
                      ? "Only an owner can grant the owner role or perform that protected action."
                      : error === "invite-delivery-unavailable"
                        ? "The invitation record was stored, but Supabase email delivery is unavailable in this environment."
                        : error === "invite-not-found"
                          ? "That invitation could not be found."
          : error;

  return <AdminNotice tone="error">{copy}</AdminNotice>;
}

export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="adminBackLink" href={href}>
      {label}
    </Link>
  );
}
