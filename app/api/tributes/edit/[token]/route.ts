import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/env";
import { getTributeEditTokenRecord, createTributeRevision, consumeTributeEditToken } from "@/lib/tribute-edit";
import { inspectFiles } from "@/lib/uploads";
import { sanitizeObjectPosition } from "@/lib/tribute-helpers";

async function uploadPendingImage(folder: string, file: File) {
  const inspected = await inspectFiles([file]);
  if (inspected.errors.length) {
    return { error: inspected.errors[0], upload: null as null | { storage_bucket: string; storage_path: string } };
  }
  const item = inspected.metadata[0];
  if (!item || item.kind !== "image") {
    return { error: "Only image uploads are supported.", upload: null };
  }
  const service = createServiceRoleSupabaseClient();
  const filePath = `${folder}/${Date.now()}-${item.file.name.replace(/\s+/g, "-")}`;
  const result = await service.storage.from("memorial-private-submissions").upload(filePath, item.file, {
    contentType: item.mimeType,
    upsert: false,
  });
  if (result.error) {
    return { error: result.error.message, upload: null };
  }
  return { error: null, upload: { storage_bucket: "memorial-private-submissions", storage_path: filePath } };
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rateKey = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown-tribute-edit";
  const rateLimit = applyRateLimit(`tribute-edit:${rateKey}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ errors: ["Too many attempts. Please wait and try again."] }, { status: 429 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ errors: ["Tribute editing is unavailable in demo mode."] }, { status: 400 });
  }

  const tokenRecord = await getTributeEditTokenRecord(token);
  if (!tokenRecord) {
    return NextResponse.json({ errors: ["This edit link is invalid or has expired."] }, { status: 403 });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const relationship = String(formData.get("relationship") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const profileImagePosition = sanitizeObjectPosition(String(formData.get("profileImagePosition") || "50% 50%"));
  if (!name || !relationship || message.length < 24) {
    return NextResponse.json({ errors: ["Please complete the required fields before submitting your update."] }, { status: 400 });
  }

  const revisionId = await createTributeRevision({
    tributeId: tokenRecord.tribute_id,
    name,
    relationship,
    location,
    message,
    profileImagePosition,
  });

  const service = createServiceRoleSupabaseClient();
  const profileImage = formData.get("profileImage");
  if (profileImage instanceof File && profileImage.size > 0) {
    const uploaded = await uploadPendingImage(`tributes/${tokenRecord.tribute_id}/pending/${revisionId}/profile`, profileImage);
    if (uploaded.error) {
      return NextResponse.json({ errors: [uploaded.error] }, { status: 400 });
    }
    await service
      .from("tribute_revisions")
      .update({
        proposed_profile_image_bucket: uploaded.upload?.storage_bucket,
        proposed_profile_image_path: uploaded.upload?.storage_path,
      })
      .eq("id", revisionId);
  }

  const additionalImages = formData.getAll("additionalImages").filter((item): item is File => item instanceof File && item.size > 0);
  const additionalMeta = JSON.parse(String(formData.get("additionalImageMeta") || "[]")) as Array<{
    caption?: string;
    altText?: string;
    objectPosition?: string;
    sortOrder?: number;
  }>;

  for (const [index, file] of additionalImages.entries()) {
    const uploaded = await uploadPendingImage(`tributes/${tokenRecord.tribute_id}/pending/${revisionId}/media`, file);
    if (uploaded.error) {
      return NextResponse.json({ errors: [uploaded.error] }, { status: 400 });
    }
    const meta = additionalMeta[index] || {};
    await service.from("tribute_revision_media").insert({
      revision_id: revisionId,
      storage_bucket: uploaded.upload?.storage_bucket,
      storage_path: uploaded.upload?.storage_path,
      media_type: "image",
      alt_text: meta.altText || `Tribute photograph shared by ${name}`,
      caption: meta.caption || null,
      object_position: sanitizeObjectPosition(meta.objectPosition),
      sort_order: Number(meta.sortOrder || index),
      status: "pending",
    });
  }

  await consumeTributeEditToken(tokenRecord.id);
  return NextResponse.json({ ok: true, status: "pending-review" }, { status: 202 });
}
