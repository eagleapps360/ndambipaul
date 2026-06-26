"use client";

import { FormEvent, useState } from "react";

export default function TributeManageForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/tributes/manage", { method: "POST", body: formData });
    const payload = await response.json();
    setStatus(payload.message || "If a matching tribute exists, an editing link has been sent to that email address.");
    setSubmitting(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Email address used for the tribute
        <input type="email" name="email" required placeholder="Visible only to the secure edit workflow" />
      </label>
      <p className="subtle">If a matching tribute exists, a secure editing link will be sent privately.</p>
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Request secure edit link"}
      </button>
      {status ? <p className="successBox">{status}</p> : null}
    </form>
  );
}
