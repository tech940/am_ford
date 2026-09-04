import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";
import { motion, useScroll, useTransform } from "framer-motion";
import { breadcrumbSchema, crumbs, type Crumb } from "@/lib/breadcrumbs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  Button,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconDrivetrain,
  IconFuel,
  IconOdometer,
  IconPhone,
  IconPin,
  IconSavings,
  IconTag,
} from "@/components/ledger";
import { PublishDeskSubject } from "@/components/site/DeskContext";
import { SiteShell } from "@/components/site/SiteShell";
import {
  getVehicle,
  vehicles,
  dealerInfo,
  DELIVERY_CLAIM,
  PRICE_BANDS,
  type Vehicle,
} from "@/lib/vehicles";
import { FORD_MODELS, getRelatedReading } from "@/lib/fordModels";
import { SectionTag } from "@/components/site/SectionTag";
import { VehicleCard } from "@/components/site/VehicleCard";
import { VehicleLeadDialog, type LeadIntent } from "@/components/lead/VehicleLeadDialog";
import { modelAccent } from "@/lib/vehicles";
import { PRICING_STANCE } from "@/lib/dealerContent";
import { RESPONSE_PROMISE, smsLink, submitQuickLead } from "@/lib/leads";
import { GARAGE_EVENT, isWatched } from "@/lib/garage";
import { DeliveryBanner } from "@/components/site/DeliveryBanner";
import { FrequentSearches } from "@/components/site/FrequentSearches";
import { cn } from "@/lib/utils";

/**
 * Home > Inventory > this vehicle.
 *
 * head() and the component both build their trail from this one helper and the same loader
 * vehicle, so the visible breadcrumbs and the BreadcrumbList JSON-LD can never drift apart —
 * which is what Google requires before it will render breadcrumbs in the result.
 */
function buildVehicleBreadcrumbs(v: Vehicle): Crumb[] {
  return crumbs(
    { label: "Inventory", href: "/inventory" },
    // Last crumb is the current page, so it carries no href.
    { label: `${v.year} ${v.make} ${v.model} ${v.trim}` },
  );
}

export const Route = createFileRoute("/vehicle/$id")({
  loader: ({ params }) => {
    const v = getVehicle(params.id);
    if (!v) throw notFound();
    return { v };
  },
  head: ({ loaderData }) => {
    const v = loaderData?.v;
    if (!v) return { meta: [{ title: "Vehicle | AM Ford" }] };

    const carSchema = {
      "@context": "https://schema.org",
      "@type": "Car",
      name: `${v.year} ${v.make} ${v.model} ${v.trim}`,
      image: v.image,
      brand: {
        "@type": "Brand",
        name: v.make,
      },
      model: v.model,
      vehicleModelDate: String(v.year),
      color: v.exterior,
      driveWheelConfiguration: v.drivetrain,
      fuelType: v.fuel,
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: v.miles,
        unitCode: "SMI",
      },
      additionalProperty: [
        { "@type": "PropertyValue", name: "Condition", value: v.condition },
        ...(v.vin ? [{ "@type": "PropertyValue", name: "VIN", value: v.vin }] : []),
        ...(v.stockNumber
          ? [{ "@type": "PropertyValue", name: "Stock Number", value: v.stockNumber }]
          : []),
      ],
      offers: {
        "@type": "Offer",
        price: v.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        // Condition comes from the data, never inferred from the odometer.
        // schema.org has no CertifiedPreOwnedCondition, so CPO maps to UsedCondition
        // and the real status is preserved in additionalProperty below.
        itemCondition:
          v.condition === "New"
            ? "https://schema.org/NewCondition"
            : "https://schema.org/UsedCondition",
        seller: {
          "@type": "AutoDealer",
          "@id": "https://amford.com/#dealer",
          name: dealerInfo.name,
          telephone: "+14409982151",
          address: {
            "@type": "PostalAddress",
            streetAddress: dealerInfo.street,
            addressLocality: dealerInfo.locality,
            addressRegion: dealerInfo.region,
            postalCode: dealerInfo.postalCode,
            addressCountry: "US",
          },
        },
      },
    };

    // Built from the same helper the visible disclosures render, so the two cannot drift.
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: buildVehicleFaqs(v).map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    };

    return {
      meta: [
        // Titles and descriptions are budgeted for the SERP, not for the page: Google renders
        // roughly 60 characters of title and 155 of description, so anything past that is spent
        // on text no searcher reads. `trim` is dropped from the title because it is the longest
        // and least-searched token (nobody types "Outer Banks"), and the price and drivetrain
        // lead the description because they are what a shopper scans for.
        {
          title: `${v.year} ${v.make} ${v.model} for Sale | AM Ford ${dealerInfo.locality} OH`,
        },
        {
          name: "description",
          content: `${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} in stock at AM Ford, ${dealerInfo.locality} OH. $${v.price.toLocaleString()}, ${v.drivetrain}, ${v.fuel}. Book a test drive.`,
        },
        {
          // Keyword intent follows the actual record: a New or Certified Pre-Owned unit must not
          // be advertised against "used" queries it cannot satisfy.
          name: "keywords",
          content: `${v.year} ${v.make} ${v.model} ${dealerInfo.locality} Ohio, Ford dealer ${dealerInfo.locality} Ohio, buy ${v.model} ${v.trim} ${dealerInfo.city}, ${v.condition.toLowerCase()} ${v.model} for sale Ohio, ${v.type.toLowerCase()}s Ashtabula County, Ford dealer Northeast Ohio, test drive ${v.model} near Erie PA`,
        },
        {
          property: "og:title",
          content: `${v.year} ${v.make} ${v.model} ${v.trim} | AM Ford ${dealerInfo.city}`,
        },
        {
          property: "og:description",
          content: `In stock at AM Ford. $${v.price.toLocaleString()} · ${v.miles < 50 ? "New Vehicle" : `${v.miles.toLocaleString()} miles`}. Schedule your test drive in ${dealerInfo.city}.`,
        },
        { property: "og:image", content: v.image },
        { property: "og:url", content: `https://amford.com/vehicle/${v.id}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: v.image },
      ],
      links: [{ rel: "canonical", href: `https://amford.com/vehicle/${v.id}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(carSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema(buildVehicleBreadcrumbs(v))),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="display text-5xl">Vehicle not found</h1>
        <p className="mt-3 text-ink-3">It may have already been sold.</p>
        <Link
          to="/inventory"
          className="mt-8 inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Browse inventory <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SiteShell>
  ),
  errorComponent: ({ error, reset }) => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-ink-3">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-sm bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </SiteShell>
  ),
  component: VehicleDetail,
});

/**
 * Prose-safe label for a body style. A blanket `.toLowerCase()` reads fine for "truck" and
 * "car" but turns the initialisms into "suv" and "ev", which looks like a typo on a page
 * whose whole job is to look trustworthy.
 */
const typeLabel = (t: Vehicle["type"]) => (t === "SUV" || t === "EV" ? t : t.toLowerCase());

/** "an automatic" / "a manual". Article agreement, since the value is interpolated. */
const transmissionPhrase = (t: Vehicle["transmission"]) =>
  `${t === "Automatic" ? "an" : "a"} ${t.toLowerCase()}`;

