import { Link } from "@tanstack/react-router";
import {
  FILTER_OPTIONS,
  PRICE_BANDS,
  vehicles,
  type PriceBand,
  type Vehicle,
} from "@/lib/vehicles";
import { SERVICE_AREAS } from "@/lib/serviceAreas";
import { COUNTIES } from "@/lib/counties";
import { FORD_MODELS } from "@/lib/fordModels";
import { COMPARISONS, GUIDES, comparePath, guidePath } from "@/lib/contentPages";
import { cn } from "@/lib/utils";

/**
 * "Frequent Searches Leading to This Page" internal-link hub.
 *
 * Modelled on the dense grouped link block marketplaces run above the footer: a heading per
 * group and a row of pipe separated text links. Two rules hold this file together.
 *
 * 1. EVERY list is derived from the data modules, never from a slug list typed in here. Add a
 *    city to serviceAreas.ts, a guide to contentPages.ts, or a vehicle to vehicles.ts and the
 *    block picks it up. Nothing here can drift out of step with the routes that exist.
 * 2. Nothing links to a search that returns an empty page. Body styles, fuels, price bands, and
 *    conditions are all filtered against the live `vehicles` array before they are rendered, so
 *    a link can only exist if the lot can answer it.
 *
 * The heading is the wording the client asked for. It is the only claim in the block: there is
 * no search volume, ranking, popularity, or trend claim anywhere here, because we hold no data
 * that would support one.
 */

/** The slice of the /inventory search contract these links use. Kept local so this component
 * never imports the inventory route module (which imports this one). */
type InventoryLinkSearch = {
  type?: Vehicle["type"];
  fuel?: Vehicle["fuel"];
  condition?: Vehicle["condition"];
  priceMin?: number;
  priceMax?: number;
};

export type FrequentSearchItem =
  | { key: string; label: string; kind: "inventory"; search: InventoryLinkSearch }
  | { key: string; label: string; kind: "model"; slug: string }
  | { key: string; label: string; kind: "city"; slug: string }
  | { key: string; label: string; kind: "county"; slug: string }
  | { key: string; label: string; kind: "static"; to: string };

export type FrequentSearchGroupId =
  | "models"
  | "bodyStyle"
  | "fuel"
  | "price"
  | "condition"
  | "nearby"
  | "research";

export type FrequentSearchGroup = {
  id: FrequentSearchGroupId;
  heading: string;
  items: FrequentSearchItem[];
};

/** Which page this block is rendered on. Each variant gets its own, relevant set of groups
 * rather than the same wall of links repeated. */
export type FrequentSearchesVariant = "inventory" | "vehicle";

const VARIANT_GROUPS: Record<FrequentSearchesVariant, FrequentSearchGroupId[]> = {
  // Someone on the listing is narrowing down, so the refinement axes lead.
  inventory: ["bodyStyle", "price", "fuel", "condition", "nearby"],
  // Someone on a single vehicle is cross shopping, so models and research lead.
  vehicle: ["models", "research", "condition", "nearby"],
};

/* -------------------------------------------------------------------------- */
/* Anchor text                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Anchors have to read like something a person types into a search box, and they must not all
 * read like the same thing. Each family below rotates through several phrasings rather than
 * stamping one template across the block.
 */
const rotate = <T,>(templates: readonly T[], index: number): T =>
  templates[index % templates.length];

/** Exhaustive on Vehicle["type"], so a new body style fails the type check instead of
 * silently rendering an unlabelled filter. */
const TYPE_NOUN: Record<Vehicle["type"], string> = {
  Truck: "Ford trucks",
  SUV: "Ford SUVs",
  Car: "Ford cars",
  EV: "Electric Fords",
};

/** Same nouns, cased for use after an adjective ("New electric Fords"). */
const TYPE_NOUN_MID: Record<Vehicle["type"], string> = {
  Truck: "Ford trucks",
  SUV: "Ford SUVs",
  Car: "Ford cars",
  EV: "electric Fords",
};

const TYPE_TEMPLATES: ((noun: string) => string)[] = [
  (n) => `${n} for sale in Jefferson OH`,
  (n) => `${n} near Ashtabula`,
  (n) => `${n} available in Jefferson, Ohio`,
  (n) => `${n} for Northeast Ohio drivers`,
];

