import Image from "next/image";
import type { BiographyMedia } from "@/lib/biography-content";

type BiographyImageFrameProps = {
  image: BiographyMedia;
  sizes: string;
  priority?: boolean;
};

export default function BiographyImageFrame({ image, sizes, priority = false }: BiographyImageFrameProps) {
  const frameRatio = image.frameRatio || "portrait";
  const fit = image.fit || "contain";

  return (
    <figure className="biographyStoryFigure">
      <div className={`biographyImageFrame biographyImageFrame--${frameRatio} biographyImageFrame--${fit}`}>
        {fit === "cover" ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            className={`biographyImage biographyImage--${fit}`}
            style={{ objectPosition: image.objectPosition }}
          />
        ) : (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            className={`biographyImage biographyImage--${fit}`}
          />
        )}
      </div>
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}
