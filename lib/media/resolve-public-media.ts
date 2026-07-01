import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";

export type ResolvedMedia = {
  url: string;
  expiresAt?: string;
};

type ParsedStorageReference = {
  bucket: string;
  path: string;
};

const defaultSignedUrlExpirySeconds = 60 * 60;
const defaultTributeProfileBucket = "memorial-private-submissions";

function parseSupabaseStorageUrl(value: string): ParsedStorageReference | null {
  try {
    const url = new URL(value);
    if (!url.hostname.endsWith(".supabase.co")) {
      return null;
    }

    const match = url.pathname.match(/\/storage\/v1\/object(?:\/sign|\/public)?\/([^/]+)\/(.+)$/);
    if (!match) {
      return null;
    }

    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

function parsePrivateToken(value: string): ParsedStorageReference | null {
  if (!value.startsWith("private:")) {
    return null;
  }

  const [, bucket, ...rest] = value.split(":");
  const path = rest.join(":").trim();

  if (!bucket || !path) {
    return null;
  }

  return {
    bucket: bucket.trim(),
    path,
  };
}

export function normalizeStoragePath(value: string, bucket: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("..")) {
    return null;
  }

  const privateToken = parsePrivateToken(trimmed);
  if (privateToken) {
    return privateToken.bucket === bucket ? normalizeStoragePath(privateToken.path, bucket) : null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const parsedUrl = parseSupabaseStorageUrl(trimmed);
    if (!parsedUrl || parsedUrl.bucket !== bucket) {
      return null;
    }
    return normalizeStoragePath(parsedUrl.path, bucket);
  }

  let normalized = trimmed.replace(/^\/+/, "");
  if (normalized.startsWith(`${bucket}/`)) {
    normalized = normalized.slice(bucket.length + 1);
  }

  return normalized || null;
}

export async function resolveStorageObjectUrl(
  storagePath: string | null | undefined,
  bucket = defaultTributeProfileBucket,
  expirySeconds = defaultSignedUrlExpirySeconds,
): Promise<ResolvedMedia | null> {
  if (!storagePath) {
    return null;
  }

  const parsedReference = parsePrivateToken(storagePath) || (/^https?:\/\//i.test(storagePath) ? parseSupabaseStorageUrl(storagePath) : null);
  const resolvedBucket = parsedReference?.bucket || bucket;
  const normalizedPath = normalizeStoragePath(parsedReference?.path || storagePath, resolvedBucket);
  if (!normalizedPath) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const service = createServiceRoleSupabaseClient();
  const { data, error } = await service.storage.from(resolvedBucket).createSignedUrl(normalizedPath, expirySeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return {
    url: data.signedUrl,
    expiresAt: new Date(Date.now() + expirySeconds * 1000).toISOString(),
  };
}

export async function resolvePublicTributeProfileImage(
  storagePath: string | null,
  bucket = defaultTributeProfileBucket,
): Promise<ResolvedMedia | null> {
  return resolveStorageObjectUrl(storagePath, bucket);
}

export async function storageObjectExists(
  bucket: string | null | undefined,
  storagePath: string | null | undefined,
): Promise<boolean> {
  if (!storagePath || !isSupabaseConfigured()) {
    return false;
  }

  const parsedReference = parsePrivateToken(storagePath) || (/^https?:\/\//i.test(storagePath) ? parseSupabaseStorageUrl(storagePath) : null);
  const resolvedBucket = parsedReference?.bucket || bucket;
  if (!resolvedBucket) {
    return false;
  }

  const normalizedPath = normalizeStoragePath(parsedReference?.path || storagePath, resolvedBucket);
  if (!normalizedPath) {
    return false;
  }

  const service = createServiceRoleSupabaseClient();
  const segments = normalizedPath.split("/").filter(Boolean);
  const fileName = segments.pop();
  const folder = segments.join("/");

  if (!fileName) {
    return false;
  }

  const { data, error } = await service.storage.from(resolvedBucket).list(folder, { limit: 200 });
  if (error) {
    return false;
  }

  return (data || []).some((item) => item.name === fileName);
}
