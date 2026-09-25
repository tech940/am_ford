import { dealerInfo } from "@/lib/vehicles";

// Our own pages. These previously pointed at /terms-of-use/ and /privacy-policy/ on the
// legacy site, which is behind bot protection today and will 404 after cutover, leaving the
// consent disclosure linking to nothing.
export const TERMS_OF_USE_URL = "/terms";

export const PRIVACY_POLICY_URL = "/privacy";

/**
 * One wording for every consent disclosure. The four named exports below are kept because
 * separate forms import them by name; they share this text so the dealership location can
 * never drift between forms. The "Terms of use" link is rendered by each form next to the
 * text, so it is deliberately not part of the string.
 */
const CONTACT_CONSENT_DISCLOSURE =
  `I agree that ${dealerInfo.name} in ${dealerInfo.city} may call or text me at the number I ` +
  "provided about my inquiry. Consent is not a condition of purchase. Message and data rates " +
  "may apply. Reply STOP to opt out.";

export const SMS_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;

export const SMS_MARKETING_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;

export const SMS_TRANSACTIONAL_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;

export const TERMS_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;
