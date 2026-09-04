import { dealerInfo } from "./vehicles";

/**
 * Lead submission over the PostgREST endpoint directly, with `fetch`.
 *
 * WHY NOT `@supabase/supabase-js`
 * The SDK was shipping `GoTrueClient` (auth) and `RealtimeClient` (websockets) into the client
 * bundle of a site that has no login and no realtime feature, in order to perform exactly one
 * operation: `INSERT` a row into `leads`. Installed, that dependency tree is auth-js 2.70 MB +
 * realtime-js 0.69 MB + storage-js 0.98 MB + supabase-js 0.64 MB, none of which this product
 * uses. PostgREST is a plain HTTP API and an insert is a POST.
 *
 * Behaviour is unchanged: same URL, same anon key, same table, same row shape, and the same
 * RLS policy applies. `Prefer: return=minimal` keeps an INSERT-only policy sufficient — the
 * leads table must never be readable with the public key.
 */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/** True when the build was given both env vars. Vite inlines these at BUILD time. */
export const leadStorageConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export type LeadInquiry = {
  id?: string;
  lead_type:
    | "test_drive"
    | "quote_request"
    | "financing_preapproval"
    | "special_order"
    | "general_contact";
  vehicle_id?: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
  financing_details?: Record<string, unknown>;
  created_at?: string;
  status?: "new" | "contacted" | "scheduled" | "closed";
};

/** Every failure path hands the customer a channel that actually works. */
const callInstead = `Please call or text us on ${dealerInfo.phone} and we will pick it up from there.`;

export async function submitLeadInquiry(
  lead: LeadInquiry,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  if (!leadStorageConfigured) {
    // Never pretend a lead was captured. This fires when a deploy was built without the two
    // env vars, which silently breaks every form on the site for the life of that bundle.
    console.error(
      "Lead NOT stored: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing at build time.",
    );
    return {
      success: false,
      message: `Our online form is temporarily unavailable. ${callInstead}`,
    };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        // No representation returned, so an INSERT-only policy is enough.
        Prefer: "return=minimal",
      },
      body: JSON.stringify([lead]),
    });

    if (!res.ok) {
      // PostgREST returns a JSON error body; log it, never surface it to the customer.
      const detail = await res.text().catch(() => "");
      console.error("Lead insert failed:", res.status, detail);
      return {
        success: false,
        message: `Unable to submit your enquiry right now. ${callInstead}`,
      };
    }

    return {
      success: true,
      message: "Your enquiry has been sent.",
    };
  } catch (err: unknown) {
    console.error("Unexpected error submitting lead:", err);
    return {
      success: false,
      message: `Something went wrong sending that. ${callInstead}`,
    };
  }
}
