import { submitLeadInquiry, type LeadInquiry } from "./supabase";
import { dealerInfo, type Vehicle } from "./vehicles";

/** TCPA disclosure shown next to the required consent checkbox on every capture surface. */
export const CONSENT_TEXT =
  "I agree that AM Ford may contact me by phone or text at the number provided about my inquiry. " +
  "Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out.";

/** Shown on every success screen — the speed-to-lead promise. */
export const RESPONSE_PROMISE =
  "Expect a call or text within 15 minutes during business hours (Mon to Sat).";

/** Machine-readable consent proof appended to every lead message. */
export function consentStamp(): string {
  return `[SMS/call consent granted ${new Date().toISOString()}]`;
}

const LEAD_FLAG_KEY = "am:lead-submitted";

/** Session memory that a lead was captured — used to suppress further offers/popups. */
export function markLeadSubmitted() {
  try {
    sessionStorage.setItem(LEAD_FLAG_KEY, new Date().toISOString());
  } catch {
    /* best effort */
  }
}

export function hasSubmittedLead(): boolean {
  try {
    return sessionStorage.getItem(LEAD_FLAG_KEY) !== null;
  } catch {
    return false;
  }
}

export type QuickLeadInput = {
  /**
   * True only when the visitor actually ticked the consent box. The stamp below is evidence
   * in a TCPA dispute, so it must never be written for someone who did not consent: a record
   * claiming consent that was never given is worse than having no record at all.
   */
  consent?: boolean;
  /**
   * The disclosure actually rendered beside the box, for a surface that shows wording of its
   * own rather than CONSENT_TEXT. What we store has to be what the visitor read, or it is not
   * evidence of anything. Surfaces using the shared wording can leave this unset.
   */
  consentText?: string;
  vehicle?: Vehicle;
  leadType?: LeadInquiry["lead_type"];
  name?: string;
  /** Optional: an email-only signup has no phone, and inventing one is worse than omitting it. */
  phone?: string;
  email?: string;
  message: string;
  financingDetails?: Record<string, unknown>;
};

/**
 * One funnel for every capture surface: stamps consent proof onto the message,
 * attaches the vehicle id so leads join to inventory, and remembers the
 * submission so exit offers stop firing at people who already converted.
 */
export async function submitQuickLead(input: QuickLeadInput) {
  const result = await submitLeadInquiry({
    lead_type: input.leadType ?? "quote_request",
    vehicle_id: input.vehicle?.id,
    full_name: input.name?.trim() || "Not provided",
    email: input.email?.trim() ?? "",
    phone: input.phone?.trim() || undefined,
    message: input.message.trim(),
    // Consent now lands in the table's own sms_consent_checked / _at / _text columns, which is
    // where it belongs as evidence. Stamping it into free text as well would create a second,
    // unverifiable copy that could contradict the first.
    sms_consent: input.consent === true,
    sms_consent_text: input.consent === true ? (input.consentText ?? CONSENT_TEXT) : undefined,
    financing_details: input.financingDetails,
  });
  if (result.success) markLeadSubmitted();
  return result;
}

/**
 * Payment-shopper estimate shown on vehicle cards: 10% down, 72 months, 7.49% APR.
 * Marketing estimate only — the calculator on the vehicle page does the real math.
 */
export function estMonthlyPayment(price: number): number {
  const principal = price * 0.9;
  const monthlyRate = 0.0749 / 12;
  const months = 72;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}

/** Pre-filled "text us" deep link (the ?& form keeps iOS and Android both happy). */
export function smsLink(vehicle?: Vehicle): string {
  const body = vehicle
    ? `Hi AM Ford — I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} listed at $${vehicle.price.toLocaleString()}. Is it still available?`
    : `Hi AM Ford — I have a question about your inventory.`;
  return `sms:${dealerInfo.phoneHref.replace("tel:", "")}?&body=${encodeURIComponent(body)}`;
}
