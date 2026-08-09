import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  Car,
  CreditCard,
  Wrench,
  Truck,
  Signpost,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo, DELIVERY_CLAIM, SERVED_MARKETS } from "@/lib/vehicles";
import { SERVICE_AREAS } from "@/lib/serviceAreas";
import { COUNTIES } from "@/lib/counties";

const CANONICAL = "https://amford.com/areas-we-serve";

/**
 * Communities that already have their own page. Used to strip them out of the plain-text
 * tier lists below so a visitor never meets the same town twice, once as a card and once
 * as unlinked text. Both "Erie" and "Erie, PA" forms are registered because SERVED_MARKETS
 * spells out-of-state towns with their state suffix.
 */
const LINKED_MARKETS = new Set(
  SERVICE_AREAS.flatMap((a) => [a.city.toLowerCase(), `${a.city}, ${a.state}`.toLowerCase()]),
);

const withoutLinkedPages = (markets: string[]) =>
  markets.filter((m) => !LINKED_MARKETS.has(m.toLowerCase()));

/**
 * The remaining served towns, grouped the way a driver thinks about the trip rather than
 * the way the tier constants are named. Tiers that end up empty are not rendered.
 */
const OTHER_MARKET_GROUPS = [
  {
    heading: "Ashtabula County",
    blurb:
      "Our home county. Every town here is a short drive from the showroom, and most of our walk-in traffic comes from these communities.",
    towns: withoutLinkedPages(SERVED_MARKETS.tier1),
  },
  {
    heading: "Lake, Geauga, Trumbull, and Mahoning Counties",
    blurb:
      "Drivers to our west and south, generally reaching us by Interstate 90 along the lake or State Route 11 heading north into Ashtabula County.",
    towns: withoutLinkedPages(SERVED_MARKETS.tier2),
  },
  {
    heading: "Greater Northeast Ohio and Northwest Pennsylvania",
    blurb:
      "Farther out, where buyers usually settle the paperwork by phone and email, then have the vehicle brought to them.",
    towns: withoutLinkedPages(SERVED_MARKETS.tier3),
  },
].filter((g) => g.towns.length > 0);

const NEXT_STEPS = [
  {
    icon: Car,
    to: "/inventory" as const,
    anchor: "Browse Ford trucks, SUVs, and cars in stock",
    body: "Filter the current lineup by body style, drivetrain, price, and mileage before you make the drive.",
  },
  {
    icon: CreditCard,
    to: "/financing" as const,
    anchor: "Apply for vehicle financing",
    body: "Start the credit application from home and our finance team works through the options with you.",
  },
  {
    icon: Wrench,
    to: "/service" as const,
    anchor: "Schedule Ford service and maintenance",
    body: "Book maintenance, diagnostics, and repairs with factory-trained technicians at our Jefferson shop.",
  },
  {
    icon: Truck,
    to: "/nationwide-vehicle-delivery" as const,
    anchor: "Read how home delivery and nationwide shipping work",
    body: "See how remote purchasing, trade appraisal, and transport are handled when a showroom visit is not practical.",
  },
];

const BREADCRUMBS = crumbs({ label: "Areas We Serve" });