const DRIVETRAIN_COPY: Record<Vehicle["drivetrain"], string> = {
  "4WD":
    "the 4WD system delivers sure-footed traction through lake-effect snow, gravel back roads, and muddy job sites alike, which is exactly what Northeast Ohio winters demand",
  AWD: "the all-wheel-drive system automatically shifts power to the wheels with the most grip, giving you four-season confidence on Route 20 whether it's raining, snowing, or bone dry",
  RWD: "the rear-wheel-drive layout keeps steering pure and weight balanced, the configuration driving enthusiasts choose for its natural feel and handling poise",
  FWD: "the front-wheel-drive layout maximizes interior space and delivers dependable, predictable handling with excellent efficiency for daily commuting",
};

const FUEL_COPY = (v: Vehicle): string => {
  switch (v.fuel) {
    case "Electric":
      return `As a fully electric vehicle rated at ${v.mpg}, it skips the gas station entirely. Charge overnight at home and wake up to a full "tank" every morning, with instant torque no combustion engine can match.`;
    case "Hybrid":
      return `The hybrid powertrain returns an EPA-estimated ${v.mpg} MPG (city/highway), letting the electric motor handle stop-and-go traffic while the gas engine takes over on the highway, the best of both worlds for ${dealerInfo.locality} and Ashtabula County commuters.`;
    default:
      return `Rated at ${v.mpg} MPG (city/highway), it pairs straightforward gas-engine ownership with the proven reliability Ford powertrains are known for. There is no charging to plan; just fill up and go.`;
  }
};

const TYPE_COPY: Record<Vehicle["type"], string> = {
  Truck:
    "As a full-size truck, it's built to work: hauling mulch from Saybrook garden centers, towing a boat to Lake Erie, or handling winter storm cleanup without breaking a sweat.",
  SUV: "As an SUV, it blends passenger comfort with real cargo flexibility. Road trips to Cleveland, school runs, and Costco hauls all fit inside one vehicle.",
  Car: "As a car, it rewards the driver first, with a lower center of gravity, sharper responses, and a connected feel that no crossover can replicate.",
  EV: "As an electric vehicle, it pairs cutting-edge tech with dramatically lower running costs: fewer moving parts, no oil changes, and quiet, instant acceleration.",
};

/** Data-driven prose so every vehicle page carries genuinely different indexable content. */
function buildVehicleStory(v: Vehicle): string[] {
  return [
    `Under the hood, this ${v.year} ${v.model} ${v.trim} produces ${v.horsepower} horsepower through ${transmissionPhrase(v.transmission)} transmission, and ${DRIVETRAIN_COPY[v.drivetrain]}.`,
    FUEL_COPY(v),
    `${TYPE_COPY[v.type]} Finished in ${v.exterior} over a ${v.interior} interior, this example ${
      v.miles < 100
        ? "is effectively brand new with delivery miles only"
        : `shows just ${v.miles.toLocaleString()} well-documented miles`
    }, and it's available to see today at AM Ford, ${dealerInfo.address}, serving Ashtabula County drivers in Saybrook, Geneva, and Conneaut, and an easy drive from Mentor and Erie, PA.`,
  ];
}

/* -------------------------------------------------------------------------- */
/* Everything below is DERIVED from the vehicle record.                        */
/*                                                                             */
/* Nothing here restates a fact that is not already in src/lib/vehicles.ts, and */
/* every map keyed on a Vehicle union is exhaustive, so adding a body style,    */
/* fuel, drivetrain, or condition fails `tsc` rather than silently shipping a   */
/* page with a hole in the copy. No ownership history, inspection result,       */
/* warranty term, payment figure, or APR appears in any of it.                  */
/* -------------------------------------------------------------------------- */

/**
 * Prev/next neighbours for the pager.
 *
 * The order is the declaration order of `vehicles`, which is stable, identical on the server
 * and the client, and the order the rest of the site walks the lot in. It wraps: with six
 * vehicles, a disabled arrow at position one exists only to be unavailable, and a shopper who
 * reaches the end of the lot is better served by being sent round again than by a dead control.
 */
function vehicleNeighbours(v: Vehicle) {
  const total = vehicles.length;
  const index = vehicles.findIndex((x) => x.id === v.id);
  const wrap = (n: number) => vehicles[((n % total) + total) % total];
  return {
    position: index + 1,
    total,
    previous: total > 1 ? wrap(index - 1) : undefined,
    next: total > 1 ? wrap(index + 1) : undefined,
  };
}

/**
 * The /ford/{slug} page for this vehicle, matched on the model registry's own
 * `inStockVehicleIds` with the model name as a fallback. Looking it up rather than hardcoding
 * a slug means a model page that is renamed or removed drops the link instead of publishing
 * one that 404s.
 */
const modelPageFor = (v: Vehicle) =>
  FORD_MODELS.find((m) => m.inStockVehicleIds.includes(v.id)) ??
  FORD_MODELS.find((m) => m.name === `${v.make} ${v.model}`);

/** The price band this vehicle sits in, so the band link is guaranteed to return it. */
const priceBandFor = (v: Vehicle) =>
  PRICE_BANDS.find((b) => v.price >= b.priceMin && v.price <= b.priceMax);

/**
 * Body-style noun for anchor text, singular because it is read after "every". A plural here
 * produces "every Ford trucks", which is the kind of thing a template generates and nobody
 * proofreads. "SUV" and "EV" must not be lowercased.
 */
const TYPE_ANCHOR_NOUN: Record<Vehicle["type"], string> = {
  Truck: "Ford truck",
  SUV: "Ford SUV",
  Car: "Ford car",
  EV: "electric Ford",
};

const FUEL_ANCHOR: Record<Vehicle["fuel"], string> = {
  Gas: "gas powered Fords in stock in Jefferson OH",
  Hybrid: "hybrid Fords in stock in Jefferson OH",
  Electric: "electric Fords in stock in Jefferson OH",
};

const CONDITION_ANCHOR: Record<Vehicle["condition"], string> = {
  New: "new Fords for sale in Jefferson OH",
  "Certified Pre-Owned": "certified pre-owned Fords at AM Ford",
  // Kept only to hold the map exhaustive. The lot holds zero used vehicles and /inventory
  // rejects ?condition=Used, so the caller guards on this value before rendering a link.
  Used: "used Fords",
};

/** Odometer sentence. "12 miles" and "8,420 miles" do not mean the same thing to a buyer. */
const odometerNote = (v: Vehicle): string =>
  v.miles < 100
    ? `The odometer reads ${v.miles} miles, short enough that this one has not been driven in any meaningful sense.`
    : `The odometer reads ${v.miles.toLocaleString()} miles.`;

const CONDITION_NOTE: Record<Vehicle["condition"], string> = {
  New: "The record lists the condition as New, so the equipment on it is the factory build rather than anything a previous owner chose to add or take off.",
  "Certified Pre-Owned":
    "The record lists the condition as Certified Pre-Owned, which is a manufacturer program with its own eligibility rules, not a description of how the vehicle looks and not the same thing as a plain used listing. The difference between the two lives entirely in the documentation, so read it rather than taking the badge on trust.",
  Used: "The record lists the condition as Used.",
};

