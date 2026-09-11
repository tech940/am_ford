import { createClient } from "@supabase/supabase-js";
import { vehicles, type Vehicle } from "./vehicles";

// Supabase environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
// Prefer anon key, fallback to service role key if anon permissions are not granted in Supabase RLS
const supabaseKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Supabase Client instance (null if env vars are missing)
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Lead capture inquiry type
export type LeadInquiry = {
  id?: string;
  lead_type:
    | "test_drive"
    | "quote_request"
    | "financing_preapproval"
    | "special_order"
    | "general_contact"
    | "newsletter_signup";
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

export interface InventoryRawRow {
  id: number | string;
  dealer_id?: string;
  vin?: string;
  stock_number?: string;
  data?: Record<string, any>;
  [key: string]: any;
}

export function mapInventoryRowToVehicle(r: InventoryRawRow): Vehicle {
  const d = r.data || {};
  const isElectric =
    (d["Fuel Type"] || "").toLowerCase().includes("electric") ||
    (d.Model || "").includes("Mach-E") ||
    (d.Model || "").includes("Lightning");
  const isHybrid = (d["Fuel Type"] || "").toLowerCase().includes("hybrid");

  let type: Vehicle["type"] = "SUV";
  const model = d.Model || "";
  const body = (d.Body || "").toLowerCase();
  if (
    model.includes("F-150") ||
    model.includes("Super Duty") ||
    model.includes("Ranger") ||
    model.includes("Maverick") ||
    model.includes("F-250") ||
    model.includes("F-350") ||
    model.includes("F-650") ||
    model.includes("Sierra") ||
    model.includes("Silverado") ||
    model.includes("Titan") ||
    model.includes("Tacoma") ||
    body.includes("truck") ||
    body.includes("pickup")
  ) {
    type = "Truck";
  } else if (
    (model.includes("Mustang") && !model.includes("Mach-E")) ||
    body.includes("sedan") ||
    body.includes("coupe") ||
    model.includes("Camry") ||
    model.includes("Sonata") ||
    model.includes("Cruze") ||
    model.includes("K5") ||
    model.includes("200")
  ) {
    type = "Car";
  } else if (isElectric) {
    type = "EV";
  }

  const condition: Vehicle["condition"] =
    d.Certified === "Yes" || d.Certification
      ? "Certified Pre-Owned"
      : d["New/Used"] === "N"
        ? "New"
        : "Used";
  const photos = Array.isArray(d["Photo Url List"])
    ? d["Photo Url List"].filter((p: unknown): p is string => typeof p === "string" && !!p)
    : [];

  return {
    id: r.vin || d.VIN || String(r.id),
    make: d.Make || "Ford",
    model: d.Model || "Vehicle",
    trim: d.Series || d["Series Detail"] || "",
    year: parseInt(d.Year, 10) || 2026,
    price: parseFloat(d.Price || d["Dealer Discounted"] || d.MSRP) || 0,
    msrp: parseFloat(d.MSRP) || undefined,
    miles: parseInt(d.Odometer, 10) || 0,
    type,
    fuel: isElectric ? "Electric" : isHybrid ? "Hybrid" : "Gas",
    drivetrain: (d["Drivetrain Desc"] || "").includes("4WD")
      ? "4WD"
      : (d["Drivetrain Desc"] || "").includes("AWD")
        ? "AWD"
        : (d["Drivetrain Desc"] || "").includes("FWD")
          ? "FWD"
          : "RWD",
    transmission: (d.Transmission || "").includes("Manual") ? "Manual" : "Automatic",
    exterior: d["Manufacturer Color"] || d.Colour || "Agate Black Metallic",
    interior: d["Interior Color"] || "Black",
    mpg: d["City MPG"] && d["Highway MPG"] ? `${d["City MPG"]} / ${d["Highway MPG"]}` : "20 / 26",
    horsepower: type === "Truck" ? 400 : 300,
    image:
      photos[0] ||
      "https://assets.cai-media-management.com/resize/1024x1024/common-vehicle-media/303504c6-8b4d-463b-9327-a47a0c975418.jpg",
    images: photos,
    features: Array.isArray(d.Features) ? d.Features : [],
    vin: r.vin || d.VIN,
    stockNumber: r.stock_number || d["Stock #"],
    condition,
    sellerNotes: (d.Description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
  };
}

/**
 * Fetch all vehicles from Supabase database table `vehicle_inventory`.
 * Fallback to local vehicle dataset if Supabase is not configured or query fails.
 */
export async function fetchVehicles(): Promise<Vehicle[]> {
  if (!supabase) {
    return vehicles;
  }

  try {
    const { data, error } = await supabase
      .from("vehicle_inventory")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch error or empty table. Using local fallback vehicles.", error);
      return vehicles;
    }

    return data
      .map(mapInventoryRowToVehicle)
      .filter((v) => (v.make || "").toLowerCase() === "ford");
  } catch (err) {
    console.error("Failed to fetch vehicles from Supabase:", err);
    return vehicles;
  }
}

/**
 * Fetch single vehicle by VIN or ID from Supabase database table `vehicle_inventory`.
 */
export async function fetchVehicleById(idOrVin: string): Promise<Vehicle | null> {
  if (!supabase) {
    return vehicles.find((v) => v.id === idOrVin || v.vin === idOrVin) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from("vehicle_inventory")
      .select("*")
      .or(`vin.eq.${idOrVin},stock_number.eq.${idOrVin}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return vehicles.find((v) => v.id === idOrVin || v.vin === idOrVin) ?? null;
    }

    return mapInventoryRowToVehicle(data[0]);
  } catch (err) {
    console.error("Failed to fetch vehicle by ID from Supabase:", err);
    return vehicles.find((v) => v.id === idOrVin || v.vin === idOrVin) ?? null;
  }
}

const LEAD_TYPE_LABELS: Record<LeadInquiry["lead_type"], string> = {
  test_drive: "Test Drive",
  quote_request: "Quote Request",
  financing_preapproval: "Financing Pre-Approval",
  special_order: "Special Order",
  general_contact: "General Contact",
  newsletter_signup: "Stay Updated (VIP Offers)",
};

/**
 * Submit lead inquiry (Test Drive, Quote, Financing, Special Order) to Supabase table `leads`.
 */
export async function submitLeadInquiry(
  lead: LeadInquiry,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  if (!supabase) {
    console.error(
      "Lead NOT stored: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing at build time.",
    );
    return {
      success: false,
      message:
        "Our online form is temporarily unavailable. Please call or text us at (440) 553-7072 — we answer fast.",
    };
  }

  try {
    // Find associated vehicle for listing title if vehicle_id is provided
    const vehicle = lead.vehicle_id ? vehicles.find((v) => v.id === lead.vehicle_id) : undefined;
    const listingTitle = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.trim()
      : undefined;

    // Compose rich contextual message incorporating all inquiry fields
    const messageParts: string[] = [];
    if (lead.vehicle_id) {
      messageParts.push(`Vehicle: ${listingTitle || lead.vehicle_id} (ID: ${lead.vehicle_id})`);
    }
    if (lead.preferred_date || lead.preferred_time) {
      const schedule = [lead.preferred_date, lead.preferred_time].filter(Boolean).join(" at ");
      messageParts.push(`Preferred Schedule: ${schedule}`);
    }
    if (lead.message) {
      messageParts.push(lead.message);
    }
    if (lead.financing_details && Object.keys(lead.financing_details).length > 0) {
      messageParts.push(`Financing Details: ${JSON.stringify(lead.financing_details)}`);
    }

    // Map to actual Supabase `leads` table schema columns
    const payload = {
      customer_name: lead.full_name?.trim() || "Valued Customer",
      customer_phone: lead.phone?.trim() || "Not provided",
      customer_email: lead.email?.trim() || null,
      inquiry_type: LEAD_TYPE_LABELS[lead.lead_type] || lead.lead_type || "General Contact",
      message: messageParts.join(" | ") || null,
      listing_title: listingTitle || null,
      status: "New",
      consent: true,
    };

    const { error } = await supabase.from("leads").insert([payload]);

    if (error) {
      console.error("Supabase lead insert error:", error);
      return {
        success: false,
        message: "Unable to submit inquiry right now. Please call (440) 553-7072.",
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
      message: "An unexpected error occurred. Please call sales at (440) 553-7072.",
    };
  }
}

export type DbLead = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  inquiry_type: string | null;
  message: string | null;
  listing_title: string | null;
  status: string;
  created_at: string;
  consent: boolean;
};

/**
 * Fetch all leads from Supabase for Admin Dashboard
 */
export async function fetchAllLeads(): Promise<DbLead[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch leads:", error);
      return [];
    }
    return (data || []) as DbLead[];
  } catch (err) {
    console.error("Error fetching leads:", err);
    return [];
  }
}

/**
 * Update lead status in Supabase (e.g. New, Contacted, Scheduled, Closed)
 */
export async function updateLeadStatus(id: string, status: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Failed to update lead status:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error updating lead status:", err);
    return false;
  }
}

/**
 * Delete lead in Supabase
 */
export async function deleteLead(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete lead:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error deleting lead:", err);
    return false;
  }
}
