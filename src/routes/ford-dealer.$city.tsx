import type { ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  Car,
  CreditCard,
  Wrench,
  Truck,
  CheckCircle2,
  Compass,
  Search,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";
import { getServiceArea, type ServiceArea } from "@/lib/serviceAreas";
import { getCountyForCity } from "@/lib/counties";
import { getFordModel, type FordModel } from "@/lib/fordModels";
import type { InventorySearch } from "@/routes/inventory";

const SITE_ORIGIN = "https://amford.com";

/** Titles say "OH"; body copy says "Ohio". Both come from the same two-letter source. */
const STATE_NAMES: Record<ServiceArea["state"], string> = {
  OH: "Ohio",
  PA: "Pennsylvania",
};

/**
 * One source for the trail on this route: head() feeds it to breadcrumbSchema() and the
 * component feeds the same call to <Breadcrumbs>, so the rendered labels and the
 * structured data are the same strings by construction.
 */
const cityCrumbs = (area: ServiceArea) =>
  crumbs(
    { label: "Areas We Serve", href: "/areas-we-serve" },
    { label: `Ford Dealer Near ${area.city}, ${area.state}` },
  );

/** /inventory params that are numbers in the URL schema; everything else stays a string. */
const NUMERIC_SEARCH_KEYS = ["year", "priceMin", "priceMax", "milesMin", "milesMax", "page"];
const STRING_SEARCH_KEYS = ["q", "type", "fuel", "drive", "trans", "badges", "sort"];

/**
 * popularWith entries arrive from the data file as plain string maps, but /inventory types
 * its search params. Unknown keys are dropped and numeric keys are coerced here, so a typo
 * in the data can never build a deep link the inventory validator silently discards.
 */
function toInventorySearch(raw: Record<string, string>): InventorySearch {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (NUMERIC_SEARCH_KEYS.includes(key)) {
      const n = Number(value);
      if (Number.isFinite(n)) out[key] = n;
    } else if (STRING_SEARCH_KEYS.includes(key)) {
      out[key] = value;
    }
  }
  return out as InventorySearch;
}

/** One featured model on a city page: which model, and why it suits that community. */
type ModelPick = { slug: string; why: string };

/**
 * Which Ford models lead on which city page.
 *
 * Keyed by area slug so no two city pages carry the same lineup, which the brief requires.
 * The order follows the dominant need already recorded in that ServiceArea entry: snowbelt
 * and harbor towns lead with four-wheel drive, commuter and cross-border towns lead with the
 * hybrid, and the metro page leads with what parks in a city garage. Every reason below is
 * traceable to that area's own localNeeds or uniqueSection, so nothing here is invented.
 */
