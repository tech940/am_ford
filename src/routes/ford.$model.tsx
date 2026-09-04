import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Phone,
  Scale,
  Search,
  Truck,
} from "lucide-react";
import { PublishDeskSubject } from "@/components/site/DeskContext";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { getFordModel, getRelatedReading, type FordModel } from "@/lib/fordModels";
import { dealerInfo, DELIVERY_CLAIM, getVehicle, type Vehicle } from "@/lib/vehicles";
import { getServiceArea, SERVICE_AREAS, type ServiceArea } from "@/lib/serviceAreas";
import type { InventorySearch } from "./inventory";

const SITE_ORIGIN = "https://amford.com";

/**
 * One source for the trail on this route: head() feeds it to breadcrumbSchema() and the
 * component feeds the same call to <Breadcrumbs>, so the rendered labels and the
 * structured data are the same strings by construction.
 */
const modelCrumbs = (model: FordModel) =>
  crumbs({ label: "Ford Models", href: "/ford-models" }, { label: model.name });

const VEHICLE_TYPES = ["Truck", "SUV", "Car", "EV"] as const;
const VEHICLE_FUELS = ["Gas", "Hybrid", "Electric"] as const;
const VEHICLE_DRIVETRAINS = ["4WD", "AWD", "RWD", "FWD"] as const;

/**
 * FordModel.inventorySearch is a plain string map so the content file stays free of
 * route types. This narrows it to the validated shape /inventory accepts; anything
 * unrecognized is dropped rather than pushed into the URL.
 */
function toInventorySearch(raw: Record<string, string>): InventorySearch {
  const oneOf = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
    value !== undefined && (allowed as readonly string[]).includes(value)
      ? (value as T)
      : undefined;
  return {
    q: raw.q !== undefined && raw.q !== "" ? raw.q : undefined,
    type: oneOf(raw.type, VEHICLE_TYPES),
    fuel: oneOf(raw.fuel, VEHICLE_FUELS),
    drive: oneOf(raw.drive, VEHICLE_DRIVETRAINS),
  };
}

/**
 * Which city pages each model page links out to.
 *
 * Chosen per model rather than repeated across all six, so a page points at the communities
 * whose recorded localNeeds actually match the vehicle: the snowbelt and harbor towns for the
 * trucks, the commuter and cross-border towns for the hybrid and the electric truck.
 */
const CITY_PICKS: Record<string, string[]> = {
  "f-150": ["ashtabula-oh", "chardon-oh", "geneva-oh"],
  mustang: ["geneva-oh", "madison-oh", "cleveland-oh"],
  explorer: ["madison-oh", "geneva-oh", "erie-pa"],
  "f-150-lightning": ["austinburg-oh", "cleveland-oh", "conneaut-oh"],
  bronco: ["chardon-oh", "geneva-oh", "erie-pa"],
  escape: ["austinburg-oh", "cleveland-oh", "conneaut-oh"],
};

/** Resolves the slugs above against SERVICE_AREAS, so a stale slug drops out instead of 404ing. */
function cityPicksFor(model: FordModel): ServiceArea[] {
  const slugs = CITY_PICKS[model.slug] ?? SERVICE_AREAS.slice(0, 3).map((area) => area.slug);
  return slugs
    .map((slug) => getServiceArea(slug))
    .filter((area): area is ServiceArea => area !== undefined);
}

export const Route = createFileRoute("/ford/$model")({
  loader: ({ params }) => {
    const model = getFordModel(params.model);
    if (!model) throw notFound();
    const inStock = model.inStockVehicleIds
      .map((id) => getVehicle(id))
      .filter((v): v is Vehicle => v !== undefined);
    return { model, inStock };
  },
  head: ({ loaderData }) => {
    const model = loaderData?.model;
    if (!model) return { meta: [{ title: "Ford Models | AM Ford" }] };

    const canonical = `${SITE_ORIGIN}/ford/${model.slug}`;
    const title = `${model.name} for Sale in ${dealerInfo.city} | AM Ford`;
    // Leads with the tagline because that is the only part of this string that differs
    // between the six model pages. DELIVERY_CLAIM is deliberately not concatenated here:
    // it is 84 characters of boilerplate that pushed every description past 240, well over
    // the ~155 characters a result actually shows. It still appears verbatim on the page.
    const description = `${model.tagline} ${model.name} for sale at AM Ford in ${dealerInfo.city}, serving Ashtabula County.`;

    // Built from the same model.faqs the page renders, so the visible copy and the
    // structured data can never drift apart.
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: model.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: [
            `${model.name} Jefferson Ohio`,
            `${model.name} Ashtabula County`,
            `new ${model.name} Northeast Ohio`,
            `${model.name} for sale ${dealerInfo.city}`,
            `${model.name} dealer near Geneva Ohio`,
            `${model.name} dealer near Conneaut Ohio`,
            `${model.name} dealer near Erie PA`,
            "Ford dealer Jefferson Ohio",
          ].join(", "),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema(modelCrumbs(model))),
        },
        { type: "application/ld+json", children: JSON.stringify(faqSchema) },
      ],
    };
  },
  component: FordModelPage,
});

