"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
        }
      },
      { threshold: 0.15 },
    );

    const current = ref.current;
    if (current) {
      io.observe(current);
    }

    return () => {
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${seen ? "seen" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