const MODEL_PICKS: Record<string, ModelPick[]> = {
  "ashtabula-oh": [
    {
      slug: "f-150",
      why: "Boat trailers heading to the harbor ramps and a bed that works every weekday are the two jobs named most here, and the F-150 is configured in enough ways to cover both.",
    },
    {
      slug: "explorer",
      why: "Three rows plus available all-wheel drive for households that run south on Route 11 as often as they drive across town.",
    },
    {
      slug: "escape",
      why: "Easy to place in the older neighborhood grids near the lake, and the hybrid version suits the short trips around the Bridge Street district.",
    },
    {
      slug: "f-150-lightning",
      why: "Worth a look if you can charge overnight at home and want onboard power for tools on a job site instead of hauling a generator.",
    },
  ],
  "geneva-oh": [
    {
      slug: "explorer",
      why: "A third row for the households that host visitors all summer, and a flat load floor once the season is over.",
    },
    {
      slug: "f-150",
      why: "Stock, tables, coolers, and equipment trailers through the season, with a hitch setup matched to the loaded weight you actually pull.",
    },
    {
      slug: "bronco",
      why: "Removable roof panels suit a short open-air season on the lakeshore, and the same vehicle stays capable once the weather turns.",
    },
    {
      slug: "mustang",
      why: "Owners here run one on the same calendar the town keeps: the Grand River valley two-lane routes and the drive out to Geneva-on-the-Lake through the warm months, then covered up once the salt goes down.",
    },
  ],
  "conneaut-oh": [
    {
      slug: "escape",
      why: "The hybrid does its best work in stop-and-go driving, which is most of what a weekly run across the Pennsylvania line involves at either end.",
    },
    {
      slug: "explorer",
      why: "Settles down at Interstate 90 speeds, with all-wheel drive available for lakeshore roads where snow drifts across before the plows arrive.",
    },
    {
      slug: "f-150-lightning",
      why: "If your driveway can take a Level 2 charger, overnight charging at a Conneaut home covers the large majority of local driving.",
    },
    {
      slug: "f-150",
      why: "Four-wheel drive and a bed for hauling between the harbor, the creek, and the state line.",
    },
  ],
  "austinburg-oh": [
    {
      slug: "escape",
      why: "Commuting mileage adds up faster than most buyers estimate, and the hybrid is at its best in the town driving at both ends of an Interstate 90 run.",
    },
    {
      slug: "f-150-lightning",
      why: "A predictable daily commute and somewhere to charge overnight are exactly the conditions this truck was built around.",
    },
    {
      slug: "explorer",
      why: "Room for the family plus available all-wheel drive for township roads that get cleared after the interstate does.",
    },
    {
      slug: "f-150",
      why: "Still the pick when the commute ends at a job site rather than an office, and the interchange makes the run in either direction easy.",
    },
  ],
  "madison-oh": [
    {
      slug: "explorer",
      why: "Covers a school run and a highway commute in the same morning, and the third row earns its keep on the days you carry someone else's kids.",
    },
    {
      slug: "escape",
      why: "A practical second vehicle for the household where one car goes west on Interstate 90 every weekday.",
    },
    {
      slug: "f-150",
      why: "Garden supplies, weekend hauling, and a hitch for whatever the trailer happens to be that month.",
    },
    {
      slug: "mustang",
      why: "A second car that earns its keep from spring through late fall on the two-lane routes east of town, then gets parked for the months when rear-wheel drive and road salt argue with each other.",
    },
  ],
  "chardon-oh": [
    {
      slug: "f-150",
      why: "Four-wheel drive for hill starts on packed snow and long rural driveways, which is the brief Geauga County buyers usually arrive with.",
    },
    {
      slug: "bronco",
      why: "Body-on-frame ground clearance for township roads that have not been plowed yet, which stops a low vehicle long before traction becomes the issue.",
    },
    {
      slug: "explorer",
      why: "Available all-wheel drive and three rows for families who want winter traction without moving up to a full-size truck.",
    },
    {
      slug: "escape",
      why: "Available all-wheel drive in a smaller crossover, for drivers who want traction without a large vehicle to place in a parking lot.",
    },
  ],
  "erie-pa": [
    {
      slug: "explorer",
      why: "Three rows and available all-wheel drive for a lakeshore winter that runs long on the Pennsylvania side, and it can be delivered to an Erie address.",
    },
    {
      slug: "f-150",
      why: "Four-wheel drive and a bed, with the Pennsylvania title and registration work confirmed before the truck leaves Jefferson.",
    },
    {
      slug: "escape",
      why: "A smaller crossover with all-wheel drive available, easy to live with across the mix of city streets and open road around the bay.",
    },
    {
      slug: "bronco",
      why: "Removable roof panels for the short open-air season, and genuine capability once the snow reaches the Erie lakeshore.",
    },
  ],
  "cleveland-oh": [
    {
      slug: "escape",
      why: "Sized for a city garage and a tight street space, and the hybrid is at its best in the stop-and-go driving a Cuyahoga County week is made of.",
    },
    {
      slug: "f-150-lightning",
      why: "Makes sense for households with home or workplace charging, and we will measure the truck against your garage door before you commit.",
    },
    {
      slug: "mustang",
      why: "A rear-wheel-drive coupe that works as a second car from spring through late fall, which is how nearly every owner in this region runs one.",
    },
    {
      slug: "explorer",
      why: "Three rows and available all-wheel drive, with photos and a walkaround video of the actual vehicle before it reaches your driveway.",
    },
  ],
};

/** Used only if a service area is added without its own lineup, so the block is never empty. */
const FALLBACK_PICKS: ModelPick[] = [
  {
    slug: "f-150",
    why: "The full-size pickup this county buys more than any other, with four-wheel drive offered across most of the lineup.",
  },
  {
    slug: "explorer",
    why: "A three-row SUV with all-wheel drive available, which is the combination Northeast Ohio families ask us for most.",
  },
  {
    slug: "escape",
    why: "A compact crossover that is easy to park, with a hybrid version suited to mixed town and open road driving.",
  },
];

