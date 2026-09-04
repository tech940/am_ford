import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Loader2,
  Package,
  Phone,
  Send,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { CONSENT_TEXT, RESPONSE_PROMISE, submitQuickLead } from "@/lib/leads";
import { dealerInfo, DELIVERY_CLAIM, vehicles, type Vehicle } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

const PATH = "/commercial";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "Commercial and Work Vehicles" });

/**
 * Service, not an Offer or a Product list. We hold no commercial units in stock, so
 * emitting inventory-shaped structured data would describe vehicles that do not exist.
 * This node advertises the ordering, upfit coordination, and service work only, and
 * references the single dealership in __root.tsx by @id.
 */
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${CANONICAL}#commercial-vehicles`,
  name: "Commercial and Work Vehicle Ordering, Upfitting, and Service",
  serviceType:
    "Commercial vehicle sourcing, factory ordering, upfit coordination, and fleet service",
  description:
    "AM Ford in Jefferson, Ohio sources and factory orders Ford commercial vehicles including Transit cargo and passenger vans, Super Duty pickups, chassis cab, and E-Series, coordinates upfitting with the bodies and equipment your trade needs, holds fleet purchasing conversations, and services commercial vehicles.",
  url: CANONICAL,
  provider: { "@id": "https://amford.com/#dealer" },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Ashtabula County" },
    { "@type": "AdministrativeArea", name: "Northeast Ohio" },
    { "@type": "AdministrativeArea", name: "Northwestern Pennsylvania" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Commercial Vehicle Services",
    itemListElement: [
      "Ford Transit cargo and passenger van ordering",
      "Ford Super Duty work truck ordering",
      "Chassis cab and E-Series sourcing",
      "Upfit and body equipment coordination",
      "Fleet purchasing consultation",
      "Commercial vehicle service and maintenance",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  },
};

