const defaultObjectPosition = "center 24%";

const positionByImagePath: Array<[string, string]> = [
  ["/images/pa-ndambi/pa-ndambi-blue-cutout.png", "center bottom"],
  ["/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg", "center 16%"],
  ["/images/pa-ndambi/pa-ndambi-close-portrait.jpg", "center 18%"],
  ["/images/pa-ndambi/pa-ndambi-scout-memory.jpg", "center 20%"],
  ["/images/pa-ndambi/pa-ndambi-traditional-blue.jpg", "center 22%"],
  ["/images/pa-ndambi/pa-ndambi-beach.jpg", "center 28%"],
  ["/images/pa-ndambi/pa-ndambi-snow.jpg", "center 30%"],
  ["/images/pa-ndambi/pa-ndambi-airport-profile.jpg", "center 24%"],
  ["/images/pa-ndambi/pa-ndambi-street.jpg", "center 26%"],
  ["/images/pa-ndambi/pa-ndambi-car-snow.jpg", "center 34%"],
  ["/images/pa-ndambi/pa-ndambi-olympic-stadium.jpg", "center 28%"],
];

export function getMemorialObjectPosition(src: string) {
  const match = positionByImagePath.find(([path]) => src.includes(path));
  return match?.[1] || defaultObjectPosition;
}
