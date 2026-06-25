import SectionTitle from "@/components/SectionTitle";
import GalleryLightbox from "@/components/GalleryLightbox";
import { MediaUploadForm } from "@/components/Forms";
import { getApprovedGalleryItems } from "@/lib/content";

export const metadata = {
  title: "Gallery",
  description: "Approved photo and video gallery with moderated public upload flow.",
};

export default async function GalleryPage() {
  const items = await getApprovedGalleryItems();
  const albumMap = new Map<string, { title: string; category: string; count: number }>();
  items.forEach((item) => {
    const existing = albumMap.get(item.albumSlug);
    if (existing) {
      existing.count += 1;
      return;
    }
    albumMap.set(item.albumSlug, { title: item.albumTitle, category: item.category, count: 1 });
  });

  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Gallery</p>
        <h1>Moments preserved with care</h1>
        <p>Approved images and videos are grouped into albums and presented with captions, dates and contributor credit.</p>
      </section>

      <section className="section">
        <SectionTitle eyebrow="Albums" title="Moderated photos and video memories" />
        <div className="albumList">
          {[...albumMap.entries()].map(([slug, album]) => (
            <article key={slug} className="albumCard">
              <strong>{album.title}</strong>
              <span>
                {album.category} · {album.count} items
              </span>
            </article>
          ))}
        </div>
        <GalleryLightbox items={items} />
      </section>

      <section className="section splitLayout">
        <div>
          <SectionTitle eyebrow="Contribute" title="Submit media for moderation" copy="Public uploads remain private until approved. Signed URLs and private storage should be used when Supabase storage is wired in." />
        </div>
        <MediaUploadForm />
      </section>
    </main>
  );
}