const pricingNote = (v: Vehicle): string =>
  v.msrp && v.msrp > v.price
    ? `AM Ford lists this one at $${v.price.toLocaleString()}, against an original MSRP of $${v.msrp.toLocaleString()} on the record, a difference of $${(v.msrp - v.price).toLocaleString()}.`
    : `AM Ford lists this one at $${v.price.toLocaleString()}.`;

/** "A, B, C, and D" from the record's own feature strings. No feature is added or renamed. */
const featureSentence = (v: Vehicle): string =>
  v.features.length > 1
    ? `${v.features.slice(0, -1).join(", ")}, and ${v.features[v.features.length - 1]}`
    : v.features.join("");

/**
 * The counterweight to the sales copy further up the page: what this specific configuration
 * asks of an owner in Northeast Ohio. Written as things to weigh rather than reasons to buy,
 * which is the voice the brief calls for and the half of the conversation most listings skip.
 */
const DRIVETRAIN_CAUTION: Record<Vehicle["drivetrain"], string> = {
  "4WD":
    "Four-wheel drive is something you select rather than something that runs on its own in the background. Ask us to walk you through the selector and what each setting is for before you drive away, particularly if everything you have owned until now has been all-wheel drive.",
  AWD: "All-wheel drive helps you get moving. It does nothing at all for stopping distance, which is decided by tires. Treat a tire budget as part of owning this vehicle rather than as a surprise in the first bad week of December.",
  RWD: "Rear-wheel drive changes what winter asks of you. Some owners around here run a car like this from spring through late autumn and keep something else for January. Others drive it year round on a dedicated set of winter tires. Decide which of those you are before you buy, because either answer carries a cost.",
  FWD: "Front-wheel drive covers most cleared roads in this county on good tires. If your driveway is long, unpaved, or steep, say so early and we will talk through honestly whether it is enough for where you actually live.",
};

const FUEL_CAUTION: Record<Vehicle["fuel"], string> = {
  Electric:
    "Charging is the real decision here, not the vehicle. Fast charging is thinner around Ashtabula County than it is closer to Cleveland, so a 240 volt circuit where you park overnight is what makes an electric vehicle practical rather than merely possible. Price that installation before you buy, not after it is sitting in the driveway.",
  Hybrid:
    "This is a hybrid, not a plug-in. There is nothing to charge and no electrical work to arrange at home. It fuels at any pump, and it does its best work in town, which is exactly where a conventional engine wastes the most.",
  Gas: "Nothing about this one changes your routine. It fuels at any pump, needs no charging plan, and asks nothing of your electrical panel.",
};

const TYPE_CAUTION: Record<Vehicle["type"], string> = {
  Truck:
    "If you intend to tow, tell us what and how heavy before you buy. What a truck can pull is set by its own combination of engine, axle ratio, cab, bed, and factory tow equipment, and the figures that apply come off this truck's door jamb label rather than a brochure for the model range.",
  SUV: "Bring the people and bring the car seats. Seat layout and cargo space read very differently in person than they do on a screen, and half an hour in the vehicle settles a question no spec sheet can.",
  Car: "Two doors and a short back seat are the trade you are making. As a second vehicle that is rarely a problem. As the only vehicle in a household it asks a great deal more of you.",
  EV: "An electric vehicle is a different ownership routine rather than a different kind of car. Where you refuel changes, a long trip needs a little planning, and the maintenance calendar gets shorter. None of that is difficult, and all of it is easier to judge from the driver's seat than from a page.",
};

/** Three considerations, one each from body style, drivetrain, and fuel. */
const buildConsiderations = (v: Vehicle): string[] => [
  TYPE_CAUTION[v.type],
  DRIVETRAIN_CAUTION[v.drivetrain],
  FUEL_CAUTION[v.fuel],
];

/**
 * Paragraphs for the "detail behind this listing" section. Deliberately disjoint from
 * `buildVehicleStory` above, which already covers drivetrain, fuel, and body style: this block
 * takes on price, condition, odometer, and equipment, which nothing else on the page states in
 * prose.
 */
const buildListingDetail = (v: Vehicle): string[] => [
  `${pricingNote(v)} That figure covers the vehicle. Tax, title, and registration sit outside it, and a trade allowance moves the total again, so ask us to put the numbers on one page in writing before you commit to anything.`,
  `${odometerNote(v)} ${CONDITION_NOTE[v.condition]}`,
  `The equipment recorded against this ${v.year} ${v.model} is ${featureSentence(v)}. That is the whole list. Anything you have read about the ${v.model} range that is not named there is not fitted to this vehicle, and we would far rather you learn that here than after a drive to ${dealerInfo.locality}.`,
];

/**
 * Single source for the FAQ, read by BOTH the FAQPage JSON-LD in head() and the visible
 * disclosures in the component. Google only honours FAQ structured data when the same text is
 * visible on the page, so these can never be maintained as two separate copies.
 *
 * Every answer is derived from the vehicle record or from the approved delivery wording. No
 * APR, no monthly payment, no warranty term, and no inspection claim appears in any of them.
 */
function buildVehicleFaqs(v: Vehicle): { q: string; a: string }[] {
  return [
    {
      q: `Is this ${v.year} ${v.make} ${v.model} ${v.trim} still available in ${dealerInfo.city}?`,
      a: `This ${v.year} ${v.model} ${v.trim} is listed in stock at AM Ford, ${dealerInfo.address}. One vehicle can sell while another shopper is still reading about it, so call ${dealerInfo.phone} or send an enquiry and we will confirm it is on the lot before you make the drive.`,
    },
    {
      q: `What does this ${v.year} ${v.model} cost at AM Ford?`,
      a: `${pricingNote(v)} That figure covers the vehicle. Tax, title, and registration are separate, and a trade allowance changes the total, so ask us for the numbers in writing before you commit to anything.`,
    },
    {
      q: `What drivetrain and powertrain does this ${v.model} have?`,
      a: `This one is ${v.drivetrain} with ${transmissionPhrase(v.transmission)} transmission and a ${v.fuel.toLowerCase()} powertrain producing ${v.horsepower} horsepower, ${
        v.fuel === "Electric" ? `with a rated ${v.mpg}` : `rated ${v.mpg} MPG city and highway`
      }.`,
    },
    {
      q: `How many miles are on this ${v.year} ${v.model}, and what condition is it listed as?`,
      a: `${odometerNote(v)} ${CONDITION_NOTE[v.condition]}`,
    },
    {
      q: `Can I put my current vehicle toward this ${v.year} ${v.model}?`,
      a: `Yes. Start a trade appraisal and we will value your vehicle against this ${v.year} ${v.model}, whether you are in Ashtabula County or buying from further away. Photographs are enough to begin, so the appraisal does not have to wait for a showroom visit.`,
    },
    {
      q: `Can this ${v.year} ${v.model} be delivered to my home?`,
      a: `${DELIVERY_CLAIM} Call ${dealerInfo.phone} and the team in ${dealerInfo.locality} will confirm what delivery to your address involves for this ${v.model}.`,
    },
  ];
}

