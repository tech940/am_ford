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
};

export const vehicles: Vehicle[] = [
  {
    id: "f150-platinum-2025",
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
