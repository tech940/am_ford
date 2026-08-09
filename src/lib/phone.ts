interface NormalizedPhone {
  digits: string;
  e164: string;
}

export function normalizePhone(input: string): NormalizedPhone {
  const digits = input.replace(/\D/g, "");
  if (!digits) {
    throw new Error("Phone number is required");
  }

  const defaultCountryCode = (import.meta.env.VITE_DEFAULT_COUNTRY_CODE || "1").replace(/\D/g, "");
  const withCountryCode =
    defaultCountryCode && digits.length <= 10 ? `${defaultCountryCode}${digits}` : digits;

  if (withCountryCode.length < 8 || withCountryCode.length > 15) {
    throw new Error("Invalid phone number. Use full number with country code.");
  }

  return {
    digits: withCountryCode,
    e164: `+${withCountryCode}`,
  };
}