const FUEL_LABEL: Record<Vehicle["fuel"], string> = {
  Gas: "Gas powered Fords for sale near Ashtabula",
  Hybrid: "Hybrid Fords in Jefferson OH",
  Electric: "Electric Ford models in stock",
};

const PRICE_TEMPLATES: ((band: string) => string)[] = [
  (b) => `Fords priced ${b}`,
  (b) => `Ford models from ${b}`,
  (b) => `Ford stock in the ${b} range`,
  (b) => `Fords near Ashtabula priced ${b}`,
];

const CONDITION_LABEL: Record<Vehicle["condition"], string> = {
  New: "New Fords for sale in Jefferson OH",
  "Certified Pre-Owned": "Certified pre-owned Fords near Ashtabula",
  Used: "Used vehicles for sale near Ashtabula",
};

const CONDITION_ADJECTIVE: Record<Vehicle["condition"], string> = {
  New: "New",
  "Certified Pre-Owned": "Certified pre-owned",
  Used: "Used",
};

const CONDITION_TYPE_TEMPLATES: ((adjective: string, noun: string) => string)[] = [
  (a, n) => `${a} ${n} near Ashtabula`,
  (a, n) => `${a} ${n} in Jefferson OH`,
  (a, n) => `${a} ${n} on the lot today`,
  (a, n) => `${a} ${n} for Ashtabula County drivers`,
];

const MODEL_TEMPLATES: ((name: string) => string)[] = [
  (m) => `${m} for sale in Jefferson OH`,
  (m) => `${m} near Ashtabula OH`,
  (m) => `${m} trims, specs, and current stock`,
  (m) => `${m} at a Ford dealer in Ashtabula County`,
  (m) => `${m} for Northeast Ohio drivers`,
  (m) => `Buying a ${m} in Jefferson OH`,
];

/** Every city phrasing says "near" or "serving". AM Ford has one location, in Jefferson, so no
 * anchor may read as a branch in the city it names. */
const CITY_TEMPLATES: ((city: string, state: string) => string)[] = [
  (c, s) => `Ford dealer near ${c}, ${s}`,
  (c) => `Ford trucks and SUVs for ${c} drivers`,
  (c, s) => `Ford dealership serving ${c}, ${s}`,
  (c) => `Buying a Ford from ${c}`,
];

const NEIGHBORING_COUNTY_TEMPLATES: ((county: string) => string)[] = [
  (c) => `Ford dealer serving ${c}`,
  (c) => `${c} Ford trucks and SUVs`,
  (c) => `Buying a Ford from ${c}`,
];

/* -------------------------------------------------------------------------- */
/* Item builders, all derived from real data                                   */
/* -------------------------------------------------------------------------- */

/** Body styles the lot can actually answer, in FILTER_OPTIONS order. */
const stockedTypes = (): Vehicle["type"][] =>
  FILTER_OPTIONS.types.filter(
    (t): t is Vehicle["type"] => t !== "All" && vehicles.some((v) => v.type === t),
  );

const stockedFuels = (): Vehicle["fuel"][] =>
  FILTER_OPTIONS.fuels.filter(
    (f): f is Vehicle["fuel"] => f !== "All" && vehicles.some((v) => v.fuel === f),
  );

/**
 * Conditions a link is allowed to filter on: the ones actually on the lot.
 */
const LINKABLE_CONDITIONS: Vehicle["condition"][] = [
  ...new Set(vehicles.map((v) => v.condition)),
];

const bandHasStock = (band: PriceBand) =>
  vehicles.some((v) => v.price >= band.priceMin && v.price <= band.priceMax);

export const modelItems = (): FrequentSearchItem[] =>
  FORD_MODELS.map((model, i) => ({
    key: `model-${model.slug}`,
    label: rotate(MODEL_TEMPLATES, i)(model.name),
    kind: "model",
    slug: model.slug,
  }));

export const bodyStyleItems = (): FrequentSearchItem[] =>
  stockedTypes().map((type, i) => ({
    key: `type-${type}`,
    label: rotate(TYPE_TEMPLATES, i)(TYPE_NOUN[type]),
    kind: "inventory",
    search: { type },
  }));

