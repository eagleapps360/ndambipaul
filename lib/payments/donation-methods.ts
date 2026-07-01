export const DONATION_METHODS = {
  CASH: "cash",
  KIND: "kind",
  MOBILE_MONEY: "mobile-money",
  CARD: "card",
} as const;

export type DonationMethod = (typeof DONATION_METHODS)[keyof typeof DONATION_METHODS];

export const DONATION_METHOD_VALUES = Object.values(DONATION_METHODS) as DonationMethod[];

export function buildDonationMethodFields(method: DonationMethod) {
  return {
    method,
    donation_method: method,
  };
}