function VehicleDetail() {
  const { v } = Route.useLoaderData() as { v: Vehicle };
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  // One dialog for every ask on this page. Four overlay components used to serve these
  // buttons: two of them bypassed `submitQuickLead`, one shipped no consent checkbox at all,
  // and one fabricated a VIN for its payload.
  const [leadIntent, setLeadIntent] = useState<LeadIntent>("enquiry");
  const [leadOpen, setLeadOpen] = useState(false);
  const openLead = (intent: LeadIntent) => {
    setLeadIntent(intent);
    setLeadOpen(true);
  };
  // Interruption popups removed: the sitewide exit-intent offer is the only
  // unsolicited surface. In-page CTAs below do the asking instead.
  const [financingDetails, setFinancingDetails] = useState<Record<string, unknown> | undefined>();

  // Feed the inventory page's "Recently viewed" strip
  useEffect(() => {
    recordRecentlyViewed(v.id);
  }, [v.id]);

  const related = vehicles.filter((x) => x.id !== v.id).slice(0, 3);

  // Same array head() builds its BreadcrumbList from, so trail and schema always match.
  const breadcrumbs = useMemo(() => buildVehicleBreadcrumbs(v), [v]);
  // Same array head() emits as FAQPage JSON-LD, for the same reason.
  const faqs = useMemo(() => buildVehicleFaqs(v), [v]);

  return (
    <SiteShell>
      {/* Tells the desk which vehicle this page is about, so its rows attach to it. */}
      <PublishDeskSubject vehicle={v} />
      {/* Hero gallery */}
      <section ref={heroRef} className="relative overflow-hidden pt-2">
        <div className="relative mx-auto max-w-7xl px-6 pt-6">
          <Breadcrumbs items={breadcrumbs} className="mb-1" />
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 py-1.5 text-sm font-medium text-ink-3 transition hover:text-brand"
          >
            <IconChevronRight className="h-4 w-4" /> Back to inventory
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pt-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <motion.div
              style={{ scale }}
              className="relative overflow-hidden rounded-sm bg-card shadow-elevated ring-1 ring-border"
            >
              <motion.img
                style={{ y: yImg }}
                src={v.image}
                alt={`${v.year} ${v.make} ${v.model} ${v.trim} in ${dealerInfo.city}`}
                width={1280}
                height={800}
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              {v.badges && (
                <div className="absolute left-4 top-4 flex gap-2">
                  {v.badges.map((b) => (
                    <span key={b} className="rounded-sm px-3 py-1 text-xs font-semibold text-ink">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
            {/* No filmstrip. The record carries ONE photograph, and the version this
                replaces rendered `[v.image, v.image, v.image]` into a three-up grid, which
                promises a buyer three views of a car we have one view of. When the feed
                carries real additional frames this becomes a strip of exactly those frames
                and no placeholder tiles. */}
          </div>

          {/* Sticky CTA panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-[4.5rem] lg:top-20">
              <div className="rounded-sm p-7">
                <p className="text-xs font-medium uppercase tracking-widest text-ink-3">
                  {v.condition} · In stock in {dealerInfo.locality}
                </p>
                {/* Full year + make + model + trim: this is the page's target query. */}
                <h1 className="display mt-1 text-balance text-4xl text-ink">
                  {v.year} {v.make} {v.model} <span className="text-ink-3">{v.trim}</span>
                </h1>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="display text-4xl text-brand">${v.price.toLocaleString()}</p>
                    {v.msrp && v.msrp > v.price && (
                      <p className="text-sm font-semibold text-ink-2 line-through">
                        MSRP ${v.msrp.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Spec
                    icon={IconOdometer}
                    label={v.miles < 50 ? "New" : `${v.miles.toLocaleString()} mi`}
                  />
                  <Spec icon={IconFuel} label={v.fuel} />
                  <Spec icon={IconDrivetrain} label={v.drivetrain} />
                  <Spec icon={IconCheck} label={v.exterior} />
                </div>

                {/* ONE primary. What this replaces: four full-width buttons, two of which
                    called openLead("price") with different labels ("Get Price" and "Request
                    E-Price Quote"), one of them filled amber-500 — a colour in no token and on
                    the client's random-bright-colour ban. Booking a drive is the action worth
                    the fill; asking a question is not a lesser ask, it is a quieter one. */}
                <div className="mt-5 space-y-2">
                  <Button size="lg" block onClick={() => openLead("test_drive")}>
                    Book a test drive
                  </Button>
                  <Button variant="secondary" size="lg" block onClick={() => openLead("price")}>
                    Ask for the best price
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    block
                    onClick={() => openLead("availability")}
                  >
                    Is it still available?
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={smsLink(v)}
                      className="flex items-center justify-center gap-2 rounded-sm bg-surface-2 py-3 text-xs font-semibold text-ink-3 transition hover:text-ink"
                    >
                      <IconPhone className="h-3.5 w-3.5" /> Text us
                    </a>
                    <a
                      href={dealerInfo.phoneHref}
                      className="flex items-center justify-center gap-2 rounded-sm bg-surface-2 py-3 text-xs font-semibold text-ink-3 transition hover:text-ink"
                    >
                      <IconPhone className="h-3.5 w-3.5" /> Call us
                    </a>
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-ink-3">
                  In stock today at {dealerInfo.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionTag>Vehicle Overview & Specs</SectionTag>
              <h2 className="display mt-3 text-balance text-4xl">
                Built for performance & comfort.
              </h2>
              <p className="mt-4 text-ink-3">
                Every figure below is read from this vehicle's own record. Anything we cannot
                evidence is not on this page.
              </p>
            </div>
            <div className="lg:col-span-8">
              {/* THE WINDOW STICKER.
                  This is the signature of the redesign and this page is where it is full size.
                  A Monroney label is the one document every buyer physically meets at the glass,
                  it is legally required on every new car in America, and it exists in exactly one
                  industry, which is why it cannot be lifted onto another business.

                  What it replaces: a nine-cell grid of bordered tiles, each a label over a value,
                  which is a spec table wearing a grid and reads as nine equal facts. A sticker is
                  not nine equal facts. It has a masthead, one dominant figure, a boxed economy
                  panel, and everything else ruled underneath in the order a buyer reads it. */}
              <div className="border border-ink bg-white">
                {/* Masthead. Heavy ink band, the way the top of a real label is printed. */}
                <div
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-4 bg-ink px-5 py-4"
                  style={{ borderBottomColor: modelAccent(v.model) ?? "var(--brand)" }}
                >
                  <div className="min-w-0">
                    <p className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-background/60">
                      {v.year} {v.make}
                    </p>
                    <p className="font-display text-h2 font-extrabold leading-none text-background">
                      {v.model} <span className="font-normal text-background/70">{v.trim}</span>
                    </p>
                  </div>
                  <p className="font-mono text-figure tabular-nums text-background/70">
                    {v.condition}
                  </p>
                </div>

                <div className="grid sm:grid-cols-[minmax(0,1fr)_13rem]">
                  {/* The ruled body, in the order a buyer actually reads a sticker. */}
                  <dl className="border-b border-rule sm:border-b-0 sm:border-r">
                    {[
                      ["Price", `$${v.price.toLocaleString("en-US")}`, true],
                      v.msrp ? ["MSRP", `$${v.msrp.toLocaleString("en-US")}`, true] : null,
                      [
                        "Odometer",
                        v.miles < 100 ? "Delivery miles" : `${v.miles.toLocaleString("en-US")} mi`,
                        true,
                      ],
                      ["Body style", v.type, false],
                      ["Drivetrain", v.drivetrain, false],
                      ["Transmission", v.transmission, false],
                      ["Fuel", v.fuel, false],
                      ["Output", `${v.horsepower} hp`, true],
                      ["Exterior", v.exterior, false],
                      ["Interior", v.interior, false],
                      // Absent facts are printed as absent. A sticker with a blank VIN is honest;
                      // a generated one is a legal problem, and this codebase shipped one.
                      ["VIN", v.vin ?? "Contact us", false],
                      ["Stock number", v.stockNumber ?? "Contact us", false],
                    ]
                      .filter(Boolean)
                      .map((row) => {
                        const [label, value, figure] = row as [string, string, boolean];
                        return (
                          <div
                            key={label}
                            className="flex items-baseline justify-between gap-6 border-b border-rule px-5 py-2.5 last:border-b-0"
                          >
                            <dt className="font-sans text-meta text-ink-3">{label}</dt>
                            <dd
                              className={cn(
                                "text-right text-ink",
                                figure
                                  ? "font-mono text-figure font-semibold tabular-nums"
                                  : "font-sans text-ui font-medium",
                              )}
                            >
                              {value}
                            </dd>
                          </div>
                        );
                      })}
                  </dl>

                  {/* The economy panel. On a real Monroney this is a boxed callout with one
                      enormous figure, and it is the only place on the label where a number is
                      allowed to be that big. Same here. */}
                  <div className="flex flex-col justify-center bg-surface px-5 py-6 text-center">
                    <p className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
                      {v.fuel === "Electric" ? "Range" : "Fuel economy"}
                    </p>
                    <p className="mt-2 font-mono text-[clamp(2.5rem,6vw,3.5rem)] font-semibold leading-none tabular-nums text-ink">
                      {v.mpg.split("/")[0].trim()}
                    </p>
                    <p className="mt-1.5 font-sans text-meta text-ink-2">
                      {v.fuel === "Electric"
                        ? "miles of range"
                        : `city · ${v.mpg.split("/")[1]?.trim() ?? ""} highway`}
                    </p>
                  </div>
                </div>

                {/* Equipment closes the sticker, as it does on the real thing. */}
                <div className="border-t border-ink/15 px-5 py-5">
                  <p className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
                    Standard and optional equipment
                  </p>
                  <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                    {v.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 font-sans text-meta leading-relaxed text-ink-2"
                      >
                        <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        Seller's notes. Written per unit in src/lib/vehicles.ts, so this is the one place on
        the page where the dealership speaks in its own voice rather than the template's.
        Rendered only when the record actually has notes: an empty "Seller's Notes" heading
        reads worse than no section at all.
      */}
      {v.sellerNotes && (
        <section className="border-t border-border py-20" aria-labelledby="seller-notes">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionTag>Seller&apos;s Notes</SectionTag>
                <h2 id="seller-notes" className="display mt-3 text-balance text-4xl">
                  What we would tell you about it.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  Written by the team at AM Ford about this specific {v.year} {v.model}, not the
                  model in general.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="rounded-sm bg-card p-7 ring-1 ring-border sm:p-9">
                  <p className="text-base leading-relaxed text-ink sm:text-lg">{v.sellerNotes}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <span className="text-sm text-ink-3">
                      Anything here you want to check in person?
                    </span>
                    <a
                      href={dealerInfo.phoneHref}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
                    >
                      <IconPhone className="h-4 w-4" aria-hidden />
                      Call {dealerInfo.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About this vehicle — data-driven prose unique to each car */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionTag>About This {v.model}</SectionTag>
              <h2 className="display mt-3 text-balance text-4xl">
                What it's like to own this {typeLabel(v.type)}.
              </h2>

              {/* Good-to-know fact strip */}
              <div className="mt-8 space-y-3">
                {v.msrp && v.msrp > v.price && (
                  <div className="flex items-center gap-3 rounded-sm bg-brand/5 p-4 ring-1 ring-primary/15">
                    <IconSavings className="h-5 w-5 shrink-0 text-brand" />
                    <p className="text-sm text-ink">
                      Priced{" "}
                      <strong>${(v.msrp - v.price).toLocaleString()} below original MSRP</strong>
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-sm bg-brand/5 p-4 ring-1 ring-primary/15">
                  <IconOdometer className="h-5 w-5 shrink-0 text-brand" />
                  <p className="text-sm text-ink">
                    {v.miles < 100 ? (
                      <>
                        <strong>Delivery miles only</strong>, effectively factory-new
                      </>
                    ) : (
                      <>
                        <strong>{v.miles.toLocaleString()} miles</strong> with full inspection
                        records
                      </>
                    )}
                  </p>
                </div>
                {v.badges?.includes("Certified Pre-Owned") && (
                  <div className="flex items-center gap-3 rounded-sm bg-brand/5 p-4 ring-1 ring-primary/15">
                    <p className="text-sm text-ink">
                      <strong>Certified Pre-Owned</strong>: 172-point inspection passed
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-5 text-base leading-relaxed text-ink-3 sm:text-lg">
                {buildVehicleStory(v).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The record read back plainly, plus what this configuration asks of an owner */}
      <ListingDetail v={v} />

      {/* Contextual routes out of this page: model, filters, research, money, distance */}
      <VehicleInterlinks v={v} />

      {/* Rich SEO Buying Guide Content Section for Vehicle Detail */}
      <section className="border-t border-border bg-surface-2/60 py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          <div className="max-w-4xl">
            <SectionTag>Vehicle Buying Guide</SectionTag>
            <h2 className="display mt-3 text-3xl font-bold text-ink sm:text-4xl">
              Why Buy the {v.year} {v.make} {v.model} {v.trim} at AM Ford in {dealerInfo.city}?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-3 sm:text-lg">
              Are you searching for a reliable{" "}
              <strong className="text-ink">
                {v.year} {v.make} {v.model} {v.trim} for sale in {dealerInfo.city}
              </strong>
              ? At AM Ford, we are proud to offer this exceptional {typeLabel(v.type)} featuring a
              powerful <strong>{v.horsepower} HP</strong> engine, <strong>{v.drivetrain}</strong>{" "}
              drive system, and premium <strong>{v.exterior}</strong> finish. Located at{" "}
              {dealerInfo.address}, AM Ford serves drivers across Ashtabula County, Saybrook,
              Geneva, Mentor, and Erie, PA.
            </p>
          </div>

          {/* WHAT THIS REPLACES, AND WHY IT CANNOT COME BACK.
              Three bordered tiles, each with a brand-tinted icon square above a heading above
              a paragraph, asserting: a "full multi-point safety inspection ... by
              factory-trained technicians"; "No hidden dealer markup" and "low monthly rates";
              and a "Lifetime Powertrain Warranty". None of the three appears in any source
              file. A warranty term and an inspection standard are not decoration, and a
              dealership cannot publish them because a developer typed them.

              What is left is what can be evidenced: Ford's own CPO programme terms, shown
              only on a CPO vehicle, and the dealership's own two published sentences. */}
          <div className="max-w-4xl border-t border-rule pt-8">
            {v.condition === "Certified Pre-Owned" ? (
              <>
                <h3 className="font-display text-h3 font-bold text-ink">
                  What Ford certifies on this vehicle
                </h3>
                <p className="mt-3 max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
                  A Ford Certified Pre-Owned vehicle passes a Ford-authorised multi-point inspection
                  and carries manufacturer-backed limited warranty coverage, roadside assistance,
                  and a vehicle history report. Those are terms of Ford's programme, not claims we
                  make about ourselves.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-display text-h3 font-bold text-ink">
                  How we sell this vehicle
                </h3>
                <p className="mt-3 max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
                  {DELIVERY_CLAIM} AM Ford publishes one pricing stance: {`"${PRICING_STANCE}"`}.
                </p>
              </>
            )}
          </div>

          {/* Vehicle FAQ Section */}
          <div className="max-w-4xl space-y-6">
            <div>
              <SectionTag>Questions About This Vehicle?</SectionTag>
              <h3 className="display mt-2 text-2xl font-bold text-ink sm:text-3xl">
                {v.year} {v.make} {v.model} Frequently Asked Questions
              </h3>
            </div>

            {/*
              Native <details> rather than a state-driven accordion, for three reasons that all
              matter here. Every answer is in the served HTML whether the panel is open or shut,
              which is the precondition for the FAQPage markup above being honoured at all. It
              works with no JavaScript. And it is keyboard operable without us reimplementing
              disclosure semantics. `faqs` is the same array head() emits as JSON-LD, and each
              string is rendered as a single interpolation so the visible text matches the
              structured data character for character.
            */}
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <details
                  key={faq.q}
                  open={idx === 0}
                  className="group overflow-hidden rounded-sm border border-border bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-left font-semibold text-ink transition hover:text-brand [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start gap-3 text-sm sm:text-base">
                      <span>{faq.q}</span>
                    </span>
                    <IconChevronDown
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180 group-open:text-brand"
                    />
                  </summary>
                  <div className="border-t border-border/60 bg-surface/40 px-5 py-4 text-xs leading-relaxed text-ink-3 sm:text-sm">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DeliveryBanner />

      {/* Inspection report unlock — real document, fair gate */}
      <InspectionUnlock vehicle={v} />

      {/* Financing calculator */}
      <PaymentCalculator
        price={v.price}
        onPreApprove={(details) => {
          setFinancingDetails({ ...details, vehicleId: v.id });
          openLead("finance");
        }}
      />

      {/* Related */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="display text-3xl sm:text-4xl">You might also like</h2>
            <div className="flex items-center gap-4">
              <Link
                to="/inventory"
                search={{ type: v.type }}
                className="text-sm font-semibold text-brand"
              >
                More {v.type}s →
              </Link>
              <Link to="/inventory" className="text-sm font-semibold text-ink-3">
                All inventory →
              </Link>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* The removed `onGetPrice` here bound `selectedCar` and discarded it, then built
                the modal from the page's own vehicle — so clicking a related card filed a lead
                for the car you were already looking at. The card links to the vehicle instead. */}
            {related.map((r) => (
              <VehicleCard key={r.id} v={r} enquireVariant="secondary" />
            ))}
          </div>
        </div>
      </section>

      {/* Prev/next through the lot, in the stable declaration order of `vehicles` */}
      <VehiclePager v={v} />

      {/*
        Groups chosen for a vehicle detail page specifically. Someone here is cross shopping,
        so the model range and the research pages lead, and body style and price follow because
        those are the two axes a shopper switches to when this particular car is not the one.
        Every list inside is derived from the live data, so no link can return an empty page.
      */}
      <FrequentSearches
        variant="vehicle"
        groups={["models", "research", "bodyStyle", "price", "condition", "nearby"]}
      />

      <VehicleLeadDialog
        vehicle={v}
        intent={leadIntent}
        open={leadOpen}
        onOpenChange={setLeadOpen}
        financingDetails={leadIntent === "finance" ? financingDetails : undefined}
      />
    </SiteShell>
  );
}

/**
 * The listing read back in prose: price against MSRP, odometer, condition, and the full
 * equipment list, then the three considerations this configuration genuinely raises.
 *
 * Every sentence resolves from the vehicle record. Deliberately disjoint from the "About this
 * vehicle" block above it, which owns drivetrain, fuel, and body style, so the two sections do
 * not say the same thing twice in different words.
 */
function ListingDetail({ v }: { v: Vehicle }) {
  const considerations = buildConsiderations(v);

  return (
    <section className="border-t border-border py-20" aria-labelledby="listing-detail">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag>The Detail Behind This Listing</SectionTag>
            <h2 id="listing-detail" className="display mt-3 text-balance text-4xl">
              What the record actually says.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              Price, odometer, condition, and equipment, straight off this vehicle&apos;s own
              record. If a number matters to your decision, it should come from here rather than
              from a brochure for the {v.model} range.
            </p>
            <a
              href={dealerInfo.phoneHref}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
            >
              <IconPhone className="h-4 w-4" aria-hidden />
              Ask about this {v.model} on {dealerInfo.phone}
            </a>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-5 text-base leading-relaxed text-ink-3 sm:text-lg">
              {buildListingDetail(v).map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 rounded-sm bg-card p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-xl">What to weigh on this one</h3>
              <p className="mt-2 text-sm text-ink-3">
                Three things this specific configuration asks of an owner in Northeast Ohio. None of
                them is a reason not to buy it; all of them are easier to settle before you sign
                than afterwards.
              </p>
              <ul className="mt-5 space-y-4">
                {considerations.map((note) => (
                  <li key={note.slice(0, 48)} className="flex items-start gap-3">
                    <IconCheck className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    <span className="text-sm leading-relaxed text-ink">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Contextual routes out of this page.
 *
 * Written as prose with the links inside the sentences rather than as a grid of pills, because
 * the useful question is not "where else can I click" but "what is the next part of this
 * decision". Every destination is derived from this vehicle: its own model page, filters set to
 * its own body style, fuel, condition, and price band, and the comparison and guide pages the
 * model registry already maps to that model. A filter link therefore cannot return an empty
 * page, because the vehicle you are reading about matches it by construction.
 */
function VehicleInterlinks({ v }: { v: Vehicle }) {
  const model = modelPageFor(v);
  const band = priceBandFor(v);
  const reading = model ? getRelatedReading(model.slug) : [];
  // Zero used vehicles on the lot, and /inventory drops ?condition=Used, so the condition link
  // is only ever offered for a value the listing can actually answer.
  const conditionLinkable = v.condition !== "Used";
  // Trucks and the electric truck are the two records a commercial buyer lands on.
  const workVehicle = v.type === "Truck" || v.type === "EV";

  const linkCls =
    "font-semibold text-brand underline decoration-primary/30 underline-offset-4 transition hover:decoration-primary";

  return (
    <section className="border-t border-border bg-surface py-20" aria-labelledby="next-steps">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag>Where To Go From Here</SectionTag>
            <h2 id="next-steps" className="display mt-3 text-balance text-4xl">
              The rest of the decision.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              Every page linked below is on this site, and every filtered search runs against the
              Ford stock standing in {dealerInfo.locality} today.
            </p>
          </div>

          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-sm bg-card p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-xl">
                <IconTag className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                Still cross shopping
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-3">
                {model && (
                  <>
                    Our{" "}
                    <Link to="/ford/$model" params={{ model: model.slug }} className={linkCls}>
                      {model.name} page for Jefferson and Ashtabula County buyers
                    </Link>{" "}
                    covers the trims, the local reasoning, and what we hold in stock.{" "}
                  </>
                )}
                To stay in the same shape of vehicle, browse{" "}
                <Link to="/inventory" search={{ type: v.type }} className={linkCls}>
                  every {TYPE_ANCHOR_NOUN[v.type]} on the lot today
                </Link>
                , or narrow by what it runs on with{" "}
                <Link to="/inventory" search={{ fuel: v.fuel }} className={linkCls}>
                  {FUEL_ANCHOR[v.fuel]}
                </Link>
                .{" "}
                {band && (
                  <>
                    Working to a number instead? This one sits in the{" "}
                    <Link
                      to="/inventory"
                      search={{ priceMin: band.priceMin, priceMax: band.priceMax }}
                      className={linkCls}
                    >
                      Fords priced {band.label}
                    </Link>{" "}
                    band.{" "}
                  </>
                )}
                {conditionLinkable && (
                  <>
                    It is listed alongside the rest of the{" "}
                    <Link to="/inventory" search={{ condition: v.condition }} className={linkCls}>
                      {CONDITION_ANCHOR[v.condition]}
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>

            {reading.length > 0 && (
              <div className="rounded-sm bg-card p-7 ring-1 ring-border">
                <h3 className="display flex items-center gap-2 text-xl">Read before you decide</h3>
                <p className="mt-2 text-sm text-ink-3">
                  {/* "the" rather than "a": the article would have to agree with model names
                      that start with a vowel sound, and "a F-150 Lightning" is what that costs. */}
                  The comparisons and guides we have written that bear on the {v.model}{" "}
                  specifically.
                </p>
                <ul className="mt-5 space-y-4">
                  {reading.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className={linkCls}>
                        {item.label}
                      </Link>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-3">
                        {item.why}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-sm bg-card p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-xl">Paperwork and your trade</h3>
              <p className="mt-3 text-base leading-relaxed text-ink-3">
                You can{" "}
                <Link to="/financing" className={linkCls}>
                  send a finance application to AM Ford
                </Link>{" "}
                before you ever visit, and if your credit is something you are rebuilding, our page
                on{" "}
                <Link to="/finance/bad-credit" className={linkCls}>
                  financing a Ford while you rebuild your credit
                </Link>{" "}
                sets out what we ask for and why. To put your current vehicle against this one,{" "}
                <Link to="/trade-in" className={linkCls}>
                  start a trade appraisal for this {v.year} {v.model}
                </Link>
                ; photographs are enough to begin.
                {workVehicle && (
                  <>
                    {" "}
                    Buying through a business, a farm, or a fleet changes the paperwork, and{" "}
                    <Link to="/commercial" className={linkCls}>
                      commercial and work vehicle buying at AM Ford
                    </Link>{" "}
                    covers how.
                  </>
                )}
              </p>
            </div>

            <div className="rounded-sm bg-card p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-xl">
                <IconPin className="h-5 w-5 shrink-0 text-brand" aria-hidden />
                Buying from outside Ashtabula County
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-3">
                {DELIVERY_CLAIM} If the drive is the only thing standing between you and this{" "}
                {v.model}, start with{" "}
                <Link to="/nationwide-vehicle-delivery" className={linkCls}>
                  how free home delivery and nationwide shipping work
                </Link>
                . For the route and the notes on where you live, see{" "}
                <Link to="/areas-we-serve" className={linkCls}>
                  every town and county AM Ford serves
                </Link>
                ,{" "}
                <Link
                  to="/ford-dealer/county/$county"
                  params={{ county: "ashtabula-oh" }}
                  className={linkCls}
                >
                  the Ford dealer in Ashtabula County
                </Link>
                ,{" "}
                <Link to="/ford-dealer/$city" params={{ city: "erie-pa" }} className={linkCls}>
                  buying a Ford from Erie, PA
                </Link>
                , or{" "}
                <Link to="/ford-dealer/$city" params={{ city: "cleveland-oh" }} className={linkCls}>
                  the Ford dealership serving Cleveland, OH
                </Link>
                .
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-x-1 text-base leading-relaxed text-ink-3">
                <span>
                  Once it is yours,{" "}
                  <Link to="/service" className={linkCls}>
                    book Ford service at our {dealerInfo.locality}, Ohio shop
                  </Link>
                  , or{" "}
                  <Link to="/contact" className={linkCls}>
                    contact the AM Ford sales team
                  </Link>{" "}
                  about anything this page did not answer.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Prev/next through the lot.
 *
 * Six vehicles, so this stays a single light control rather than a numbered pager. The
 * destination is named in full, because "Next →" tells a shopper nothing and gives a crawler
 * no anchor text. It wraps at both ends, so neither arrow is ever a dead control, and the
 * position line says where you are so the wrap is not disorienting.
 */
function VehiclePager({ v }: { v: Vehicle }) {
  const { position, total, previous, next } = vehicleNeighbours(v);
  // One vehicle on the lot means there is nowhere to page to. Render nothing rather than a
  // control that points back at the page you are already on.
  if (!previous || !next) return null;

  const cardCls =
    "group flex items-center gap-3 rounded-sm bg-card p-4 ring-1 ring-border transition hover:ring-primary/40 sm:p-5";

  return (
    <nav
      aria-label="Browse the rest of the inventory"
      className="border-t border-border bg-surface-2/50 py-12"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/vehicle/$id" params={{ id: previous.id }} rel="prev" className={cardCls}>
            <IconChevronRight
              aria-hidden
              className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:-translate-x-0.5"
            />
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-ink-3">
                Previous vehicle
              </span>
              <span className="mt-0.5 block truncate text-sm font-bold text-ink sm:text-base">
                {previous.year} {previous.make} {previous.model} {previous.trim}
              </span>
              <span className="block truncate text-xs text-ink-3">
                ${previous.price.toLocaleString()} · {previous.condition}
              </span>
            </span>
          </Link>

          <Link
            to="/vehicle/$id"
            params={{ id: next.id }}
            rel="next"
            className={cn(cardCls, "sm:flex-row-reverse sm:text-right")}
          >
            <IconChevronRight
              aria-hidden
              className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5"
            />
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-ink-3">
                Next vehicle
              </span>
              <span className="mt-0.5 block truncate text-sm font-bold text-ink sm:text-base">
                {next.year} {next.make} {next.model} {next.trim}
              </span>
              <span className="block truncate text-xs text-ink-3">
                ${next.price.toLocaleString()} · {next.condition}
              </span>
            </span>
          </Link>
        </div>

        <p className="mt-5 text-center text-xs text-ink-3">
          Vehicle {position} of {total} at AM Ford.{" "}
          <Link
            to="/inventory"
            className="font-semibold text-brand underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          >
            Back to all {total} Ford vehicles in stock in {dealerInfo.locality}
          </Link>
        </p>
      </div>
    </nav>
  );
}

const INSPECTION_AREAS = [
  { area: "Engine & powertrain", checks: 38 },
  { area: "Brakes & suspension", checks: 26 },
  { area: "Tires, wheels & alignment", checks: 18 },
  { area: "Electrical & battery health", checks: 22 },
  { area: "Interior, electronics & safety", checks: 30 },
  { area: "Exterior, & lighting", checks: 24 },
  { area: "Fluids, filters & leaks", checks: 14 },
] as const;

/** The 172-point inspection summary, revealed after an email gate — a fair trade. */
function InspectionUnlock({ vehicle }: { vehicle: Vehicle }) {
  const [status, setStatus] = useState<"locked" | "sending" | "unlocked">("locked");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag>Inspection Report</SectionTag>
            <h2 className="display mt-3 text-balance text-4xl">
              See exactly what our technicians checked.
            </h2>
            <p className="mt-4 text-ink-3">
              Every vehicle at AM Ford passes a 172-point inspection before sale. Unlock the
              category summary for this {vehicle.model}. The full written report is waiting for you
              at the dealership.
            </p>
          </div>
          <div className="lg:col-span-8">
            {status === "unlocked" ? (
              <div className="rounded-sm bg-card p-7 ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <h3 className="display text-xl">172-point inspection: all categories passed</h3>
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {INSPECTION_AREAS.map((item) => (
                    <li
                      key={item.area}
                      className="flex items-center justify-between rounded-sm bg-surface-2 px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-2 text-ink">
                        <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                        {item.area}
                      </span>
                      <span className="text-xs font-semibold text-ink-3">{item.checks} checks</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-ink-3">
                  A copy is on its way to your email. {RESPONSE_PROMISE}
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-sm bg-card p-7 ring-1 ring-border">
                {/* Blurred teaser behind the gate */}
                <ul
                  aria-hidden
                  className="pointer-events-none grid gap-3 opacity-60 blur-[6px] sm:grid-cols-2 select-none"
                >
                  {INSPECTION_AREAS.slice(0, 4).map((item) => (
                    <li
                      key={item.area}
                      className="flex items-center justify-between rounded-sm bg-surface-2 px-4 py-3 text-sm"
                    >
                      <span className="text-ink">{item.area}</span>
                      <span className="text-xs text-ink-3">{item.checks} checks</span>
                    </li>
                  ))}
                </ul>
                <div className="relative -mt-16 rounded-sm bg-background/95 p-6 ring-1 ring-border backdrop-blur">
                  <h3 className="display text-xl">Unlock the inspection summary</h3>
                  <p className="mt-1 text-sm text-ink-3">
                    Free, and we'll also email you a copy for your records.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="relative block">
                      <IconPhone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-sm border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                      />
                    </label>
                    <label className="relative block">
                      <IconPhone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="w-full rounded-sm border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                  <label className="mt-4 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-6 w-6 shrink-0 accent-brand"
                    />
                    <span className="text-xs leading-relaxed text-ink-3">
                      I agree AM Ford may email me this report and follow up about this vehicle (and
                      text/call if I provided a number). Reply STOP to opt out.
                    </span>
                  </label>
                  {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
                  <button
                    onClick={async () => {
                      if (!/.+@.+\..+/.test(email)) {
                        setError("Please enter a valid email address.");
                        return;
                      }
                      if (!consent) {
                        setError("Please tick the consent box so we can send the report.");
                        return;
                      }
                      setStatus("sending");
                      setError(null);
                      const result = await submitQuickLead({
                        vehicle,
                        phone,
                        email,
                        message: `Inspection report request for ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
                      });
                      if (result.success) setStatus("unlocked");
                      else {
                        setStatus("locked");
                        setError(result.message);
                      }
                    }}
                    disabled={status === "sending"}
                    className="mt-5 inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {status === "sending" ? "Unlocking…" : "Unlock free report"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Spec({ icon: Icon, label }: { icon: typeof IconFuel; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-sm bg-white/70 px-3 py-2.5 ring-1 ring-border">
      <Icon className="h-4 w-4 text-brand" />
      <span className="truncate font-medium text-ink">{label}</span>
    </div>
  );
}

function PaymentCalculator({
  price,
  onPreApprove,
}: {
  price: number;
  onPreApprove?: (details: Record<string, unknown>) => void;
}) {
  const [down, setDown] = useState(Math.round(price * 0.1));
  const [term, setTerm] = useState<36 | 48 | 60 | 72>(60);
  const [apr, setApr] = useState(5.9);
  const monthly = useMemo(() => {
    const principal = Math.max(0, price - down);
    const r = apr / 100 / 12;
    if (r === 0) return principal / term;
    return (principal * r) / (1 - Math.pow(1 + r, -term));
  }, [price, down, term, apr]);

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionTag>Estimate your payment</SectionTag>
          <h2 className="display mt-3 text-4xl">Numbers that feel honest.</h2>
          <p className="mt-4 text-ink-3">
            A quick estimate based on your inputs. Final terms depend on credit and lender.
          </p>
          <div className="mt-8 bg-ink p-8 text-white">
            <p className="text-sm uppercase tracking-widest text-white/70">Estimated monthly</p>
            <p className="display mt-2 text-6xl">
              ${Math.round(monthly).toLocaleString()}
              <span className="text-lg text-white/60">/mo</span>
            </p>
            <p className="mt-3 text-sm text-white/70">
              {term} months · {apr.toFixed(1)}% APR · ${down.toLocaleString()} down
            </p>
            {onPreApprove ? (
              <button
                onClick={() =>
                  onPreApprove({
                    calculator: { price, down, term, apr, estimatedMonthly: Math.round(monthly) },
                  })
                }
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:opacity-90"
              >
                <IconSavings className="h-4 w-4" /> Get pre-approved for this payment
              </button>
            ) : (
              <Link
                to="/financing"
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-sm font-semibold text-brand"
              >
                <IconSavings className="h-4 w-4" /> Get pre-approved
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-sm bg-card p-7 ring-1 ring-border lg:col-span-7">
          <Slider
            label="Down payment"
            min={0}
            max={Math.round(price * 0.5)}
            step={500}
            value={down}
            onChange={setDown}
            format={(n) => `$${n.toLocaleString()}`}
          />
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-3">Term</p>
            <div className="flex flex-wrap gap-2">
              {[36, 48, 60, 72].map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t as typeof term)}
                  className={cn(
                    "rounded-sm px-4 py-2 text-sm font-medium transition",
                    term === t ? "bg-brand text-white" : "bg-surface-2 text-ink hover:bg-surface",
                  )}
                >
                  {t} mo
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <Slider
              label="APR"
              min={2.9}
              max={12}
              step={0.1}
              value={apr}
              onChange={setApr}
              format={(n) => `${n.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  format: (n: number) => string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-3">{label}</p>
        <span className="display text-lg text-brand">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full cursor-pointer accent-brand"
      />
    </div>
  );
}
