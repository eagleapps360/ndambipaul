import { z } from "zod";
import { inspectFiles } from "@/lib/uploads";

export type SubmissionType = "tribute" | "team" | "media";
export const DEFAULT_TRIBUTE_CATEGORY = "general" as const;
export const TRIBUTE_SUBMISSION_FAILURE_MESSAGE = "We could not submit your tribute right now. Please try again shortly.";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

export type TributeSubmissionData = {
  name: string;
  relationship: string;
  location: string;
  email: string;
  phone: string;
  message: string;
};

export type TributeInsertData = {
  slug: string;
  submission_reference: string;
  status: "pending";
  moderation_status: "pending";
  category: typeof DEFAULT_TRIBUTE_CATEGORY;
  relationship: string;
  relationship_category: string;
  name: string;
  contributor_name: string;
  location: string | null;
  message: string;
  tribute_message: string;
  private_contact: {
    email: string | null;
    phone: string | null;
  };
  private_email: string | null;
  private_phone: string | null;
  featured: false;
};

export type TeamSubmissionData = {
  fullName: string;
  phone: string;
  email: string;
  preferredTeam: string;
  secondaryTeam: string;
  location: string;
  availability: string;
  experience: string;
  notes: string;
};

export type MediaSubmissionData = {
  contributor: string;
  category: string;
  caption: string;
};

export function sanitizeText(input: FormDataEntryValue | null) {
  const value = typeof input === "string" ? input : "";
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

export function honeypotTriggered(formData: FormData) {
  return sanitizeText(formData.get("company")) !== "";
}

export function validateCaptcha(formData: FormData) {
  const enabled = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && process.env.CAPTCHA_SECRET_KEY;
  if (process.env.ALLOW_CAPTCHA_BYPASS === "true" && process.env.NODE_ENV !== "production") {
    return true;
  }
  if (!enabled) {
    return true;
  }
  return Boolean(sanitizeText(formData.get("captchaToken")));
}

const tributeSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  relationship: z.string().min(2, "Please enter your relationship."),
  location: z.string().optional(),
  email: z.string().email("Please enter a valid email address.").or(z.literal("")),
  phone: z.string().optional(),
  message: z.string().min(24, "Please write a longer tribute message."),
  consent: z.literal(true, {
    message: "Please confirm that you have permission to share this content.",
  }),
});

const tributeInsertSchema = z.object({
  slug: z.string().min(1),
  submission_reference: z.string().min(1),
  status: z.literal("pending").default("pending"),
  moderation_status: z.literal("pending").default("pending"),
  category: z.literal(DEFAULT_TRIBUTE_CATEGORY).default(DEFAULT_TRIBUTE_CATEGORY),
  relationship: z.string().min(2),
  relationship_category: z.string().min(2),
  name: z.string().min(2),
  contributor_name: z.string().min(2),
  location: z.string().nullable(),
  message: z.string().min(24),
  tribute_message: z.string().min(24),
  private_contact: z.object({
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
  }),
  private_email: z.string().email().nullable(),
  private_phone: z.string().nullable(),
  featured: z.literal(false).default(false),
});

const teamSchema = z.object({
  fullName: z.string().min(2, "Please provide your full name."),
  phone: z.string().min(7, "Please provide a reachable phone number."),
  email: z.string().email("Please enter a valid email address.").or(z.literal("")),
  preferredTeam: z.string().min(2, "Please choose a preferred team."),
  secondaryTeam: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
  consent: z.literal(true, {
    message: "Please confirm that coordinators may contact you.",
  }),
});

const mediaSchema = z.object({
  contributor: z.string().min(2, "Please tell us who is contributing these files."),
  category: z.string().min(2, "Please choose an album or category."),
  caption: z.string().min(8, "Please add a short caption."),
  consent: z.literal(true, {
    message: "Please confirm that you have rights to share these files.",
  }),
});

const stripeDonationSchema = z.object({
  name: z.string().min(2, "Please provide the donor name."),
  amount: z.coerce.number().finite().min(1, "Enter a valid donation amount."),
  acknowledgement: z.string().min(1, "Choose an acknowledgement preference."),
  email: z.string().email("Enter a valid donor email address.").or(z.literal("")),
  phone: z.string().optional(),
  anonymous: z.boolean().optional().default(false),
});

const donationPledgeSchema = z
  .object({
    donorName: z.string().min(2, "Please provide the donor name."),
    method: z.enum(["mobile-money", "cash", "kind", "bank-transfer"], {
      message: "Choose a supported donation method.",
    }),
    amount: z.union([z.coerce.number().finite().min(0, "Enter a valid amount."), z.null()]),
    email: z.string().email("Enter a valid email address.").or(z.literal("")),
    phone: z.string().optional(),
    transactionReference: z.string().optional(),
    acknowledgement: z.string().min(1, "Choose an acknowledgement preference."),
    anonymous: z.boolean().optional().default(false),
    provider: z.string().optional(),
    itemDescription: z.string().optional(),
    quantity: z.string().optional(),
    estimatedValue: z.union([z.coerce.number().finite(), z.null()]).optional().default(null),
    sentAt: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.method === "mobile-money" && (!value.transactionReference || value.transactionReference.trim().length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transactionReference"],
        message: "Enter the mobile money transaction reference.",
      });
    }
  });

function errorsFromResult(result: { success: boolean; error?: { issues: Array<{ message: string }> } }) {
  if (result.success) return [];
  return (result.error?.issues || []).map((issue) => issue.message);
}

