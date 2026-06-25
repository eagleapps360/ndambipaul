import path from "path";
import { uploadLimits } from "@/lib/env";
import { demoUploadRules } from "@/lib/demo-content";

export type FileMetadata = {
  file: File;
  kind: "image" | "video" | "document";
  extension: string;
  mimeType: string;
  sizeBytes: number;
};

const imageSignatures = [
  { kind: "image" as const, mime: "image/jpeg", ext: [".jpg", ".jpeg"], magic: [0xff, 0xd8, 0xff] },
  { kind: "image" as const, mime: "image/png", ext: [".png"], magic: [0x89, 0x50, 0x4e, 0x47] },
  { kind: "image" as const, mime: "image/gif", ext: [".gif"], ascii: "GIF8" },
  { kind: "image" as const, mime: "image/webp", ext: [".webp"], asciiAt: { offset: 8, text: "WEBP" } },
];

const videoExtensions = [".mp4", ".webm", ".mov"];

function hasMagic(bytes: Uint8Array, expected: number[]) {
  return expected.every((byte, index) => bytes[index] === byte);
}

function hasAscii(bytes: Uint8Array, text: string, offset = 0) {
  return text.split("").every((char, index) => bytes[index + offset] === char.charCodeAt(0));
}

export async function inspectFiles(files: File[]) {
  const errors: string[] = [];
  const accepted = demoUploadRules;
  const metadata: FileMetadata[] = [];

  if (files.length > uploadLimits.filesPerSubmission) {
    errors.push(`Please upload no more than ${uploadLimits.filesPerSubmission} files.`);
  }

  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const imageMatch = imageSignatures.find((signature) => {
      if (signature.magic) return hasMagic(bytes, signature.magic);
      if (signature.ascii) return hasAscii(bytes, signature.ascii);
      if (signature.asciiAt) return hasAscii(bytes, signature.asciiAt.text, signature.asciiAt.offset);
      return false;
    });

    let kind: FileMetadata["kind"] | null = null;
    if (imageMatch && accepted.acceptedImages.includes(file.type) && imageMatch.ext.includes(extension)) {
      kind = "image";
    } else if (accepted.acceptedVideos.includes(file.type) && videoExtensions.includes(extension)) {
      kind = "video";
    } else if (accepted.acceptedDocuments.includes(file.type) && extension === ".pdf" && hasAscii(bytes, "%PDF")) {
      kind = "document";
    }

    if (!kind) {
      errors.push(`${file.name}: unsupported or invalid file type.`);
      continue;
    }

    const maxMb =
      kind === "image" ? uploadLimits.imageMb : kind === "video" ? uploadLimits.videoMb : uploadLimits.documentMb;
    if (file.size > maxMb * 1024 * 1024) {
      errors.push(`${file.name}: exceeds ${maxMb}MB limit.`);
      continue;
    }

    metadata.push({
      file,
      kind,
      extension,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  }

  return { errors, metadata };
}
