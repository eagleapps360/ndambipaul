import Image from "next/image";
import { getMemorialObjectPosition } from "@/lib/memorial-images";

const constellationPhotos = [
  {
    src: "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg",
    alt: "Pa Ndambi Paul Angemba in blue regalia",
    title: "Pa Ndambi in blue regalia",
    caption: "A life of dignity and grace",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-close-portrait.jpg",
    alt: "Close portrait of Pa Ndambi Paul Angemba",
    title: "A life well lived",
    caption: "A journey of faith, family, service, and legacy.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-beach.jpg",
    alt: "Pa Ndambi Paul Angemba by the waterside",
    title: "Waterside memories",
    caption: "Moments of quiet reflection and joy.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-airport-profile.jpg",
    alt: "Profile portrait of Pa Ndambi Paul Angemba during travel",
    title: "Journey and legacy",
    caption: "Family memories carried across distance.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-street.jpg",
    alt: "Pa Ndambi Paul Angemba on a street during family travel",
    title: "Everyday grace",
    caption: "Dignity in each season of life.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-car-snow.jpg",
    alt: "Pa Ndambi Paul Angemba near a car in the snow",
    title: "Family memories abroad",
    caption: "Love that traveled and endured.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-olympic-stadium.jpg",
    alt: "Pa Ndambi Paul Angemba near the Olympic stadium",
    title: "Journey and legacy",
    caption: "Stories gathered across the years.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-traditional-blue.jpg",
    alt: "Pa Ndambi Paul Angemba in traditional blue attire",
    title: "Traditional attire and heritage",
    caption: "Heritage remembered with honour.",
  },
  {
    src: "/images/pa-ndambi/pa-ndambi-scout-memory.jpg",
    alt: "Pa Ndambi Paul Angemba in scout uniform",
    title: "Scout service and honour",
    caption: "Service, discipline, and steady example.",
  },
] as const;

export default function HomePhotoConstellation() {
  return (
    <section className="section memoryConstellationSection">
      <div className="memoryConstellationIntro">
        <p className="kicker">Moments of a Life Well Lived</p>
        <h2>Moments of a Life Well Lived</h2>
        <p>A journey of faith, family, service, and legacy.</p>
      </div>
      <div className="memoryConstellation" aria-label="Animated photo memories of Pa Ndambi Paul Angemba">
        <div className="memoryConstellationGlow memoryConstellationGlowOne" aria-hidden="true" />
        <div className="memoryConstellationGlow memoryConstellationGlowTwo" aria-hidden="true" />
        {constellationPhotos.map((photo, index) => (
          <article
            key={photo.src}
            className={`memoryCard memoryCard${index + 1}`}
            style={{ ["--card-delay" as string]: `${index * 140}ms` }}
          >
            <div className="memoryCardMedia">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 900px) 88vw, 30vw"
                style={{ objectPosition: getMemorialObjectPosition(photo.src) }}
              />
            </div>
            <div className="memoryCardCopy">
              <strong>{photo.title}</strong>
              <span>{photo.caption}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
