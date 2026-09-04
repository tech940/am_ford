import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ChevronRight,
  Filter,
  Tag,
  ShieldCheck,
  Award,
  Car,
  MapPin,
  HelpCircle,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { GARAGE_EVENT, getSavedVehicles } from "@/lib/garage";
import { breadcrumbSchema, crumbs, type Crumb } from "@/lib/breadcrumbs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DeliveryBanner } from "@/components/site/DeliveryBanner";
import { InventoryInterlinks } from "@/components/site/InventoryInterlinks";
import { FrequentSearches } from "@/components/site/FrequentSearches";
import { SiteShell } from "@/components/site/SiteShell";
import { LeadCaptureModal } from "@/components/site/LeadCaptureModal";
import { VehicleCard } from "@/components/site/VehicleCard";
import {
  vehicles,
  FILTER_OPTIONS,
  FILTERABLE_CONDITIONS,
  dealerInfo,
  DELIVERY_CLAIM,
  type Vehicle,
} from "@/lib/vehicles";
import { SectionTag } from "@/components/site/Home";
import OfferPopup from "@/components/popups/OfferPopup";
import { TradeValuatorModal } from "@/components/convert/TradeValuatorModal";
import OTPPopup from "@/components/popups/OTPPopup";
import { cn } from "@/lib/utils";

/**
 * Single source for the FAQ, consumed by BOTH the FAQPage JSON-LD in head() and the
 * visible accordion below. Google only honours FAQ structured data when the same text is
 * visible on the page, so these must never be maintained as two separate copies.
 *
 * Wording follows the client brief: no exclamation marks, no em dashes, and no claims the
 * inventory does not support. Stock is currently 5 New plus 1 Certified Pre-Owned, so
 * nothing here may describe the lot as a used-car inventory.
 */
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: `What kind of Ford inventory does AM Ford stock in ${dealerInfo.city}?`,
    a: `AM Ford stocks new Ford trucks, SUVs, cars, and EVs alongside certified pre-owned Ford models at ${dealerInfo.address}. We serve Ashtabula County, Saybrook, Geneva, Mentor, and Erie, PA.`,
  },
  {
    q: "What is the difference between a used Ford and a Certified Pre-Owned (CPO) Ford?",
    a: "A Certified Pre-Owned Ford passes a Ford-authorized multi-point inspection and comes with manufacturer-backed limited warranty coverage, roadside assistance, and a CARFAX vehicle history report. A standard used vehicle carries no factory certification.",
  },
  {
    q: "Can I apply for financing at AM Ford with less than perfect credit?",
    a: "Yes. AM Ford works with Ohio credit unions and national lenders to find auto loan options across a wide range of credit profiles, including first-time buyers. Apply online and our finance team will follow up with your terms.",
  },
  {
    q: `Can I trade in my current vehicle at AM Ford in ${dealerInfo.locality}?`,
    a: "Yes. AM Ford appraises trade-ins of any make or model using current market data, and your trade equity can be applied directly to any vehicle in our inventory.",
  },
  {
    q: "Does AM Ford offer nationwide or home vehicle delivery?",
    a: "Yes. AM Ford offers nationwide vehicle delivery and home delivery across Northeast Ohio and Ashtabula County. We handle documentation remotely and coordinate shipping directly to your driveway or workplace.",
  },
  {
    q: "What warranties come with new Ford vehicles at AM Ford?",
    a: "Every new Ford includes Ford's factory 3-year/36,000-mile Bumper-to-Bumper Limited Warranty and a 5-year/60,000-mile Powertrain Limited Warranty, along with 24/7 Ford Roadside Assistance.",
  },
  {
    q: "Can I order a custom Ford vehicle directly from the factory?",
    a: "Yes. If the exact trim, color, or package you want is not on our lot, AM Ford can place a factory custom order directly with Ford Motor Company or source it through our regional dealer network.",
  },
  {
    q: "How does test drive booking work at AM Ford?",
    a: "You can schedule a test drive online or by calling (440) 998-2151. We will have the vehicle prepped, cleaned, and waiting out front for your arrival.",
  },
  {
    q: "Are there any hidden dealer documentation or add-on fees at AM Ford?",
    a: "No. AM Ford practices straightforward, transparent pricing. The price quoted is the price you pay plus state tax and title fees; we do not add unexpected dealer prep or doc fees at signing.",
  },
  {
    q: "What maintenance services does the AM Ford Service Center handle?",
    a: "Our certified Ford Service Center handles oil changes, tire rotations, brake service, battery replacement, transmission service, and major recall work using genuine OEM Ford and Motorcraft parts.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const SORT_OPTIONS = [
  { code: "featured", label: "Featured" },
  { code: "price_asc", label: "Price: Low to High" },
  { code: "price_desc", label: "Price: High to Low" },
  { code: "year_desc", label: "Year: Newest" },
  { code: "miles_asc", label: "Mileage: Lowest" },
] as const;
type SortCode = (typeof SORT_OPTIONS)[number]["code"];


const PRICE_FLOOR = 20000;
const PRICE_CAP = 100000;
const MILES_FLOOR = 0;
const MILES_CAP = 50000;
/**
 * Vehicles per page. At 9, today's 6-vehicle lot is a single page, so the pager below does
 * not render at all, which is deliberate rather than a bug. Everything downstream (the "Showing"
 * counter, the pager, and the ItemList slice in head()) reads this constant and derives
 * totalPages from it, so nothing has to be touched when the lot outgrows one page.
 */
const PAGE_SIZE = 9;
const COMPARE_MAX = 3;

/**
 * Multi-value params travel as comma-separated slugs, not JSON arrays, so URLs stay
 * clean and shareable: `?badges=off-road,hybrid` rather than `?badges=%5B%22Off-Road%22%5D`.
 */
export const badgeToSlug = (badge: string) => badge.toLowerCase().replace(/\s+/g, "-");
export const slugToBadge = (slug: string): string | undefined =>
  (FILTER_OPTIONS.badges as readonly string[]).find((b) => badgeToSlug(b) === slug.toLowerCase());

/** Parse a comma list from the URL into validated values; empty means "not filtered". */
function parseList(value: unknown, resolve: (item: string) => string | undefined): string[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  const seen = new Set<string>();
  for (const raw of value.split(",")) {
    const resolved = resolve(raw.trim());
    if (resolved !== undefined) seen.add(resolved);
  }
  return [...seen];
}

/**
 * Conditions a URL is allowed to filter by. Defined in @/lib/vehicles and re-exported here so
 * the sitemap generator and this route cannot drift apart; see the note on the declaration.
 */
export { FILTERABLE_CONDITIONS };
type FilterableCondition = (typeof FILTERABLE_CONDITIONS)[number];
const isFilterableCondition = (c: Vehicle["condition"] | undefined): c is FilterableCondition =>
  c !== undefined && (FILTERABLE_CONDITIONS as readonly string[]).includes(c);

/** Filter state as it lives in the URL. Every field is optional — absent means "not filtered". */
export type InventorySearch = {
  q?: string;
  type?: Vehicle["type"];
  fuel?: Vehicle["fuel"];
  /** Validated against FILTERABLE_CONDITIONS, which is narrower than Vehicle["condition"]. */
  condition?: Vehicle["condition"];
  drive?: Vehicle["drivetrain"];
  trans?: Vehicle["transmission"];
  year?: number;
  priceMin?: number;
  priceMax?: number;
  milesMin?: number;
  milesMax?: number;
  /** Comma-separated badge slugs, e.g. "off-road,certified-pre-owned". */
  badges?: string;
  sort?: Exclude<SortCode, "featured">;
  page?: number;
  /** Comma-separated vehicle ids. */
  compare?: string;
};

/** Accepts only known values; anything malformed in the URL is silently dropped. */
function validateInventorySearch(search: Record<string, unknown>): InventorySearch {
  const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
    allowed.includes(v as T) ? (v as T) : undefined;
  const numIn = (v: unknown, min: number, max: number): number | undefined => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
  };
  // Accept the comma form, and stay tolerant of a legacy JSON array so old links
  // and bookmarks keep working; both normalize to the canonical slug list.
  const rawBadges = Array.isArray(search.badges)
    ? (search.badges as unknown[]).map(String).join(",")
    : search.badges;
  const badgeSlugs = parseList(rawBadges, (item) => {
    const byName = (FILTER_OPTIONS.badges as readonly string[]).includes(item) ? item : undefined;
    const resolved = byName ?? slugToBadge(item);
    return resolved ? badgeToSlug(resolved) : undefined;
  });

  const rawCompare = Array.isArray(search.compare)
    ? (search.compare as unknown[]).map(String).join(",")
    : search.compare;
  const compareIds = parseList(rawCompare, (id) =>
    vehicles.some((v) => v.id === id) ? id : undefined,
  ).slice(0, COMPARE_MAX);

  let priceMin = numIn(search.priceMin, PRICE_FLOOR + 1, PRICE_CAP);
  let priceMax = numIn(search.priceMax, PRICE_FLOOR, PRICE_CAP - 1);
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    [priceMin, priceMax] = [priceMax, priceMin];
  }
  let milesMin = numIn(search.milesMin, MILES_FLOOR + 1, MILES_CAP);
  let milesMax = numIn(search.milesMax, MILES_FLOOR, MILES_CAP - 1);
  if (milesMin !== undefined && milesMax !== undefined && milesMin > milesMax) {
    [milesMin, milesMax] = [milesMax, milesMin];
  }

  const page = numIn(search.page, 2, 9999);

  return {
    q: typeof search.q === "string" && search.q !== "" ? search.q : undefined,
    type: oneOf(search.type, ["Truck", "SUV", "Car", "EV"]),
    fuel: oneOf(search.fuel, ["Gas", "Hybrid", "Electric"]),
    condition: oneOf(search.condition, FILTERABLE_CONDITIONS),
    drive: oneOf(search.drive, ["4WD", "AWD", "RWD", "FWD"]),
    trans: oneOf(search.trans, ["Automatic", "Manual"]),
    year: numIn(search.year, 2000, 2100),
    priceMin,
    priceMax,
    milesMin,
    milesMax,
    badges: badgeSlugs.length > 0 ? badgeSlugs.join(",") : undefined,
    sort: oneOf(search.sort, ["price_asc", "price_desc", "year_desc", "miles_asc"]),
    page: page !== undefined ? Math.trunc(page) : undefined,
    compare: compareIds.length > 0 ? compareIds.join(",") : undefined,
  };
}

/** The resolved filter values the UI works with ("All" = no constraint). */
type EffectiveFilters = {
  q: string;
  type: string;
  fuel: string;
  condition: string;
  drivetrain: string;
  transmission: string;
  year: string | number;
  priceRange: [number, number];
  milesRange: [number, number];
  badges: string[];
};