export const Route = createFileRoute("/commercial")({
  head: () => ({
    meta: [
      { title: "Commercial and Work Vehicles | AM Ford Jefferson OH" },
      {
        name: "description",
        content:
          "AM Ford in Jefferson, Ohio orders Ford Transit vans, Super Duty trucks, chassis cab, and E-Series work vehicles, with upfit coordination and service.",
      },
      {
        name: "keywords",
        content:
          "commercial Ford dealer Ohio, Ford Transit van Jefferson Ohio, Super Duty work truck Ashtabula County, chassis cab dealer Northeast Ohio, fleet vehicles Ohio, Ford E-Series, work van upfitting Ohio, contractor truck dealer",
      },
      { property: "og:title", content: "Commercial and Work Vehicles at AM Ford" },
      {
        property: "og:description",
        content:
          "Transit vans, Super Duty, chassis cab, and E-Series, ordered to your spec and upfitted for the work you actually do.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
      { type: "application/ld+json", children: JSON.stringify(SERVICE_SCHEMA) },
    ],
  }),
  component: CommercialPage,
});

const PLATFORMS = [
  {
    icon: Package,
    name: "Ford Transit cargo van",
    body: "The everyday work van: a tall, enclosed load space that takes shelving, racking, and a partition, with roof heights and body lengths chosen to suit what you carry rather than what happened to be on a lot.",
  },
  {
    icon: Users,
    name: "Ford Transit passenger van",
    body: "The same platform configured to move people, which is what churches, care providers, shuttle operators, and crews traveling together usually need. Seating layout is part of the order, not an afterthought.",
  },
  {
    icon: Truck,
    name: "Ford Super Duty",
    body: "F-250 and F-350 pickups for trades that tow and haul beyond what a half-ton is built for. Cab, bed, axle, and tow equipment all get specified against the loads you actually pull.",
  },
  {
    icon: ClipboardList,
    name: "Chassis cab",
    body: "The starting point when a body has to go on the back: service bodies, dump bodies, flatbeds, and utility bodies. We order the chassis and coordinate the body so it arrives as one finished vehicle.",
  },
  {
    icon: Wrench,
    name: "Ford E-Series",
    body: "Still the backbone of a lot of cutaway and box work. If your business runs E-Series and you want to keep the fleet consistent, we can talk about sourcing and ordering.",
  },
];

const UPFITS = [
  "Shelving, racking, drawers, and bin systems for van interiors",
  "Bulkheads and partitions, floor and wall liners",
  "Ladder racks, roof racks, pipe carriers, and conduit tubes",
  "Service bodies, utility bodies, flatbeds, and dump bodies",
  "Liftgates, cranes, and loading equipment",
  "Snow plow and spreader preparation",
  "Auxiliary power, inverters, upfitter switches, and work lighting",
  "Ladder and cargo securing, interior lighting, and safety equipment",
];

const INDUSTRIES = [
  "Building trades and general contractors",
  "Plumbing, heating, and electrical",
  "Landscaping, tree care, and lawn maintenance",
  "Excavation, concrete, and site work",
  "Farms and agricultural operations",
  "Delivery, courier, and service routes",
  "Property management and facilities maintenance",
  "Churches, care providers, and community transport",
];

const PROCESS = [
  {
    step: "Tell us what the vehicle has to do",
    body: "Not the model name, the job. What you carry, what you tow, how many people ride in it, where it has to fit, and what has failed on the vehicle it replaces. The spec falls out of that conversation.",
  },
  {
    step: "We confirm what can be built",
    body: "We check what configurations are currently available to order, what is buildable together, and what the realistic timing looks like. Lead times move with Ford production scheduling, so we give you the current picture rather than a comfortable guess.",
  },
  {
    step: "The order goes in",
    body: "You approve the specification and we place the order. If a vehicle already in the pipeline or at another store matches what you need sooner, we will tell you about that option too.",
  },
  {
    step: "Upfit gets coordinated",
    body: "Bodies and equipment are sequenced so the chassis goes straight to the upfitter and comes back finished. You deal with us throughout rather than managing two suppliers.",
  },
  {
    step: "Delivery and handover",
    body: "We hand the vehicle over ready to work, with the paperwork sorted and the service relationship already set up.",
  },
];

/** "a, b, and c" with no Oxford comma on a two-item list. */
const listWithAnd = (items: string[]): string => {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

/** Small counts read better spelled out in prose; anything larger falls back to digits. */
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const spellCount = (n: number) => WORDS[n] ?? String(n);

/**
 * The commercial FAQ has to describe the lot accurately, and a sentence typed by hand
 * goes stale the first time stock changes. Both halves are derived from the vehicles
 * array instead: the New / Certified Pre-Owned split, and the models actually present.
 */
const LOT_SUMMARY = (() => {
  const counts = new Map<Vehicle["condition"], number>();
  for (const v of vehicles) counts.set(v.condition, (counts.get(v.condition) ?? 0) + 1);
  const conditions = listWithAnd(
    [...counts].map(([condition, n]) => `${spellCount(n)} ${condition.toLowerCase()}`),
  );
  const models = listWithAnd([...new Set(vehicles.map((v) => v.model))]);
  return `${conditions} Ford ${vehicles.length === 1 ? "vehicle" : "vehicles"} (${models})`;
})();

const FAQS = [
  {
    q: "Do you have commercial vehicles in stock right now?",
    a: `No, and we would rather say so than send you on a wasted trip. The lot right now holds ${LOT_SUMMARY}, and none of them is a work vehicle. Commercial units here are ordered or sourced to a specification, which is generally what businesses want anyway, because a work vehicle bought off a lot is usually a compromise on something.`,
  },
  {
    q: "How long does a factory order take?",
    a: "It depends on the vehicle, the configuration, and Ford production scheduling at the time you order, and it is not a number anyone can honestly promise on a web page. We check the current position when we take your order and keep you updated as it moves. If timing is critical, tell us early, because sourcing an existing unit is sometimes the faster route.",
  },
  {
    q: "Can you handle the upfit, or do I arrange that myself?",
    a: "We coordinate it. You tell us what equipment the vehicle needs, we work with the upfitter, and the vehicle is delivered finished. You can arrange your own upfitter if you already have one you trust, and we will hand the chassis over in whatever state they need it.",
  },
  {
    q: "I need several vehicles over the next year. Can we plan that?",
    a: "Yes, and that is a better conversation to have early than one truck at a time. We can look at standardizing specification across the fleet so parts and upfits stay interchangeable, plan replacement timing, and check which Ford commercial programs your business may be eligible for.",
  },
  {
    q: "Do you service commercial vehicles?",
    a: "Yes. Our service department works on Ford trucks and vans, and we understand that a vehicle off the road is a day of work lost. Tell us how your week runs and we will try to schedule around it rather than against it.",
  },
  {
    q: "Can a work vehicle be financed through the dealership?",
    a: "Yes. Commercial financing depends on how the business is structured, how long it has been trading, and the lender, and terms depend on credit and the length of the agreement. Our finance team will tell you what is available once they have the details rather than before.",
  },
];

function CommercialPage() {
  const [needs, setNeeds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggleNeed = (name: string) =>
    setNeeds((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Commercial</SectionTag>
          <h1 className="display mt-3 max-w-3xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            Commercial and Work Vehicles at AM Ford
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We do not keep a row of work vans parked out front. What we do is order and source them,
            spec them against the job, and coordinate the body or equipment that goes on the back,
            so the vehicle that arrives is the one your crew actually needs. If you run a trade, a
            farm, a route, or a fleet in Ashtabula County, start with a conversation rather than a
            listing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#commercial-inquiry"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-deep"
            >
              Tell Us What You Need <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" /> Call {dealerInfo.phone}
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              Contact the AM Ford Team
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>What We Can Order and Source</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">The Ford commercial platforms</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Availability and configuration change with Ford production, so treat this as the range
            we work in rather than a stock list. We confirm what is buildable when we take your
            order.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((plat) => (
              <div key={plat.name} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <plat.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">{plat.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plat.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Capability figures for towing, payload, and body allowance are set by the specific build
            of an individual vehicle rather than by the model name. Tell us the loaded weights you
            work with and we will check them against the configuration we are ordering for you.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <SectionTag>Upfitting</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">
              A chassis is only half of a work vehicle
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Most of the value in a commercial vehicle sits in what gets added after the factory.
              We coordinate that work with the upfitters so the chassis, the body, and the equipment
              are sequenced properly and you take delivery of a finished vehicle instead of a
              project.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {UPFITS.map((u) => (
                <li key={u} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{u}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-card p-5 text-sm leading-relaxed text-muted-foreground ring-1 ring-border">
              If you already work with an upfitter you trust, keep them. We will deliver the chassis
              in the state they need and stay involved until the vehicle is in service.
            </p>
          </div>

          <div>
            <SectionTag>Who We Do This For</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">
              Businesses around Ashtabula County
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Work vehicles in this part of Ohio deal with gravel township roads, lake-effect
              winters, and a season that compresses a year of outdoor work into a few months. That
              shapes the specification, particularly drivetrain choice and plow preparation.
            </p>
            <ul className="mt-6 space-y-3">
              {INDUSTRIES.map((ind) => (
                <li key={ind} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{ind}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">Fleet purchasing conversations</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Whether you are adding one van or replacing several units across a year, planning it
                out is worth more than the individual transactions. We can look at standardizing
                specification so parts, keys, and upfits stay interchangeable, map replacement
                timing against your work calendar, and check which Ford commercial programs your
                business may be eligible for.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>How Ordering Works</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">From the job to the keys</h2>
          <ol className="mt-8 space-y-4">
            {PROCESS.map((p, i) => (
              <li key={p.step} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-bold text-ink">{p.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            {DELIVERY_CLAIM} That applies to work vehicles as well, so a business outside our
            immediate area does not have to send a driver to collect a van.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/financing"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
            >
              Ford Financing Options
            </Link>
            <Link
              to="/service"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
            >
              Ford Service and Parts Department
            </Link>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
            >
              Every Ford Vehicle In Stock Now
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Keeping It Working</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">Service for vehicles that earn</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A work vehicle off the road costs more than the repair. Our service department handles
            Ford trucks and vans, and we would rather book your maintenance around your work week
            than have you lose a day to it. Fleet operators can talk to us about scheduled servicing
            for multiple units so the vehicles come through in a planned rotation instead of one
            breakdown at a time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/service"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Book Ford Service <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
            >
              <Phone className="h-4 w-4" /> Call the Service Department
            </a>
          </div>
        </div>
      </section>

      <section id="commercial-inquiry" className="scroll-mt-28 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionTag>Start Here</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Tell us what the job needs</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Send us the shape of the problem and we will come back with what can be ordered,
              roughly when, and what it would take to get it working. No obligation, and you will
              talk to someone who knows the product rather than a call center.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{RESPONSE_PROMISE}</p>
            <div className="mt-6 rounded-2xl bg-card p-5 text-sm text-muted-foreground ring-1 ring-border">
              <p className="font-semibold text-ink">{dealerInfo.name}</p>
              <p className="mt-1">{dealerInfo.address}</p>
              <a
                href={dealerInfo.phoneHref}
                className="mt-2 inline-block font-semibold text-primary"
              >
                {dealerInfo.phone}
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-7 ring-1 ring-border lg:col-span-7">
            {status === "done" ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                <h3 className="display mt-5 text-3xl">Inquiry received</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                  {RESPONSE_PROMISE} If it is easier, call us directly on {dealerInfo.phone}.
                </p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const phone = String(data.get("phone") ?? "");
                  if (phone.replace(/\D/g, "").length < 10) {
                    setError("Please enter a valid phone number.");
                    return;
                  }
                  setStatus("sending");
                  setError(null);
                  const result = await submitQuickLead({
                    leadType: "special_order",
                    name: String(data.get("name") ?? ""),
                    phone,
                    email: String(data.get("email") ?? ""),
                    message: `Commercial vehicle inquiry from ${
                      String(data.get("business") ?? "").trim() || "an unnamed business"
                    }. Interested in: ${
                      needs.length > 0 ? needs.join(" + ") : "not specified"
                    }. Units needed: ${
                      String(data.get("units") ?? "").trim() || "not specified"
                    }. Details: ${String(data.get("details") ?? "").trim() || "none provided"}`,
                  });
                  if (result.success) setStatus("done");
                  else {
                    setStatus("idle");
                    setError(result.message);
                  }
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" name="name" placeholder="Alex Morgan" required />
                  <Field
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="(440) 555-0199"
                    required
                  />
                  <Field label="Business name" name="business" placeholder="Morgan Excavating" />
                  <Field label="Email" name="email" type="email" placeholder="you@example.com" />
                  <Field label="Units needed" name="units" placeholder="1" />
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    What are you looking at
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PLATFORMS.map((plat) => {
                      const active = needs.includes(plat.name);
                      return (
                        <button
                          key={plat.name}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleNeed(plat.name)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-sm transition",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-surface-2 text-ink hover:bg-surface",
                          )}
                        >
                          {plat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="mt-6 block">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    What the vehicle has to do
                  </span>
                  <textarea
                    name="details"
                    rows={4}
                    placeholder="What you carry or tow, any body or equipment you need, and when you need it working."
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>

                <label className="mt-6 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-6 w-6 shrink-0 accent-brand"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {CONSENT_TEXT}
                  </span>
                </label>

                {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {status === "sending" ? "Sending" : "Send Commercial Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Commercial Questions</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">What businesses ask us</h2>
          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <dt className="flex items-start gap-3 text-base font-bold text-ink">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f.q}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({
  label,
  placeholder,
  name,
  type = "text",
  required,
}: {
  label: string;
  placeholder?: string;
  name?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}
