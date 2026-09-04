/**
 * Content transcribed from the live AM Ford homepage (amfordashtabula.com), Aug 2026.
 *
 * WHY THIS FILE EXISTS
 * Everything here is the dealership's own published copy, lineup and offer programmes. It is
 * the difference between writing plausible dealership words and using the real ones. Anything
 * in this file can be shown on the site; anything NOT in this file, and not in vehicles.ts,
 * still needs sign-off before it appears.
 *
 * WHAT IT CORRECTS
 *  - `vehicles.ts` holds six vehicles. The live site sells the full Ford lineup and a used
 *    department including certified pre-owned, used trucks, and stock under $25,000. The six
 *    records are placeholder, not the lot.
 *  - Several "no used inventory" conclusions drawn from that placeholder data were therefore
 *    wrong about the business, though still correct about the data. Copy that mentions used
 *    stock is fine; it just needs inventory behind it.
 */

/** The four things the live homepage puts in front of everything else, in its own order. */
export const PRIMARY_ACTIONS = [
  { label: "New Vehicles", href: "/inventory", search: { condition: "New" } as const },
  // The feed holds six New and one Certified Pre-Owned and zero Used, so a nav item labelled
  // "Used Vehicles" that lands on a one-result filtered page is a worse arrival than the full
  // list, which at least shows the CPO unit in context.
  { label: "Used Vehicles", href: "/inventory" },
  { label: "Schedule Service", href: "/service" },
  { label: "Value Your Trade", href: "/trade-in" },
] as const;

/**
 * The real lineup, grouped as the dealership groups it.
 *
 * `image` is the official Ford render for that model, taken from the same source the live
 * site uses and vendored into src/assets. `hasPage` marks which models have a detail route;
 * never link a model to a page that does not exist.
 */
export type LineupGroup = "SUVs & Cars" | "Trucks & Vans" | "Electric & Hybrid" | "Commercial";

export const LINEUP: {
  group: LineupGroup;
  models: { name: string; slug: string; hasPage: boolean; image: string }[];
}[] = [
  {
    group: "SUVs & Cars",
    models: [
      { name: "Mustang", slug: "mustang", hasPage: true, image: "model-mustang" },
      { name: "Escape", slug: "escape", hasPage: true, image: "model-escape" },
      { name: "Bronco Sport", slug: "bronco-sport", hasPage: false, image: "model-bronco-sport" },
      { name: "Bronco", slug: "bronco", hasPage: true, image: "model-bronco" },
      { name: "Explorer", slug: "explorer", hasPage: true, image: "model-explorer" },
      { name: "Edge", slug: "edge", hasPage: false, image: "model-edge" },
      { name: "Expedition", slug: "expedition", hasPage: false, image: "model-expedition" },
      {
        name: "Mustang Mach-E",
        slug: "mustang-mach-e",
        hasPage: false,
        image: "model-mustang-mach-e",
      },
    ],
  },
  {
    group: "Trucks & Vans",
    models: [
      { name: "Maverick", slug: "maverick", hasPage: false, image: "model-maverick" },
      { name: "Ranger", slug: "ranger", hasPage: false, image: "model-ranger" },
      { name: "F-150", slug: "f-150", hasPage: true, image: "model-f-150" },
      { name: "Super Duty", slug: "super-duty", hasPage: false, image: "model-super-duty" },
      {
        name: "F-150 Lightning",
        slug: "f-150-lightning",
        hasPage: true,
        image: "model-f-150-lightning",
      },
      { name: "Transit", slug: "transit", hasPage: false, image: "model-transit" },
      { name: "E-Transit", slug: "e-transit", hasPage: false, image: "model-e-transit" },
    ],
  },
  {
    group: "Electric & Hybrid",
    models: [
      {
        name: "Mustang Mach-E",
        slug: "mustang-mach-e",
        hasPage: false,
        image: "model-mustang-mach-e",
      },
      {
        name: "F-150 Lightning",
        slug: "f-150-lightning",
        hasPage: true,
        image: "model-f-150-lightning",
      },
      { name: "E-Transit", slug: "e-transit", hasPage: false, image: "model-e-transit" },
      { name: "Maverick", slug: "maverick", hasPage: false, image: "model-maverick" },
      { name: "Escape ST-Line Elite Hybrid", slug: "escape", hasPage: true, image: "model-escape" },
      { name: "Escape Plug-In Hybrid", slug: "escape", hasPage: true, image: "model-escape" },
    ],
  },
  {
    group: "Commercial",
    models: [
      {
        name: "Transit CC-CA",
        slug: "transit-cc-ca",
        hasPage: false,
        image: "model-transit-cc-ca",
      },
      {
        name: "Super Duty Commercial",
        slug: "super-duty",
        hasPage: false,
        image: "model-super-duty",
      },
      { name: "Chassis Cab", slug: "chassis-cab", hasPage: false, image: "model-chassis-cab" },
      { name: "Transit", slug: "transit", hasPage: false, image: "model-transit" },
      { name: "E-Transit", slug: "e-transit", hasPage: false, image: "model-e-transit" },
    ],
  },
];

