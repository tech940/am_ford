import vehicleInventory from "@/data/vehicle_inventory.json";
import carMustang from "@/assets/car-mustang.jpg";
import carExplorer from "@/assets/car-explorer.jpg";
import carLightning from "@/assets/car-lightning.jpg";
import carBronco from "@/assets/car-bronco.jpg";
import carEscape from "@/assets/car-escape.jpg";
import heroTruck from "@/assets/hero-truck.jpg";

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  msrp?: number;
  miles: number;
  type: "Truck" | "SUV" | "Car" | "EV";
  fuel: "Gas" | "Hybrid" | "Electric";
  drivetrain: "4WD" | "AWD" | "RWD" | "FWD";
  transmission: "Automatic" | "Manual";
  exterior: string;
  interior: string;
  mpg: string;
  horsepower: number;
  image: string;
  images?: string[];
  badges?: string[];
  features: string[];
  inTransit?: boolean;
  /**
   * Required on every vehicle detail page per the SEO brief (§16 Inventory Pages).
   * Leave undefined until the real value is known: the UI shows "Contact us for the VIN"
   * rather than a placeholder. NEVER generate a VIN — a fabricated one is a legal risk.
   */
  vin?: string;
  stockNumber?: string;
  /** New / used / certified status — the brief requires this to be explicit. */
  condition: "New" | "Used" | "Certified Pre-Owned";
  /**
   * Free-text notes about this specific unit, written the way a salesperson would describe
   * it in person. The dealership can rewrite these at any time.
   *
   * Everything here must be derivable from the record above: trim, condition, odometer,
   * drivetrain, colours, and the `features` list. Do NOT write ownership history, accident
   * history, service history, inspection results, or warranty terms. None of that is in the
   * data, and the brief treats an unverifiable claim as unpublishable.
   */
  sellerNotes?: string;
};

