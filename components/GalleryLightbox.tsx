"use client";

import Image from "next/image";
import { useState } from "react";
import { getMemorialObjectPosition } from "@/lib/memorial-images";
import type { GalleryItemPublic } from "@/lib/public-types";

export default function GalleryLightbox({ items }: { items: GalleryItemPublic[] }) {
  const [active, setActive] = useState<GalleryItemPublic | null>(null);

  return (
    <>
      <div className="galleryGrid">
        {items.map((item) => (
          <button key={item.id} className="galleryCard" onClick={() => setActive(item)}>
            <div className="galleryThumb">
              <Image
                src={item.posterUrl}
                alt={item.altText || item.title}
                fill
                sizes="(max-width: 800px) 100vw, 33vw"
                style={{ objectPosition: getMemorialObjectPosition(item.posterUrl) }}
              />
              {item.kind === "video" ? <span className="playBadge">Play</span> : null}
            </div>
            <div className="galleryMeta">
              <strong>{item.title}</strong>
              <span>
                {item.albumTitle} · {item.contributor}
              </span>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <dialog className="lightbox" open aria-label={active.title}>
          <button className="closeButton" onClick={() => setActive(null)}>
            Close
          </button>
          <div className="lightboxBody">
            {active.kind === "video" ? (
              <iframe
                title={active.title}
                src={active.publicUrl}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="lightboxImage">
                <Image
                  src={active.publicUrl}
                  alt={active.altText || active.title}
                  fill
                  sizes="90vw"
                  style={{ objectPosition: getMemorialObjectPosition(active.publicUrl) }}
                />
              </div>
            )}
            <div className="lightboxCopy">
              <h3>{active.title}</h3>
              <p>{active.caption}</p>
              <small>
                {active.contributor} · {active.date}
              </small>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
