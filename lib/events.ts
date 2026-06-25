export type FuneralEvent = {
  id: "wake-service" | "burial-service";
  slug: "wake-service-camp-fire" | "burial-service";
  eventNumber: "EVENT 01" | "EVENT 02";
  label: string;
  title: string;
  eventType: "wake" | "burial";
  day: "Thursday" | "Friday";
  dateTime: string;
  timezone: "Africa/Douala";
  displayDateTime: string;
  displayDate: string;
  displayCompactDateTime: string;
  shortDate: string;
  displayTime: string;
  time: string;
  venue: string;
  locationNote: string | null;
  description: string;
  countdownLabel: string;
  completedLabel: string;
  variant: "wake" | "burial";
  streamStatusUpcoming: string;
  streamStatusCompleted: string;
};

export const funeralEvents: FuneralEvent[] = [
  {
    id: "wake-service",
    slug: "wake-service-camp-fire",
    eventNumber: "EVENT 01",
    label: "EVENT 01",
    title: "Wake Service / Camp Fire",
    eventType: "wake",
    day: "Thursday",
    dateTime: "2026-07-02T15:00:00+01:00",
    timezone: "Africa/Douala",
    displayDateTime: "Thursday, 2 July 2026 at 15:00",
    displayDate: "Thursday, 2 July 2026",
    displayCompactDateTime: "2 July 2026 · 15:00",
    shortDate: "2 July 2026",
    displayTime: "15:00",
    time: "15:00",
    venue: "Family Residence, Mbengwi",
    locationNote: "Below Mbon Market",
    description:
      "An evening of scripture, worship, reflections and family remembrance as relatives and friends gather to comfort one another and honour Pa Ndambi. The Boy Scouts of Cameroon will perform honours and host a Camp Fire under the auspices of the National Commander.",
    countdownLabel: "Wake Service begins in",
    completedLabel: "The Wake Service has begun",
    variant: "wake",
    streamStatusUpcoming: "UPCOMING",
    streamStatusCompleted: "RECORDING COMING SOON",
  },
  {
    id: "burial-service",
    slug: "burial-service",
    eventNumber: "EVENT 02",
    label: "EVENT 02",
    title: "Burial Service",
    eventType: "burial",
    day: "Friday",
    dateTime: "2026-07-03T07:30:00+01:00",
    timezone: "Africa/Douala",
    displayDateTime: "Friday, 3 July 2026 at 07:30",
    displayDate: "Friday, 3 July 2026",
    displayCompactDateTime: "3 July 2026 · 07:30",
    shortDate: "3 July 2026",
    displayTime: "07:30",
    time: "07:30",
    venue: "PC Njembeng",
    locationNote: null,
    description:
      "Family, friends, church members and well-wishers will gather for the final funeral rites and burial service of Pa Ndambi Paul Angemba.",
    countdownLabel: "Burial Service begins in",
    completedLabel: "The Burial Service has begun",
    variant: "burial",
    streamStatusUpcoming: "UPCOMING",
    streamStatusCompleted: "RECORDING COMING SOON",
  },
] as const;

export const funeralDateRangeDisplay = "2–3 July 2026";

export function getFuneralEventBySlug(slug: string) {
  return funeralEvents.find((event) => event.slug === slug || event.id === slug) || null;
}

export function formatEventDateTime(dateTime: string, timeZone = "Africa/Douala") {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(dateTime));

  const parts = formatted.split(", ");
  if (parts.length !== 3) {
    return formatted;
  }

  return `${parts[0]}, ${parts[1]} at ${parts[2]}`;
}