export const fallbackVehicles: Vehicle[] = [
  {
    id: "f150-platinum-2025",
    sellerNotes:
      "Platinum sits at the top of the F-150 range, so this one already carries the equipment most buyers otherwise add a piece at a time. Heated and cooled front seats, a 360 degree camera that earns its keep in a tight yard or backing to a trailer, and BlueCruise for hands-free highway miles. Pro Power Onboard turns the bed into a generator on a job site or during an outage. Four-wheel drive, delivery miles only.",
    condition: "New",
    make: "Ford",
    model: "F-150",
    trim: "Platinum",
    year: 2025,
    price: 64995,
    msrp: 68420,
    miles: 12,
    type: "Truck",
    fuel: "Gas",
    drivetrain: "4WD",
    transmission: "Automatic",
    exterior: "Oxford White",
    interior: "Black Leather",
    mpg: "20 / 26",
    horsepower: 400,
    image: heroTruck,
    badges: ["New Arrival", "Best Seller"],
    features: [
      "360° Camera",
      "Heated & Cooled Seats",
      "Pro Power Onboard",
      "BlueCruise Hands-Free",
      "Twin-Panel Moonroof",
    ],
  },
  {
    id: "mustang-gt-2025",
    sellerNotes:
      "The GT Premium is the V8 car. Brembo brakes and MagneRide suspension are the parts that matter once the road stops being straight, and the Recaro seats hold you in place while they work. Active exhaust keeps it civil leaving the neighborhood. It is rear-wheel drive, so if this is a year-round car here, budget for a proper winter tire set and it will surprise you.",
    condition: "New",
    make: "Ford",
    model: "Mustang",
    trim: "GT Premium",
    year: 2025,
    price: 49880,
    msrp: 52100,
    miles: 8,
    type: "Car",
    fuel: "Gas",
    drivetrain: "RWD",
    transmission: "Automatic",
    exterior: "Atlas Blue",
    interior: "Black Leather",
    mpg: "15 / 24",
    horsepower: 480,
    image: carMustang,
    badges: ["Performance"],
    features: [
      "5.0L V8",
      "Brembo Brakes",
      "MagneRide Suspension",
      "Recaro Seats",
      "Active Exhaust",
    ],
  },
  {
    id: "explorer-st-2025",
    sellerNotes:
      "ST is the performance version of the Explorer, built around the 3.0L EcoBoost V6 with all-wheel drive underneath. The useful part is that nothing practical was given up for it: three rows are still here, and so is the tow package. Adaptive cruise and the B&O system make the long drives easier. Agate Black over Ebony leather.",
    condition: "New",
    make: "Ford",
    model: "Explorer",
    trim: "ST",
    year: 2025,
    price: 56750,
    miles: 15,
    type: "SUV",
    fuel: "Gas",
    drivetrain: "AWD",
    transmission: "Automatic",
    exterior: "Agate Black",
    interior: "Ebony Leather",
    mpg: "18 / 24",
    horsepower: 400,
    image: carExplorer,
    badges: ["3-Row"],
    features: [
      "3.0L EcoBoost V6",
      "Twin-Panel Moonroof",
      "B&O Sound",
      "Tow Package",
      "Adaptive Cruise",
    ],
  },
  {
    id: "f150-lightning-2025",
    sellerNotes:
      "The electric F-150, in Lariat trim with the extended range battery. Pro Power Onboard runs at 9.6kW on this one, which is enough for tools on site or key circuits at home when the power goes out. The frunk is a genuinely usable lockable, drainable box rather than a novelty. Worth a conversation about charging before you commit, and we are happy to walk through what your driveway would need.",
    condition: "New",
    make: "Ford",
    model: "F-150 Lightning",
    trim: "Lariat",
    year: 2025,
    price: 71990,
    miles: 6,
    type: "EV",
    fuel: "Electric",
    drivetrain: "4WD",
    transmission: "Automatic",
    exterior: "Iconic Silver",
    interior: "Black Leather",
    mpg: "320 mi range",
    horsepower: 580,
    image: carLightning,
    badges: ["Electric", "New"],
    features: [
      "Extended Range Battery",
      "Mega Power Frunk",
      "Pro Power Onboard 9.6kW",
      "BlueCruise",
      '15.5" Touchscreen',
    ],
  },
  {
    id: "bronco-outer-banks-2025",
    sellerNotes:
      "Outer Banks pairs the Bronco off-road hardware with the more finished interior, so it works as a daily vehicle rather than only a weekend one. The roof and doors come off, G.O.A.T. modes and Trail Control handle the rough stuff, and the locking differential is there for when traction genuinely runs out. Heated seats for February.",
    condition: "New",
    make: "Ford",
    model: "Bronco",
    trim: "Outer Banks",
    year: 2025,
    price: 47995,
    miles: 22,
    type: "SUV",
    fuel: "Gas",
    drivetrain: "4WD",
    transmission: "Automatic",
    exterior: "Oxford White",
    interior: "Navy Pier Leather",
    mpg: "20 / 22",
    horsepower: 330,
    image: carBronco,
    badges: ["Off-Road"],
    features: [
      "Removable Roof & Doors",
      "G.O.A.T. Modes",
      "Trail Control",
      "Lockable Diff",
      "Heated Seats",
    ],
  },
  {
    id: "escape-titanium-2024",
    sellerNotes:
      "Our certified pre-owned Escape, in Titanium trim with the hybrid powertrain and all-wheel drive. At 8,420 miles it has barely started. The hybrid suits stop-and-go driving and the short winter trips where a cold engine never fully warms up. Panoramic roof, B&O audio, adaptive cruise, and wireless charging are all fitted. Ask us for the certified pre-owned paperwork and the vehicle history report.",
    condition: "Certified Pre-Owned",
    make: "Ford",
    model: "Escape",
    trim: "Titanium Hybrid",
    year: 2024,
    price: 36450,
    msrp: 38990,
    miles: 8420,
    type: "SUV",
    fuel: "Hybrid",
    drivetrain: "AWD",
    transmission: "Automatic",
    exterior: "Rapid Red",
    interior: "Sandstone Leather",
    mpg: "42 / 36",
    horsepower: 200,
    image: carEscape,
    badges: ["Certified Pre-Owned", "Hybrid"],
    features: [
      "Hybrid Powertrain",
      "Panoramic Roof",
      "B&O Sound",
      "Adaptive Cruise",
      "Wireless Charging",
    ],
  },
];

/**
 * Determines whether a vehicle is currently in transit to the dealership lot.
 */
export function isInTransit(v: Partial<Vehicle>): boolean {
  if (v.inTransit === true) return true;
  if (v.badges && v.badges.includes("In Transit")) return true;
  if (v.sellerNotes && /\b(in transit|in-transit|factory order|scheduled for delivery|on order)\b/i.test(v.sellerNotes)) {
    return true;
  }
  if (v.year && v.year >= 2026 && v.miles != null && v.miles <= 5 && v.condition === "New") {
    return true;
  }
  return false;
}

/**
 * Automatically derives relevant badges based on vehicle attributes, trim, powertrain, and equipment.
 */
