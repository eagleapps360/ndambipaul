function readEnv(key: string) {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export type EnvCategory = "application" | "supabase" | "stripe" | "captcha" | "notifications" | "uploads" | "admin";

export type EnvReport = {
  mode: "development" | "test" | "production";
  demoModeRequested: boolean;
  supabaseConfigured: boolean;
  isValid: boolean;
  missingByCategory: Partial<Record<EnvCategory, string[]>>;
  warnings: string[];
  fatalErrors: string[];
};

function readCsvEnv(key: string) {
  const value = readEnv(key);
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isSupabaseConfigured() {
  return Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL") && readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") && readEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export function getNodeEnv() {
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
}

export function isProductionEnvironment() {
  return getNodeEnv() === "production";
}

export function isDemoMode() {
  const allowDemo = readEnv("ALLOW_DEMO_MODE");
  const buildPhase = process.env.NEXT_PHASE === "phase-production-build";
  return !isSupabaseConfigured() && (allowDemo === "true" || process.env.NODE_ENV !== "production" || buildPhase);
}

export function requireEnv(key: string) {
  const value = readEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getAdminEmailAllowlist() {
  return readCsvEnv("ADMIN_EMAIL_ALLOWLIST");
}

export function isAdminEmailAllowed(email: string) {
  const candidate = email.trim().toLowerCase();
  const allowlist = getAdminEmailAllowlist();
  if (!candidate || allowlist.length === 0) {
    return false;
  }
  return allowlist.includes(candidate);
}

function parseNumberEnv(key: string, fallback: number) {
  const raw = readEnv(key);
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const uploadLimits = {
  imageMb: parseNumberEnv("MAX_IMAGE_UPLOAD_MB", 10),
  videoMb: parseNumberEnv("MAX_VIDEO_UPLOAD_MB", 250),
  documentMb: parseNumberEnv("MAX_DOCUMENT_UPLOAD_MB", 25),
  filesPerSubmission: parseNumberEnv("MAX_FILES_PER_SUBMISSION", 8),
};

export function getAppUrl() {
  return readEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
}

function addMissing(report: EnvReport, category: EnvCategory, key: string) {
  report.missingByCategory[category] = [...(report.missingByCategory[category] || []), key];
}

function validateUrlCandidate(value: string | undefined) {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getEnvironmentReport(): EnvReport {
  const mode = getNodeEnv();
  const productionBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const demoModeRequested = readEnv("ALLOW_DEMO_MODE") === "true";
  const report: EnvReport = {
    mode,
    demoModeRequested,
    supabaseConfigured: isSupabaseConfigured(),
    isValid: true,
    missingByCategory: {},
    warnings: [],
    fatalErrors: [],
  };

  const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL");
  if (!siteUrl) {
    addMissing(report, "application", "NEXT_PUBLIC_SITE_URL");
  } else if (!validateUrlCandidate(siteUrl)) {
    report.fatalErrors.push("Application: NEXT_PUBLIC_SITE_URL must be a valid URL.");
  }

  if (!readEnv("ALLOW_DEMO_MODE")) {
    addMissing(report, "application", "ALLOW_DEMO_MODE");
  }

  const supabaseKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  for (const key of supabaseKeys) {
    if (!readEnv(key)) {
      addMissing(report, "supabase", key);
    }
  }

  if (!readEnv("ADMIN_EMAIL_ALLOWLIST")) {
    addMissing(report, "admin", "ADMIN_EMAIL_ALLOWLIST");
  }

  const stripeKeys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_DONATION_CURRENCY"] as const;
  const stripeConfiguredCount = stripeKeys.filter((key) => Boolean(readEnv(key))).length;
  if (stripeConfiguredCount > 0 && stripeConfiguredCount < stripeKeys.length) {
    stripeKeys.forEach((key) => {
      if (!readEnv(key)) addMissing(report, "stripe", key);
    });
    report.warnings.push("Stripe: partial configuration detected; card donations and webhook verification are not fully ready.");
  }

  const captchaSiteKey = readEnv("NEXT_PUBLIC_CAPTCHA_SITE_KEY");
  const captchaSecretKey = readEnv("CAPTCHA_SECRET_KEY");
  const allowCaptchaBypass = readEnv("ALLOW_CAPTCHA_BYPASS");
  if (captchaSiteKey || captchaSecretKey) {
    if (!captchaSiteKey) addMissing(report, "captcha", "NEXT_PUBLIC_CAPTCHA_SITE_KEY");
    if (!captchaSecretKey) addMissing(report, "captcha", "CAPTCHA_SECRET_KEY");
  }
  if (!readEnv("ALLOW_CAPTCHA_BYPASS")) {
    addMissing(report, "captcha", "ALLOW_CAPTCHA_BYPASS");
  }

  const uploadKeys = ["MAX_IMAGE_UPLOAD_MB", "MAX_VIDEO_UPLOAD_MB", "MAX_DOCUMENT_UPLOAD_MB", "MAX_FILES_PER_SUBMISSION"] as const;
  for (const key of uploadKeys) {
    if (!readEnv(key)) {
      addMissing(report, "uploads", key);
    }
  }

  if (mode === "production" && !productionBuildPhase) {
    if (demoModeRequested) {
      report.fatalErrors.push("Application: ALLOW_DEMO_MODE must be false in production.");
    }
    if (!report.supabaseConfigured) {
      report.fatalErrors.push("Supabase: production requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.");
    }
    if (!readEnv("ADMIN_EMAIL_ALLOWLIST")) {
      report.fatalErrors.push("Admin: production requires ADMIN_EMAIL_ALLOWLIST so authorised administrators can log in.");
    }
    if (allowCaptchaBypass === "true") {
      report.fatalErrors.push("CAPTCHA: ALLOW_CAPTCHA_BYPASS must be false in production.");
    }
  } else if (mode !== "production" && !report.supabaseConfigured && !demoModeRequested) {
    report.fatalErrors.push("Supabase: either configure Supabase or set ALLOW_DEMO_MODE=true for local/demo usage.");
  }

  if (!captchaSiteKey && !captchaSecretKey) {
    report.warnings.push("CAPTCHA: no site key/secret configured; public submissions rely on honeypot and validation only.");
  }
  if (stripeConfiguredCount === 0) {
    report.warnings.push("Stripe: no Stripe keys configured; card donations remain unavailable.");
  }

  report.isValid = report.fatalErrors.length === 0;
  return report;
}

export function assertEnvironmentReady() {
  const report = getEnvironmentReport();
  if (!report.isValid) {
    throw new Error(report.fatalErrors.join(" "));
  }
  return report;
}
