"use client";

import { useEffect } from "react";

export default function DevImageProbe({ paths }: { paths: readonly string[] }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let cancelled = false;

    void Promise.all(
      paths.map(async (path) => {
        try {
          const response = await fetch(path, { method: "HEAD" });
          if (!response.ok && !cancelled) {
            console.warn(`[memorial-image-probe] Missing asset: ${path} (${response.status})`);
          }
        } catch (error) {
          if (!cancelled) {
            console.warn(`[memorial-image-probe] Failed to verify asset: ${path}`, error);
          }
        }
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [paths]);

  return null;
}
