type AnimatedBiographyHeadingProps = {
  chapter?: string;
  title: string;
  align?: "left" | "center";
  shimmerWord?: string;
};

function renderTitle(title: string, shimmerWord?: string) {
  if (!shimmerWord || !title.includes(shimmerWord)) {
    return title;
  }

  const [before, after] = title.split(shimmerWord, 2);

  return (
    <>
      {before}
      <span className="biographyHeadingShimmer">{shimmerWord}</span>
      {after}
    </>
  );
}

export default function AnimatedBiographyHeading({
  chapter,
  title,
  align = "left",
  shimmerWord,
}: AnimatedBiographyHeadingProps) {
  return (
    <div className={`biographyHeading biographyHeading${align === "center" ? "Center" : "Left"}`}>
      {chapter ? <span className="biographyChapterMarker">{chapter}</span> : null}
      <span className="biographyHeadingLine" aria-hidden="true" />
      <h2>{renderTitle(title, shimmerWord)}</h2>
    </div>
  );
}
