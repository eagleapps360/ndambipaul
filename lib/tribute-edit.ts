import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import { normalizeEmail, sanitizeObjectPosition } from "@/lib/tribute-helpers";
import { createEditToken, hashToken } from "@/lib/tribute-security";
import { sendTributeEditEmail } from "@/lib/tribute-email";

const EDIT_TOKEN_TTL_MINUTES = 20;

export async function requestTributeEditLink(email: string) {
  if (!isSupabaseConfigured()) {
    return { ok: true as const };
  }

  const normalizedEmail = normalizeEmail(email);
  const service = createServiceRoleSupabaseClient();
  const { data: tribute } = await service
    .from("tributes")
    .select("id, contributor_name, normalized_email, private_email")
    .eq("normalized_email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (!tribute) {
    return { ok: true as const };
  }

  const rawToken = createEditToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EDIT_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

  await service.from("tribute_edit_tokens").insert({
    tribute_id: tribute.id,
    email_hash: hashToken(normalizedEmail),
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const editLink = `${getAppUrl()}/tributes/edit/${rawToken}`;
  await sendTributeEditEmail({
    tributeName: tribute.contributor_name || "your tribute",
    recipientEmail: tribute.private_email || normalizedEmail,
    editLink,
    expiresInMinutes: EDIT_TOKEN_TTL_MINUTES,
  });

  return { ok: true as const };
}

export async function getTributeEditTokenRecord(rawToken: string) {
  if (!isSupabaseConfigured()) return null;
  const service = createServiceRoleSupabaseClient();
  const tokenHash = hashToken(rawToken);
  const { data } = await service
    .from("tribute_edit_tokens")
    .select("id, tribute_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  return data;
}

export async function consumeTributeEditToken(tokenId: string) {
  if (!isSupabaseConfigured()) return;
  const service = createServiceRoleSupabaseClient();
  await service.from("tribute_edit_tokens").update({ used_at: new Date().toISOString() }).eq("id", tokenId);
}

export async function createTributeRevision(input: {
  tributeId: string;
  name: string;
  relationship: string;
  location: string;
  message: string;
  profileImagePosition: string;
}) {
  const service = createServiceRoleSupabaseClient();
  const { data, error } = await service
    .from("tribute_revisions")
    .insert({
      tribute_id: input.tributeId,
      submitted_by_type: "contributor",
      proposed_name: input.name,
      proposed_relationship: input.relationship,
      proposed_location: input.location || null,
      proposed_message: input.message,
      proposed_profile_image_position: sanitizeObjectPosition(input.profileImagePosition),
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
