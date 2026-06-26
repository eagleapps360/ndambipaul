"use client";

import Image from "next/image";
import { useState } from "react";
import type { TributeImage } from "@/lib/public-types";

export default function TributeMediaLightbox({ items }: { items: TributeImage[] }) {
  const [active, setActive] = useState<TributeImage | null>(null);

  if (!items.length) {
    return null;
  }

  return (
    <>
      <div className="tributeMediaGrid">
        {items.map((item) => (
          <button key={item.id} className="tributeMediaCard" onClick={() => setActive(item)} type="button">
            <div className="tributeMediaThumb">
              <Image
                src={item.url}
                alt={item.altText}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                className="tributeMediaThumbImage"
                unoptimized={!item.url.startsWith("/")}
                style={{ objectPosition: item.objectPosition }}
              />
            </div>
            {item.caption ? <p>{item.caption}</p> : null}
          </button>
        ))}
      </div>

      {active ? (
        <dialog className="lightbox" open aria-label={active.altText}>
          <button className="closeButton" onClick={() => setActive(null)}>
            Close
          </button>
          <div className="lightboxBody">
            <div className="lightboxImage tributeLightboxImage">
              <Image src={active.url} alt={active.altText} fill sizes="90vw" className="tributeLightboxFullImage" unoptimized={!active.url.startsWith("/")} />
            </div>
            <div className="lightboxCopy">
              <h3>{active.caption || "Tribute photograph"}</h3>
              <p>{active.altText}</p>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