function vehicleMatches(v: Vehicle, f: EffectiveFilters): boolean {
  if (f.type !== "All" && v.type !== f.type) return false;
  if (f.fuel !== "All" && v.fuel !== f.fuel) return false;
  if (f.condition !== "All" && v.condition !== f.condition) return false;
  if (f.drivetrain !== "All" && v.drivetrain !== f.drivetrain) return false;
  if (f.transmission !== "All" && v.transmission !== f.transmission) return false;
  if (f.year !== "All" && v.year !== Number(f.year)) return false;
  if (v.price < f.priceRange[0] || v.price > f.priceRange[1]) return false;
  if (v.miles < f.milesRange[0] || v.miles > f.milesRange[1]) return false;
  if (f.badges.length > 0 && !f.badges.some((b) => v.badges?.includes(b))) return false;
  if (f.q.trim() !== "") {
    const query = f.q.toLowerCase();
    const fullTitle =
      `${v.year} ${v.make} ${v.model} ${v.trim} ${v.exterior} ${v.type} ${v.fuel}`.toLowerCase();
    if (!fullTitle.includes(query)) return false;
  }
  return true;
}

/**
 * Labels for the indexable landing pages. They feed the <title>, the meta description, the
 * H1, and the ItemList name, so they carry three constraints at once:
 *
 * 1. NOT "Used ...". Stock is 5 New plus 1 Certified Pre-Owned and there is no used truck
 *    on the lot, so a "Used Trucks" title would misdescribe the inventory.
 * 2. Short. The title is `${label} for Sale in ${city} | AM Ford`, which is 36 fixed
 *    characters against a 60-character budget, leaving the label at most 24.
 * 3. Distinct between the two maps. type=EV and fuel=Electric are separate indexable URLs
 *    with self-canonicals, so sharing a label would ship two pages with identical titles.
 */
const TYPE_SEO_LABEL: Record<Vehicle["type"], string> = {
  Truck: "Ford Trucks",
  SUV: "Ford SUVs",
  Car: "Ford Cars",
  EV: "Ford EVs",
};
const FUEL_SEO_LABEL: Record<Vehicle["fuel"], string> = {
  Gas: "Gas Fords",
  Hybrid: "Hybrid Fords",
  Electric: "Electric Fords",
};
/**
 * Condition labels break constraint 2 above on purpose: "Certified Pre-Owned Fords" is 25
 * characters, one over the 24 the shared `${label} for Sale in ${city} | AM Ford` template
 * allows. That is why the condition landing pages carry their own title in CONDITION_SEO
 * rather than reusing that template. This label is still the H1, the breadcrumb, and the
 * ItemList name, none of which are length-capped. Do not fold the two templates back together.
 */
const CONDITION_SEO_LABEL: Record<FilterableCondition, string> = {
  New: "New Fords",
  "Certified Pre-Owned": "Certified Pre-Owned Fords",
};

/**
 * The params that make a URL "filtered" for indexing purposes. `sort` and `compare` are view
 * state rather than filters, so they never change a page's indexability or its canonical.
 *
 * soloFilter() and buildInventorySeo() both read this ONE list. They used to keep private
 * copies, which is exactly how a new param ends up filtering the grid while quietly leaving
 * a multi-filter URL indexable.
 */
const FILTER_KEYS = [
  "q",
  "type",
  "fuel",
  "condition",
  "drive",
  "trans",
  "year",
  "priceMin",
  "priceMax",
  "milesMin",
  "milesMax",
  "badges",
  "page",
] as const;

const activeFilterKeys = (s: InventorySearch) => FILTER_KEYS.filter((k) => s[k] !== undefined);

/**
 * `page` counts as a filter for INDEXING (it changes which vehicles a URL shows, so page 2 is
 * never indexable), but it is not part of a page's IDENTITY. /inventory?type=Truck&page=2 is
 * still the Ford Trucks landing page and has to keep that H1, that breadcrumb trail, that
 * ItemList name, and that canonical; only the robots tag changes.
 *
 * Before this split, adding &page=2 to a landing URL silently demoted it to the generic
 * "Vehicles for Sale" heading and canonicalled it to bare /inventory. That is invisible at
 * six vehicles, where nothing paginates, and wrong the moment the lot outgrows one page.
 */
const IDENTITY_FILTER_KEYS = FILTER_KEYS.filter((k) => k !== "page");
const activeIdentityKeys = (s: InventorySearch) =>
  IDENTITY_FILTER_KEYS.filter((k) => s[k] !== undefined);

/**
 * A URL qualifies as a landing page when exactly ONE identity filter is active and it is
 * type, fuel, or condition. Those pages get unique titles, self-canonicals, and on-page
 * content; everything deeper is noindex,follow.
 */
function soloFilter(
  s: InventorySearch,
): { kind: "type" | "fuel" | "condition"; value: string } | null {
  if (activeIdentityKeys(s).length !== 1) return null;
  if (s.type !== undefined) return { kind: "type", value: s.type };
  if (s.fuel !== undefined) return { kind: "fuel", value: s.fuel };
  // Guarded rather than a plain undefined check: a condition with no label (today "Used")
  // must fall through to the noindex branch instead of becoming a titleless landing page.
  if (isFilterableCondition(s.condition)) return { kind: "condition", value: s.condition };
  return null;
}

/** Unique on-page copy for each indexable landing page — distinct content per URL. */
const LANDING_CONTENT: Record<string, { heading: string; body: string[] }> = {
  "type:Truck": {
    heading: `Ford Trucks for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "Northeast Ohio asks a lot of a truck: lake-effect snow from November to March, boat ramps along Lake Erie all summer, and back roads that punish anything without real ground clearance. The trucks on this page, led by the Ford F-150, are chosen for exactly that duty cycle, with 4WD drivetrains, proven EcoBoost and V8 powertrains, and tow packages inspected point by point before they earn a spot on our lot.",
      `Every truck at AM Ford comes with a full mechanical inspection, transparent pricing, and trade-in valuations that reward the truck you're driving today. We put Ford trucks to work for crews and contractors across Ashtabula County, so compare payloads and options above, then book a test drive at our showroom at ${dealerInfo.address}.`,
    ],
  },
  "type:SUV": {
    heading: `Ford SUVs for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "From three-row family haulers like the Ford Explorer to trail-ready icons like the Bronco and efficient hybrids like the Escape, the SUVs on this page cover every version of Ohio family life: school runs in Saybrook, ski trips to Peek'n Peak, and everything Lake Erie throws in between. AWD and 4WD options give you four-season confidence, and flexible cargo layouts swallow strollers, sports gear, and Costco runs alike.",
      `Every SUV on our lot, new and certified pre-owned alike, is inspected by factory-trained technicians and priced against current market data. Filter by drivetrain, price, or mileage above, then come see your shortlist in person at AM Ford in ${dealerInfo.locality}, an easy drive from anywhere in Ashtabula County.`,
    ],
  },
  "type:Car": {
    heading: `Ford Cars for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "Some drivers want a commuting appliance; some want a reason to take the long way home. The cars on this page, including the Ford Mustang GT with its 5.0L V8, deliver the lower center of gravity, sharper steering, and driver-first feel that no crossover can imitate.",
      `Every car at AM Ford passes a comprehensive mechanical and safety inspection before sale, and our finance team works with Ohio credit unions and national lenders to find terms that fit real budgets. Browse the inventory above or call ${dealerInfo.phone} to hold a car for your visit to our ${dealerInfo.locality} lot.`,
    ],
  },
  "type:EV": {
    heading: `Ford EVs for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "Electric ownership in Northeast Ohio is more practical than most drivers expect: charge overnight on a standard home circuit or a Level 2 charger, wake up to a full battery every morning, and skip the gas station entirely. The EVs on this page, like the F-150 Lightning with its 320-mile extended-range battery and Pro Power Onboard generator capability, prove electric doesn't mean compromise.",
      `AM Ford's technicians are factory-trained on Ford's EV platform, so your battery health check, software updates, and service all happen here in ${dealerInfo.locality}, not at a dealership an hour away in Cleveland. Ask us about home-charger installation guidance with any EV purchase.`,
    ],
  },
  "fuel:Gas": {
    heading: `Gas Fords for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "Gasoline power remains the simplest ownership story there is: fill up anywhere, service anywhere, and rely on decades of proven Ford powertrain engineering. The gas-powered trucks, SUVs, and cars on this page range from the workhorse F-150 EcoBoost to the 480-horsepower Mustang GT, each fully inspected before it reaches the lot.",
      `If you're weighing gas against hybrid or electric, our sales team will walk you through real cost-of-ownership numbers for your actual commute; no pressure, just math. Visit AM Ford at ${dealerInfo.address} to compare them side by side.`,
    ],
  },
  "fuel:Hybrid": {
    heading: `Hybrid Fords for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "A hybrid earns its keep in exactly the driving Ashtabula County serves up: stop-and-go around town where the electric motor does the work, and open highway to Cleveland or Erie where the gas engine cruises efficiently. Hybrids like the Escape Titanium on this page are rated over 40 MPG in the city with no charging required, so there are no cords and no planning, just fewer fuel stops.",
      `Every hybrid at AM Ford gets a battery-health verification as part of its inspection, and our certified technicians handle hybrid service in-house at our ${dealerInfo.locality} shop. Compare hybrid options above or book a test drive to feel the difference yourself.`,
    ],
  },
  "fuel:Electric": {
    heading: `Electric Fords for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "An electric Ford is the shortest path to lower running costs without giving up capability. The electric vehicles on this page, like the F-150 Lightning Lariat with 580 horsepower and a 320-mile range, combine instant torque, near-silent cruising, and a far simpler maintenance story: no oil changes, fewer moving parts, and electricity that costs a fraction of gasoline per mile.",
      `AM Ford verifies battery health on every EV we sell, and our factory-trained EV technicians provide full service support right here in ${dealerInfo.locality} for drivers across Ashtabula County and Northeast Ohio. Ask about home charging setup and Ohio utility off-peak rates when you visit.`,
    ],
  },
  "condition:New": {
    heading: `New Ford Trucks, SUVs, Cars, and EVs in ${dealerInfo.locality}, Ohio`,
    body: [
      "Buying new means you are the first name on the title: delivery miles on the odometer, the current model year of Ford technology, and a vehicle nobody else has already configured to their own taste. The new inventory on this page runs from the F-150 Platinum and the Bronco Outer Banks through the Mustang GT and the all-electric F-150 Lightning, which between them cover the work week, the weekend, and the school run without asking you to give up any of the three.",
      `Every new Ford here is prepped and inspected by factory-trained technicians before it reaches the front line, and the price on the listing is the price we quote you, with no hidden dealer fees attached at the desk. ${DELIVERY_CLAIM} If you would rather look first and decide later, we are at ${dealerInfo.address}, and ${dealerInfo.phone} reaches the sales team directly.`,
    ],
  },
  "condition:Certified Pre-Owned": {
    heading: `Certified Pre-Owned Fords for Sale in ${dealerInfo.locality}, Ohio`,
    body: [
      "Certified pre-owned sits between a new Ford and an ordinary second-hand car, and the certification is the entire difference. A CPO Ford is not simply a trade-in that looked clean enough to put out front. Ford sets the eligibility rules on age and mileage, defines the inspection a technician has to complete, and requires the vehicle history to be reviewed before anything can be listed as certified. A vehicle that does not qualify is never sold to you as one that does.",
      `For a lot of Ashtabula County buyers that is the balance point: someone else has already taken the first years of depreciation, and the manufacturer still stands behind the vehicle instead of handing it over as-is. Coverage and terms are set by the Ford program and documented per vehicle, so ask us for the paperwork on the specific unit you are considering and read it before you sign anything. Certified stock turns over as trade-ins arrive and clear inspection, so if the right one is not on this page today, call ${dealerInfo.phone} and we will tell you when it lands.`,
    ],
  },
};