export function deriveVehicleBadges(v: Partial<Vehicle>): string[] {
  const badges = new Set<string>(v.badges || []);

  if (isInTransit(v)) {
    badges.add("In Transit");
  }
  if (v.year && v.year >= 2026 && v.condition === "New") {
    badges.add("New Arrival");
  }
  if (
    v.model &&
    ["F-150", "Explorer", "Bronco Sport", "Escape", "Mustang", "Ranger"].some(
      (m) => v.model === m || v.model?.startsWith(m),
    )
  ) {
    badges.add("Best Seller");
  }
  if (
    (v.trim && /ST|GT|Raptor|Shelby|Tremor/i.test(v.trim)) ||
    (v.horsepower && v.horsepower >= 400)
  ) {
    badges.add("Performance");
  }
  if (
    (v.model && /Explorer|Expedition|Yukon|Highlander|Enclave|Sorento|Pacifica/i.test(v.model)) ||
    (v.features && v.features.some((f) => /3rd Row|Third Row|7 Passenger|8 Passenger/i.test(f)))
  ) {
    badges.add("3-Row");
  }
  if (v.fuel === "Electric" || v.type === "EV" || (v.model && /Lightning|Mach-E/i.test(v.model))) {
    badges.add("Electric");
  }
  if (
    (v.trim && /Tremor|Badlands|Trailhawk|Raptor|Power Wagon|AT4|Timberline/i.test(v.trim)) ||
    (v.model && /Bronco/i.test(v.model) && !/Sport/i.test(v.model)) ||
    (v.features && v.features.some((f) => /FX4|Off-Road|Skid Plate/i.test(f)))
  ) {
    badges.add("Off-Road");
  }
  if (v.condition === "Certified Pre-Owned") {
    badges.add("Certified Pre-Owned");
  }
  if (v.fuel === "Hybrid") {
    badges.add("Hybrid");
  }

  return Array.from(badges);
}

/**
 * The full active vehicle inventory. Prioritizes the real 233-vehicle inventory extracted
 * from Supabase `vehicle_inventory`, with instant local fallback and dynamic badge enrichment.
 */
export const vehicles: Vehicle[] = (
  vehicleInventory && Array.isArray(vehicleInventory) && vehicleInventory.length > 0
    ? (vehicleInventory as unknown as Vehicle[]).filter((v) => (v.make || "").toLowerCase() === "ford")
    : fallbackVehicles
).map((v) => {
  const imagesList = (
    Array.isArray(v.images) && v.images.length > 0
      ? v.images
      : typeof v.image === "string"
        ? v.image.split(",")
        : []
  )
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => s.startsWith("http") || s.startsWith("/"));

  const primaryImage =
    typeof v.image === "string" && v.image.includes(",")
      ? v.image.split(",")[0].trim()
      : v.image || imagesList[0] || "";

  return {
    ...v,
    image: primaryImage,
    images: imagesList.length > 0 ? imagesList : primaryImage ? [primaryImage] : [],
    inTransit: isInTransit(v),
    badges: deriveVehicleBadges(v),
  };
});

/**
 * Conditions a URL is allowed to filter by, and the single source of truth for that list.
 * Includes "New", "Used", and "Certified Pre-Owned" matching real inventory.
 */
export const FILTERABLE_CONDITIONS = ["New", "Used", "Certified Pre-Owned"] as const;

export const FILTER_OPTIONS = {
  types: ["All", "Truck", "SUV", "Car", "EV"] as const,
  fuels: ["All", "Gas", "Hybrid", "Electric"] as const,
  drivetrains: ["All", "4WD", "AWD", "RWD", "FWD"] as const,
  transmissions: ["All", "Automatic", "Manual"] as const,
  years: ["All", 2026, 2025, 2024, 2023, 2022, 2021, 2020] as const,
  badges: [
    "In Transit",
    "New Arrival",
    "Best Seller",
    "Performance",
    "3-Row",
    "Electric",
    "Off-Road",
    "Certified Pre-Owned",
    "Hybrid",
  ] as const,
};

/**
 * Generates an SEO-friendly, unique vehicle slug combining Year, Make, Model, Trim, and VIN/ID.
 * Example: "2026-ford-explorer-tremor-1fmuk8jh5tgb44780"
 */
