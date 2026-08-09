import { dealerInfo } from "@/lib/vehicles";

export const TERMS_OF_USE_URL = "https://www.amfordashtabula.com/terms-of-use/";

export const PRIVACY_POLICY_URL = "https://www.amfordashtabula.com/privacy-policy/";

/**
 * One wording for every consent disclosure. The four named exports below are kept because
 * separate forms import them by name; they share this text so the dealership location can
 * never drift between forms. The "Terms of use" link is rendered by each form next to the
 * text, so it is deliberately not part of the string.
 */
const CONTACT_CONSENT_DISCLOSURE =
  `By submitting, you agree that ${dealerInfo.name} in ${dealerInfo.city} may contact you. ` +
  "Message/data rates may apply.";

export const SMS_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;

export const SMS_MARKETING_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;

export const SMS_TRANSACTIONAL_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;

export const TERMS_CONSENT_DISCLOSURE = CONTACT_CONSENT_DISCLOSURE;