/**
 * How the vehicles on a landing page should be described in its meta description.
 *
 * Derived from the vehicles the URL actually resolves to rather than hardcoded, so the
 * description can never claim a condition the page does not show: today ?type=Truck is
 * "new" (one New F-150) while ?type=SUV is "new and certified pre-owned" (two New plus the
 * CPO Escape), and both stay correct if the lot changes.
 *
 * Only the type and fuel descriptions use this. The ?condition= pages state their condition
 * in the label already, so running it through here would produce "new New Fords".
 */
function conditionPhrase(list: Vehicle[]): string {
  const hasNew = list.some((v) => v.condition === "New");
  const hasCertified = list.some((v) => v.condition === "Certified Pre-Owned");
  if (hasNew && hasCertified) return "new and certified pre-owned";
  if (hasCertified) return "certified pre-owned";
  return "new";
}

/**
 * Title and description for the two condition landing pages.
 *
 * Written per page rather than templated. The shared type/fuel template would produce
 * "Shop new New Fords" for ?condition=New, because conditionPhrase() and the label describe
 * the same axis there, and "Certified Pre-Owned Fords for Sale in Jefferson, OH | AM Ford"
 * is 61 characters, one over budget. Both strings below are measured: title <= 60,
 * description <= 155.
 *
 * Certified Pre-Owned is the page buyers actually search for, so it says what certification
 * means and stops there. No inspection point count, no warranty length, no coverage
 * specifics: those are unapproved claims, and the honest version is that the terms are
 * documented per vehicle.
 */
const CONDITION_SEO: Record<FilterableCondition, { title: string; description: string }> = {
  New: {
    title: `New Fords for Sale in ${dealerInfo.city} | AM Ford`,
    description: `Browse new Ford trucks, SUVs, cars, and EVs at AM Ford in ${dealerInfo.city}, serving Ashtabula County and Northeast Ohio. Compare pricing and specs.`,
  },
  "Certified Pre-Owned": {
    title: `Certified Pre-Owned Fords in ${dealerInfo.city} | AM Ford`,
    description: `Shop certified pre-owned Fords at AM Ford in ${dealerInfo.city}, serving Ashtabula County. Every CPO Ford is manufacturer certified and inspected.`,
  },
};

/**
 * Filter-aware SEO: a single type, fuel, or condition filter becomes an indexable landing
 * page with its own title and self-referencing canonical; any deeper filter combination is
 * noindex,follow so crawl budget stays on the clean pages.
 *
 * SERP budgets apply to EVERY variant this returns, not just the base page: title <= 60
 * characters including the "| AM Ford" brand, description <= 155. The longest label
 * ("Electric Fords") with the longest condition phrase lands at 50 / 148, so there is
 * headroom, but any edit to these templates has to be re-measured against all ten URLs.
 */
function buildInventorySeo(s: InventorySearch) {
  const solo = soloFilter(s);
  const activeKeys = activeFilterKeys(s);

  /**
   * Page 2 and beyond is never indexable, on a landing page or anywhere else, because it is a
   * partial slice of a list whose page 1 is already indexed. It stays `follow` so the vehicle
   * detail pages reachable only from a later page keep a crawl path. The canonical still points
   * at the UNPAGINATED page for that same reason: the paginated URL is not a page in its own
   * right, so it must not claim to be one.
   *
   * Note the validator refuses `page` values below 2, so ?page=1 is dropped before it gets
   * here and can never become a second, indexable copy of the base URL.
   */
  const paginated = s.page !== undefined;
  const paginatedRobots = paginated ? "noindex,follow" : undefined;

  if (solo?.kind === "condition" && isFilterableCondition(s.condition)) {
    const copy = CONDITION_SEO[s.condition];
    return {
      title: copy.title,
      description: copy.description,
      // "Certified Pre-Owned" carries a space, so the value has to be encoded. The space must
      // come out as "+", NOT "%20": every internal link to this facet is built by the router,
      // which serialises a query-string space as "+", so the crawler only ever requests
      // ?condition=Certified+Pre-Owned. A "%20" canonical would point at a URL string nothing
      // links to, stranding the facet's internal link equity on an orphan. encodeURIComponent
      // is still the right escaper for every other character; only the space needs remapping.
      canonical: `https://amford.com/inventory?condition=${encodeURIComponent(s.condition).replace(/%20/g, "+")}`,
      robots: paginatedRobots,
    };
  }

  const onlyType = solo?.kind === "type";
  const onlyFuel = solo?.kind === "fuel";

  if (onlyType || onlyFuel) {
    const label = onlyType ? TYPE_SEO_LABEL[s.type!] : FUEL_SEO_LABEL[s.fuel!];
    const param = onlyType ? `type=${s.type}` : `fuel=${s.fuel}`;
    return {
      title: `${label} for Sale in ${dealerInfo.city} | AM Ford`,
      description: `Shop ${conditionPhrase(matchingVehicles(s))} ${label} at AM Ford in ${dealerInfo.city}, serving Ashtabula County and Northeast Ohio. Compare pricing and specs.`,
      canonical: `https://amford.com/inventory?${param}`,
      robots: paginatedRobots,
    };
  }

  return {
    title: `Ford Trucks, SUVs & Cars for Sale in ${dealerInfo.city} | AM Ford`,
    description: `Shop the AM Ford lineup in ${dealerInfo.city}: new and certified pre-owned Ford trucks, SUVs, cars, and EVs. Serving Ashtabula County and Northeast Ohio.`,
    canonical: "https://amford.com/inventory",
    robots: activeKeys.length > 0 ? "noindex,follow" : undefined,
  };
}

/** Structured data needs absolute URLs, so every schema href is built from this origin. */
const SITE_ORIGIN = "https://amford.com";

/** SEO label for an indexable landing page, or null when this URL is not one. */
function landingLabel(s: InventorySearch): string | null {
  const solo = soloFilter(s);
  if (!solo) return null;
  if (solo.kind === "type") return TYPE_SEO_LABEL[s.type!];
  if (solo.kind === "fuel") return FUEL_SEO_LABEL[s.fuel!];
  return isFilterableCondition(s.condition) ? CONDITION_SEO_LABEL[s.condition] : null;
}

/**
 * Home > Inventory, plus a third crumb on the indexable type/fuel/condition landing pages.
 *
 * Built once here and fed to BOTH breadcrumbSchema() in head() and <Breadcrumbs> in the
 * component, so the visible trail and the structured data can never disagree — which is
 * what Google requires before it will render breadcrumbs in the result.
 */
function buildBreadcrumbs(s: InventorySearch): Crumb[] {
  const label = landingLabel(s);
  // The last crumb is always the current page, so it carries no href.
  return label === null
    ? crumbs({ label: "Inventory" })
    : crumbs({ label: "Inventory", href: "/inventory" }, { label });
}

/** URL search params resolved into the filter snapshot the grid evaluates against. */
function effectiveFilters(s: InventorySearch): EffectiveFilters {
  return {
    q: s.q ?? "",
    type: s.type ?? "All",
    fuel: s.fuel ?? "All",
    condition: s.condition ?? "All",
    drivetrain: s.drive ?? "All",
    transmission: s.trans ?? "All",
    year: s.year ?? "All",
    priceRange: [s.priceMin ?? PRICE_FLOOR, s.priceMax ?? PRICE_CAP],
    milesRange: [s.milesMin ?? MILES_FLOOR, s.milesMax ?? MILES_CAP],
    // Slugs in the URL, display names for matching against Vehicle.badges
    badges: badgeNamesFromSearch(s.badges),
  };
}

/** URL slug list -> display badge names. */
function badgeNamesFromSearch(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((slug) => slugToBadge(slug.trim()))
    .filter((b): b is string => b !== undefined);
}

/**
 * Which page numbers the pager shows: always the first and last, plus `span` either side of
 * the current one, with "gap" standing in for the stretch that is skipped.
 *
 * A pager that prints every page fits fine at three pages and overflows a 320px screen at
 * eight, which is a bug that cannot be seen today because six vehicles at {@link PAGE_SIZE}
 * per page is one page. Keeping the run bounded means the control is already correct at the
 * point it first becomes visible.
 */
export function pageWindow(current: number, total: number, span = 1): (number | "gap")[] {
  const wanted = new Set<number>([1, total]);
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 1 && p <= total) wanted.add(p);
  }
  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const p of [...wanted].sort((a, b) => a - b)) {
    if (previous !== 0 && p - previous > 1) out.push("gap");
    out.push(p);
    previous = p;
  }
  return out;
}

/** Grid sort order. Shared by the component and by the ItemList schema in head(). */
function sortVehicles(list: Vehicle[], sort: SortCode): Vehicle[] {
  switch (sort) {
    case "price_asc":
      return [...list].sort((a, b) => a.price - b.price);
    case "price_desc":
      return [...list].sort((a, b) => b.price - a.price);
    case "year_desc":
      return [...list].sort((a, b) => b.year - a.year);
    case "miles_asc":
      return [...list].sort((a, b) => a.miles - b.miles);
    default:
      return list;
  }
}

/**
 * The vehicles this URL resolves to, in the order the grid renders them. head() and the
 * component both go through here so the emitted schema matches what a visitor sees.
 */
function matchingVehicles(s: InventorySearch): Vehicle[] {
  const filters = effectiveFilters(s);
  return sortVehicles(
    vehicles.filter((v) => vehicleMatches(v, filters)),
    s.sort ?? "featured",
  );
}

/**
 * schema.org OfferItemCondition defines only New/Used/Refurbished/Damaged, so a Certified
 * Pre-Owned car maps to UsedCondition and keeps its CPO status in additionalProperty rather
 * than an invented enum value. Condition always comes from vehicle.condition, never mileage.
 */
const CONDITION_SCHEMA_URL: Record<Vehicle["condition"], string> = {
  New: "https://schema.org/NewCondition",
  Used: "https://schema.org/UsedCondition",
  "Certified Pre-Owned": "https://schema.org/UsedCondition",
};

/** Seller block shared by every Offer, built from the single dealer source of truth. */
const SELLER_SCHEMA = {
  "@type": "AutoDealer",
  "@id": "https://amford.com/#dealer",
  name: dealerInfo.name,
  telephone: dealerInfo.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: dealerInfo.street,
    addressLocality: dealerInfo.locality,
    addressRegion: dealerInfo.region,
    postalCode: dealerInfo.postalCode,
    addressCountry: "US",
  },
};

