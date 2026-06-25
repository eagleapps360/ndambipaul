"use client";

import { FormEvent, useState } from "react";
import SubmissionSuccess, { type SubmissionSuccessProps } from "@/components/SubmissionSuccess";
import { donationOptions, uploadRules } from "@/lib/ui-config";
import type { TeamDefinition } from "@/lib/public-types";

type SuccessState = SubmissionSuccessProps | null;

function HiddenProtectionFields() {
  return (
    <>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="srOnly" aria-hidden="true" />
      <input type="hidden" name="captchaToken" value="" />
    </>
  );
}

function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="errorBox">{message}</p>;
}

async function submitForm(endpoint: string, formData: FormData) {
  const response = await fetch(endpoint, { method: "POST", body: formData });
  const data = await response.json();
  return { ok: response.ok, data };
}

export function TributeForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", "tribute");
    const response = await submitForm("/api/submissions", formData);
    if (response.ok) {
      form.reset();
      setSuccess({
        title: "Tribute received",
        message: "Thank you for sharing this memory. Your tribute and media have been received and will appear after family review.",
        reference: response.data.reference,
        nextActionLabel: "View tributes",
        nextActionHref: "/tributes",
        dismissLabel: "Submit another tribute",
        onDismiss: () => setSuccess(null),
      });
      setSubmitting(false);
      return;
    }
    setError(response.data.errors?.join(" ") || "We could not submit your tribute.");
    setSubmitting(false);
  }

  if (success) {
    return <SubmissionSuccess {...success} />;
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <HiddenProtectionFields />
      <div className="formGrid">
        <label>
          Full name
          <input required name="name" />
        </label>
        <label>
          Relationship
          <input required name="relationship" />
        </label>
      </div>
      <div className="formGrid">
        <label>
          Location
          <input name="location" placeholder="City, Country" />
        </label>
        <label>
          Private email
          <input type="email" name="email" placeholder="Visible to administrators only" />
        </label>
      </div>
      <div className="formGrid">
        <label>
          Private phone
          <input name="phone" placeholder="Visible to administrators only" />
        </label>
        <label>
          Profile image
          <input type="file" name="uploads" accept={uploadRules.acceptedImages.join(",")} />
        </label>
      </div>
      <label>
        Your tribute
        <textarea required rows={6} name="message" />
      </label>
      <label>
        Additional photos or video clips
        <input type="file" name="uploads" accept={`${uploadRules.acceptedImages.join(",")},${uploadRules.acceptedVideos.join(",")}`} multiple />
      </label>
      <label className="check">
        <input type="checkbox" name="consent" required /> I have permission to share this content and understand it will be reviewed before publication.
      </label>
      <p className="subtle">Private email and phone stay visible only to approved memorial administrators.</p>
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit tribute for approval"}
      </button>
      <ErrorNotice message={error} />
    </form>
  );
}

