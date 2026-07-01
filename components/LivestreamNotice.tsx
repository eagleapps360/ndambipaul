"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Livestream } from "@/lib/content";
import { getLivestreamNoticeState, LIVESTREAM_TIMEZONE } from "@/lib/livestream-notice";

const liveDismissTtlMs = 30 * 60 * 1000;

function shouldHideOnPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/tributes/manage") || pathname.startsWith("/tributes/edit/");
}

function formatCountdown(targetIso: string, now: number) {
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} · ${hours} hour${hours === 1 ? "" : "s"} · ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} · ${minutes} minute${minutes === 1 ? "" : "s"} · ${seconds} second${seconds === 1 ? "" : "s"}`;
  }
  return `${minutes} minute${minutes === 1 ? "" : "s"} · ${seconds} second${seconds === 1 ? "" : "s"}`;
}

function readDismissed(key: string, modal: boolean) {
  if (typeof window === "undefined") {
    return false;
  }

  if (!modal) {
    return Boolean(window.sessionStorage.getItem(key) || window.localStorage.getItem(key));
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return false;
  }
  const expiry = Number(raw);
  return Number.isFinite(expiry) && expiry > Date.now();
}

export default function LivestreamNotice({ streams }: { streams: Livestream[] }) {
  const pathname = usePathname();
  const [now, setNow] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const notice = useMemo(() => getLivestreamNoticeState(streams, now ?? Date.now()), [now, streams]);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notice) {
      setDismissed(false);
      return;
    }
    setDismissed(readDismissed(notice.dismissKey, notice.modal));
  }, [notice]);

  useEffect(() => {
    if (!notice?.modal || dismissed) {
      document.body.style.removeProperty("overflow");
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 20);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [dismissed, notice?.dismissKey, notice?.modal]);

  function handleDismiss() {
    if (!notice) {
      return;
    }
    if (notice.modal) {
      window.localStorage.setItem(notice.dismissKey, String(Date.now() + liveDismissTtlMs));
    } else if (notice.state === "scheduled") {
      window.sessionStorage.setItem(notice.dismissKey, "1");
    } else {
      window.localStorage.setItem(notice.dismissKey, "1");
    }
    setDismissed(true);
  }

  if (!notice || !pathname || shouldHideOnPath(pathname) || now === null || dismissed) {
    return null;
  }

  const countdown = notice.state === "scheduled" ? formatCountdown(notice.startsAt, now) : null;
  const primaryHref = notice.state === "live" ? notice.streamUrl : notice.state === "replay" ? notice.replayUrl : notice.detailsHref;
  const primaryLabel =
    notice.state === "live"
      ? "Watch Live Now"
      : notice.state === "replay"
        ? "Watch Replay"
        : "View Livestream Details";

  return (
    <div className={notice.modal ? "livestreamNoticeOverlay" : "livestreamNoticeDock"} role={notice.modal ? "presentation" : undefined}>
      <section
        className={notice.modal ? "livestreamNotice livestreamNoticeModal" : "livestreamNotice"}
        role={notice.modal ? "dialog" : "status"}
        aria-modal={notice.modal ? "true" : undefined}
        aria-live="polite"
        aria-label={notice.title}
      >
        <div className="livestreamNoticeTop">
          <div>
            <span className={notice.state === "live" ? "livestreamNoticeBadge isLive" : "livestreamNoticeBadge"}>
              {notice.state === "live" ? "Live" : "Livestream"}
            </span>
            <h2>{notice.title}</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="livestreamNoticeClose" onClick={handleDismiss} aria-label="Dismiss livestream notice">
            Close
          </button>
        </div>
        <p className="livestreamNoticeMessage">{notice.message}</p>
        {countdown ? (
          <p className="livestreamNoticeCountdown">
            Starts in {countdown}
            <span>Cameroon time ({LIVESTREAM_TIMEZONE})</span>
          </p>
        ) : (
          <p className="livestreamNoticeTimezone">Cameroon time ({LIVESTREAM_TIMEZONE})</p>
        )}
        <div className="livestreamNoticeActions">
          {primaryHref ? (
            primaryHref.startsWith("/") ? (
              <Link className="button" href={primaryHref}>
                {primaryLabel}
              </Link>
            ) : (
              <a className="button" href={primaryHref} target="_blank" rel="noreferrer">
                {primaryLabel}
              </a>
            )
          ) : (
            <span className="subtle">The viewing link will appear here when the broadcast begins.</span>
          )}
          {notice.state === "live" ? (
            <Link className="textLink" href={notice.programmeHref}>
              View Programme
            </Link>
          ) : null}
          {notice.state === "scheduled" && notice.eventKey === "burial" && notice.replayUrl ? (
            <a className="textLink" href={notice.replayUrl} target="_blank" rel="noreferrer">
              Watch Wake Replay
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
