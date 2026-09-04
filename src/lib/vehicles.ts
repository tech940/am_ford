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
  badges?: string[];
  features: string[];
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

export const vehicles: Vehicle[] = [
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
 * Conditions a URL is allowed to filter by, and the single source of truth for that list.
 *
 * Vehicle["condition"] also permits "Used", and its absence here is deliberate: the lot holds
 * zero used units and the brief forbids advertising used stock, so ?condition=Used is dropped
 * by the inventory validator rather than rendering an empty page a crawler could index. Add
 * "Used" here only alongside real used inventory, its own SEO label, and its own landing copy.
 *
 * This lives in the data module, not in the route, because BOTH the route (which gives each
 * of these facets a self-canonical and an indexable title) and scripts/generate-sitemap.ts
 * (which must list exactly the facets the route makes indexable) have to agree on it. They
 * previously kept separate lists and silently drifted: the route made ?condition=... indexable
 * while the sitemap omitted it.
 */
export const FILTERABLE_CONDITIONS = ["New", "Certified Pre-Owned"] as const;

export const FILTER_OPTIONS = {
  types: ["All", "Truck", "SUV", "Car", "EV"] as const,
  fuels: ["All", "Gas", "Hybrid", "Electric"] as const,
  drivetrains: ["All", "4WD", "AWD", "RWD", "FWD"] as const,
  transmissions: ["All", "Automatic", "Manual"] as const,
  years: ["All", 2025, 2024] as const,
  badges: [
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

export const getVehicle = (id: string) => vehicles.find((v) => v.id === id);

/** A price shortcut for the hero search card, ready to drop into /inventory search params. */
export type PriceBand = { label: string; priceMin: number; priceMax: number };

const BAND_STEP = 5000;
const BAND_COUNT = 4;

/** Deterministic thousands separator. Locale-dependent formatting would risk an SSR mismatch. */
const bandMoney = (n: number) => `$${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

/**
 * Price bands for the hero search card, derived from the live lot instead of guessed, so a
 * band can never advertise a slice of inventory that does not exist.
 *
 * The span is the real price range rounded outward to the nearest $5,000 (today $36,450 to
 * $71,990 becomes $35,000 to $75,000) and then cut into four equal bands. Adjacent bands
 * share an edge, which is the usual convention for a price picker: a vehicle priced exactly
 * on a boundary appears in both neighbours rather than falling through the gap between them.
 *
 * Every value stays inside the window /inventory accepts (its validator drops anything
 * outside $20,000 to $100,000), so these link straight into
 * /inventory?priceMin=...&priceMax=... without being silently discarded.
 */
export const PRICE_BANDS: PriceBand[] = (() => {
  const prices = vehicles.map((v) => v.price);
  const floor = Math.floor(Math.min(...prices) / BAND_STEP) * BAND_STEP;
  const ceiling = Math.ceil(Math.max(...prices) / BAND_STEP) * BAND_STEP;
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
 * The four vehicles the homepage shows: one per body style actually present, lowest odometer
 * first, fully deterministic.
 *
 * The point is CONSTANT HEIGHT. At today's six placeholder records this returns four; against
 * a real four-hundred-vehicle feed it also returns four, so the section and the total page
 * length do not move as inventory changes. The homepage previously rendered the same six
 * records in four different layouts across four consecutive sections.
 */
const HOMEPAGE_ORDER: Vehicle["type"][] = ["Truck", "SUV", "EV", "Car"];

export const homepageSelection = (all: Vehicle[] = vehicles): Vehicle[] =>
  HOMEPAGE_ORDER.map(
    (t) =>
      all
        .filter((v) => v.type === t)
        .sort((a, b) => a.miles - b.miles || a.price - b.price || a.id.localeCompare(b.id))[0],
  ).filter((v): v is Vehicle => Boolean(v));

/**
 * Single source of truth for dealership identity.
 * Address and positioning follow the AM Ford Website and SEO Master Content Brief:
 * the dealership is located in Jefferson, Ohio and SERVES Ashtabula County and beyond.
 * NOTE: phone number is not stated in the brief — verify with the dealership.
 */
export const dealerInfo = {
  name: "AM Ford",
  formerName: "Nassief Ford",
  city: "Jefferson, OH",
  street: "1059 State Route 46 North",
  locality: "Jefferson",
  region: "OH",
  postalCode: "44047",
  address: "1059 State Route 46 North, Jefferson, OH 44047",
  phone: "(440) 998-2151",
  phoneHref: "tel:+14409982151",
  hours: [
    { day: "Mon - Thu", time: "9:00 AM - 8:00 PM" },
    { day: "Friday", time: "9:00 AM - 6:00 PM" },
    { day: "Saturday", time: "9:00 AM - 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
};

/**
 * The one directions URL on the site. Two surfaces read it: TheStore's facts rule, which is
 * the page's only labelled directions control, and the footer address, which is the only
 * linked address. VisitUs used `maps/search/?api=1`, which is a search, not directions.
 */
export const MAPS_DIRECTIONS_HREF = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${dealerInfo.name}, ${dealerInfo.address}`,
)}`;

/**
 * Delivery is the dealership's strongest differentiator per the brief, which fixes the
 * approved wording. Never shorten DELIVERY_CLAIM to "free nationwide delivery".
 */
export const DELIVERY_CLAIM =
  "Free home delivery within 300 miles and vehicle shipping available to all 50 states.";
export const DELIVERY_SHORT = "Free home delivery within 300 miles";
export const DELIVERY_SHIPPING = "Vehicle shipping available to all 50 states";

/**
 * Legally load-bearing. Word for word, never paraphrased at a call site. Transcribed from the
 * deleted DeliveryHighlight, which is the wording the dealership approved.
 */
export const DELIVERY_DISCLAIMER =
  "Shipping charges may apply outside the complimentary 300-mile delivery area. Timing depends on your location, vehicle availability, documentation, and financing approval. Please confirm delivery terms with us before purchase.";

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

/**
 * Real Ford paint names to a swatch colour.
 *
 * Every record already carries an `exterior` like "Iconic Silver" or "Atlas Blue", and the site
 * has been rendering those as grey text on a page selling cars, where paint is one of the first
 * things a buyer filters on. A swatch is the most useful colour a listing can carry, it varies
 * per vehicle so a grid stops reading as one flat block, and it cannot be lifted onto another
 * business, because only a car dealer has Rapid Red and Agate Black.
 *
 * UNKNOWN NAMES RETURN undefined AND THE SWATCH DOES NOT RENDER. A feed that returns a paint we
 * have not mapped must show nothing: a wrong colour chip on a white truck is worse than no chip.
 */
const PAINT: Record<string, string> = {
  "agate black": "#14161a",
  "oxford white": "#f2f1ee",
  "iconic silver": "#9a9ea3",
  "atlas blue": "#1f4f8f",
  "rapid red": "#8e1f26",
  "carbonized grey": "#54585c",
  "antimatter blue": "#2c3a4a",
  "star white": "#eeecE6",
  "azure grey": "#6b7178",
  "stone blue": "#4a6274",
  "shadow black": "#17181a",
  magnetic: "#5b6064",
};

export function paintSwatch(exterior: string): string | undefined {
  return PAINT[exterior.trim().toLowerCase()];
}

/**
 * Vehicle-family accent colours, per the client's re-art-direction brief: "The accent should
 * come from the VEHICLE and its photography, not from random UI decoration."
 *
 * Applied in exactly two places — the accent strip on a vehicle card's photograph and the
 * VDP masthead rule — so the accent reads as the vehicle's own paint room, not as UI confetti.
 * Values are kept deep and automotive: these sit next to real photography and must not fight it.
 *
 * Unknown models return undefined and both call sites render the neutral rule instead.
 */
const MODEL_ACCENT: Record<string, string> = {
  mustang: "#1e63d0", // performance blue
  "mustang mach-e": "#2f9bff", // electric
  "f-150": "#c05f1d", // rugged orange
  "f-150 lightning": "#2f9bff", // electric
  bronco: "#4f6144", // earth green
  "bronco sport": "#4f6144",
  explorer: "#252c34", // dark premium
  escape: "#3d7ac0",
  ranger: "#c05f1d",
  maverick: "#c05f1d",
};

export function modelAccent(model: string): string | undefined {
  return MODEL_ACCENT[model.trim().toLowerCase()];
}