/** Resolves the slugs above against FORD_MODELS so a stale slug drops out instead of 404ing. */
function modelPicksFor(area: ServiceArea): { model: FordModel; why: string }[] {
  return (MODEL_PICKS[area.slug] ?? FALLBACK_PICKS)
    .map((pick) => ({ model: getFordModel(pick.slug), why: pick.why }))
    .filter((pick): pick is { model: FordModel; why: string } => pick.model !== undefined);
}

/** The single line a city page uses to point up at its county page. */
type CountyLinkCopy = { lead: string; anchor: string };

/**
 * Up-links to /ford-dealer/county/{slug}, written once per city rather than once per site.
 *
 * Keyed by city slug for exactly the reason MODEL_PICKS is: six of these eight pages sit in
 * a county that has a page, and one templated sentence rendered across all six would be a
 * shared run of text on near-identical pages, which is the pattern this route was rebuilt to
 * remove. No two leads below share a clause, and every anchor names its own county.
 *
 * Four of the six point at the same county page. Their anchors are still worded four
 * different ways, so the Ashtabula County page collects four distinct descriptive anchors
 * instead of the same phrase four times.
 */
const COUNTY_LINK_COPY: Record<string, CountyLinkCopy> = {
  "ashtabula-oh": {
    lead: "This whole run stays inside one county. ",
    anchor: "How AM Ford covers the whole of Ashtabula County",
  },
  "geneva-oh": {
    lead: "Geneva, the Grand River valley, and Jefferson share a county. ",
    anchor: "Ford sales and service across Ashtabula County",
  },
  "conneaut-oh": {
    lead: "The state line is close by, but this drive crosses no county line at all. ",
    anchor: "Buying a Ford inside Ashtabula County",
  },
  "austinburg-oh": {
    lead: "The interchange and our showroom are in the same county. ",
    anchor: "Every corner of Ashtabula County we sell and service in",
  },
  "madison-oh": {
    lead: "Madison sits at the eastern edge of Lake County. ",
    anchor: "A Ford dealer for the Lake County commute",
  },
  "chardon-oh": {
    lead: "Chardon is the Geauga County seat. ",
    anchor: "Ford trucks and SUVs for the Geauga County snowbelt",
  },
};

/**
 * The county page this city belongs under, or null when there is nothing to link to.
 *
 * getCountyForCity is built from the county file's own childCitySlugs, so a city in a county
 * without a page returns undefined and this renders NOTHING. That is what keeps Erie, PA
 * (Erie County) and Cleveland (Cuyahoga County) from carrying a link to a page that does not
 * exist. The fallback covers the other direction: a city added to a county's children later
 * still gets a working descriptive anchor before anyone writes a line for it.
 */
function countyLinkFor(area: ServiceArea): { slug: string; copy: CountyLinkCopy } | null {
  const county = getCountyForCity(area.slug);
  if (!county) return null;
  return {
    slug: county.slug,
    copy: COUNTY_LINK_COPY[area.slug] ?? {
      lead: "",
      anchor: `Ford dealer coverage across ${county.county}`,
    },
  };
}

/**
 * One "Next steps" tile: an icon and a descriptive link, and nothing else.
 *
 * The descriptive sentence that used to sit under each link was identical on all eight city
 * pages and counted as page content. Stripped, the grid is unambiguously navigation.
 */
function StepCard({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-bold text-ink">{children}</h3>
    </div>
  );
}

const stepLinkClass = "inline-block py-1 text-primary hover:underline";

/**
 * The order the tiles appear in, keyed off the same proximity field that decides the closing
 * block. Two orders rather than one is also what stops this grid from being a single
 * unbroken run of text repeated verbatim across all eight pages.
 */
const NEXT_STEP_ORDER: Record<ServiceArea["proximity"], string[]> = {
  "in-county": ["inventory", "service", "trade", "financing", "delivery", "contact"],
  extended: ["delivery", "inventory", "trade", "financing", "service", "contact"],
};

