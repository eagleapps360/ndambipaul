"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const distance = new Date(target).getTime() - Date.now();
  if (distance <= 0) {
    return { days: "00", hours: "00", minutes: "00" };
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
  };
}

export default function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(getRemaining(target));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getRemaining(target));
    }, 1000 * 30);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <div className="countdown" aria-label="Event countdown">
      <div>
        <strong>{remaining.days}</strong>
        <span>Days</span>
      </div>
      <div>
        <strong>{remaining.hours}</strong>
        <span>Hours</span>
      </div>
      <div>
        <strong>{remaining.minutes}</strong>
        <span>Minutes</span>
      </div>
    </div>
  );
}
