import Image from "next/image";
import { getMemorialObjectPosition } from "@/lib/memorial-images";

type HomeHeroPortraitProps = {
  src: string;
  alt: string;
};

export default function HomeHeroPortrait({ src, alt }: HomeHeroPortraitProps) {
  return (
    <div className="heroPortrait memorialHeroPortrait">
      <div className="memorialPortraitStage" aria-hidden="true">
        <span className="memorialRing memorialRingOne" />
        <span className="memorialRing memorialRingTwo" />
        <span className="memorialRing memorialRingThree" />
        <span className="memorialHalo" />
        <span className="memorialPortraitSweep" />
        <span className="memorialPortraitGlow memorialPortraitGlowOne" />
        <span className="memorialPortraitGlow memorialPortraitGlowTwo" />
        <span className="memorialPlatform" />
      </div>
      <div className="portraitFrame memorialPortraitFrame">
        <div className="memorialPortraitMotion">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 720px) 88vw, (max-width: 1080px) 68vw, 40vw"
            style={{ objectPosition: getMemorialObjectPosition(src) }}
          />
        </div>
      </div>
    </div>
  );
}