export function TeamForm({ teams }: { teams: TeamDefinition[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", "team");
    const response = await submitForm("/api/submissions", formData);
    if (response.ok) {
      form.reset();
      setSuccess({
        title: "Registration received",
        message: "Thank you for volunteering. A team coordinator will contact you after reviewing your registration.",
        reference: response.data.reference,
        nextActionLabel: "View coordinators",
        nextActionHref: "/coordinators",
        dismissLabel: "Register another volunteer",
        onDismiss: () => setSuccess(null),
      });
      setSubmitting(false);
      return;
    }
    setError(response.data.errors?.join(" ") || "We could not save your team registration.");
    setSubmitting(false);
  }

  if (success) {
    return <SubmissionSuccess {...success} />;
  }

  return (
    <form className="form glass" onSubmit={handleSubmit}>
      <HiddenProtectionFields />
      <div className="formGrid">
        <label>
          Full name
          <input required name="fullName" />
        </label>
        <label>
          Phone / WhatsApp
          <input required name="phone" />
        </label>
      </div>
      <div className="formGrid">
        <label>
          Email
          <input type="email" name="email" />
        </label>
        <label>
          Preferred team
          <select required name="preferredTeam" defaultValue="">
            <option value="" disabled>
              Select a team
            </option>
            {teams.map((team) => (
              <option key={team.slug} value={team.slug}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="formGrid">
        <label>
          Secondary team
          <select name="secondaryTeam" defaultValue="">
            <option value="">Optional</option>
            {teams.map((team) => (
              <option key={team.slug} value={team.slug}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input name="location" />
        </label>
      </div>
      <label>
        Availability
        <textarea rows={3} name="availability" />
      </label>
      <label>
        Experience
        <textarea rows={3} name="experience" />
      </label>
      <label>
        Notes
        <textarea rows={5} name="notes" />
      </label>
      <label className="check">
        <input type="checkbox" name="consent" required /> I consent to being contacted by funeral coordinators about this volunteer request.
      </label>
      <button className="button light" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Join the team"}
      </button>
      <ErrorNotice message={error} />
    </form>
  );
}

export function MediaUploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", "media");
    const response = await submitForm("/api/submissions", formData);
    if (response.ok) {
      form.reset();
      setSuccess({
        title: "Media received",
        message: "Your photos or video clips have been received and will appear after family review.",
        reference: response.data.reference,
        nextActionLabel: "View gallery",
        nextActionHref: "/gallery",
        dismissLabel: "Submit more media",
        onDismiss: () => setSuccess(null),
      });
      setSubmitting(false);
      return;
    }
    setError(response.data.errors?.join(" ") || "We could not submit your gallery files.");
    setSubmitting(false);
  }

  if (success) {
    return <SubmissionSuccess {...success} />;
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <HiddenProtectionFields />
      <div className="formGrid">
        <label>
          Contributor name
          <input required name="contributor" />
        </label>
        <label>
          Album or category
          <input required name="category" placeholder="Family, Faith, Community..." />
        </label>
      </div>
      <label>
        Caption
        <textarea required rows={4} name="caption" />
      </label>
      <label>
        Photos or videos
        <input type="file" required name="uploads" multiple accept={`${uploadRules.acceptedImages.join(",")},${uploadRules.acceptedVideos.join(",")}`} />
      </label>
      <label className="check">
        <input type="checkbox" name="consent" required /> I confirm that I have rights to share these files with the memorial team.
      </label>
      <p className="subtle">
        Uploads remain private until approved. Images up to {uploadRules.imageMaxMb}MB, videos up to {uploadRules.videoMaxMb}MB.
      </p>
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit gallery contribution"}
      </button>
      <ErrorNotice message={error} />
    </form>
  );
}

export function DonationForm() {
  const [method, setMethod] = useState<(typeof donationOptions)[number]["method"]>("mobile-money");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (method === "card") {
      const payload = {
        amount: Number(formData.get("amount") || 0),
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        anonymous: formData.get("anonymous") === "on",
        acknowledgement: formData.get("acknowledgement"),
      };
      const response = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.errors?.join(" ") || data.error || "Checkout could not be created.");
      setSubmitting(false);
      return;
    }

    const payload = {
      donorName: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      amount: formData.get("amount"),
      acknowledgement: formData.get("acknowledgement"),
      anonymous: formData.get("anonymous") === "on",
      method,
      provider: formData.get("provider"),
      transactionReference: formData.get("transactionReference"),
      itemDescription: formData.get("itemDescription"),
      quantity: formData.get("quantity"),
      estimatedValue: formData.get("estimatedValue"),
      sentAt: formData.get("sentAt"),
      notes: formData.get("notes"),
    };
    const response = await fetch("/api/donations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      form.reset();
      setSuccess({
        title:
          method === "mobile-money"
            ? "Mobile Money declaration received"
            : method === "cash"
              ? "Cash support recorded"
              : "Donation pledge received",
        message:
          method === "mobile-money"
            ? "Thank you. Your transaction details have been recorded and will be verified by the family finance team."
            : method === "cash"
              ? "Thank you. Your cash donation declaration has been recorded for family verification."
              : "Thank you for your support. The family coordination team will review the items or services you offered.",
        reference: data.reference,
        nextActionLabel: "Return to memorial home",
        nextActionHref: "/",
        dismissLabel: "Record another donation",
        onDismiss: () => setSuccess(null),
      });
      setSubmitting(false);
      return;
    }
    setError(data.errors?.join(" ") || "We could not record this donation.");
    setSubmitting(false);
  }

  if (success) {
    return <SubmissionSuccess {...success} />;
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="methodTabs">
        {donationOptions.map((option) => (
          <button key={option.method} type="button" className={method === option.method ? "active" : ""} onClick={() => setMethod(option.method)}>
            {option.title}
          </button>
        ))}
      </div>
      <div className="formGrid">
        <label>
          Donor name
          <input name="name" required />
        </label>
        <label>
          Phone
          <input name="phone" />
        </label>
      </div>
      <div className="formGrid">
        <label>
          Email
          <input name="email" type="email" />
        </label>
        {(method === "mobile-money" || method === "card") && (
          <label>
            Amount
            <input name="amount" type="number" min="1" required />
          </label>
        )}
      </div>
      <div className="formGrid">
        <label>
          Acknowledgement preference
          <select name="acknowledgement" defaultValue="public" required>
            <option value="public">Public acknowledgement</option>
            <option value="anonymous">Anonymous public listing</option>
            <option value="private">Private acknowledgement only</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" name="anonymous" /> Display publicly as anonymous
        </label>
      </div>
      {method === "mobile-money" ? (
        <div className="infoBox">
          <strong>Mobile Money placeholder details</strong>
          <p>MTN Mobile Money and Orange Money numbers will be managed from site settings. Do not publish real account numbers until family approval is complete.</p>
        </div>
      ) : null}
      {method === "mobile-money" ? (
        <>
          <div className="formGrid">
            <label>
              Provider
              <select name="provider" defaultValue="MTN Mobile Money">
                <option>MTN Mobile Money</option>
                <option>Orange Money</option>
              </select>
            </label>
            <label>
              Transaction reference
              <input name="transactionReference" required />
            </label>
          </div>
          <label>
            Date sent
            <input type="date" name="sentAt" />
          </label>
        </>
      ) : null}
      {method === "cash" ? (
        <>
          <label>
            Amount
            <input name="amount" type="number" min="0" />
          </label>
          <label>
            Cash handover note
            <textarea name="notes" rows={4} placeholder="Amount, expected collector, date and any reference information." />
          </label>
        </>
      ) : null}
      {method === "kind" ? (
        <>
          <label>
            Item or service
            <input name="itemDescription" placeholder="Food, seating, transport, printing, accommodation..." />
          </label>
          <div className="formGrid">
            <label>
              Quantity
              <input name="quantity" />
            </label>
            <label>
              Estimated value
              <input name="estimatedValue" type="number" min="0" />
            </label>
          </div>
          <label>
            Delivery notes
            <textarea name="notes" rows={4} />
          </label>
        </>
      ) : null}
      {method === "card" ? (
        <div className="infoBox">
          <strong>Secure Stripe Checkout</strong>
          <p>Card status is reconciled server-side. The website should never trust client-reported payment success.</p>
        </div>
      ) : null}
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : method === "card" ? "Continue securely" : "Record my support"}
      </button>
      <ErrorNotice message={error} />
    </form>
  );
}
