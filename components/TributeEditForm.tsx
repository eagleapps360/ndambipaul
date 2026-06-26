"use client";

import { FormEvent, useMemo, useState } from "react";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import { buildObjectPosition } from "@/lib/tribute-helpers";

export default function TributeEditForm({
  token,
  tribute,
}: {
  token: string;
  tribute: { name: string; relationship: string; location: string; message: string; profileImageUrl: string | null; profileImagePosition: string };
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePosition, setProfilePosition] = useState(() => {
    const [x, y] = tribute.profileImagePosition.split(" ").map((item) => Number(item.replace("%", "")) || 50);
    return { x, y };
  });
  const [additionalImages, setAdditionalImages] = useState<Array<{ id: string; file: File; previewUrl: string; caption: string; altText: string; x: number; y: number }>>([]);

  const profilePreviewUrl = useMemo(() => (profileImage ? URL.createObjectURL(profileImage) : tribute.profileImageUrl), [profileImage, tribute.profileImageUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    if (profileImage) {
      formData.set("profileImage", profileImage);
    }
    additionalImages.forEach((item) => formData.append("additionalImages", item.file));
    formData.set("profileImagePosition", buildObjectPosition(profilePosition.x, profilePosition.y));
    formData.set(
      "additionalImageMeta",
      JSON.stringify(
        additionalImages.map((item, index) => ({
          clientId: item.id,
          caption: item.caption,
          altText: item.altText,
          objectPosition: buildObjectPosition(item.x, item.y),
          sortOrder: index,
        })),
      ),
    );
    const response = await fetch(`/api/tributes/edit/${token}`, { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.errors?.join(" ") || "We could not submit your update.");
      setSubmitting(false);
      return;
    }
    setSuccess("Your changes have been submitted for review.");
    setSubmitting(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="formGrid">
        <label>
          Full name
          <input name="name" required defaultValue={tribute.name} />
        </label>
        <label>
          Relationship
          <input name="relationship" required defaultValue={tribute.relationship} />
        </label>
      </div>
      <label>
        Location
        <input name="location" defaultValue={tribute.location} />
      </label>
      <label>
        Tribute message
        <textarea name="message" rows={8} required defaultValue={tribute.message} />
      </label>
      <label>
        Replace profile image
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setProfileImage(event.target.files?.[0] || null)} />
      </label>
      {profilePreviewUrl ? (
        <ImagePositionEditor
          label="Profile image focus"
          imageUrl={profilePreviewUrl}
          x={profilePosition.x}
          y={profilePosition.y}
          onXChange={(value) => setProfilePosition((current) => ({ ...current, x: value }))}
          onYChange={(value) => setProfilePosition((current) => ({ ...current, y: value }))}
        />
      ) : null}
      <label>
        Add tribute photographs
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files || []).slice(0, 6);
            setAdditionalImages(
              files.map((file, index) => ({
                id: `${file.name}-${index}-${Date.now()}`,
                file,
                previewUrl: URL.createObjectURL(file),
                caption: "",
                altText: "",
                x: 50,
                y: 50,
              })),
            );
          }}
        />
      </label>
      {additionalImages.length ? (
        <div className="tributeComposerList">
          {additionalImages.map((item, index) => (
            <article key={item.id} className="tributeComposerCard">
              <ImagePositionEditor
                label={`Photo ${index + 1} focus`}
                imageUrl={item.previewUrl}
                x={item.x}
                y={item.y}
                onXChange={(value) =>
                  setAdditionalImages((current) => current.map((entry) => (entry.id === item.id ? { ...entry, x: value } : entry)))
                }
                onYChange={(value) =>
                  setAdditionalImages((current) => current.map((entry) => (entry.id === item.id ? { ...entry, y: value } : entry)))
                }
              />
              <div className="formGrid">
                <label>
                  Caption
                  <input
                    value={item.caption}
                    onChange={(event) =>
                      setAdditionalImages((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, caption: event.target.value } : entry)),
                      )
                    }
                  />
                </label>
                <label>
                  Alt text
                  <input
                    value={item.altText}
                    onChange={(event) =>
                      setAdditionalImages((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, altText: event.target.value } : entry)),
                      )
                    }
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit changes for review"}
      </button>
      {error ? <p className="errorBox">{error}</p> : null}
      {success ? <p className="successBox">{success}</p> : null}
    </form>
  );
}
