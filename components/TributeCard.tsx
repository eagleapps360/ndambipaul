"use client";

import Image from "next/image";
import Link from "next/link";
import type { TributeSummary } from "@/lib/public-types";
import { excerptMessage, getInitials } from "@/lib/tribute-helpers";

export default function TributeCard({
  tribute,
  compact = false,
}: {
  tribute: TributeSummary;
  compact?: boolean;
}) {
  const featuredImage = tribute.media?.[0] || null;
  const profileUrl = tribute.profileImage?.url || null;
  const featuredUrl = featuredImage?.url || null;

  return (
    <article className={`tributeCard tributeCard${compact ? "Compact" : ""}`}>
      <div className="tributeCardTop">
        {profileUrl ? (
          <div className="tributeAvatar tributeAvatarImage">
            <Image
              src={profileUrl}
              alt={`${tribute.name} tribute profile image`}
              fill
              sizes={compact ? "56px" : "72px"}
              className="tributeAvatarPhoto"
              unoptimized={!profileUrl.startsWith("/")}
              style={{ objectPosition: tribute.profileImage?.objectPosition || "50% 50%" }}
            />
          </div>
        ) : (
          <div className="tributeAvatar tributeAvatarFallback" aria-label={`${tribute.name} initials`}>
            <span>{getInitials(tribute.name)}</span>
          </div>
        )}
        <div className="tributeCardHeading">
          <strong>{tribute.name}</strong>
          <span>
            {tribute.relationship}
            {tribute.location ? ` · ${tribute.location}` : ""}
          </span>
        </div>
      </div>

      <p className="tributeCardMessage">{excerptMessage(tribute.message, compact ? 170 : 240)}</p>

      {featuredImage && featuredUrl ? (
        <div className="tributeCardPreview">
          <Image
            src={featuredUrl}
            alt={featuredImage.altText}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="tributePreviewPhoto"
            unoptimized={!featuredUrl.startsWith("/")}
            style={{ objectPosition: featuredImage.objectPosition }}
          />
          {tribute.mediaCount && tribute.mediaCount > 1 ? <span className="tributePreviewMore">+{tribute.mediaCount - 1} more</span> : null}
        </div>
      ) : null}

      <div className="tributeCardMeta">
        {tribute.createdAt ? <small>{new Date(tribute.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</small> : <span />}
        <Link href={`/tributes/${tribute.slug}`} className="textLink">
          Read full tribute
        </Link>
      </div>
    </article>
  );
}