/** Keeps the inline JSON-LD payload small on wide-open inventory URLs. */
const ITEM_LIST_CAP = 24;

/**
 * ItemList of the vehicles rendered on the CURRENT page, in render order. Returns
 * null when nothing matches, because the page renders its empty state instead of a grid
 * and an ItemList with no members would contradict what a visitor sees.
 *
 * The slice must mirror the component's pagination: the brief requires structured data
 * to match visible information, so page 2 must not advertise page 1's vehicles.
 */
function buildInventoryItemListSchema(s: InventorySearch) {
  const all = matchingVehicles(s);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const currentPage = Math.min(s.page ?? 1, totalPages);
  const matches = all
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    .slice(0, ITEM_LIST_CAP);
  if (matches.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: landingLabel(s) ?? "Vehicle Inventory",
    numberOfItems: matches.length,
    itemListElement: matches.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": ["Product", "Vehicle"],
        name: `${v.year} ${v.make} ${v.model} ${v.trim}`,
        url: `${SITE_ORIGIN}/vehicle/${v.id}`,
        brand: { "@type": "Brand", name: v.make },
        itemCondition: CONDITION_SCHEMA_URL[v.condition],
        mileageFromOdometer: {
          "@type": "QuantitativeValue",
          value: v.miles,
          unitCode: "SMI",
        },
        additionalProperty: {
          "@type": "PropertyValue",
          name: "Condition",
          value: v.condition,
        },
        ...(v.vin !== undefined ? { vehicleIdentificationNumber: v.vin } : {}),
        ...(v.stockNumber !== undefined ? { sku: v.stockNumber } : {}),
        offers: {
          "@type": "Offer",
          price: v.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: SELLER_SCHEMA,
        },
      },
    })),
  };
}

export const Route = createFileRoute("/inventory")({
  validateSearch: validateInventorySearch,
  head: ({ match }) => {
    const search = (match.search ?? {}) as InventorySearch;
    const seo = buildInventorySeo(search);
    const itemList = buildInventoryItemListSchema(search);
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        ...(seo.robots ? [{ name: "robots", content: seo.robots }] : []),
        {
          name: "keywords",
          content:
            "Ford dealer Jefferson Ohio, Ford dealership Jefferson OH, Ford trucks Jefferson Ohio, Ford SUVs Ashtabula County, certified pre-owned Ford Jefferson OH, Ford dealer Northeast Ohio, Ford dealer near Erie PA, AM Ford inventory",
        },
        { property: "og:title", content: seo.title },
        // og:description has no length cap, unlike the meta description above, so this is
        // where DELIVERY_CLAIM belongs. Built from seo.description so it stays filter-aware.
        {
          property: "og:description",
          content: `${seo.description} ${DELIVERY_CLAIM}`,
        },
        { property: "og:type", content: "website" },
        // Must match the <link rel="canonical"> below EXACTLY; both read the same value.
        { property: "og:url", content: seo.canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: seo.canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema(buildBreadcrumbs(search))),
        },
        ...(itemList
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify(itemList),
              },
            ]
          : []),
      ],
    };
  },
  component: InventoryPage,
});

