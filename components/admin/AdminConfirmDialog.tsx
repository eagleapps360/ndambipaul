"use client";

import { useEffect, useId, useRef, useState } from "react";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";

export default function AdminConfirmDialog({
  title,
  description,
  recordLabel,
  action,
  hiddenFields = [],
  confirmLabel,
  reasonLabel,
  requireReason = false,
  tone = "danger",
  triggerLabel,
}: {
  title: string;
  description: string;
  recordLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Array<{ name: string; value: string }>;
  confirmLabel: string;
  reasonLabel?: string;
  requireReason?: boolean;
  tone?: "danger" | "neutral";
  triggerLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const reasonId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(event: Event) {
      event.preventDefault();
      setOpen(false);
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  return (
    <>
      <button
        className={tone === "danger" ? "button ghost darkButton adminDangerButton" : "button ghost darkButton"}
        type="button"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      <dialog ref={dialogRef} className="adminDialog" aria-labelledby={reasonId}>
        <form action={action} className="adminDialogForm">
          {hiddenFields.map((field) => (
            <input key={`${field.name}-${field.value}`} type="hidden" name={field.name} value={field.value} />
          ))}
          <div className="adminDialogHeader">
            <h2 id={reasonId}>{title}</h2>
            <button className="closeButton" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p>{description}</p>
          <p className="subtle">Affected record: {recordLabel}</p>
          {requireReason ? (
            <label>
              {reasonLabel || "Reason"}
              <textarea ref={firstFieldRef as React.RefObject<HTMLTextAreaElement>} name="reason" rows={4} required />
            </label>
          ) : (
            <label className="check">
              <input ref={firstFieldRef as React.RefObject<HTMLInputElement>} name="confirmed" type="checkbox" value="yes" required />
              I understand and want to continue
            </label>
          )}
          <div className="adminDialogActions">
            <button className="button ghost darkButton" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <AdminSubmitButton label={confirmLabel} pendingLabel="Processing..." tone={tone === "danger" ? "primary" : "ghost"} />
          </div>
        </form>
      </dialog>
    </>
  );
}