export const fuelItems = (): FrequentSearchItem[] =>
  stockedFuels().map((fuel) => ({
    key: `fuel-${fuel}`,
    label: FUEL_LABEL[fuel],
    kind: "inventory",
    search: { fuel },
  }));

export const priceItems = (): FrequentSearchItem[] =>
  PRICE_BANDS.filter(bandHasStock).map((band, i) => ({
    key: `price-${band.priceMin}-${band.priceMax}`,
    label: rotate(PRICE_TEMPLATES, i)(band.label),
    kind: "inventory",
    search: { priceMin: band.priceMin, priceMax: band.priceMax },
  }));

/**
 * One link per condition, then one per condition and body style pair that exists on the lot.
 * Both halves are read off `vehicles`, so every combination returns at least one result.
 */
export const conditionItems = (): FrequentSearchItem[] => {
  const items: FrequentSearchItem[] = LINKABLE_CONDITIONS.map((condition) => ({
    key: `condition-${condition}`,
    label: CONDITION_LABEL[condition],
    kind: "inventory",
    search: { condition },
  }));

  let i = 0;
  for (const condition of LINKABLE_CONDITIONS) {
    const types = stockedTypes().filter((t) =>
      vehicles.some((v) => v.condition === condition && v.type === t),
    );
    for (const type of types) {
      items.push({
        key: `condition-${condition}-${type}`,
        label: rotate(CONDITION_TYPE_TEMPLATES, i)(
          CONDITION_ADJECTIVE[condition],
          TYPE_NOUN_MID[type],
        ),
        kind: "inventory",
        search: { condition, type },
      });
      i++;
    }
  }
  return items;
};

export const cityItems = (): FrequentSearchItem[] =>
  SERVICE_AREAS.map((area, i) => ({
    key: `city-${area.slug}`,
    label: rotate(CITY_TEMPLATES, i)(area.city, area.state),
    kind: "city",
    slug: area.slug,
  }));

export const countyItems = (): FrequentSearchItem[] => {
  let neighboring = 0;
  return COUNTIES.map((county) => {
    // The home county is the one the dealership stands in, so it is the only one that gets
    // "in" rather than "serving". The distinction comes from the data, not from a slug test.
    const label =
      county.relation === "home"
        ? `Ford dealer in ${county.county}`
        : rotate(NEIGHBORING_COUNTY_TEMPLATES, neighboring++)(county.county);
    return { key: `county-${county.slug}`, label, kind: "county", slug: county.slug };
  });
};

export const guideItems = (): FrequentSearchItem[] =>
  GUIDES.map((guide) => ({
    key: `guide-${guide.slug}`,
    // Guide titles are already written as the question a buyer types, so they are the
    // anchor. Rewriting them here would only let the two drift apart.
    label: guide.title,
    kind: "static",
    to: guidePath(guide),
  }));

export const compareItems = (): FrequentSearchItem[] =>
  COMPARISONS.map((comparison) => ({
    key: `compare-${comparison.slug}`,
    label: comparison.title,
    kind: "static",
    to: comparePath(comparison),
  }));

const GROUP_BUILDERS: Record<
  FrequentSearchGroupId,
  { heading: string; build: () => FrequentSearchItem[] }
> = {
  models: { heading: "Ford models we stock", build: modelItems },
  bodyStyle: { heading: "Shop by body style", build: bodyStyleItems },
  fuel: { heading: "Shop by fuel", build: fuelItems },
  price: { heading: "Shop by price", build: priceItems },
  condition: { heading: "New and certified pre-owned", build: conditionItems },
  nearby: { heading: "Ford dealer near you", build: () => [...cityItems(), ...countyItems()] },
  research: { heading: "Research and compare", build: () => [...guideItems(), ...compareItems()] },
};

/** Groups with their items, in the order requested. A group that would render empty is
 * dropped rather than shown as a heading with nothing under it. */