function nextStepsFor(area: ServiceArea): ReactNode[] {
  const cards: Record<string, ReactNode> = {
    inventory: (
      <StepCard key="inventory" icon={Car}>
        <Link to="/inventory" className={stepLinkClass}>
          Browse Ford trucks, SUVs, and cars in stock
        </Link>
      </StepCard>
    ),
    financing: (
      <StepCard key="financing" icon={CreditCard}>
        <Link to="/financing" className={stepLinkClass}>
          Apply for vehicle financing
        </Link>
      </StepCard>
    ),
    trade: (
      <StepCard key="trade" icon={Tag}>
        <Link to="/trade-in" className={stepLinkClass}>
          Value Your Trade
        </Link>
      </StepCard>
    ),
    service: (
      <StepCard key="service" icon={Wrench}>
        <Link to="/service" className={stepLinkClass}>
          Schedule Ford service and maintenance
        </Link>
      </StepCard>
    ),
    delivery: (
      <StepCard key="delivery" icon={Truck}>
        <Link to="/nationwide-vehicle-delivery" className={stepLinkClass}>
          How home delivery and vehicle shipping work
        </Link>
      </StepCard>
    ),
    contact: (
      <StepCard key="contact" icon={Phone}>
        <Link to="/contact" className={stepLinkClass}>
          Contact the AM Ford team
        </Link>
      </StepCard>
    ),
  };

  return NEXT_STEP_ORDER[area.proximity].map((key) => cards[key]).filter(Boolean);
}

export const Route = createFileRoute("/ford-dealer/$city")({
  loader: ({ params }) => {
    const area = getServiceArea(params.city);
    if (!area) throw notFound();
    return { area };
  },
  head: ({ loaderData }) => {
    const area = loaderData?.area;
    if (!area) return { meta: [{ title: "Areas We Serve | AM Ford" }] };

    const stateName = STATE_NAMES[area.state];
    const canonical = `${SITE_ORIGIN}/ford-dealer/${area.slug}`;

    /**
     * The address block is the Jefferson showroom on every one of these pages. Only
     * areaServed changes per city, because implying a storefront in the target town would
     * be a false local-business signal.
     */
    const dealerSchema = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      // Same @id as the site-wide node in __root.tsx: this is one dealership
      // described from a local page, not a second location.
      "@id": "https://amford.com/#dealer",
      name: dealerInfo.name,
      url: canonical,
      telephone: dealerInfo.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: dealerInfo.street,
        addressLocality: dealerInfo.locality,
        addressRegion: dealerInfo.region,
        postalCode: dealerInfo.postalCode,
        addressCountry: "US",
      },
      areaServed: {
        "@type": "City",
        name: area.city,
        address: {
          "@type": "PostalAddress",
          addressLocality: area.city,
          addressRegion: area.state,
          addressCountry: "US",
        },
      },
    };

    return {
      meta: [
        // Title, description and og:title are written per area in serviceAreas.ts. A shared
        // template here is exactly what made all eight pages interchangeable, so the route
        // is not allowed to compose them. Titles are authored under 60 characters with the
        // brand already included; descriptions under 155, which is why DELIVERY_CLAIM stays
        // in og:description and the page body rather than being concatenated in here.
        { title: area.title },
        { name: "description", content: area.metaDescription },
        {
          name: "keywords",
          content: [
            `Ford dealer near ${area.city} ${area.state}`,
            `Ford dealership near ${area.city}`,
            `new Ford ${area.city} ${area.state}`,
            // No "used trucks near" line: inventory today is new plus one certified
            // pre-owned vehicle, so that keyword advertises stock we do not have.
            `new Ford trucks and SUVs near ${area.city}`,
            `certified pre-owned ${area.city} ${area.state}`,
            `Ford service near ${area.city}`,
            `car financing ${area.city} ${area.state}`,
            `trade in appraisal ${area.city}`,
            `AM Ford ${dealerInfo.locality} Ohio`,
          ].join(", "),
        },
        { property: "og:title", content: `${area.h1} | ${dealerInfo.name}` },
        {
          property: "og:description",
          content: `AM Ford is located at ${dealerInfo.address} and serves drivers from ${area.city}, ${stateName}. ${DELIVERY_CLAIM}`,
        },
        { property: "og:type", content: "website" },
        // Without this the root default wins and every city page shares the homepage URL.
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema(cityCrumbs(area))),
        },
        { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="display text-4xl sm:text-5xl">We do not have a page for that town yet</h1>
        <p className="mt-3 text-muted-foreground">
          AM Ford is in {dealerInfo.locality}, Ohio and serves drivers well beyond the communities
          with their own page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/areas-we-serve"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            See every area AM Ford serves <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
          >
            Contact the AM Ford team
          </Link>
        </div>
      </div>
    </SiteShell>
  ),
  component: CityPage,
});

