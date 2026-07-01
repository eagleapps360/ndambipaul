"use client";

import { FormEvent, useMemo, useState } from "react";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import SubmissionSuccess, { type SubmissionSuccessProps } from "@/components/SubmissionSuccess";
import { DONATION_CURRENCY, SUGGESTED_DONATION_AMOUNTS } from "@/lib/payments/currency";
import { DONATION_METHODS, type DonationMethod } from "@/lib/payments/donation-methods";
import { buildObjectPosition } from "@/lib/tribute-helpers";
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePosition, setProfilePosition] = useState({ x: 50, y: 50 });
  const [additionalImages, setAdditionalImages] = useState<
    Array<{ id: string; file: File; previewUrl: string; caption: string; altText: string; x: number; y: number }>
  >([]);

  const profilePreviewUrl = useMemo(() => (profileImage ? URL.createObjectURL(profileImage) : null), [profileImage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", "tribute");
    if (profileImage) {
      formData.set("profileImage", profileImage);
    }
    additionalImages.forEach((item) => {
      formData.append("additionalImages", item.file);
    });
    formData.set("profileImagePosition", buildObjectPosition(profilePosition.x, profilePosition.y));
    formData.set(
      "additionalImageMeta",
      JSON.stringify(
        additionalImages.map((item, index) => ({
          clientId: item.id,
          caption: item.caption,
          altText: item.altText,
          objectPosition: buildObjectPosition(item.x, item.y),
          sortOrder: index,
        })),
      ),
    );
    const response = await submitForm("/api/submissions", formData);
    if (response.ok) {
      form.reset();
      setProfileImage(null);
      setAdditionalImages([]);
      setProfilePosition({ x: 50, y: 50 });
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

  function moveAdditionalImage(id: string, direction: -1 | 1) {
    setAdditionalImages((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
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
          Profile photograph
          <input
            type="file"
            name="profileImage"
            accept={uploadRules.acceptedImages.join(",")}
            onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
          />
        </label>
      </div>
      <label>
        Your tribute
        <textarea required rows={6} name="message" />
      </label>
      {profileImage ? (
        <ImagePositionEditor
          label="Profile image focus"
          imageUrl={profilePreviewUrl}
          x={profilePosition.x}
          y={profilePosition.y}
          onXChange={(value) => setProfilePosition((current) => ({ ...current, x: value }))}
          onYChange={(value) => setProfilePosition((current) => ({ ...current, y: value }))}
        />
      ) : null}
      <label>
        Additional tribute photographs
        <input
          type="file"
          name="additionalImages"
          accept={uploadRules.acceptedImages.join(",")}
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files || []).slice(0, 6);
            setAdditionalImages((current) => [
              ...current,
              ...files.map((file, index) => ({
                id: `${file.name}-${file.size}-${Date.now()}-${index}`,
                file,
                previewUrl: URL.createObjectURL(file),
                caption: "",
                altText: "",
                x: 50,
                y: 50,
              })),
            ].slice(0, 6));
            event.currentTarget.value = "";
          }}
        />
      </label>
      {additionalImages.length ? (
        <div className="tributeComposerList">
          {additionalImages.map((item, index) => (
            <article key={item.id} className="tributeComposerCard">
              <div className="tributeComposerCardHeader">
                <strong>Photo {index + 1}</strong>
                <div className="tributeComposerActions">
                  <button type="button" className="button ghost" onClick={() => moveAdditionalImage(item.id, -1)}>
                    Up
                  </button>
                  <button type="button" className="button ghost" onClick={() => moveAdditionalImage(item.id, 1)}>
                    Down
                  </button>
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() => setAdditionalImages((current) => current.filter((entry) => entry.id !== item.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <ImagePositionEditor
                label={`Photo ${index + 1} focus`}
                imageUrl={item.previewUrl}
                x={item.x}
                y={item.y}
                onXChange={(value) =>
                  setAdditionalImages((current) =>
                    current.map((entry) => (entry.id === item.id ? { ...entry, x: value } : entry)),
                  )
                }
                onYChange={(value) =>
                  setAdditionalImages((current) =>
                    current.map((entry) => (entry.id === item.id ? { ...entry, y: value } : entry)),
                  )
                }
              />
              <div className="formGrid">
                <label>
                  Caption
                  <input
                    value={item.caption}
                    onChange={(event) =>
                      setAdditionalImages((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, caption: event.target.value } : entry)),
                      )
                    }
                  />
                </label>
                <label>
                  Alt text
                  <input
                    value={item.altText}
                    placeholder="Tribute photograph"
                    onChange={(event) =>
                      setAdditionalImages((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, altText: event.target.value } : entry)),
                      )
                    }
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      ) : null}
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
  const [method, setMethod] = useState<DonationMethod>(DONATION_METHODS.MOBILE_MONEY);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyMobileMoneyNumber() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText("675119804");
      } else {
        const input = document.createElement("input");
        input.value = "675119804";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (method === DONATION_METHODS.CARD) {
      const payload = {
        amount: Number(formData.get("amount") || 0),
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        anonymous: formData.get("anonymous") === "on",
        acknowledgement: formData.get("acknowledgement"),
        note: formData.get("notes"),
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
          method === DONATION_METHODS.MOBILE_MONEY
            ? "Mobile Money declaration received"
            : method === DONATION_METHODS.CASH
              ? "Cash support recorded"
              : "Donation pledge received",
        message:
          method === DONATION_METHODS.MOBILE_MONEY
            ? "Thank you. Your transaction details have been recorded and will be verified by the family finance team."
            : method === DONATION_METHODS.CASH
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
          <button
            key={option.method}
            type="button"
            className={method === option.method ? "active" : ""}
            onClick={() => setMethod(option.method as DonationMethod)}
          >
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
        {(method === DONATION_METHODS.MOBILE_MONEY || method === DONATION_METHODS.CARD) && (
          <label>
            Amount ({DONATION_CURRENCY})
            <input name="amount" type="number" min="500" step="1" inputMode="numeric" required />
          </label>
        )}
      </div>
      {(method === DONATION_METHODS.MOBILE_MONEY || method === DONATION_METHODS.CARD) ? (
        <div className="filterOptions">
          {SUGGESTED_DONATION_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[name="amount"]');
                if (input) {
                  input.value = String(amount);
                }
              }}
            >
              {amount.toLocaleString("en-US")} {DONATION_CURRENCY}
            </button>
          ))}
        </div>
      ) : null}
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
      {method === DONATION_METHODS.MOBILE_MONEY ? (
        <div className="infoBox">
          <strong>MTN Mobile Money</strong>
          <p>Send your contribution to the MTN Mobile Money number below. Please use your name as the payment reference where possible.</p>
          <div className="submissionReference">
            <span>Mobile Money number</span>
            <strong>675 119 804</strong>
            <span>Account name: Aphanyieck Akwi</span>
            <button type="button" className="button light darkButton" onClick={copyMobileMoneyNumber}>
              {copyState === "copied" ? "Mobile Money number copied" : "Copy number"}
            </button>
            {copyState === "failed" ? <small>Copy failed. Please copy the number manually.</small> : null}
          </div>
        </div>
      ) : null}
      {method === DONATION_METHODS.MOBILE_MONEY ? (
        <>
          <div className="formGrid">
            <label>
              Transaction reference
              <input name="transactionReference" required />
            </label>
          </div>
          <label>
            Date sent
            <input type="date" name="sentAt" />
          </label>
          <label>
            Message or note
            <textarea name="notes" rows={4} placeholder="Optional note, sender details, or payment reference context." />
          </label>
        </>
      ) : null}
      {method === DONATION_METHODS.CASH ? (
        <>
          <label>
            Amount ({DONATION_CURRENCY})
            <input name="amount" type="number" min="500" step="1" inputMode="numeric" />
          </label>
          <label>
            Cash handover note
            <textarea name="notes" rows={4} placeholder="Amount, expected collector, date and any reference information." />
          </label>
        </>
      ) : null}
      {method === DONATION_METHODS.KIND ? (
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
      {method === DONATION_METHODS.CARD ? (
        <div className="infoBox">
          <strong>Secure Stripe Checkout</strong>
          <p>Card status is reconciled server-side. The website should never trust client-reported payment success.</p>
        </div>
      ) : null}
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : method === DONATION_METHODS.CARD ? "Continue securely" : "Record my support"}
      </button>
      <ErrorNotice message={error} />
    </form>
  );
}