export function buildFrequentSearchGroups(ids: FrequentSearchGroupId[]): FrequentSearchGroup[] {
  return ids
    .map((id) => ({ id, heading: GROUP_BUILDERS[id].heading, items: GROUP_BUILDERS[id].build() }))
    .filter((group) => group.items.length > 0);
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One link. `min-h-6` keeps every target at or above the 24px minimum, and the focus ring is
 * drawn in `currentColor` so the same component stays visible on the light hub block and on
 * the navy footer without either caller restyling it.
 */
export function FrequentSearchLink({
  item,
  className,
  onNavigate,
}: {
  item: FrequentSearchItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const cls = cn(
    "inline-flex min-h-6 max-w-full items-center rounded-sm py-1 leading-snug break-words",
    "underline-offset-2 hover:underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
    className,
  );

  switch (item.kind) {
    case "inventory":
      return (
        <Link to="/inventory" search={item.search} className={cls} onClick={onNavigate}>
          {item.label}
        </Link>
      );
    case "model":
      return (
        <Link to="/ford/$model" params={{ model: item.slug }} className={cls} onClick={onNavigate}>
          {item.label}
        </Link>
      );
    case "city":
      return (
        <Link
          to="/ford-dealer/$city"
          params={{ city: item.slug }}
          className={cls}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      );
    case "county":
      return (
        <Link
          to="/ford-dealer/county/$county"
          params={{ county: item.slug }}
          className={cls}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      );
    case "static":
      return (
        <Link to={item.to} className={cls} onClick={onNavigate}>
          {item.label}
        </Link>
      );
  }
}

/**
 * A pipe separated row of links under one heading.
 *
 * The pipes are `aria-hidden` decoration, so a screen reader hears a plain list of links and
 * not "F-150 vertical bar Mustang vertical bar". The list is labelled by its own heading, which
 * is what stops a block this size from being an undifferentiated pile of anchors.
 */
export function FrequentSearchRow({
  group,
  headingClassName,
  linkClassName,
  separatorClassName,
  idPrefix,
  onNavigate,
}: {
  group: FrequentSearchGroup;
  headingClassName: string;
  linkClassName: string;
  separatorClassName: string;
  idPrefix: string;
  onNavigate?: () => void;
}) {
  const headingId = `${idPrefix}-${group.id}`;
  return (
    <div>
      <h3 id={headingId} className={headingClassName}>
        {group.heading}
      </h3>
      <ul aria-labelledby={headingId} className="mt-1.5 flex flex-wrap items-center gap-x-1">
        {group.items.map((item, index) => (
          <li key={item.key} className="flex max-w-full items-center">
            {index > 0 && (
              <span aria-hidden="true" className={cn("select-none pr-1", separatorClassName)}>
                |
              </span>
            )}
            <FrequentSearchLink item={item} className={linkClassName} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FrequentSearches({
  variant,
  groups,
  className,
}: {
  variant: FrequentSearchesVariant;
  /** Overrides the variant preset when a page needs a bespoke set. */
  groups?: FrequentSearchGroupId[];
  className?: string;
}) {
  const built = buildFrequentSearchGroups(groups ?? VARIANT_GROUPS[variant]);
  if (built.length === 0) return null;

  const endId = `frequent-searches-end-${variant}`;

  return (
    <section className={cn("border-t border-slate-200 bg-slate-50 py-10 sm:py-12", className)}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <nav aria-label="Frequent searches leading to this page">
          {/* A block this long needs a way past it. Hidden until it takes focus, then visible. */}
          <a
            href={`#${endId}`}
            className="sr-only focus:not-sr-only focus:mb-3 focus:inline-flex focus:min-h-6 focus:items-center focus:rounded-lg focus:bg-[#002c5f] focus:px-3 focus:py-1.5 focus:text-xs focus:font-bold focus:text-white"
          >
            Skip past the frequent searches
          </a>

          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
            Frequent Searches Leading to This Page
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Every link opens a page on this site, and each filtered search runs against the Ford
            stock standing in Jefferson today.
          </p>

          <div className="mt-6 space-y-4">
            {built.map((group) => (
              <div
                key={group.id}
                className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0"
              >
                <FrequentSearchRow
                  group={group}
                  idPrefix={`fs-${variant}`}
                  headingClassName="text-[11px] font-bold tracking-[0.18em] text-[#002c5f] uppercase"
                  linkClassName="px-0.5 text-[13px] font-medium text-slate-700 hover:text-[#002c5f]"
                  separatorClassName="text-slate-300"
                />
              </div>
            ))}
          </div>

          <span id={endId} tabIndex={-1} className="sr-only">
            End of the frequent searches links
          </span>
        </nav>
      </div>
    </section>
  );
}