export function vehicleSlug(v: { year: number; make: string; model: string; trim: string; vin?: string; stockNumber?: string; id: string }): string {
  const parts = [
    v.year,
    v.make,
    v.model,
    v.trim,
    v.vin || v.stockNumber || v.id,
  ];
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const getVehicle = (id: string): Vehicle | undefined => {
  if (!id) return undefined;
  const lower = id.toLowerCase().trim();
  // 1. Direct match on real inventory by ID, VIN, Stock Number, or generated slug
  const found = vehicles.find(
    (v) =>
      v.id.toLowerCase() === lower ||
      (v.vin && v.vin.toLowerCase() === lower) ||
      (v.stockNumber && v.stockNumber.toLowerCase() === lower) ||
      vehicleSlug(v).toLowerCase() === lower ||
      (v.vin && lower.endsWith(v.vin.toLowerCase())) ||
      lower.endsWith(v.id.toLowerCase()),
  );
  if (found) return found;

  // 2. Match on legacy mock vehicles (preserves old links & model page previews)
  return fallbackVehicles.find(
    (v) =>
      v.id.toLowerCase() === lower ||
      (v.vin && v.vin.toLowerCase() === lower) ||
      vehicleSlug(v).toLowerCase() === lower ||
      (v.vin && lower.endsWith(v.vin.toLowerCase())) ||
      lower.endsWith(v.id.toLowerCase()),
  );
};

/** A price shortcut for the hero search card, ready to drop into /inventory search params. */
export type PriceBand = { label: string; priceMin: number; priceMax: number };

const BAND_STEP = 5000;
const BAND_COUNT = 4;

/** Deterministic thousands separator. Locale-dependent formatting would risk an SSR mismatch. */
const bandMoney = (n: number) => `$${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

/**
 * Price bands for the hero search card, derived from the live lot instead of guessed, so a
 * band can never advertise a slice of inventory that does not exist.
 */
export const PRICE_BANDS: PriceBand[] = (() => {
  const prices = vehicles.map((v) => v.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 20000;
  const maxPrice = prices.length ? Math.max(...prices) : 100000;
  const floor = Math.floor(minPrice / BAND_STEP) * BAND_STEP;
  const ceiling = Math.ceil(maxPrice / BAND_STEP) * BAND_STEP;
  // Math.max keeps the bands from collapsing to zero width if the lot ever holds a single price.
  const width = Math.max(
    BAND_STEP,
    Math.ceil((ceiling - floor) / BAND_COUNT / BAND_STEP) * BAND_STEP,
  );
  return Array.from({ length: BAND_COUNT }, (_, i) => {
    const priceMin = floor + i * width;
    const priceMax = i === BAND_COUNT - 1 ? Math.max(ceiling, priceMin + width) : priceMin + width;
    return { label: `${bandMoney(priceMin)} to ${bandMoney(priceMax)}`, priceMin, priceMax };
  });
})();

/**
 * Single source of truth for dealership identity.
 * Address and positioning follow the AM Ford Website and SEO Master Content Brief:
 * the dealership is located in Jefferson, Ohio and SERVES Ashtabula County and beyond.
 * NOTE: phone number is not stated in the brief — verify with the dealership.
 */
export const dealerInfo = {
  name: "AM Ford",
  legalName: "AM Ford Inc.",
  formerName: "Nassief Ford",
  city: "Jefferson, OH",
  county: "Ashtabula County",
  street: "1059 State Route 46 North",
  locality: "Jefferson",
  region: "OH",
  postalCode: "44047",
  address: "1059 State Route 46 North, Jefferson, OH 44047",
  fullAddress: "1059 State Route 46 North - Jefferson, OH 44047",
  phone: "(440) 553-7072",
  phoneHref: "tel:+14405537072",
  phones: {
    sales: "(440) 553-7072",
    salesHref: "tel:+14405537072",
    service: "(440) 553-7074",
    serviceHref: "tel:+14405537074",
    parts: "(440) 553-7075",
    partsHref: "tel:+14405537075",
  },
  hours: [
    { day: "Mon – Thu", time: "9:00 AM – 8:00 PM" },
    { day: "Friday", time: "9:00 AM – 6:00 PM" },
    { day: "Saturday", time: "9:00 AM – 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
};

/**
 * Delivery is the dealership's strongest differentiator per the brief, which fixes the
 * approved wording. Never shorten DELIVERY_CLAIM to "free nationwide delivery".
 */
export const DELIVERY_CLAIM =
  "Free home delivery within 300 miles and vehicle shipping available to all 50 states.";
export const DELIVERY_SHORT = "Free home delivery within 300 miles";
export const DELIVERY_SHIPPING = "Vehicle shipping available to all 50 states";

/** Markets served (Tier 1 immediate market first) — for copy and Areas We Serve. */
export const SERVED_MARKETS = {
  tier1: [
    "Jefferson",
    "Ashtabula",
    "Austinburg",
    "Geneva",
    "Geneva-on-the-Lake",
    "Conneaut",
    "Kingsville",
    "North Kingsville",
    "Saybrook",
    "Rock Creek",
    "Orwell",
    "Andover",
    "Pierpont",
  ],
  tier2: [
    "Madison",
    "Perry",
    "Painesville",
    "Mentor",
    "Chardon",
    "Burton",
    "Middlefield",
    "Chesterland",
    "Warren",
    "Cortland",
    "Youngstown",
  ],
  tier3: ["Cleveland", "Erie, PA", "Northwestern Pennsylvania", "Akron", "Canton"],
};
