"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type SubmissionSuccessProps = {
  title: string;
  message: string;
  reference?: string | null;
  nextActionLabel?: string;
  nextActionHref?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
};

export default function SubmissionSuccess({
  title,
  message,
  reference,
  nextActionLabel,
  nextActionHref,
  onDismiss,
  dismissLabel = "Dismiss",
}: SubmissionSuccessProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    const container = containerRef.current;
    const heading = headingRef.current;
    if (!container || !heading) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });

    const timer = window.setTimeout(() => {
      heading.focus();
    }, reduceMotion ? 0 : 250);

    return () => window.clearTimeout(timer);
  }, []);

  async function copyReference() {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div ref={containerRef} className="submissionSuccess" role="status" aria-live="polite" tabIndex={-1}>
      <div className="submissionSuccessIcon" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <circle cx="24" cy="24" r="22" />
          <path d="M16 24.5 21.5 30 32.5 18.5" />
        </svg>
      </div>
      <div className="submissionSuccessBody">
        <p className="submissionSuccessEyebrow">Submission confirmed</p>
        <h2 ref={headingRef} className="submissionSuccessTitle" tabIndex={-1}>
          {title}
        </h2>
        <p className="submissionSuccessMessage">{message}</p>

        {reference ? (
          <div className="submissionReference">
            <span>Submission reference</span>
            <strong>{reference}</strong>
            <button type="button" className="button light darkButton" onClick={copyReference}>
              {copyState === "copied" ? "Copied" : "Copy reference"}
            </button>
            {copyState === "failed" ? <small>Copy failed. Please copy it manually.</small> : null}
          </div>
        ) : null}

        {nextActionLabel || onDismiss ? (
          <div className="submissionSuccessActions">
            {nextActionLabel && nextActionHref ? (
              <Link className="button" href={nextActionHref}>
                {nextActionLabel}
              </Link>
            ) : null}
            {onDismiss ? (
              <button type="button" className="button light darkButton" onClick={onDismiss} aria-label={dismissLabel}>
                {dismissLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
