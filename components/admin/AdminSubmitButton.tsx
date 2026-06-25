"use client";

import { useFormStatus } from "react-dom";

export default function AdminSubmitButton({
  label,
  pendingLabel,
  tone = "primary",
}: {
  label: string;
  pendingLabel?: string;
  tone?: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();

  return (
    <button className={tone === "ghost" ? "button ghost darkButton" : "button"} type="submit" disabled={pending}>
      {pending ? pendingLabel || "Saving..." : label}
    </button>
  );
}
