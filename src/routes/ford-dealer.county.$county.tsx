import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  ArrowRight,
  Phone,
  Compass,
  Search,
  CheckCircle2,
  Signpost,
  Route as RouteIcon,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";
import { getCounty, validChildCitySlugs, type County } from "@/lib/counties";
import { getServiceArea } from "@/lib/serviceAreas";
import { getFordModel, type FordModel } from "@/lib/fordModels";
import type { InventorySearch } from "@/routes/inventory";

const SITE_ORIGIN = "https://amford.com";

/**
 * County landing pages for /ford-dealer/county/{slug}.
 *
 * The static "county" segment is deliberate. /ford-dealer/$city already owns the two segment
 * shape, so putting counties one level deeper means the two route trees can never fight over
 * a slug, and "ashtabula-oh" is free to be both a city page and a county page.
 *
 * THE RULE THIS FILE IS WRITTEN UNDER: this component renders data and navigation, and it
 * writes no prose. Section headings, body copy, list items, search labels, and the reason
 * each Ford model appears all come from the County record in @/lib/counties. If a sentence
 * were written here instead, it would render identically on all four county pages, which is
 * precisely the duplicate content pattern the city pages were rebuilt to remove.
 *
 * Anchor text for the child city links is not written here either: it comes from the matching
 * ServiceArea record, so each anchor is descriptive and already unique per city.
 */

/** One source for the trail: head() feeds it to breadcrumbSchema, the component to <Breadcrumbs>. */
const countyCrumbs = (county: County) =>
  crumbs(
    { label: "Areas We Serve", href: "/areas-we-serve" },
    { label: `${county.county}, ${county.state}` },
  );

/** /inventory params that are numbers in the URL schema; everything else stays a string. */
const NUMERIC_SEARCH_KEYS = ["year", "priceMin", "priceMax", "milesMin", "milesMax", "page"];
const STRING_SEARCH_KEYS = ["q", "type", "fuel", "drive", "trans", "badges", "sort"];

/**
 * popularWith entries arrive from the data file as plain string maps, but /inventory types
 * its search params. Unknown keys are dropped and numeric keys coerced here, so a typo in
 * the data cannot build a deep link that the inventory validator silently discards.
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

/** Resolves county model slugs against FORD_MODELS so a stale slug drops out instead of 404ing. */
function modelPicksFor(county: County): { model: FordModel; why: string }[] {
  return county.models.picks
    .map((pick) => ({ model: getFordModel(pick.slug), why: pick.why }))
    .filter((pick): pick is { model: FordModel; why: string } => pick.model !== undefined);
}

const linkClass = "inline-block py-1 text-primary hover:underline";

/**
 * Site chrome. These are link labels with no descriptive copy attached, so the block reads
 * as navigation rather than as page content repeated four times. /financing is here on every
 * county page, which is where the required financing link comes from.
 */
const CHROME_LINKS: { to: string; label: string }[] = [
  { to: "/financing", label: "Apply for vehicle financing" },
  { to: "/service", label: "Schedule Ford service and maintenance" },
  { to: "/trade-in", label: "Value your trade" },
  { to: "/nationwide-vehicle-delivery", label: "How home delivery and vehicle shipping work" },
  { to: "/contact", label: "Contact the AM Ford team" },
  { to: "/areas-we-serve", label: "Every area AM Ford serves from Jefferson, Ohio" },
];

