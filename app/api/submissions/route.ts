import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { applyRateLimit } from "@/lib/rate-limit";
import {
  buildTributeInsert,
  honeypotTriggered,
  type MediaSubmissionData,
  type TeamSubmissionData,
  type TributeSubmissionData,
  TRIBUTE_SUBMISSION_FAILURE_MESSAGE,
  validateMediaForm,
  validateTeamForm,
  validateTributeForm,
} from "@/lib/validation";
import { isSupabaseConfigured } from "@/lib/env";
import { inspectFiles } from "@/lib/uploads";

function buildReference(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function uploadPrivateFiles(folder: string, files: File[]) {
  const inspected = await inspectFiles(files);
  if (inspected.errors.length) {
    return { errors: inspected.errors, uploads: [] as Array<Record<string, unknown>> };
  }
  if (!isSupabaseConfigured()) {
    return {
      errors: [],
      uploads: inspected.metadata.map((item) => ({
        storage_bucket: "memorial-private-submissions",
        original_storage_path: `demo:${folder}/${item.file.name}`,
        media_type: item.kind,
        mime_type: item.mimeType,
        extension: item.extension,
        file_size: item.sizeBytes,
      })),
    };
  }
  const service = createServiceRoleSupabaseClient();
  const uploads: Array<Record<string, unknown>> = [];
  for (const item of inspected.metadata) {
    const filePath = `${folder}/${Date.now()}-${item.file.name.replace(/\s+/g, "-")}`;
    const result = await service.storage.from("memorial-private-submissions").upload(filePath, item.file, {
      contentType: item.mimeType,
      upsert: false,
    });
    if (result.error) {
      return { errors: [`${item.file.name}: ${result.error.message}`], uploads: [] };
    }
    uploads.push({
      storage_bucket: "memorial-private-submissions",
      original_storage_path: filePath,
      media_type: item.kind,
      mime_type: item.mimeType,
      extension: item.extension,
      file_size: item.sizeBytes,
    });
  }
  return { errors: [], uploads };
}

function createSubmissionFailureResponse(message: string) {
  return NextResponse.json({ errors: [message] }, { status: 500 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const rateKey = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const rateLimit = applyRateLimit(rateKey);
  if (!rateLimit.allowed) {
    return NextResponse.json({ errors: ["Too many submissions. Please wait and try again."] }, { status: 429 });
  }

  if (honeypotTriggered(formData)) {
    return NextResponse.json({ errors: ["Spam submission rejected."] }, { status: 400 });
  }

  const type = String(formData.get("type") || "");
  const result =
    type === "tribute"
      ? await validateTributeForm(formData)
      : type === "team"
        ? validateTeamForm(formData)
        : type === "media"
          ? await validateMediaForm(formData)
          : { ok: false as const, errors: ["Unknown submission type."] };

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const reference = buildReference(type);
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        reference,
        demoMode: true,
        moderation: "Supabase is not configured, so this local demo accepted the submission without persisting it.",
      },
      { status: 202 },
    );
  }

  const service = createServiceRoleSupabaseClient();
  if (type === "tribute") {
    const tributeData = result.data as TributeSubmissionData;
    const files = formData.getAll("uploads").filter((item): item is File => item instanceof File && item.size > 0);
    const uploadResult = await uploadPrivateFiles(`tributes/${reference}`, files);
    if (uploadResult.errors.length) {
      return NextResponse.json({ errors: uploadResult.errors }, { status: 400 });
    }
    const tributeInsert = buildTributeInsert(tributeData, reference);
    const { data: tribute, error } = await service
      .from("tributes")
      .insert(tributeInsert)
      .select("id")
      .single();
    if (error) {
      console.error("TRIBUTE_CREATE_FAILED", { code: error.code, message: error.message, reference });
      return createSubmissionFailureResponse(TRIBUTE_SUBMISSION_FAILURE_MESSAGE);
    }
    if (uploadResult.uploads.length) {
      await service.from("media_items").insert(
        uploadResult.uploads.map((upload, index) => ({
          ...upload,
          tribute_id: tribute.id,
          contributor_name: tributeData.name,
          caption: index === 0 ? "Profile or tribute upload" : "Additional tribute media",
          moderation_status: "pending",
          featured: false,
          display_order: index + 1,
        })),
      );
    }
    revalidateTag("tributes", "max");
    return NextResponse.json({ ok: true, status: "pending", reference }, { status: 202 });
  }

  if (type === "team") {
    const teamData = result.data as TeamSubmissionData;
    const { error } = await service.from("team_registrations").insert({
      applicant_name: teamData.fullName,
      phone: teamData.phone,
      email: teamData.email || null,
      primary_team_slug: teamData.preferredTeam,
      secondary_team_slug: teamData.secondaryTeam || null,
      location: teamData.location || null,
      availability: teamData.availability || null,
      experience: teamData.experience || null,
      notes: teamData.notes || null,
      status: "pending",
      submission_reference: reference,
    });
    if (error) {
      console.error("TEAM_REGISTRATION_CREATE_FAILED", { code: error.code, message: error.message, reference });
      return createSubmissionFailureResponse("We could not submit your team registration right now. Please try again shortly.");
    }
    return NextResponse.json({ ok: true, status: "pending", reference }, { status: 202 });
  }

  if (type === "media") {
    const mediaData = result.data as MediaSubmissionData;
    const files = formData.getAll("uploads").filter((item): item is File => item instanceof File && item.size > 0);
    const uploadResult = await uploadPrivateFiles(`gallery/${reference}`, files);
    if (uploadResult.errors.length) {
      return NextResponse.json({ errors: uploadResult.errors }, { status: 400 });
    }
    const { error } = await service.from("media_items").insert(
      uploadResult.uploads.map((upload, index) => ({
        ...upload,
        contributor_name: mediaData.contributor,
        caption: mediaData.caption,
        gallery_album_slug: mediaData.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        media_category: mediaData.category,
        moderation_status: "pending",
        featured: false,
        display_order: index + 1,
      })),
    );
    if (error) {
      console.error("MEDIA_SUBMISSION_CREATE_FAILED", { code: error.code, message: error.message, reference });
      return createSubmissionFailureResponse("We could not submit your media right now. Please try again shortly.");
    }
    return NextResponse.json({ ok: true, status: "pending", reference }, { status: 202 });
  }

  return NextResponse.json(
    {
      errors: ["Unknown submission type."],
    },
    { status: 400 },
  );
}