/**
 * Homepage copy blocks, verbatim from the live site.
 *
 * These are the dealership's own words and carry no unverifiable claim, which is exactly why
 * they are worth keeping over anything invented. Note the trade block: "even if you don't buy
 * from us" is a genuinely good, specific line and it is theirs.
 */
export const HOME_BLOCKS = {
  service: {
    title: "Service for your vehicle, peace of mind for you",
    body: "Get the most out of your vehicle from the techs who know it best.",
    primary: { label: "Schedule service", href: "/service" },
  },
  trade: {
    title: "Sell us your car, even if you don't buy from us.",
    body: "We are always looking for vehicles to stock our lot with. Get an easy, no obligation, online quote for your vehicle.",
    primary: { label: "Appraise my vehicle", href: "/trade-in" },
  },
  finance: {
    title: "Start early, get approved online before you shop.",
    body: "Fill out our quick credit application and we will work with you to find the right vehicle that you can afford.",
    primary: { label: "Apply for financing", href: "/financing" },
  },
  commercial: {
    title: "Built for the road forward",
    body: "Your job has never been tougher, and we will be here to help you keep working. Ford Commercial Vehicles are engineered to withstand the severity of everyday on-the-job duty.",
    primary: { label: "Commercial inventory", href: "/commercial" },
  },
  visit: {
    title: "Located in Jefferson, OH",
    primary: { label: "Get directions", href: "" },
  },
} as const;

/**
 * Live Ford incentive programmes, with the programme numbers and the disclaimer text the
 * manufacturer requires alongside them.
 *
 * These are REAL and carry PGM numbers, unlike the "$500 off" that appears in four
 * contradictory wordings across the app with no voucher, code or expiry anywhere in the
 * system. If an offer is shown on the site, it should be one of these.
 *
 * EVERY ONE OF THESE EXPIRES. `endsOn` is the manufacturer's stated end date; a surface that
 * renders an offer must check it rather than assume. Do not extend a date without the new
 * programme sheet.
 */
export type Incentive = {
  id: string;
  label: string;
  detail: string;
  programme: string;
  endsOn: string;
  disclaimer: string;
};

export const INCENTIVES: Incentive[] = [
  {
    id: "apr-0-36",
    label: "0% APR for 36 months",
    detail: "$27.78 per month per $1,000 financed, regardless of down payment.",
    programme: "PGM #21624",
    endsOn: "2026-08-31",
    disclaimer:
      "Not all buyers will qualify for Ford Credit APR financing. Take new retail delivery or place a new retail order from an authorized Ford Dealer's stock by 8/31/26. See dealer for residency restrictions, qualifications, and details.",
  },
  {
    id: "defer-90",
    label: "Defer your first payment up to 90 days",
    detail: "Available with Ford Credit limited-term financing.",
    programme: "Ford Credit",
    endsOn: "2026-08-31",
    disclaimer:
      "Customer can defer first payment up to 90 days. Not all buyers will qualify for Ford Credit limited-term financing.",
  },
  {
    id: "sse-down-payment",
    label: "$1,000 Summer Sales Event Down Payment Assistance",
    detail: "Applied at signing.",
    programme: "PGM #14196",
    endsOn: "2026-08-31",
    disclaimer: "Must qualify for all rebates and programmes. See dealer for details.",
  },
  {
    id: "maintenance-2yr",
    label: "Complimentary 2-year Premium Maintenance Plan",
    detail: "On select Ford vehicles. 2 years or 25,000 miles, whichever comes first.",
    programme: "PGM #76324",
    endsOn: "2026-08-31",
    disclaimer:
      "Coverage begins at the new vehicle limited warranty start date. Transferrable for a fee. Available on select Ford vehicles only.",
  },
];

/** True while at least one incentive is still inside its stated window. */
export function activeIncentives(today: Date): Incentive[] {
  return INCENTIVES.filter((i) => new Date(i.endsOn) >= today);
}

/**
 * The dealership's own pricing stance, run as a banner across the top of the live homepage.
 *
 * This is what stands behind the "Want a lower price? Ask us" affordance on vehicle cards.
 * Note it is THEIR claim, published by them. It is reproduced, not invented. It is also a
 * strong claim, so it should not be restated in stronger words anywhere else.
 */
/**
 * SOURCED: provided by the client, in writing, in the August 2026 re-art-direction brief:
 * "Family-owned since 1964 ... 60+ years of serving the community." This project previously
 * DELETED an "Established 1964" claim because no source existed. The client's own brief is
 * the source. Derive "60+ years" from the year rather than hardcoding a number that goes
 * stale.
 */
export const FOUNDED_YEAR = 1964;
export const yearsServing = (now: Date) => now.getFullYear() - FOUNDED_YEAR;

export const PRICING_STANCE = "We will beat any deal";

/** Communities the live site names. Cross-check against SERVED_MARKETS in vehicles.ts. */
export const NAMED_AREAS = [
  "Ashtabula",
  "Cleveland",
  "Erie",
  "Warren",
  "Geneva",
  "Chardon",
  "Painesville",
  "Madison",
] as const;
