import type { Livestream } from "@/lib/content";

export const LIVESTREAM_TIMEZONE = "Africa/Douala";

export type NoticeState = "scheduled" | "live" | "replay" | "ended";
export type NoticeEventKey = "wake" | "burial";

export type LivestreamNoticeState = {
  eventKey: NoticeEventKey;
  state: NoticeState;
  title: string;
  message: string;
  startsAt: string;
  streamUrl: string | null;
  replayUrl: string | null;
  detailsHref: string;
  programmeHref: string;
  dismissKey: string;
  modal: boolean;
};

const wakeStart = "2026-07-02T15:00:00+01:00";
const burialStart = "2026-07-03T07:30:00+01:00";
const fallbackDurationsMs = {
  wake: 4 * 60 * 60 * 1000,
  burial: 5 * 60 * 60 * 1000,
} as const;

function normalizeSlug(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function getStreamByEvent(streams: Livestream[], eventKey: NoticeEventKey) {
  const eventSlug = eventKey === "wake" ? "wake-service-camp-fire" : "burial-service";
  return (
    streams.find((stream) => normalizeSlug(stream.eventSlug) === eventSlug) ||
    streams.find((stream) => normalizeSlug(stream.slug).includes(eventKey))
  );
}

function deriveState(stream: Livestream | undefined, eventKey: NoticeEventKey, now: number) {
  const startsAt = stream?.actualStartAt || stream?.startsAt || (eventKey === "wake" ? wakeStart : burialStart);
  const startsAtMs = new Date(startsAt).getTime();
  const fallbackEndMs = startsAtMs + fallbackDurationsMs[eventKey];
  const rawEndsAtMs = stream?.endsAt ? new Date(stream.endsAt).getTime() : null;
  const endsAtMs = rawEndsAtMs && rawEndsAtMs > startsAtMs ? rawEndsAtMs : fallbackEndMs;
  const status = String(stream?.status || "scheduled").toLowerCase();

  if (status === "ended") {
    return stream?.recordingUrl ? "replay" : "ended";
  }
  if (status === "live" && now >= startsAtMs) {
    return "live";
  }
  if (now < startsAtMs) {
    return "scheduled";
  }
  if (now <= endsAtMs) {
    return status === "scheduled" ? "scheduled" : "live";
  }
  return stream?.recordingUrl ? "replay" : "ended";
}

export function getLivestreamNoticeState(streams: Livestream[], now = Date.now()): LivestreamNoticeState | null {
  const wake = getStreamByEvent(streams, "wake");
  const burial = getStreamByEvent(streams, "burial");
  const wakeState = deriveState(wake, "wake", now);
  const burialState = deriveState(burial, "burial", now);
  const burialStartsAt = burial?.actualStartAt || burial?.startsAt || burialStart;

  if (wakeState === "scheduled") {
    return {
      eventKey: "wake",
      state: "scheduled",
      title: "Wake Service Livestream",
      message: "The Wake Service and Camp Fire will begin on Thursday, 2 July 2026 at 3:00 PM Cameroon time.",
      startsAt: wake?.actualStartAt || wake?.startsAt || wakeStart,
      streamUrl: wake?.externalUrl || wake?.embedUrl || null,
      replayUrl: wake?.recordingUrl || null,
      detailsHref: "/livestreams#wake-service-camp-fire",
      programmeHref: "/programme",
      dismissKey: "ndambi-livestream-wake-scheduled-dismissed",
      modal: false,
    };
  }

  if (wakeState === "live") {
    return {
      eventKey: "wake",
      state: "live",
      title: "We Are Live",
      message: "The Wake Service and Camp Fire for Pa Ndambi Paul Angemba is now live.",
      startsAt: wake?.actualStartAt || wake?.startsAt || wakeStart,
      streamUrl: wake?.externalUrl || wake?.embedUrl || null,
      replayUrl: wake?.recordingUrl || null,
      detailsHref: "/livestreams#wake-service-camp-fire",
      programmeHref: "/programme",
      dismissKey: "ndambi-livestream-wake-live-dismissed",
      modal: true,
    };
  }

  if (now < new Date(burialStartsAt).getTime() && burialState === "scheduled") {
    return {
      eventKey: "burial",
      state: "scheduled",
      title: "Burial Service Livestream",
      message: "The Burial Service will begin on Friday, 3 July 2026 at 7:30 AM Cameroon time.",
      startsAt: burialStartsAt,
      streamUrl: burial?.externalUrl || burial?.embedUrl || null,
      replayUrl: wake?.recordingUrl || null,
      detailsHref: "/livestreams#burial-service",
      programmeHref: "/programme",
      dismissKey: "ndambi-livestream-burial-scheduled-dismissed",
      modal: false,
    };
  }

  if (burialState === "live") {
    return {
      eventKey: "burial",
      state: "live",
      title: "We Are Live",
      message: "The Burial Service for Pa Ndambi Paul Angemba is now live.",
      startsAt: burialStartsAt,
      streamUrl: burial?.externalUrl || burial?.embedUrl || null,
      replayUrl: burial?.recordingUrl || null,
      detailsHref: "/livestreams#burial-service",
      programmeHref: "/programme",
      dismissKey: "ndambi-livestream-burial-live-dismissed",
      modal: true,
    };
  }

  if (burialState === "replay") {
    return {
      eventKey: "burial",
      state: "replay",
      title: "Burial Service Replay",
      message: "The live Burial Service has ended. You can now watch the replay.",
      startsAt: burialStartsAt,
      streamUrl: null,
      replayUrl: burial?.recordingUrl || null,
      detailsHref: "/livestreams#burial-service",
      programmeHref: "/programme",
      dismissKey: "ndambi-livestream-final-replay-dismissed",
      modal: false,
    };
  }

  return {
    eventKey: "burial",
    state: "ended",
    title: "Burial Service Livestream",
    message: "The Burial Service livestream has ended. A replay will be shared when available.",
    startsAt: burialStartsAt,
    streamUrl: null,
    replayUrl: null,
    detailsHref: "/livestreams#burial-service",
    programmeHref: "/programme",
    dismissKey: "ndambi-livestream-final-replay-dismissed",
    modal: false,
  };
}
