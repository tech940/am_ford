import { createClient } from "@supabase/supabase-js";
import { vehicles, type Vehicle } from "./vehicles";

// Supabase environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Supabase Client instance (null if env vars are missing)
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Lead capture inquiry type
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

/**
 * Fetch all vehicles from Supabase database table `vehicles`.
 * Fallback to local vehicle dataset if Supabase is not configured or query fails.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  if (!supabase) {
    return vehicles;
  }

  try {
    const { data, error } = await supabase.from("vehicles").select("*").eq("status", "available");

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch error or empty table. Using local fallback vehicles.", error);
      return vehicles;
    }

    return data as Vehicle[];
  } catch (err) {
    console.error("Failed to fetch vehicles from Supabase:", err);
    return vehicles;
  }
}

/**
 * Submit lead inquiry (Test Drive, Quote, Financing, Special Order) to Supabase table `leads`.
 */
export async function submitLeadInquiry(
  lead: LeadInquiry,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  if (!supabase) {
    // No storage configured: never pretend the lead was captured — hand the
    // customer a channel that actually works instead.
    console.error(
      "Lead NOT stored: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing at build time.",
    );
    return {
      success: false,
      message:
        "Our online form is temporarily unavailable. Please call or text us at (440) 998-2151 — we answer fast.",
    };
  }

  try {
    // Plain insert (no .select()) so an INSERT-only RLS policy for the anon role
    // is sufficient — the leads table must never be readable with the public key.
    const { error } = await supabase.from("leads").insert([lead]);

    if (error) {
      console.error("Supabase lead insert error:", error);
      return {
        success: false,
        message: "Unable to submit inquiry right now. Please call (440) 998-2151.",
      };
    }

    return {
      success: true,
      message: "Your inquiry has been submitted! We will reach out promptly.",
    };
  } catch (err: unknown) {
    console.error("Unexpected error submitting lead:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please call sales at (440) 998-2151.",
    };
  }
}
