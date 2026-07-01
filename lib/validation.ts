import { z } from "zod";
import { DONATION_CURRENCY, MAX_DONATION_AMOUNT, MIN_DONATION_AMOUNT } from "@/lib/payments/currency";
import { DONATION_METHOD_VALUES } from "@/lib/payments/donation-methods";
import { inspectFiles } from "@/lib/uploads";
import { buildObjectPosition, normalizeEmail, sanitizeObjectPosition } from "@/lib/tribute-helpers";

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
  profileImagePosition: string;
  additionalImageMeta: Array<{
    clientId: string;
    caption: string;
    altText: string;
    objectPosition: string;
    sortOrder: number;
  }>;
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
  normalized_email: string | null;
  profile_image_position: string;
  edit_version: number;
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
  normalized_email: z.string().email().nullable(),
  profile_image_position: z.string().min(3),
  edit_version: z.number().int().min(1),
  featured: z.literal(false).default(false),
});

const imageMetaSchema = z.object({
  clientId: z.string().min(1),
  caption: z.string().optional().default(""),
  altText: z.string().optional().default(""),
  objectPosition: z.string().min(3),
  sortOrder: z.number().int().min(0),
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
  amount: z
    .coerce
    .number()
    .finite()
    .int(`Enter the ${DONATION_CURRENCY} amount as a whole number.`)
    .min(MIN_DONATION_AMOUNT, `Enter at least ${MIN_DONATION_AMOUNT} ${DONATION_CURRENCY}.`)
    .max(MAX_DONATION_AMOUNT, `Enter an amount below ${MAX_DONATION_AMOUNT} ${DONATION_CURRENCY}.`),
  acknowledgement: z.string().min(1, "Choose an acknowledgement preference."),
  email: z.string().email("Enter a valid donor email address.").or(z.literal("")),
  phone: z.string().optional(),
  anonymous: z.boolean().optional().default(false),
  note: z.string().optional(),
});

const donationPledgeSchema = z
  .object({
    donorName: z.string().min(2, "Please provide the donor name."),
    method: z.enum(DONATION_METHOD_VALUES, { message: "Choose a supported donation method." }),
    amount: z.union([z.coerce.number().finite().int("Enter the amount as a whole number.").min(0, "Enter a valid amount."), z.null()]),
    email: z.string().email("Enter a valid email address.").or(z.literal("")),
    phone: z.string().optional(),
    transactionReference: z.string().optional(),
    acknowledgement: z.string().min(1, "Choose an acknowledgement preference."),
    anonymous: z.boolean().optional().default(false),
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
    if (value.method === "mobile-money" && value.amount === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `Enter the donation amount in ${DONATION_CURRENCY}.`,
      });
    }
    if ((value.method === "mobile-money" || value.method === "cash" || value.method === "card") && value.amount !== null) {
      if (!Number.isInteger(value.amount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: `Enter the ${DONATION_CURRENCY} amount as a whole number.`,
        });
      } else if (value.amount < MIN_DONATION_AMOUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: `Enter at least ${MIN_DONATION_AMOUNT} ${DONATION_CURRENCY}.`,
        });
      } else if (value.amount > MAX_DONATION_AMOUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: `Enter an amount below ${MAX_DONATION_AMOUNT} ${DONATION_CURRENCY}.`,
        });
      }
    }
  });

function errorsFromResult(result: { success: boolean; error?: { issues: Array<{ message: string }> } }) {
  if (result.success) return [];
  return (result.error?.issues || []).map((issue) => issue.message);
}

export async function validateTributeForm(formData: FormData): Promise<ValidationResult<TributeSubmissionData>> {
  let parsedImageMeta: TributeSubmissionData["additionalImageMeta"] = [];
  const rawMeta = sanitizeText(formData.get("additionalImageMeta"));
  if (rawMeta) {
    try {
      const decoded = JSON.parse(rawMeta);
      const metaParsed = z.array(imageMetaSchema).safeParse(decoded);
      if (metaParsed.success) {
        parsedImageMeta = metaParsed.data.map((item) => ({
          clientId: item.clientId,
          caption: item.caption || "",
          altText: item.altText || "",
          objectPosition: sanitizeObjectPosition(item.objectPosition),
          sortOrder: item.sortOrder,
        }));
      }
    } catch {
      parsedImageMeta = [];
    }
  }

  const payload = {
    name: sanitizeText(formData.get("name")),
    relationship: sanitizeText(formData.get("relationship")),
    location: sanitizeText(formData.get("location")),
    email: sanitizeText(formData.get("email")),
    phone: sanitizeText(formData.get("phone")),
    message: sanitizeText(formData.get("message")),
    profileImagePosition: sanitizeObjectPosition(sanitizeText(formData.get("profileImagePosition")) || buildObjectPosition(50, 50)),
    additionalImageMeta: parsedImageMeta,
    consent: formData.get("consent") === "on",
  };

  const parsed = tributeSchema.safeParse(payload);
  const errors = errorsFromResult(parsed);

  if (!validateCaptcha(formData)) {
    errors.push("CAPTCHA verification is required.");
  }

  const profileImage = formData.get("profileImage");
  const additionalImages = formData.getAll("additionalImages").filter((item): item is File => item instanceof File && item.size > 0);
  const uploads = [
    ...(profileImage instanceof File && profileImage.size > 0 ? [profileImage] : []),
    ...additionalImages,
  ];
  if (additionalImages.length > 6) {
    errors.push("Please upload no more than 6 additional tribute photographs.");
  }
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
    normalized_email: data.email ? normalizeEmail(data.email) : null,
    profile_image_position: data.profileImagePosition,
    edit_version: 1,
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
          note: typeof record.note === "string" ? record.note.trim() : "",
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