export const Route = createFileRoute("/areas-we-serve")({
  head: () => ({
    meta: [
      {
        title: "Ford Dealer Serving Ashtabula County, OH | AM Ford",
      },
      {
        name: "description",
        content: `AM Ford serves Ashtabula County, Northeast Ohio, and Northwest Pennsylvania from ${dealerInfo.city}. Find your community, drive time, and delivery details.`,
      },
      {
        name: "keywords",
        content: [
          "Ford dealer Ashtabula County",
          "Ford dealership Northeast Ohio",
          "Ford dealer Jefferson Ohio",
          "areas served AM Ford",
          ...SERVICE_AREAS.map((a) => `Ford dealer near ${a.city} ${a.state}`),
        ].join(", "),
      },
      {
        property: "og:title",
        content: "Ford Dealer Serving Ashtabula County and Northeast Ohio | AM Ford",
      },
      {
        property: "og:description",
        content: `AM Ford is located in ${dealerInfo.locality}, Ohio and serves drivers across Northeast Ohio and Northwest Pennsylvania. ${DELIVERY_CLAIM}`,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
    ],
  }),
  component: AreasWeServePage,
});

function AreasWeServePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Areas We Serve</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            Ford Dealer Serving Ashtabula County and Northeast Ohio
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            AM Ford sells and services Ford trucks, SUVs, and cars from a single location at{" "}
            {dealerInfo.address}. Jefferson sits near the middle of Ashtabula County, so customers
            reach us from the lakefront towns to the north, the farm roads to the south, and the
            Pennsylvania line to the east.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            When the drive is not practical, we come to you instead. {DELIVERY_CLAIM}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
            >
              Browse Ford Trucks, SUVs, and Cars <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" aria-hidden /> Call the Jefferson Showroom
            </a>
          </div>
        </div>
      </section>

      {/* County tier, deliberately above the town grid so the page reads county then city.
          Anchor text is each county's own H1 and the line under it is that county's own
          `approach` field, so nothing here is a fresh claim about a place and no two cards
          share a sentence. */}
      <section className="border-b border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>Counties We Serve</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">Start with your county</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Four counties have a page of their own, each written around what driving in that county
            actually asks of a vehicle. The dealership is the same one on all of them.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {COUNTIES.map((county) => (
              <div
                key={county.slug}
                className="flex flex-col rounded-3xl bg-card p-7 ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Signpost className="h-6 w-6" aria-hidden />
                </div>
                <span className="mt-5 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {county.relation === "home" ? "Our home county" : "Neighboring county"}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">
                  <Link
                    to="/ford-dealer/county/$county"
                    params={{ county: county.slug }}
                    className="inline-block py-1 text-primary hover:underline"
                  >
                    {county.h1}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {county.approach}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">Community pages, one per town</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Each page below covers the route into Jefferson, the vehicles that community tends to
            shop for, and something specific to that town rather than a rewrite of the same
            paragraph.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_AREAS.map((area) => (
              <Link
                key={area.slug}
                to="/ford-dealer/$city"
                params={{ city: area.slug }}
                className="group flex flex-col rounded-3xl bg-card p-7 ring-1 ring-border transition hover:ring-2 hover:ring-primary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">
                  Ford dealer near {area.city}, {area.state}
                </h3>
                {area.county ? (
                  <p className="mt-1 text-sm text-muted-foreground">{area.county}</p>
                ) : null}
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                  Drive time: {area.driveTime}
                </p>
                <span
                  aria-hidden
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-ink transition group-hover:gap-2.5"
                >
                  View the {area.city} page <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Wider Coverage</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">Other communities we serve</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            These towns sit inside the area we regularly sell, service, and deliver to. They do not
            have a page of their own, so call us with questions about the drive, a trade appraisal,
            or a specific model.
          </p>

          <div className="mt-8 space-y-6">
            {OTHER_MARKET_GROUPS.map((group) => (
              <div
                key={group.heading}
                className="rounded-3xl bg-card p-6 ring-1 ring-border sm:p-7"
              >
                <h3 className="text-lg font-bold text-ink">{group.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{group.blurb}</p>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-ink">
                  {group.towns.join(", ")}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Wherever you are on that list, the dealership itself stays in one place:{" "}
            {dealerInfo.name} at {dealerInfo.address}. We have no other store.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">Where to go next</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {NEXT_STEPS.map((step) => (
              <div key={step.to} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">
                  <Link to={step.to} className="inline-block py-1 text-primary hover:underline">
                    {step.anchor}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border">
            <h3 className="display text-xl">Not sure which page applies to you?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tell us where you are driving from and what you are shopping for, and we will confirm
              the route, your trade value, and whether delivery makes more sense than a visit.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Contact the AM Ford Team
              </Link>
              <a
                href={dealerInfo.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
