"use client";

import { useEffect, useState } from "react";

type CountdownState = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isComplete: boolean;
};

type EventCountdownProps = {
  targetDate: string;
  label: string;
  completedLabel: string;
  inverse?: boolean;
};

function getCountdownState(targetDate: string): CountdownState {
  const distance = new Date(targetDate).getTime() - Date.now();

  if (distance <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isComplete: true,
    };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isComplete: false,
  };
}

const initialState: CountdownState = {
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
  isComplete: false,
};

export default function EventCountdown({ targetDate, label, completedLabel, inverse = false }: EventCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownState>(initialState);

  useEffect(() => {
    const tick = () => {
      setCountdown(getCountdownState(targetDate));
    };

    tick();

    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  if (countdown.isComplete) {
    return (
      <p className={inverse ? "eventCountdownComplete eventCountdownCompleteInverse" : "eventCountdownComplete"} aria-live="polite">
        {completedLabel}
      </p>
    );
  }

  return (
    <div className={inverse ? "eventCountdown eventCountdownInverse" : "eventCountdown"} aria-label={label}>
      <p className="eventCountdownLabel">{label}</p>
      <div className="eventCountdownGrid">
        {[
          ["Days", countdown.days],
          ["Hours", countdown.hours],
          ["Minutes", countdown.minutes],
          ["Seconds", countdown.seconds],
        ].map(([unit, value]) => (
          <div key={unit} className="eventCountdownUnit">
            <strong>{value}</strong>
            <span>{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