export function InventoryPage() {
  // Filter state lives in the URL — shareable, refresh-proof, back/forward-friendly.
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  // Every filter change resets pagination (a patch may still set `page` explicitly).
  const updateFilters = (patch: Partial<InventorySearch>, opts?: { replace?: boolean }) =>
    navigate({
      search: (prev) => ({ ...prev, page: undefined, ...patch }),
      replace: opts?.replace ?? false,
      resetScroll: false,
    });

  // Derived display values (URL absence = default)
  const q = search.q ?? "";
  const type = search.type ?? "All";
  const fuel = search.fuel ?? "All";
  const condition = search.condition ?? "All";
  const drivetrain = search.drive ?? "All";
  const transmission = search.trans ?? "All";
  const year: string | number = search.year ?? "All";
  const priceRange: [number, number] = [
    search.priceMin ?? PRICE_FLOOR,
    search.priceMax ?? PRICE_CAP,
  ];
  const milesRange: [number, number] = [
    search.milesMin ?? MILES_FLOOR,
    search.milesMax ?? MILES_CAP,
  ];
  const selectedBadges = useMemo(() => badgeNamesFromSearch(search.badges), [search.badges]);
  const sort: SortCode = search.sort ?? "featured";
  const page = search.page ?? 1;
  const compareIds = useMemo(
    () => (search.compare ? search.compare.split(",").filter(Boolean) : []),
    [search.compare],
  );

  // Discrete choices push history entries (back undoes a filter); sliders/search use replace.
  const setType = (t: string) =>
    updateFilters({ type: t === "All" ? undefined : (t as Vehicle["type"]) });
  const setFuel = (f: string) =>
    updateFilters({ fuel: f === "All" ? undefined : (f as Vehicle["fuel"]) });
  const setCondition = (c: string) =>
    updateFilters({ condition: c === "All" ? undefined : (c as Vehicle["condition"]) });
  const setDrivetrain = (d: string) =>
    updateFilters({ drive: d === "All" ? undefined : (d as Vehicle["drivetrain"]) });
  const setTransmission = (t: string) =>
    updateFilters({ trans: t === "All" ? undefined : (t as Vehicle["transmission"]) });
  const setYear = (y: string | number) =>
    updateFilters({ year: y === "All" ? undefined : Number(y) });
  const setPriceRange = ([min, max]: number[]) =>
    updateFilters(
      {
        priceMin: min <= PRICE_FLOOR ? undefined : min,
        priceMax: max >= PRICE_CAP ? undefined : max,
      },
      { replace: true },
    );
  const setMilesRange = ([min, max]: number[]) =>
    updateFilters(
      {
        milesMin: min <= MILES_FLOOR ? undefined : min,
        milesMax: max >= MILES_CAP ? undefined : max,
      },
      { replace: true },
    );
  const setSort = (code: SortCode) =>
    updateFilters({ sort: code === "featured" ? undefined : code });
  const setPage = (p: number) => updateFilters({ page: p <= 1 ? undefined : p });

  const toggleCompare = (v: Vehicle) => {
    const next = compareIds.includes(v.id)
      ? compareIds.filter((id) => id !== v.id)
      : [...compareIds, v.id].slice(0, COMPARE_MAX);
    navigate({
      search: (prev) => ({ ...prev, compare: next.length > 0 ? next.join(",") : undefined }),
      replace: true,
      resetScroll: false,
    });
  };

  // Search input: local echo for instant typing, debounced into the URL.
  const [qInput, setQInput] = useState(q);
  useEffect(() => setQInput(q), [q]);
  useEffect(() => {
    if (qInput === q) return;
    const t = setTimeout(
      () => updateFilters({ q: qInput === "" ? undefined : qInput }, { replace: true }),
      300,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput, q]);

  // Sidebar Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Special Order Modal state
  const [specialOrderOpen, setSpecialOrderOpen] = useState(false);

  // Marketing Popup states
  const [offerOpen, setOfferOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [selectedVehicleForOtp, setSelectedVehicleForOtp] = useState<Vehicle | null>(null);

  // Hero offer-ticket state

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when sidebar drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Effective filters snapshot: one object the grid, facet counts, and
  // empty-state suggestions all evaluate against.
  const effective: EffectiveFilters = useMemo(() => effectiveFilters(search), [search]);

  /** How many vehicles would match if the current filters were changed by `patch`. */
  const facetCount = (patch: Partial<EffectiveFilters>) =>
    vehicles.filter((v) => vehicleMatches(v, { ...effective, ...patch })).length;

  // Active filter count logic
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (type !== "All") count++;
    if (fuel !== "All") count++;
    if (condition !== "All") count++;
    if (drivetrain !== "All") count++;
    if (transmission !== "All") count++;
    if (year !== "All") count++;
    if (priceRange[0] > PRICE_FLOOR || priceRange[1] < PRICE_CAP) count++;
    if (milesRange[0] > MILES_FLOOR || milesRange[1] < MILES_CAP) count++;
    if (selectedBadges.length > 0) count += selectedBadges.length;
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const resetFilters = () => {
    setQInput("");
    navigate({
      search: (prev) => ({ sort: prev.sort, compare: prev.compare }),
      resetScroll: false,
    });
  };

  const toggleBadge = (badge: string) => {
    const next = selectedBadges.includes(badge)
      ? selectedBadges.filter((b) => b !== badge)
      : [...selectedBadges, badge];
    updateFilters({
      badges: next.length > 0 ? next.map(badgeToSlug).join(",") : undefined,
    });
  };

  // Filtered vehicles memo
  const filteredVehicles = useMemo(
    () =>
      sortVehicles(
        vehicles.filter((v: Vehicle) => vehicleMatches(v, effective)),
        sort,
      ),
    [effective, sort],
  );

  // Pagination (page clamps to the last page if the URL points past it)
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedVehicles = filteredVehicles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Self-healing empty state: which single filter removal brings results back?
  const relaxSuggestions = useMemo(() => {
    if (filteredVehicles.length > 0) return [];
    const candidates: { label: string; patch: Partial<InventorySearch>; count: number }[] = [];
    if (type !== "All")
      candidates.push({
        label: `Body: ${type}`,
        patch: { type: undefined },
        count: facetCount({ type: "All" }),
      });
    if (fuel !== "All")
      candidates.push({
        label: `Fuel: ${fuel}`,
        patch: { fuel: undefined },
        count: facetCount({ fuel: "All" }),
      });
    if (condition !== "All")
      candidates.push({
        label: `Condition: ${condition}`,
        patch: { condition: undefined },
        count: facetCount({ condition: "All" }),
      });
    if (drivetrain !== "All")
      candidates.push({
        label: `Drive: ${drivetrain}`,
        patch: { drive: undefined },
        count: facetCount({ drivetrain: "All" }),
      });
    if (transmission !== "All")
      candidates.push({
        label: `Trans: ${transmission}`,
        patch: { trans: undefined },
        count: facetCount({ transmission: "All" }),
      });
    if (year !== "All")
      candidates.push({
        label: `Year: ${year}`,
        patch: { year: undefined },
        count: facetCount({ year: "All" }),
      });
    if (priceRange[0] > PRICE_FLOOR || priceRange[1] < PRICE_CAP)
      candidates.push({
        label: "Price range",
        patch: { priceMin: undefined, priceMax: undefined },
        count: facetCount({ priceRange: [PRICE_FLOOR, PRICE_CAP] }),
      });
    if (milesRange[0] > MILES_FLOOR || milesRange[1] < MILES_CAP)
      candidates.push({
        label: "Mileage range",
        patch: { milesMin: undefined, milesMax: undefined },
        count: facetCount({ milesRange: [MILES_FLOOR, MILES_CAP] }),
      });
    if (selectedBadges.length > 0)
      candidates.push({
        label: selectedBadges.length === 1 ? `Badge: ${selectedBadges[0]}` : "Badges",
        patch: { badges: undefined },
        count: facetCount({ badges: [] }),
      });
    if (q.trim() !== "")
      candidates.push({
        label: `Search "${q}"`,
        patch: { q: undefined },
        count: facetCount({ q: "" }),
      });
    return candidates
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredVehicles.length, effective]);

  // Unique landing-page copy when exactly one indexable filter (type/fuel) is active
  const landing = useMemo(() => {
    const solo = soloFilter(search);
    return solo ? LANDING_CONTENT[`${solo.kind}:${solo.value}`] : undefined;
  }, [search]);

  // Vehicles selected for comparison (order preserved from the URL)
  const compareVehicles = useMemo(
    () =>
      compareIds
        .map((id) => vehicles.find((v) => v.id === id))
        .filter((v): v is Vehicle => v !== undefined),
    [compareIds],
  );
  const [compareOpen, setCompareOpen] = useState(false);

  // Same array the head() BreadcrumbList is built from, so trail and schema always match.
  const breadcrumbs = useMemo(() => buildBreadcrumbs(search), [search]);

  return (
    <SiteShell>
      <Breadcrumbs items={breadcrumbs} />

      {/*
       * Page header. Replaces the old full-bleed hero: a studio photo of a vehicle we do not
       * stock, a "$500 Trade-In Bonus" card whose Name and Phone inputs had no value, onChange,
       * name, or ref and therefore captured nothing, a "30-sec response / No credit impact"
       * trust row, a hardcoded "Verified Pre-Owned Stock" badge, and a vehicle-count chip read
       * from the placeholder feed. None of those claims had a source, so the replacement
       * carries only what is true: the H1 the landing pages need, one sentence of copy, and
       * the dealership phone line. Leads still have the card CTAs, the chat widget, and the
       * toolbar's trade-in link.
       * NOTE kept from the deleted offer block: the client brief forbids publishing APR
       * figures or monthly payments. Do not reintroduce a rate or a dollar-amount offer here
       * without written approval from the dealership.
       */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-5 px-6 pb-9 pt-4 sm:pb-11 sm:pt-5">
          <div className="max-w-2xl">
            <h1 className="display text-balance text-[32px] text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              {landingLabel(search) ?? "Vehicles"} for sale in {dealerInfo.city}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
              Browse the current lot at AM Ford, serving Ashtabula County and Northeast Ohio.
              Compare pricing, check specs, and schedule a test drive.
            </p>
          </div>
          <p className="pb-1 text-sm font-medium text-slate-500">
            Questions before you visit?{" "}
            <a
              href={dealerInfo.phoneHref}
              className="font-bold text-[#002c5f] underline-offset-4 hover:underline"
            >
              Call {dealerInfo.phone}
            </a>
          </p>
        </div>
      </section>

      {/* Main Sticky Control Toolbar */}
      <section className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl sm:top-20">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:px-6 sm:py-4 flex-nowrap overflow-hidden">
          {/* Search bar — flex-1 min-w-0 */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search model (F-150, Bronco)..."
              className="w-full truncate rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-[#002c5f] focus:ring-2 focus:ring-[#002c5f]/20 shadow-sm sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm"
            />
            {qInput && (
              <button
                onClick={() => setQInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Body Type Quick Chips (desktop only) */}
          <div className="hidden flex-wrap items-center gap-1.5 lg:flex">
            {FILTER_OPTIONS.types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                  type === t
                    ? "bg-[#002c5f] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div className="shrink-0 flex items-center gap-1.5">
            <label
              htmlFor="inventory-sort-select"
              className="hidden text-xs font-bold uppercase tracking-wider text-slate-500 lg:inline cursor-pointer"
            >
              Sort:
            </label>
            <select
              id="inventory-sort-select"
              aria-label="Sort inventory"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortCode)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-[#002c5f] shadow-sm sm:px-3.5 sm:py-2.5"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Filter Button Trigger — Icon-only on mobile, full text on sm+ */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "relative shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full p-2.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95",
              activeFilterCount > 0
                ? "bg-[#002c5f] text-white ring-2 ring-[#002c5f]/30"
                : "bg-[#002c5f] text-white hover:bg-[#001f44]",
            )}
            aria-label="Filter vehicles"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white text-[10px] sm:text-xs font-bold text-[#002c5f]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Pills Strip */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50 bg-surface/50"
            >
              <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-2 text-xs">
                <span className="font-semibold text-muted-foreground">Active filters:</span>

                {type !== "All" && (
                  <ActivePill label={`Body: ${type}`} onRemove={() => setType("All")} />
                )}
                {fuel !== "All" && (
                  <ActivePill label={`Fuel: ${fuel}`} onRemove={() => setFuel("All")} />
                )}
                {condition !== "All" && (
                  <ActivePill
                    label={`Condition: ${condition}`}
                    onRemove={() => setCondition("All")}
                  />
                )}
                {drivetrain !== "All" && (
                  <ActivePill
                    label={`Drive: ${drivetrain}`}
                    onRemove={() => setDrivetrain("All")}
                  />
                )}
                {transmission !== "All" && (
                  <ActivePill
                    label={`Trans: ${transmission}`}
                    onRemove={() => setTransmission("All")}
                  />
                )}
                {year !== "All" && (
                  <ActivePill label={`Year: ${year}`} onRemove={() => setYear("All")} />
                )}
                {(priceRange[0] > PRICE_FLOOR || priceRange[1] < PRICE_CAP) && (
                  <ActivePill
                    label={`$${priceRange[0].toLocaleString()} – $${priceRange[1].toLocaleString()}`}
                    onRemove={() => setPriceRange([PRICE_FLOOR, PRICE_CAP])}
                  />
                )}
                {(milesRange[0] > MILES_FLOOR || milesRange[1] < MILES_CAP) && (
                  <ActivePill
                    label={`${milesRange[0].toLocaleString()} – ${milesRange[1].toLocaleString()} mi`}
                    onRemove={() => setMilesRange([MILES_FLOOR, MILES_CAP])}
                  />
                )}
                {selectedBadges.map((b) => (
                  <ActivePill key={b} label={b} onRemove={() => toggleBadge(b)} />
                ))}

                <button
                  onClick={resetFilters}
                  className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <RotateCcw className="h-3 w-3" /> Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Vehicle Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              {totalPages > 1 ? (
                <>
                  Showing{" "}
                  <span className="font-bold text-slate-900">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredVehicles.length)}
                  </span>{" "}
                  of {filteredVehicles.length} vehicles
                </>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-bold text-slate-900">{filteredVehicles.length}</span> of{" "}
                  {vehicles.length} vehicles
                </>
              )}
            </p>
            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:gap-2.5">
              <button
                onClick={() => setOfferOpen(true)}
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 shadow-sm transition hover:bg-amber-100 active:scale-95 sm:px-3 sm:py-1.5 sm:text-xs"
              >
                <Tag className="h-3 w-3 shrink-0 text-amber-600 sm:h-3.5 sm:w-3.5" />
                <span>Claim $500 OFF</span>
              </button>
              <button
                onClick={() => setTradeOpen(true)}
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-bold text-[#002c5f] shadow-sm transition hover:bg-slate-200 active:scale-95 sm:px-3 sm:py-1.5 sm:text-xs"
              >
                <DollarSign className="h-3 w-3 shrink-0 text-[#002c5f] sm:h-3.5 sm:w-3.5" />
                <span>Value Your Trade</span>
              </button>
              <button
                onClick={() => setSpecialOrderOpen(true)}
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-0.5 px-1.5 py-1 text-[11px] font-bold text-[#002c5f] hover:underline sm:px-2 sm:text-xs"
              >
                <span>Special Order</span>
                <ChevronRight className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-dashed border-border bg-card p-16 text-center"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-muted-foreground">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="display mt-4 text-2xl text-ink">No matching vehicles</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We couldn't find any vehicles matching all selected filters.
                {relaxSuggestions.length > 0 && " Removing one of these gets you back on the road:"}
              </p>
              {relaxSuggestions.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {relaxSuggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        if ("q" in s.patch) setQInput("");
                        updateFilters(s.patch);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#002c5f]/25 bg-white px-4 py-2 text-xs font-bold text-[#002c5f] shadow-sm transition hover:bg-[#002c5f] hover:text-white"
                    >
                      <X className="h-3 w-3" /> Remove {s.label}
                      <span className="opacity-70">({s.count} matches)</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4" /> Reset All Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {pagedVehicles.map((v, i) => (
                <VehicleCard
                  key={v.id}
                  v={v}
                  index={i}
                  compared={compareIds.includes(v.id)}
                  onToggleCompare={toggleCompare}
                  onGetPrice={(selectedCar) => {
                    setSelectedVehicleForOtp(selectedCar);
                    setOtpOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination. Rendered only once the lot outgrows a single page, so at today's six
              vehicles over PAGE_SIZE=9 there is no pager, no "Page 1 of 1" line, and no dead
              Previous/Next pair. Nothing here invents a page that has no vehicles behind it. */}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="Inventory pages"
            >
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#002c5f]/30 disabled:pointer-events-none disabled:opacity-40"
              >
                Previous
              </button>
              {pageWindow(currentPage, totalPages).map((entry, i) =>
                entry === "gap" ? (
                  <span
                    key={`gap-${i}`}
                    aria-hidden="true"
                    className="grid h-10 w-6 place-items-center text-xs font-bold text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={entry}
                    onClick={() => setPage(entry)}
                    aria-label={`Page ${entry}`}
                    aria-current={entry === currentPage ? "page" : undefined}
                    className={cn(
                      "h-10 w-10 rounded-full text-xs font-bold shadow-sm transition",
                      entry === currentPage
                        ? "bg-[#002c5f] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-[#002c5f]/30",
                    )}
                  >
                    {entry}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#002c5f]/30 disabled:pointer-events-none disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}

          <SavedCarsStrip />
          <RecentlyViewedStrip />
        </div>
      </section>

      <InventoryBuyingGuide />

      <InventoryInterlinks activeType={search.type} activeFuel={search.fuel} />

      <DeliveryBanner />

      {/* Landing-page content — unique copy for each indexable type/fuel URL */}
      {landing && (
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
              Local Buying Guide
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {landing.heading}
            </h2>
            {landing.body.map((paragraph, i) => (
              <p key={i} className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* SEO Content & Buying Guide Section (Engineered for Google Rank #1 in Ohio) */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          {/* Main SEO Intro Header */}
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
              Your {dealerInfo.locality}, Ohio Ford Dealership
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
              Shop Ford Trucks, SUVs & Cars for Sale in {dealerInfo.locality}, Ohio
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Welcome to <strong>AM Ford</strong>, your local source for{" "}
              <strong className="text-slate-900">
                Ford vehicles for sale in {dealerInfo.city}
              </strong>{" "}
              and across Ashtabula County and the surrounding Northeast Ohio communities. Whether
              you are searching for a capable <strong>Ford F-150 truck</strong>, a spacious 3-row{" "}
              <strong>Ford Explorer SUV</strong>, an iconic <strong>Mustang sports car</strong>, or
              an all-electric <strong>F-150 Lightning</strong>, our {dealerInfo.locality} dealership
              stocks new and certified pre-owned Fords that are inspected before they reach the lot.
            </p>
          </div>

          {/* Key SEO Pillars Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-7 border border-[#002c5f]/12 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002c5f]/10 text-[#002c5f]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Certified Pre-Owned Ford Vehicles
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Every Certified Pre-Owned (CPO) Ford at AM Ford clears a{" "}
                <strong>Ford-authorized multi-point inspection</strong> before it is listed. CPO
                vehicles carry manufacturer-backed limited warranty coverage, roadside assistance,
                and a CARFAX® vehicle history report.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#002c5f]/12 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002c5f]/10 text-[#002c5f]">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">Flexible Ford Financing</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We make financing a Ford in {dealerInfo.locality} straightforward and stress-free.
                Working with Ohio credit unions and national lenders, we source auto loan options
                for a wide range of credit profiles. Start your application online and our finance
                team will follow up with your terms.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 border border-[#002c5f]/12 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#002c5f]/10 text-[#002c5f]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Serving Northeast Ohio & Erie, PA
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Located conveniently at <strong>{dealerInfo.address}</strong>, we proudly serve car
                shoppers from Ashtabula, Austinburg, Saybrook, Geneva, Conneaut, Mentor, Chardon,
                Willoughby, Cleveland, and Erie, Pennsylvania.
              </p>
            </div>
          </div>

          {/* Deep Keyword Content Article */}
          <div className="rounded-3xl bg-white p-8 border border-[#002c5f]/12 shadow-sm sm:p-10 space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Why Buy Your Next Ford from AM Ford in {dealerInfo.city}?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Shopping for a vehicle in Ohio shouldn't mean compromising on quality or paying
                hidden fees. At AM Ford, every vehicle on our lot undergoes safety and mechanical
                testing by factory-certified Ford technicians. From winter-ready 4WD trucks to
                fuel-efficient hybrid commuters, we stock vehicles tailored for Northeast Ohio
                weather and roads.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#002c5f]" /> Popular Ford Models in Stock
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Ford F-150 Trucks:</strong> Proven towing
                      power, 4x4 capability, and durable EcoBoost V6 or 5.0L V8 engines.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Ford Explorer & Bronco:</strong> Spacious
                      3-row seating and all-wheel drive stability for Ohio family road trips.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Ford Mustang GT:</strong> High-performance
                      V8 muscle cars with MagneRide suspension and active exhaust.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Electric & Hybrid Fords:</strong> F-150
                      Lightning EV and the certified pre-owned Escape Hybrid.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#002c5f]" /> The AM Ford Advantage
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">No-Hassle Transparent Pricing:</strong>{" "}
                      Upfront market-backed prices with zero hidden dealer fees.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Real Trade-In Appraisals:</strong> Your
                      current vehicle valued against current market data, any make or model.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Certified Pre-Owned Coverage:</strong>{" "}
                      Manufacturer-backed limited warranty and roadside assistance on CPO Fords.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#002c5f] mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Family-Owned in Ashtabula County:</strong>{" "}
                      Formerly {dealerInfo.formerName}, still serving the same communities.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-slate-50 p-6 border border-[#002c5f]/10">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Ready to schedule a test drive in {dealerInfo.city}?
                </h4>
                <p className="text-xs text-slate-600">
                  Contact our friendly sales team today at {dealerInfo.phone} or visit our showroom
                  at {dealerInfo.address}.
                </p>
              </div>
              <Link
                to="/contact"
                className="shrink-0 rounded-full bg-[#002c5f] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#001f44]"
              >
                Schedule Test Drive →
              </Link>
            </div>
          </div>

          {/* Frequently Asked Questions Accordion (Structured for Google Rank #1 Rich FAQ Snippets) */}
          <div className="max-w-4xl space-y-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
                Got Questions?
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Frequently Asked Questions About Buying a Ford in {dealerInfo.city}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Get quick answers regarding our new and certified pre-owned inventory, financing
                options, trade-in policy, and warranty coverage.
              </p>
            </div>

            <div className="space-y-3">
              {/* Same array the FAQPage JSON-LD is built from, so the rendered answers and
                  the structured data can never drift apart. */}
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                const answerId = `inventory-faq-answer-${idx}`;
                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl bg-white border border-slate-200 transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 transition hover:text-[#002c5f]"
                    >
                      <span className="flex items-center gap-3 text-sm sm:text-base">
                        <HelpCircle className="h-4 w-4 shrink-0 text-[#002c5f]" />
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                          isOpen && "rotate-180 text-[#002c5f]",
                        )}
                      />
                    </button>
                    {/*
                      The answer is ALWAYS mounted and collapsed with a grid row, never
                      conditionally rendered.

                      Google honours FAQPage structured data only when the same answer text is
                      on the page. The previous AnimatePresence version mounted the answer on
                      click, so nine of the ten answers in the JSON-LD were simply absent from
                      the HTML the crawler receives: identical in DevTools, invisible to a bot.
                      Collapsing an answer that is present is fine; not shipping it is not.
                    */}
                    <div
                      id={answerId}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Frequent-searches hub. Last block before the footer on purpose: it is a dense
          internal-link surface, so it belongs after the reading content rather than in
          the middle of it. The "inventory" preset carries the refinement axes a listing
          page needs (body style, price, fuel, condition, nearby). */}
      <FrequentSearches variant="inventory" />

      {/* Right Slide-Out Sidebar Filter Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-out Sidebar from the Right Side */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#002c5f]" />
                  <h2 className="text-xl font-bold text-slate-900">Filter Vehicles</h2>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#002c5f]/15 px-2.5 py-0.5 text-xs font-bold text-[#002c5f]">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-7">
                {/* Body Type Filter */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Body Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.types.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-xs font-bold transition-all",
                          type === t
                            ? "bg-[#002c5f] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        {t}{" "}
                        <span className="font-semibold opacity-60">
                          ({facetCount({ type: t })})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition Filter — New vs Certified Pre-Owned. "Used" is absent on purpose:
                    see FILTERABLE_CONDITIONS. Same pill treatment as Body Style above so the
                    drawer keeps one visual language. */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Condition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["All", ...FILTERABLE_CONDITIONS] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCondition(c)}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-xs font-bold transition-all",
                          condition === c
                            ? "bg-[#002c5f] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        {c}{" "}
                        <span className="font-semibold opacity-60">
                          ({facetCount({ condition: c })})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Type Filter */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Powertrain / Fuel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FILTER_OPTIONS.fuels.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFuel(f)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all",
                          fuel === f
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-ink hover:bg-surface-2",
                        )}
                      >
                        <span>
                          {f}{" "}
                          <span className="font-medium opacity-60">
                            ({facetCount({ fuel: f })})
                          </span>
                        </span>
                        {fuel === f && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range (min + max) */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Price Range
                    </label>
                    <span className="display text-base font-bold text-primary">
                      ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
                    </span>
                  </div>
                  <RangeSlider
                    min={PRICE_FLOOR}
                    max={PRICE_CAP}
                    step={2500}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    ariaLabels={["Minimum price", "Maximum price"]}
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>$20,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Drivetrain Filter */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Drivetrain
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.drivetrains.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDrivetrain(d)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border",
                          drivetrain === d
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-ink hover:bg-surface-2",
                        )}
                      >
                        {d}{" "}
                        <span className="font-medium opacity-60">
                          ({facetCount({ drivetrain: d })})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transmission Filter */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Transmission
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.transmissions.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTransmission(t)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border",
                          transmission === t
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-ink hover:bg-surface-2",
                        )}
                      >
                        {t}{" "}
                        <span className="font-medium opacity-60">
                          ({facetCount({ transmission: t })})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Year Filter */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Model Year
                  </label>
                  <div className="flex gap-2">
                    {FILTER_OPTIONS.years.map((y) => (
                      <button
                        key={String(y)}
                        onClick={() => setYear(y)}
                        className={cn(
                          "flex-1 rounded-xl py-2 text-xs font-semibold border transition-all text-center",
                          String(year) === String(y)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-ink hover:bg-surface-2",
                        )}
                      >
                        {y === "All" ? "All Years" : y}{" "}
                        <span className="font-medium opacity-60">({facetCount({ year: y })})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mileage Range (min + max) */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Mileage Range
                    </label>
                    <span className="display text-base font-bold text-primary">
                      {milesRange[0] <= MILES_FLOOR && milesRange[1] >= MILES_CAP
                        ? "Any Mileage"
                        : `${milesRange[0].toLocaleString()} – ${milesRange[1].toLocaleString()} mi`}
                    </span>
                  </div>
                  <RangeSlider
                    min={MILES_FLOOR}
                    max={MILES_CAP}
                    step={1000}
                    value={milesRange}
                    onValueChange={setMilesRange}
                    ariaLabels={["Minimum mileage", "Maximum mileage"]}
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>New (0 mi)</span>
                    <span>50,000+ mi</span>
                  </div>
                </div>

                {/* Special Tags & Features */}
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Special Badges & Packages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.badges.map((badge) => {
                      const isSelected = selectedBadges.includes(badge);
                      return (
                        <button
                          key={badge}
                          onClick={() => toggleBadge(badge)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                            isSelected
                              ? "border-primary bg-primary/15 text-primary font-semibold"
                              : "border-border bg-surface-2 text-muted-foreground hover:bg-surface hover:text-ink",
                          )}
                        >
                          <Tag className="h-3 w-3" />
                          <span>
                            {badge}{" "}
                            <span className="opacity-60">({facetCount({ badges: [badge] })})</span>
                          </span>
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-border bg-surface/80 p-5 backdrop-blur-md">
                <div className="flex gap-3">
                  <button
                    onClick={resetFilters}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold text-ink transition hover:bg-surface-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="flex-[2] rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
                  >
                    Show {filteredVehicles.length} Vehicles
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Compare tray — floats up whenever vehicles are selected for comparison */}
      <AnimatePresence>
        {compareVehicles.length > 0 && (
          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 sm:bottom-4">
            <motion.div
              initial={{ y: 72, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 72, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center -space-x-2">
                {compareVehicles.map((v) => (
                  <img
                    key={v.id}
                    src={v.image}
                    alt={`${v.year} ${v.model}`}
                    className="h-10 w-14 rounded-xl border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {compareVehicles.length} of {COMPARE_MAX} selected
              </p>
              <button
                onClick={() => setCompareOpen(true)}
                disabled={compareVehicles.length < 2}
                className="rounded-full bg-[#002c5f] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#001f44] disabled:opacity-40"
              >
                Compare now
              </button>
              <button
                onClick={() =>
                  navigate({
                    search: (prev) => ({ ...prev, compare: undefined }),
                    replace: true,
                    resetScroll: false,
                  })
                }
                className="text-xs font-bold text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {compareOpen && compareVehicles.length >= 2 && (
        <CompareModal vehicles={compareVehicles} onClose={() => setCompareOpen(false)} />
      )}

      <LeadCaptureModal
        isOpen={specialOrderOpen}
        onClose={() => setSpecialOrderOpen(false)}
        initialMode="special_order"
      />

      {offerOpen && <OfferPopup onClose={() => setOfferOpen(false)} pageSource="SRP" />}
      {tradeOpen && <TradeValuatorModal onClose={() => setTradeOpen(false)} />}
      {otpOpen && (
        <OTPPopup
          onClose={() => setOtpOpen(false)}
          initialCarData={
            selectedVehicleForOtp
              ? {
                  title: `${selectedVehicleForOtp.year} ${selectedVehicleForOtp.make} ${selectedVehicleForOtp.model} ${selectedVehicleForOtp.trim}`,
                  price: String(selectedVehicleForOtp.price),
                  stock: selectedVehicleForOtp.id,
                  vin: `1FT${selectedVehicleForOtp.id.toUpperCase()}2025`,
                  source: "SRP",
                }
              : undefined
          }
        />
      )}
    </SiteShell>
  );
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-primary/20"
        aria-label={`Remove filter ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/** Two-thumb range slider in the page's navy styling (Radix primitive). */
function RangeSlider({
  min,
  max,
  step,
  value,
  onValueChange,
  ariaLabels,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onValueChange: (value: number[]) => void;
  ariaLabels: [string, string];
}) {
  return (
    <SliderPrimitive.Root
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      minStepsBetweenThumbs={1}
      className="relative flex w-full touch-none select-none items-center py-1"
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
        <SliderPrimitive.Range className="absolute h-full bg-[#002c5f]" />
      </SliderPrimitive.Track>
      {ariaLabels.map((label) => (
        <SliderPrimitive.Thumb
          key={label}
          aria-label={label}
          className="block h-4 w-4 rounded-full border-2 border-[#002c5f] bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002c5f]/40"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

const COMPARE_ROWS: { label: string; render: (v: Vehicle) => string }[] = [
  { label: "Price", render: (v) => `$${v.price.toLocaleString()}` },
  { label: "MSRP", render: (v) => (v.msrp ? `$${v.msrp.toLocaleString()}` : "Not listed") },
  { label: "Mileage", render: (v) => (v.miles < 50 ? "New" : `${v.miles.toLocaleString()} mi`) },
  { label: "MPG / Range", render: (v) => v.mpg },
  { label: "Horsepower", render: (v) => `${v.horsepower} hp` },
  { label: "Drivetrain", render: (v) => v.drivetrain },
  { label: "Fuel", render: (v) => v.fuel },
  { label: "Transmission", render: (v) => v.transmission },
  { label: "Exterior", render: (v) => v.exterior },
  { label: "Interior", render: (v) => v.interior },
];

/** Side-by-side spec comparison for the vehicles picked in the compare tray. */
function CompareModal({ vehicles: list, onClose }: { vehicles: Vehicle[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Vehicle comparison"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Compare vehicles
          </h2>
          <button
            onClick={onClose}
            aria-label="Close comparison"
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32 p-2" />
                {list.map((v) => (
                  <th key={v.id} className="p-2 text-left align-bottom">
                    <img
                      src={v.image}
                      alt={`${v.year} ${v.make} ${v.model}`}
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                    />
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#002c5f]">
                      {v.year} · {v.make}
                    </p>
                    <p className="text-base font-bold leading-tight text-slate-900">
                      {v.model} <span className="font-normal text-slate-500">{v.trim}</span>
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <th className="p-2 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    {row.label}
                  </th>
                  {list.map((v) => (
                    <td key={v.id} className="p-2 font-semibold text-slate-800">
                      {row.render(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-slate-100">
                <th className="p-2" />
                {list.map((v) => (
                  <td key={v.id} className="p-2">
                    <Link
                      to="/vehicle/$id"
                      params={{ id: v.id }}
                      className="inline-flex items-center gap-1 rounded-full bg-[#002c5f] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#001f44]"
                    >
                      View details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buying guide                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Deterministic thousands separator. `toLocaleString()` is locale-dependent and can differ
 * between the Node render and the browser, which surfaces as a hydration mismatch in copy
 * that has to be identical in the server HTML and on screen.
 */
const withCommas = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const money = (n: number) => `$${withCommas(n)}`;

/** "a" / "a and b" / "a, b, and c". Used for both plain strings and link elements. */
function joinPhrase(parts: ReactNode[]): ReactNode {
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 ? (i === parts.length - 1 ? (parts.length === 2 ? " and " : ", and ") : ", ") : null}
      {part}
    </span>
  ));
}

const countWhere = (predicate: (v: Vehicle) => boolean) => vehicles.filter(predicate).length;
const milesIn = (list: Vehicle[]) => list.map((v) => v.miles);

/**
 * Every figure the buying guide states is read from here, which is read from
 * `src/lib/vehicles.ts`. Nothing below is a specification, a rating, an award, an inspection
 * count, or a warranty term: only counts, listed prices, odometer readings, and model years
 * that already exist in the vehicle records. A guide that hardcoded "six vehicles" would be
 * wrong the first time a car sold, which is the failure mode this shape exists to prevent.
 */
const LOT = (() => {
  const newVehicles = vehicles.filter((v) => v.condition === "New");
  const prices = vehicles.map((v) => v.price);
  const allMiles = milesIn(vehicles);
  return {
    total: vehicles.length,
    newCount: newVehicles.length,
    cpoCount: countWhere((v) => v.condition === "Certified Pre-Owned"),
    usedCount: countWhere((v) => v.condition === "Used"),
    priceLow: Math.min(...prices),
    priceHigh: Math.max(...prices),
    milesLow: Math.min(...allMiles),
    milesHigh: Math.max(...allMiles),
    newMilesHigh: newVehicles.length > 0 ? Math.max(...milesIn(newVehicles)) : 0,
    years: [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a),
    types: (FILTER_OPTIONS.types.filter((t) => t !== "All") as Vehicle["type"][])
      .map((type) => ({ type, count: countWhere((v) => v.type === type) }))
      .filter((entry) => entry.count > 0),
    fuels: (FILTER_OPTIONS.fuels.filter((f) => f !== "All") as Vehicle["fuel"][])
      .map((fuel) => ({ fuel, count: countWhere((v) => v.fuel === fuel) }))
      .filter((entry) => entry.count > 0),
    drivetrains: (FILTER_OPTIONS.drivetrains.filter((d) => d !== "All") as Vehicle["drivetrain"][])
      .map((drivetrain) => ({ drivetrain, count: countWhere((v) => v.drivetrain === drivetrain) }))
      .filter((entry) => entry.count > 0),
  };
})();

/** Singular and plural nouns. Exhaustive, so a new body style or fuel fails `tsc` here rather
 * than rendering "1 undefined" into published copy. */
const TYPE_WORDS: Record<Vehicle["type"], [string, string]> = {
  Truck: ["truck", "trucks"],
  SUV: ["SUV", "SUVs"],
  Car: ["car", "cars"],
  EV: ["electric Ford", "electric Fords"],
};
/** Anchor text for the body-style links. Descriptive on its own, as the brief requires, so it
 * still says where it goes when a screen reader reads the links out of context. */
const TYPE_LINK_TEXT: Record<Vehicle["type"], string> = {
  Truck: "Ford trucks in stock",
  SUV: "Ford SUVs in stock",
  Car: "Ford cars in stock",
  EV: "Ford EVs in stock",
};
const FUEL_WORDS: Record<Vehicle["fuel"], string> = {
  Gas: "gas",
  Hybrid: "hybrid",
  Electric: "electric",
};
/** Spelled out, because "3 4WD" is a sentence nobody reads twice. */
const DRIVE_WORDS: Record<Vehicle["drivetrain"], string> = {
  "4WD": "four-wheel drive",
  AWD: "all-wheel drive",
  RWD: "rear-wheel drive",
  FWD: "front-wheel drive",
};

const countedType = (type: Vehicle["type"], count: number) =>
  `${count} ${TYPE_WORDS[type][count === 1 ? 0 : 1]}`;

const PROSE_LINK =
  "font-semibold text-[#002c5f] underline underline-offset-2 decoration-[#002c5f]/40 transition hover:decoration-[#002c5f]";

function GuideTerm({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="border-t border-slate-200 pt-5">
      <dt className="text-sm font-bold tracking-tight text-slate-900">{term}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{children}</dd>
    </div>
  );
}

/**
 * The part of this page written for a person rather than for a crawler: what a lot this size
 * means for how you shop it, what each control does once you get past its label, what the two
 * condition words are actually promising, and what a form submission sets in motion.
 *
 * Server-rendered with no effect gating, no counters that start at zero, and no claim that is
 * not already sitting in the data modules this file imports.
 */
function InventoryBuyingGuide() {
  const rwd = vehicles.filter((v) => v.drivetrain === "RWD");
  const hasHybrid = vehicles.some((v) => v.fuel === "Hybrid");
  const electric = vehicles.filter((v) => v.fuel === "Electric");
  const hasElectric = electric.length > 0;

  /**
   * `type=EV` and `fuel=Electric` are two separate controls, and on a lot this small they can
   * resolve to exactly the same cars, which looks like a bug to anyone clicking both. Say so
   * when it is true, and say nothing when it stops being true, rather than asserting either
   * from memory.
   */
  const evByType = vehicles.filter((v) => v.type === "EV").map((v) => v.id);
  const evOverlapsElectric =
    evByType.length > 0 &&
    evByType.length === electric.length &&
    evByType.every((id) => electric.some((v) => v.id === id));
  const closedDays = dealerInfo.hours
    .filter((h) => h.time.toLowerCase() === "closed")
    .map((h) => h.day);

  const typeLinks = LOT.types.map(({ type }) => (
    <Link key={type} to="/inventory" search={{ type }} className={PROSE_LINK}>
      {TYPE_LINK_TEXT[type]}
    </Link>
  ));

  return (
    <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
          How this page works
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          How to shop this lot
        </h2>

        <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
          AM Ford lists {LOT.total} vehicles today, and this page shows up to {PAGE_SIZE} of them at
          a time. That is short enough to read end to end before you narrow anything down, and
          reading it first is worth the few minutes. On a national listing site, filters exist to
          cut an unreadable list into a readable one. On a lot this size they do something more
          useful: each control answers one question about vehicles you can already see all of, so
          you can use them to test an idea rather than to survive the volume.
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Every vehicle here is a Ford, and the split is {LOT.newCount} new alongside {LOT.cpoCount}{" "}
          certified pre-owned. Listed prices run from {money(LOT.priceLow)} to{" "}
          {money(LOT.priceHigh)}, across model {LOT.years.length === 1 ? "year" : "years"}{" "}
          {joinPhrase(LOT.years.map(String))}. No filter or link on this page leads to a search this
          lot cannot answer, so wherever a control exists, there is at least one vehicle standing
          behind it.
        </p>

        <h3 className="mt-12 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          What the filters actually mean here
        </h3>
        <dl className="mt-6 space-y-5">
          <GuideTerm term="Body style">
            The lot holds {joinPhrase(LOT.types.map(({ type, count }) => countedType(type, count)))}
            . Body style is the fastest first cut because it tracks how a vehicle is used rather
            than how it is badged: an open bed carries loads you would not want inside the cabin, a
            closed cargo area keeps the weather off, and a car sits lower and turns in sharper than
            either. Go straight to the {joinPhrase(typeLinks)}.
          </GuideTerm>

          <GuideTerm term="Drivetrain">
            Currently{" "}
            {joinPhrase(
              LOT.drivetrains.map(({ drivetrain, count }) => `${count} ${DRIVE_WORDS[drivetrain]}`),
            )}
            . From November through March this is the filter that earns its keep here. Four-wheel
            drive is selected when traction runs out and is the usual answer for a vehicle that has
            to pull out of a soft field or an unplowed drive. All-wheel drive works without being
            asked for it, which suits road driving in lake-effect snow.{" "}
            {rwd.length > 0
              ? `Rear-wheel drive, today the ${joinPhraseText(rwd.map((v) => v.model))}, is workable here year round provided you budget for a winter tire set.`
              : null}{" "}
            Drivetrain sits in the filter drawer rather than in the link lists, because it narrows
            the list without changing what kind of vehicle you are shopping for.
          </GuideTerm>

          <GuideTerm term="Fuel">
            Today that is{" "}
            {joinPhrase(LOT.fuels.map(({ fuel, count }) => `${count} ${FUEL_WORDS[fuel]}`))}. Gas is
            the simplest to live with because you refuel wherever you already stop.
            {hasHybrid ? (
              <>
                {" "}
                A{" "}
                <Link to="/inventory" search={{ fuel: "Hybrid" }} className={PROSE_LINK}>
                  hybrid Ford
                </Link>{" "}
                is charged by its own engine and by braking rather than by a plug, so the benefit
                lands in the stop and start driving around town rather than on the highway run to
                Cleveland or Erie.
              </>
            ) : null}
            {hasElectric ? (
              <>
                {" "}
                An{" "}
                <Link to="/inventory" search={{ fuel: "Electric" }} className={PROSE_LINK}>
                  electric Ford
                </Link>{" "}
                is charged where you park, so the question to settle before you buy is less about
                range than about whether a charger can go where you sleep. Ask us about that before
                you commit rather than after.
              </>
            ) : null}{" "}
            If you are weighing one against the other, read{" "}
            <Link to="/compare/f-150-vs-f-150-lightning" className={PROSE_LINK}>
              the F-150 compared with the F-150 Lightning
            </Link>{" "}
            and{" "}
            <Link to="/compare/explorer-vs-escape" className={PROSE_LINK}>
              the Explorer compared with the Escape
            </Link>
            .
            {evOverlapsElectric
              ? ` One thing worth knowing before you click both: the EV body style and the electric fuel filter are separate controls that return the same ${electric.length === 1 ? "vehicle" : "vehicles"} on today's lot, so either one gets you there.`
              : null}
          </GuideTerm>

          <GuideTerm term="Price">
            Listed prices span {money(LOT.priceLow)} to {money(LOT.priceHigh)}, and the price
            shortcuts on this site are cut from that real spread rather than from round numbers, so
            each band has stock behind it. The slider filters the listed price of the vehicle. It
            knows nothing about your trade, your down payment, sales tax, or title fees, which is
            why the figure you finance is worked out with the finance team and not on this page. No
            rate and no monthly payment is published anywhere on this site, because the terms depend
            on the lender and on your application rather than on the car. To turn a listed price
            into a real number, you can{" "}
            <Link to="/financing" className={PROSE_LINK}>
              start a Ford finance application
            </Link>
            ,{" "}
            <Link to="/trade-in" className={PROSE_LINK}>
              have your current vehicle appraised
            </Link>
            , or read{" "}
            <Link to="/finance/bad-credit" className={PROSE_LINK}>
              how financing works when your credit needs rebuilding
            </Link>
            .
          </GuideTerm>

          <GuideTerm term="Mileage">
            Odometer readings across the lot run from {withCommas(LOT.milesLow)} to{" "}
            {withCommas(LOT.milesHigh)} miles. The mileage slider is the quickest way to separate
            delivery miles from real use.
            {LOT.newCount > 0
              ? ` The ${LOT.newCount} new vehicles here read ${withCommas(LOT.newMilesHigh)} miles or fewer, which is transport and lot movement rather than driving.`
              : null}
          </GuideTerm>
        </dl>

        <h3 className="mt-12 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          What the condition labels mean
        </h3>
        <dl className="mt-6 space-y-5">
          <GuideTerm term={`New (${LOT.newCount} of ${LOT.total})`}>
            You are the first name on the title, the equipment is whatever the current model year
            carries, and the odometer reads delivery miles rather than someone else's commute.{" "}
            <Link to="/inventory" search={{ condition: "New" }} className={PROSE_LINK}>
              Browse the new Fords in stock
            </Link>
            .
          </GuideTerm>

          <GuideTerm term={`Certified Pre-Owned (${LOT.cpoCount} of ${LOT.total})`}>
            Certification is the entire difference between a certified pre-owned Ford and an
            ordinary second-hand car. Ford, not the dealership, decides which vehicles are eligible,
            defines the inspection a technician has to complete, and requires the vehicle history to
            be reviewed before anything can be listed as certified. What the coverage includes is
            set by that program and documented for the individual vehicle, so ask us for the
            paperwork on the exact unit you are considering and read it before you sign. We do not
            print a figure or a term for it on this page, because the document that governs it
            travels with the car.{" "}
            <Link
              to="/inventory"
              search={{ condition: "Certified Pre-Owned" }}
              className={PROSE_LINK}
            >
              Browse the certified pre-owned Fords in stock
            </Link>
            .
          </GuideTerm>

          {LOT.usedCount === 0 ? (
            <GuideTerm term="Used (none on the lot)">
              There is no used option in the condition filter, and that is not an oversight. The lot
              holds no used vehicles at all right now, so a used search here would hand you an empty
              page. Everything listed is new or certified pre-owned. If an ordinary used Ford is
              specifically what you are after,{" "}
              <Link to="/contact" className={PROSE_LINK}>
                tell us what you are looking for
              </Link>{" "}
              and we will be straight with you about whether we have it.
            </GuideTerm>
          ) : null}
        </dl>

        <h3 className="mt-12 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          What happens after you enquire
        </h3>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Every form and every phone number on this page reaches the same sales team at{" "}
          {dealerInfo.address}. There is one AM Ford and no branch network, so nobody hands you
          sideways to another store.
        </p>
        <dl className="mt-6 space-y-5">
          <GuideTerm term="If you asked about a specific vehicle">
            We confirm it is still standing here, because a lot this size changes faster than a page
            can, and we send the stock number and the VIN for that exact unit so you can run your
            own history check instead of taking ours on trust.
          </GuideTerm>
          <GuideTerm term="If you have something to trade">
            Send photographs and the mileage and we appraise it against current market data without
            you driving in first. Any make, not only Fords.{" "}
            <Link to="/trade-in" className={PROSE_LINK}>
              Start a trade appraisal
            </Link>
            .
          </GuideTerm>
          <GuideTerm term="If you applied for financing">
            The application goes to the finance team, who come back with the terms a lender will
            write for you. Nothing is approved on this page, and no number is quoted before an
            application exists, which is why you will not find a rate anywhere on this site.{" "}
            <Link to="/financing" className={PROSE_LINK}>
              Apply for Ford financing
            </Link>
            .
          </GuideTerm>
          <GuideTerm term="If you are not local">
            {DELIVERY_CLAIM} The credit application, the trade appraisal, and the paperwork can all
            be completed without a showroom visit, which is the point of that offer rather than a
            footnote to it.{" "}
            <Link to="/nationwide-vehicle-delivery" className={PROSE_LINK}>
              How delivery and shipping work
            </Link>
            .
          </GuideTerm>
          <GuideTerm term="After you take it home">
            Service, parts, and recall work happen at the same address you bought it from.{" "}
            <Link to="/service" className={PROSE_LINK}>
              Book service at the {dealerInfo.locality} shop
            </Link>
            .
          </GuideTerm>
        </dl>

        <p className="mt-8 text-sm leading-relaxed text-slate-500">
          {closedDays.length > 0
            ? `The showroom is closed on ${joinPhraseText(closedDays)}. Any other day, `
            : "Any day we are open, "}
          <a href={dealerInfo.phoneHref} className={PROSE_LINK}>
            {dealerInfo.phone}
          </a>{" "}
          reaches the sales desk directly.
        </p>
      </div>
    </section>
  );
}

/** Plain-text sibling of joinPhrase, for strings interpolated inside a template literal. */
function joinPhraseText(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/** "Your garage" — saved cars with a still-available nudge. */
function SavedCarsStrip() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(getSavedVehicles());
    sync();
    window.addEventListener(GARAGE_EVENT, sync);
    return () => window.removeEventListener(GARAGE_EVENT, sync);
  }, []);

  const saved = ids
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => v !== undefined)
    .slice(0, 4);

  if (saved.length === 0) return null;

  return (
    <div className="mt-14">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
          Your garage
        </p>
        <span className="rounded-full bg-[#002c5f]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#002c5f] ring-1 ring-[#002c5f]/20">
          Still available
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {saved.map((v) => (
          <Link
            key={v.id}
            to="/vehicle/$id"
            params={{ id: v.id }}
            className="group flex items-center gap-3 rounded-2xl border border-[#002c5f]/15 bg-white p-3 shadow-sm transition hover:border-[#002c5f]/35 hover:shadow-md"
          >
            <img
              src={v.image}
              alt={`${v.year} ${v.make} ${v.model}`}
              className="h-14 w-20 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {v.year} {v.model}
              </p>
              <p className="truncate text-xs text-slate-500">{v.trim}</p>
              <p className="text-sm font-extrabold text-[#002c5f]">${v.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** "Recently viewed" mini-cards fed by localStorage from the vehicle detail page. */
function RecentlyViewedStrip() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getRecentlyViewed()), []);

  const recent = ids
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => v !== undefined)
    .slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <div className="mt-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
        Recently viewed
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((v) => (
          <Link
            key={v.id}
            to="/vehicle/$id"
            params={{ id: v.id }}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-[#002c5f]/30 hover:shadow-md"
          >
            <img
              src={v.image}
              alt={`${v.year} ${v.make} ${v.model}`}
              className="h-14 w-20 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {v.year} {v.model}
              </p>
              <p className="truncate text-xs text-slate-500">{v.trim}</p>
              <p className="text-sm font-extrabold text-[#002c5f]">${v.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
