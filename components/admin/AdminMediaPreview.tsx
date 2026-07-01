import Image from "next/image";

export default function AdminMediaPreview({
  kind,
  url,
  alt,
}: {
  kind: string;
  url: string | null;
  alt: string;
}) {
  if (!url) {
    return <div className="adminMediaPreview adminMediaPreview-empty">Preview unavailable</div>;
  }

  if (kind === "video") {
    return (
      <video className="adminMediaPreview" controls preload="metadata">
        <source src={url} />
      </video>
    );
  }

  if (kind === "document") {
    return (
      <a className="adminMediaPreview adminMediaPreview-doc" href={url} target="_blank" rel="noreferrer">
        Open PDF preview
      </a>
    );
  }

  return (
    <div className="adminMediaPreview adminMediaPreview-image">
      <Image src={url} alt={alt} fill sizes="240px" unoptimized={!url.startsWith("/")} />
    </div>
  );
}