export async function validateTributeForm(formData: FormData): Promise<ValidationResult<TributeSubmissionData>> {
  const payload = {
    name: sanitizeText(formData.get("name")),
    relationship: sanitizeText(formData.get("relationship")),
    location: sanitizeText(formData.get("location")),
    email: sanitizeText(formData.get("email")),
    phone: sanitizeText(formData.get("phone")),
    message: sanitizeText(formData.get("message")),
    consent: formData.get("consent") === "on",
  };

  const parsed = tributeSchema.safeParse(payload);
  const errors = errorsFromResult(parsed);

  if (!validateCaptcha(formData)) {
    errors.push("CAPTCHA verification is required.");
  }

  const uploads = formData.getAll("uploads").filter((item): item is File => item instanceof File && item.size > 0);
  const inspected = await inspectFiles(uploads);
  errors.push(...inspected.errors);

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    data: payload,
  };
}

export function buildTributeInsert(data: TributeSubmissionData, reference: string): TributeInsertData {
  return tributeInsertSchema.parse({
    slug: reference,
    submission_reference: reference,
    relationship: data.relationship,
    relationship_category: data.relationship,
    name: data.name,
    contributor_name: data.name,
    location: data.location || null,
    message: data.message,
    tribute_message: data.message,
    private_contact: {
      email: data.email || null,
      phone: data.phone || null,
    },
    private_email: data.email || null,
    private_phone: data.phone || null,
  });
}

export function validateTeamForm(formData: FormData): ValidationResult<TeamSubmissionData> {
  const payload = {
    fullName: sanitizeText(formData.get("fullName")),
    phone: sanitizeText(formData.get("phone")),
    email: sanitizeText(formData.get("email")),
    preferredTeam: sanitizeText(formData.get("preferredTeam")),
    secondaryTeam: sanitizeText(formData.get("secondaryTeam")),
    location: sanitizeText(formData.get("location")),
    availability: sanitizeText(formData.get("availability")),
    experience: sanitizeText(formData.get("experience")),
    notes: sanitizeText(formData.get("notes")),
    consent: formData.get("consent") === "on",
  };

  const parsed = teamSchema.safeParse(payload);
  const errors = errorsFromResult(parsed);

  if (!validateCaptcha(formData)) {
    errors.push("CAPTCHA verification is required.");
  }

  return errors.length
    ? { ok: false, errors }
    : {
        ok: true,
        data: {
          fullName: payload.fullName,
          phone: payload.phone,
          email: payload.email,
          preferredTeam: payload.preferredTeam,
          secondaryTeam: payload.secondaryTeam,
          location: payload.location,
          availability: payload.availability,
          experience: payload.experience,
          notes: payload.notes,
        },
      };
}

export async function validateMediaForm(formData: FormData): Promise<ValidationResult<MediaSubmissionData>> {
  const payload = {
    contributor: sanitizeText(formData.get("contributor")),
    category: sanitizeText(formData.get("category")),
    caption: sanitizeText(formData.get("caption")),
    consent: formData.get("consent") === "on",
  };

  const parsed = mediaSchema.safeParse(payload);
  const errors = errorsFromResult(parsed);

  const uploads = formData.getAll("uploads").filter((item): item is File => item instanceof File && item.size > 0);
  if (!uploads.length) {
    errors.push("Please choose at least one photo or video.");
  }

  const inspected = await inspectFiles(uploads);
  errors.push(...inspected.errors);

  if (!validateCaptcha(formData)) {
    errors.push("CAPTCHA verification is required.");
  }

  return errors.length
    ? { ok: false, errors }
    : {
        ok: true,
        data: {
          contributor: payload.contributor,
          category: payload.category,
          caption: payload.caption,
        },
      };
}

export function validateStripeDonation(body: unknown) {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const payload =
    record
      ? {
          name: typeof record.name === "string" ? record.name.trim().replace(/[<>]/g, "") : "",
          amount: record.amount,
          acknowledgement: typeof record.acknowledgement === "string" ? record.acknowledgement.trim() : "",
          email: typeof record.email === "string" ? record.email.trim() : "",
          phone: typeof record.phone === "string" ? record.phone.trim() : "",
          anonymous: Boolean(record.anonymous),
        }
      : null;

  const parsed = stripeDonationSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.issues.map((issue) => issue.message) };
  }

  return { ok: true as const, data: parsed.data };
}

export function validateDonationPledge(body: unknown) {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const payload =
    record
      ? {
          donorName: typeof record.donorName === "string" ? record.donorName.trim() : "",
          method: typeof record.method === "string" ? record.method.trim() : "",
          amount: record.amount === "" ? null : record.amount ?? null,
          email: typeof record.email === "string" ? record.email.trim() : "",
          phone: typeof record.phone === "string" ? record.phone.trim() : "",
          transactionReference:
            typeof record.transactionReference === "string"
              ? record.transactionReference.trim()
              : "",
          acknowledgement: typeof record.acknowledgement === "string" ? record.acknowledgement.trim() : "",
          anonymous: Boolean(record.anonymous),
          provider: typeof record.provider === "string" ? record.provider.trim() : "",
          itemDescription: typeof record.itemDescription === "string" ? record.itemDescription.trim() : "",
          quantity: typeof record.quantity === "string" ? record.quantity.trim() : "",
          estimatedValue: record.estimatedValue === "" ? null : (record.estimatedValue ?? null),
          sentAt: typeof record.sentAt === "string" ? record.sentAt.trim() : "",
          notes: typeof record.notes === "string" ? record.notes.trim() : "",
        }
      : null;

  const parsed = donationPledgeSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.issues.map((issue) => issue.message) };
  }

  return { ok: true as const, data: parsed.data };
}