function FordModelPage() {
  const { model, inStock } = Route.useLoaderData();
  const inventorySearch = toInventorySearch(model.inventorySearch);
  const cityPicks = cityPicksFor(model);
  const relatedReading = getRelatedReading(model.slug);

  return (
    <SiteShell>
      <PublishDeskSubject model={model.name} />
      <Breadcrumbs items={modelCrumbs(model)} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>{model.bodyStyle === "EV" ? "Electric" : model.bodyStyle} Lineup</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            {model.name} for Sale in {dealerInfo.city}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold text-ink sm:text-lg">
            {model.tagline}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {model.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              search={inventorySearch}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-deep"
            >
              Browse {model.name} listings <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" /> Call AM Ford about the {model.name}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="display text-2xl sm:text-3xl">What the {model.name} is good at</h2>
              <ul className="mt-6 space-y-4">
                {model.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                    <span className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="display mt-5 text-xl sm:text-2xl">
                  The {model.name} around {dealerInfo.locality}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {model.localAngle}
                </p>
                <p className="mt-4 text-sm font-semibold text-ink">
                  AM Ford sells and services the {model.name} from one location,{" "}
                  {dealerInfo.address}.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border">
            <h2 className="display text-xl sm:text-2xl">Where {model.name} buyers drive in from</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {model.regionNote}
            </p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {cityPicks.map((area) => (
                <li key={area.slug}>
                  <Link
                    to="/ford-dealer/$city"
                    params={{ city: area.slug }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-surface-2/60 px-4 py-2.5 text-sm font-semibold text-brand ring-1 ring-border transition hover:ring-2 hover:ring-brand/40"
                  >
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    Ford dealer near {area.city}, {area.state}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold">
              <Link to="/areas-we-serve" className="inline-block py-1 text-primary hover:underline">
                See every area AM Ford serves from {dealerInfo.locality}, Ohio
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>In Stock Now</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">
            {model.name} listings at our {dealerInfo.locality} lot
          </h2>

          {inStock.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inStock.map((v) => (
                <Link
                  key={v.id}
                  to="/vehicle/$id"
                  params={{ id: v.id }}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border transition hover:ring-brand/40"
                >
                  <img
                    src={v.image}
                    alt={`${v.year} ${v.make} ${v.model} ${v.trim} at AM Ford in ${dealerInfo.city}`}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {v.condition}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-ink">
                      {v.year} {v.make} {v.model}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      {v.trim} trim
                    </p>
                    <p className="mt-4 text-2xl font-black text-brand">
                      ${v.price.toLocaleString()}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand group-hover:underline">
                      View this {v.year} {v.model} {v.trim}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">
                No {model.name} is listed on our lot right now
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Stock changes week to week, and we would rather say so than show you a listing that
                is not there. Tell us the configuration you want, including cab or body style,
                drivetrain, color, and the equipment you care about, and we will look for a match
                through our sourcing network and tell you what it takes to get one here.{" "}
                {DELIVERY_CLAIM}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-deep"
                >
                  Ask AM Ford to source a {model.name}{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={dealerInfo.phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
                >
                  <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
                </a>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/inventory"
              search={inventorySearch}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-5 py-3 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Search className="h-4 w-4" aria-hidden /> Filter our inventory to {model.name}{" "}
              listings
            </Link>
            <Link
              to="/ford-models"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
            >
              Compare the other Ford models we sell
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>{model.name} Questions</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">
            Questions buyers ask us about the {model.name}
          </h2>
          <dl className="mt-8 space-y-4">
            {model.faqs.map((f) => (
              <div key={f.q} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <dt className="flex items-start gap-3 text-base font-bold text-ink">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {f.q}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {relatedReading.length > 0 && (
        <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <SectionTag>Related Reading</SectionTag>
            <h2 className="display mt-3 text-2xl sm:text-3xl">
              Comparisons and guides that cover the {model.name}
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {relatedReading.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex h-full flex-col rounded-2xl bg-card p-6 ring-1 ring-border transition hover:ring-2 hover:ring-brand/40"
                  >
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {item.kind === "Comparison" ? (
                        <Scale className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      )}
                      {item.kind}
                    </span>
                    <span className="mt-3 inline-flex items-start gap-1.5 text-base font-bold text-brand group-hover:underline">
                      {item.label}
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.why}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-surface-2/60 py-12 sm:py-14">
        <div className="mx-auto max-w-4xl px-6">
          {/*
            Site chrome: the same delivery band runs on every model page by design, so it is
            styled as a utility strip rather than a content section and carries one sentence
            instead of the paragraph it used to repeat six times. DELIVERY_CLAIM stays verbatim.
          */}
          <div className="flex flex-col gap-4 rounded-2xl bg-card px-6 py-5 ring-1 ring-border sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Delivery from AM Ford
                </h2>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {DELIVERY_CLAIM} Every vehicle leaves from our one location at{" "}
                  {dealerInfo.address}.
                </p>
              </div>
            </div>
            <Link
              to="/nationwide-vehicle-delivery"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/25 bg-white px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              See how home delivery and shipping work
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              to="/financing"
              className="rounded-2xl bg-card p-5 text-sm font-bold text-ink ring-1 ring-border transition hover:ring-brand/40"
            >
              Apply for {model.name} financing
            </Link>
            <Link
              to="/service"
              className="rounded-2xl bg-card p-5 text-sm font-bold text-ink ring-1 ring-border transition hover:ring-brand/40"
            >
              Book Ford service in {dealerInfo.locality}
            </Link>
            <Link
              to="/contact"
              className="rounded-2xl bg-card p-5 text-sm font-bold text-ink ring-1 ring-border transition hover:ring-brand/40"
            >
              Schedule a {model.name} test drive
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