export const Route = createFileRoute("/ford-dealer/county/$county")({
  loader: ({ params }) => {
    const county = getCounty(params.county);
    if (!county) throw notFound();
    return { county };
  },
  head: ({ loaderData }) => {
    const county = loaderData?.county;
    if (!county) return { meta: [{ title: "Areas We Serve | AM Ford" }] };

    const canonical = `${SITE_ORIGIN}/ford-dealer/county/${county.slug}`;

    /**
     * The dealership node is a REFERENCE, not a second business.
     *
     * It carries the same @id as the site-wide AutoDealer in __root.tsx, and it deliberately
     * omits both `address` and `url`. Emitting a postal address here would describe a second
     * dealership sitting in Painesville, Chardon, or Warren, which is the exact bug that was
     * fixed on the city pages. All this node adds to the graph is one more areaServed.
     */
    const dealerSchema = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "@id": "https://amford.com/#dealer",
      name: dealerInfo.name,
      telephone: dealerInfo.phone,
      areaServed: {
        "@type": "AdministrativeArea",
        name: `${county.county}, Ohio`,
      },
    };

    return {
      meta: [
        // Title, description, and og:description are authored per county in counties.ts.
        // Composing them from a template here is what made eight city pages interchangeable,
        // so the route is not permitted to build them.
        { title: county.title },
        { name: "description", content: county.metaDescription },
        {
          name: "keywords",
          content: [
            `Ford dealer ${county.county}`,
            `Ford dealership ${county.county} Ohio`,
            `new Ford trucks ${county.county}`,
            `new Ford SUVs ${county.county}`,
            `certified pre-owned Ford ${county.county}`,
            `Ford service ${county.county}`,
            `car financing ${county.county} Ohio`,
            `Ford dealer near ${county.countySeat} OH`,
            `AM Ford ${dealerInfo.locality} Ohio`,
          ].join(", "),
        },
        { property: "og:title", content: `${county.h1} | ${dealerInfo.name}` },
        { property: "og:description", content: county.ogDescription },
        { property: "og:type", content: "website" },
        // Without this the root default wins and every county page shares the homepage URL.
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema(countyCrumbs(county))),
        },
        { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="display text-4xl sm:text-5xl">We do not have a page for that county yet</h1>
        <p className="mt-3 text-muted-foreground">
          AM Ford is in {dealerInfo.locality}, Ohio, the Ashtabula County seat, and serves drivers
          well beyond the counties with a page of their own.
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
  component: CountyPage,
});

function CountyPage() {
  const { county } = Route.useLoaderData();
  const modelPicks = modelPicksFor(county);
  const childAreas = validChildCitySlugs(county)
    .map((slug) => getServiceArea(slug))
    .filter((area): area is NonNullable<typeof area> => area !== undefined);

  return (
    <SiteShell>
      <Breadcrumbs items={countyCrumbs(county)} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>
            {county.county}, {county.state}
          </SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            {county.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {county.intro}
          </p>

          <div className="mt-8 max-w-2xl rounded-3xl bg-card p-6 ring-1 ring-border sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-ink">Our one location</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {dealerInfo.name} is at {dealerInfo.address}. {county.approach}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
            >
              {county.cta.inventoryLabel} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden /> Call {dealerInfo.phone}
            </a>
          </div>
        </div>
      </section>

      {/* The county's angle sits directly under the H1, so the first thing below the fold is
          the material that makes this page different from the other three. */}
      <section className="border-b border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>{county.county}</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">{county.angle.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {county.angle.body}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.landscape.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {county.landscape.body}
          </p>

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <RouteIcon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-5 text-xl font-bold text-ink">{county.directions.heading}</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {county.directions.body}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.extra.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {county.extra.body}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.needs.heading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {county.needs.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground ring-1 ring-border"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.searches.heading}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {county.searches.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {county.popularWith.map((item) => (
              <Link
                key={item.label}
                to="/inventory"
                search={toInventorySearch(item.search)}
                className="group inline-flex max-w-full items-center gap-2 rounded-2xl bg-card px-5 py-3.5 text-sm font-semibold text-ink ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
              >
                <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0">{item.label}</span>
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
          <h2 className="display mt-3 text-3xl sm:text-4xl">{county.models.heading}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {county.models.intro}
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
                  <Link to="/ford/$model" params={{ model: model.slug }} className={linkClass}>
                    {model.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{why}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm font-semibold">
            <Link to="/ford-models" className={linkClass}>
              Compare every Ford model AM Ford sells
            </Link>
          </p>
        </div>
      </section>

      {/* Down-links to the city pages inside this county, derived from childCitySlugs. A county
          with no city page renders its alternativeLinks instead, so Trumbull County never
          appears to have a Warren page waiting behind a link. */}
      <section className="border-y border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.childBlock.heading}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {county.childBlock.body}
          </p>

          {childAreas.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {childAreas.map((area) => (
                <div
                  key={area.slug}
                  className="flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-ink">
                    <Link
                      to="/ford-dealer/$city"
                      params={{ city: area.slug }}
                      className={linkClass}
                    >
                      {area.h1}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {area.driveTime}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {(county.alternativeLinks ?? []).map((item) => (
                <li
                  key={item.to}
                  className="flex items-start gap-3 rounded-2xl bg-card p-5 ring-1 ring-border"
                >
                  <Signpost className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <Link to={item.to} className={`${linkClass} min-w-0 font-semibold`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.alsoServed.heading}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {county.alsoServed.towns.join(", ")}. {county.alsoServed.body}
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="display mt-5 text-2xl sm:text-3xl">{county.closing.heading}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {county.closing.body}
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">{county.cta.heading}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {county.cta.body}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
            >
              {county.cta.inventoryLabel} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden /> Call {dealerInfo.phone}
            </a>
          </div>

          {/* Navigation, not page content: link labels only, with no copy attached. */}
          <ul className="mt-10 grid gap-2 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-3">
            {CHROME_LINKS.map((item) => (
              <li key={item.to} className="min-w-0">
                <Link to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