function CityPage() {
  const { area } = Route.useLoaderData();
  const modelPicks = modelPicksFor(area);
  const nextSteps = nextStepsFor(area);
  const countyLink = countyLinkFor(area);

  /**
   * DELIVERY_CLAIM is already inside the whyUs paragraph on most extended-area entries.
   * Repeating it verbatim in the closing block would be the only long run of shared text
   * left on those pages, so the claim is added here only when the page has not said it yet.
   */
  const deliveryStatedAlready = area.whyUs.includes(DELIVERY_CLAIM);

  return (
    <SiteShell>
      <Breadcrumbs items={cityCrumbs(area)} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>
            {area.county ? `${area.county}, ${area.state}` : `${area.city}, ${area.state}`}
          </SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            {area.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {area.intro}
          </p>

          <div className="mt-8 max-w-2xl rounded-3xl bg-card p-6 ring-1 ring-border sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Finding us from {area.city}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {dealerInfo.name} is at {dealerInfo.address}. Drive time from {area.city}:{" "}
                  {area.driveTime}.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {area.directions}
                </p>
                {/* Up-link to the county page. Rendered only where that county has a page,
                    and worded per city so six pages do not gain one shared sentence. */}
                {countyLink ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {countyLink.copy.lead}
                    <Link
                      to="/ford-dealer/county/$county"
                      params={{ county: countyLink.slug }}
                      className="font-semibold text-primary hover:underline"
                    >
                      {countyLink.copy.anchor}
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-deep"
            >
              Browse Ford Trucks, SUVs, and Cars <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
            </a>
          </div>
        </div>
      </section>

      {/* The one section no other city page repeats sits directly under the H1, so the first
          thing below the fold is the material that distinguishes this page. */}
      <section className="border-b border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>{area.city} Specific</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">{area.uniqueSection.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {area.uniqueSection.body}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">Why {area.city} drivers choose AM Ford</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{area.whyUs}</p>

          <h3 className="mt-10 text-xl font-bold text-ink">
            What {area.city} drivers usually come in for
          </h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {area.localNeeds.map((need) => (
              <li
                key={need}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground ring-1 ring-border"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{need}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">
            Popular searches with {area.city} shoppers
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{area.searchIntro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {area.popularWith.map((item) => (
              <Link
                key={item.label}
                to="/inventory"
                search={toInventorySearch(item.search)}
                className="group inline-flex items-center gap-2 rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-ink ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
              >
                <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {item.label}
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>Model Lineup</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            Popular Ford models with {area.city} drivers
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {area.modelIntro}
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modelPicks.map(({ model, why }) => (
              <div
                key={model.slug}
                className="flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {model.bodyStyle === "EV" ? "Electric" : model.bodyStyle}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">
                  <Link
                    to="/ford/$model"
                    params={{ model: model.slug }}
                    className="inline-block py-1 text-primary hover:underline"
                  >
                    {model.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{why}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm font-semibold">
            <Link to="/ford-models" className="inline-block py-1 text-primary hover:underline">
              Compare every Ford model AM Ford sells
            </Link>
          </p>
        </div>
      </section>

      {/* Closing block. What goes in it is decided by area.proximity, not by a list of city
          slugs: a fifteen minute run down Route 46 is a drive, not a delivery story, so the
          delivery explainer is reserved for the areas where the distance actually changes
          the decision. */}
      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {area.proximity === "extended" ? (
                <Truck className="h-6 w-6" aria-hidden />
              ) : (
                <MapPin className="h-6 w-6" aria-hidden />
              )}
            </div>
            <h2 className="display mt-5 text-2xl sm:text-3xl">{area.closing.heading}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {area.proximity === "extended" && !deliveryStatedAlready ? `${DELIVERY_CLAIM} ` : ""}
              {area.closing.body}
            </p>
          </div>
        </div>
      </section>

      {/* Site chrome, deliberately. These are the standard next actions with no descriptive
          copy attached, so the grid cannot read as page content on eight near-identical
          pages. The order comes from the area record so the most useful action for this
          community leads. */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">Next steps for {area.city} buyers</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{nextSteps}</div>

          <p className="mt-10 inline-flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            <Link to="/areas-we-serve" className="inline-block py-1 text-primary hover:underline">
              See every area AM Ford serves from {dealerInfo.locality}, Ohio
            </Link>
          </p>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Showroom hours and directions are on the contact page.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
