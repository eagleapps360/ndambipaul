const objectPositionPattern = /^(\d{1,3})%\s+(\d{1,3})%$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function sanitizeObjectPosition(value: string | null | undefined, fallback = "50% 50%") {
  const candidate = typeof value === "string" ? value.trim() : "";
  const match = objectPositionPattern.exec(candidate);
  if (!match) {
    return fallback;
  }
  return `${clampPercent(Number(match[1]))}% ${clampPercent(Number(match[2]))}%`;
}

export function buildObjectPosition(x: number, y: number) {
  return `${clampPercent(x)}% ${clampPercent(y)}%`;
}

export function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "TW";
}

export function excerptMessage(message: string, max = 220) {
  if (message.length <= max) return message;
  return `${message.slice(0, max).trimEnd()}...`;
}
