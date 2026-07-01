export const DONATION_CURRENCY = "XAF";
export const MIN_DONATION_AMOUNT = 500;
export const MAX_DONATION_AMOUNT = 5_000_000;
export const SUGGESTED_DONATION_AMOUNTS = [5_000, 10_000, 25_000, 50_000, 100_000] as const;

const zeroDecimalCurrencies = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function normalizeCurrency(currency: string) {
  return String(currency || "").trim().toUpperCase();
}

export function isSupportedDonationCurrency(currency: string) {
  return normalizeCurrency(currency) === DONATION_CURRENCY;
}

export function validateDonationAmount(amount: number, currency = DONATION_CURRENCY) {
  const normalizedCurrency = normalizeCurrency(currency);

  if (!Number.isFinite(amount)) {
    throw new Error("Donation amount must be a finite number.");
  }

  if (!isSupportedDonationCurrency(normalizedCurrency)) {
    throw new Error("Unsupported donation currency.");
  }

  if (!Number.isInteger(amount)) {
    throw new Error(`${normalizedCurrency} donations must be entered as whole numbers.`);
  }

  if (amount < MIN_DONATION_AMOUNT) {
    throw new Error(`Donation amount must be at least ${MIN_DONATION_AMOUNT} ${normalizedCurrency}.`);
  }

  if (amount > MAX_DONATION_AMOUNT) {
    throw new Error(`Donation amount must not exceed ${MAX_DONATION_AMOUNT} ${normalizedCurrency}.`);
  }

  return amount;
}

export function toStripeAmount(amount: number, currency: string) {
  const normalizedCurrency = normalizeCurrency(currency);
  const validAmount = validateDonationAmount(amount, normalizedCurrency);

  if (zeroDecimalCurrencies.has(normalizedCurrency)) {
    return validAmount;
  }

  return validAmount * 100;
}
