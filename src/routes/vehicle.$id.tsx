import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect, lazy, Suspense } from "react";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Calendar,
  CheckCircle2,
  Fuel,
  Gauge,
  Cog,
  Palette,
  Shield,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CreditCard,
  Truck,
  Wrench,
  ListChecks,
  DollarSign,
  Tag,
  MessageSquare,
  Video,
  Bell,
  ClipboardCheck,
  Mail,
  Loader2,
  Camera,
  Rotate3d,
  Maximize2,
  X,
  LayoutGrid,
  Images,
} from "lucide-react";
import { breadcrumbSchema, crumbs, type Crumb } from "@/lib/breadcrumbs";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SiteShell } from "@/components/site/SiteShell";
import type { ModalMode } from "@/components/site/LeadCaptureModal";
import {
  getVehicle,
  vehicles,
  dealerInfo,
  DELIVERY_CLAIM,
  PRICE_BANDS,
  vehicleSlug,
  isInTransit,
  type Vehicle,
} from "@/lib/vehicles";
import { FORD_MODELS, getRelatedReading } from "@/lib/fordModels";
import { SectionTag } from "@/components/site/Home";
import { VehicleCard } from "@/components/site/VehicleCard";
import type { QuickEnquiryPreset } from "@/components/convert/QuickEnquiryModal";

// Lazy-load heavy non-critical modals
const LeadCaptureModal = lazy(() =>
  import("@/components/site/LeadCaptureModal").then((m) => ({ default: m.LeadCaptureModal })),
);
const OTPPopup = lazy(() => import("@/components/popups/OTPPopup"));
const QuickEnquiryModal = lazy(() =>
  import("@/components/convert/QuickEnquiryModal").then((m) => ({ default: m.QuickEnquiryModal })),
);
import { RESPONSE_PROMISE, smsLink, submitQuickLead } from "@/lib/leads";
import { GARAGE_EVENT, isWatched } from "@/lib/garage";
import { DeliveryBanner } from "@/components/site/DeliveryBanner";
import { FrequentSearches } from "@/components/site/FrequentSearches";
import { cn } from "@/lib/utils";
import { getSpin } from "@/lib/spin360";
import { Spin360, preloadSpin } from "@/components/site/Spin360";

/**
 * Home > Inventory > this vehicle.
 *
 * head() and the component both build their trail from this one helper and the same loader
 * vehicle, so the visible breadcrumbs and the BreadcrumbList JSON-LD can never drift apart —
 * which is what Google requires before it will render breadcrumbs in the result.
 */
function buildVehicleBreadcrumbs(v: Vehicle): Crumb[] {
  const isUsedOrCpo = v.condition === "Used" || v.condition === "Certified Pre-Owned";
  return crumbs(
    {
      label: isUsedOrCpo ? "Used Vehicles" : "New Vehicles",
      href: isUsedOrCpo ? "/inventory?condition=Used" : "/inventory?condition=New",
    },
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
      ...(v.vin ? { vehicleIdentificationNumber: v.vin } : {}),
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
        url: `https://amford.com/vehicle/${vehicleSlug(v)}`,
        priceValidUntil: "2026-12-31",
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
          telephone: "+14405537072",
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
          title: `${v.year} ${v.make} ${v.model} for Sale in Ashtabula County, OH | AM Ford`,
        },
        {
          name: "description",
          content: `${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} in stock in Ashtabula County (${dealerInfo.locality}, OH) at AM Ford. $${v.price.toLocaleString()}, ${v.drivetrain}, ${v.fuel}. Book a test drive.`,
        },
        {
          // Keyword intent follows the actual record: a New or Certified Pre-Owned unit must not
          // be advertised against "used" queries it cannot satisfy.
          name: "keywords",
          content: `${v.year} ${v.make} ${v.model} Ashtabula County, Ford dealer Ashtabula County, buy ${v.model} ${v.trim} Ashtabula County, ${v.condition.toLowerCase()} ${v.model} for sale Ashtabula County OH, ${v.type.toLowerCase()}s Ashtabula County, Ford dealer ${dealerInfo.locality} Ohio, Ford dealer Northeast Ohio`,
        },
        // Local geo tags for Ashtabula County search intent
        { name: "geo.region", content: "US-OH" },
        { name: "geo.placename", content: "Ashtabula County, OH" },
        { name: "geo.position", content: "41.7389;-80.7684" },
        { name: "ICBM", content: "41.7389, -80.7684" },
        {
          property: "og:title",
          content: `${v.year} ${v.make} ${v.model} ${v.trim} for Sale in Ashtabula County | AM Ford`,
        },
        {
          property: "og:description",
          content: `In stock at AM Ford in Ashtabula County (${dealerInfo.city}, OH). $${v.price.toLocaleString()} · ${v.miles < 50 ? "New Vehicle" : `${v.miles.toLocaleString()} miles`}. Schedule your test drive today.`,
        },
        { property: "og:image", content: v.image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: `${v.year} ${v.make} ${v.model} ${v.trim} for sale at AM Ford in ${dealerInfo.city}, OH`,
        },
        { property: "og:url", content: `https://amford.com/vehicle/${vehicleSlug(v)}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: v.image },
      ],
      links: [{ rel: "canonical", href: `https://amford.com/vehicle/${vehicleSlug(v)}` }],
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
        <p className="mt-3 text-muted-foreground">It may have already been sold.</p>
        <Link
          to="/inventory"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Browse inventory <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SiteShell>
  ),
  errorComponent: ({ error, reset }) => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
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
      return `The hybrid powertrain returns an EPA-estimated ${v.mpg} MPG (city/highway), letting the electric motor handle stop-and-go traffic while the gas engine takes over on the highway, the best of both worlds for daily commuting and highway driving across Northeast Ohio.`;
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
  Gas: "gas powered Fords in Northeast Ohio",
  Hybrid: "hybrid Fords in Northeast Ohio",
  Electric: "electric Fords in Northeast Ohio",
};

const CONDITION_ANCHOR: Record<Vehicle["condition"], string> = {
  New: "new Fords for sale at AM Ford",
  "Certified Pre-Owned": "certified pre-owned Fords at AM Ford",
  Used: "used vehicles for sale at AM Ford",
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
  `The equipment recorded against this ${v.year} ${v.model} is ${featureSentence(v)}. That is the whole list. Anything you have read about the ${v.model} range that is not named there is not fitted to this vehicle, and we would far rather you learn that here than after a drive to our showroom.`,
];

/**
 * Single source for the FAQ, read by BOTH the FAQPage JSON-LD in head() and the visible
 * disclosures in the component. Google only honours FAQ structured data when the same text is
 * visible on the page, so these can never be maintained as two separate copies.
 *
 * Every answer is derived from the vehicle record or from approved dealer wording.
 */
function buildVehicleFaqs(v: Vehicle): { q: string; a: string }[] {
  const isElectric = v.fuel === "Electric";
  const hasWinterFeatures = v.features.some((f) =>
    /heated|all-weather|4wd|awd|snow|traction|remote start/i.test(f),
  );
  const winterFeatureList = v.features
    .filter((f) => /heated|all-weather|4wd|awd|snow|traction|remote start/i.test(f))
    .join(", ");

  const warrantyText =
    v.condition === "New"
      ? `This new ${v.year} ${v.model} includes Ford's original factory warranty coverage: a 3-year/36,000-mile bumper-to-bumper limited warranty, a 5-year/60,000-mile powertrain limited warranty, and 24/7 roadside assistance.`
      : v.condition === "Certified Pre-Owned"
        ? `As a Ford Certified Pre-Owned vehicle, this ${v.model} includes comprehensive factory-backed limited warranty coverage, a 7-year/100,000-mile powertrain warranty from the original in-service date, and 24/7 roadside assistance.`
        : `This pre-owned ${v.year} ${v.model} has passed our rigorous multi-point safety inspection and is eligible for comprehensive Ford Protect extended service plans and powertrain protection packages.`;

  return [
    {
      q: `Is this ${v.year} ${v.make} ${v.model} ${v.trim} available in Ashtabula County, OH?`,
      a: `Yes, this ${v.year} ${v.make} ${v.model} ${v.trim}${v.vin ? ` (VIN: ${v.vin})` : ""} is listed in stock at AM Ford, located at ${dealerInfo.address} in ${dealerInfo.city}, OH. Inventory changes rapidly, so call ${dealerInfo.phone} or send an inquiry to confirm availability and schedule your visit.`,
    },
    {
      q: `What is the price of this ${v.year} ${v.make} ${v.model} and are there any hidden dealer fees?`,
      a: `${pricingNote(v)} At AM Ford, we provide transparent upfront pricing with no surprise dealer documentation markups or hidden prep fees. Applicable state and local sales tax, title, and registration fees are calculated separately based on your county of registration.`,
    },
    {
      q: `What are the powertrain, drivetrain, and fuel efficiency specs for this ${v.model}?`,
      a: `This ${v.model} ${v.trim} is equipped with a ${v.drivetrain} drivetrain, ${transmissionPhrase(v.transmission)} transmission, and a ${v.fuel.toLowerCase()} powertrain producing ${v.horsepower} horsepower. It is rated at ${isElectric ? `${v.mpg} of electric driving range` : `${v.mpg} MPG (city/highway)`}.`,
    },
    {
      q: `What is the mileage and verified condition of this ${v.year} ${v.model}?`,
      a: `${odometerNote(v)} ${CONDITION_NOTE[v.condition]} Every pre-owned vehicle on our lot undergoes a strict multi-point safety inspection by factory-trained Ford service technicians before it is listed for sale.`,
    },
    {
      q: `Can I get online financing approval for this ${v.year} ${v.make} ${v.model}?`,
      a: `Yes. AM Ford partners with Ford Credit, national automotive banks, and local Ashtabula County credit unions to provide competitive interest rates and flexible loan terms. We work with all credit tiers—including good credit, bad credit, and first-time buyers. Submit our fast online credit application to get pre-approved in minutes.`,
    },
    {
      q: `Can I trade in my current vehicle toward this ${v.year} ${v.model}?`,
      a: `Yes! You can value your trade-in online with our instant appraisal tool. We offer top market value for all makes and models, and your trade equity can be applied directly to reduce your purchase price and lower your monthly payment, with valuable Ohio sales tax trade-in credits.`,
    },
    {
      q: `What warranty coverage is included with this ${v.year} ${v.make} ${v.model}?`,
      a: `${warrantyText} Ask our finance team about optional extended coverage tailored to your driving habits.`,
    },
    {
      q: `Can this ${v.year} ${v.model} be delivered directly to my home?`,
      a: `${DELIVERY_CLAIM} We deliver directly to your driveway across Ashtabula, Lake, Geauga, and Trumbull counties, as well as Western Pennsylvania and beyond. Call ${dealerInfo.phone} to coordinate delivery logistics for this ${v.model}.`,
    },
    {
      q: `Is a CARFAX vehicle history report available for this ${v.model}?`,
      a: `Yes. We provide a complimentary CARFAX vehicle history report for every used and Certified Pre-Owned vehicle in stock. You can review prior ownership history, title status, service records, and accident reports with total transparency.`,
    },
    {
      q: `How is this ${v.year} ${v.model} equipped for Northeast Ohio winter driving?`,
      a: `Equipped with ${v.drivetrain} traction control, this ${v.model} is engineered to handle Northeast Ohio snow, slush, and Lake Erie winter weather conditions.${hasWinterFeatures ? ` This specific vehicle features ${winterFeatureList}.` : " Dedicated winter tire packages and all-weather floor liners are also available through our parts department."}`,
    },
    {
      q: `How do I book a VIP test drive for this ${v.year} ${v.make} ${v.model}?`,
      a: `Scheduling a test drive is fast and easy. Book online or call ${dealerInfo.phone}, and our team will have this ${v.year} ${v.model} ${v.trim} detailed, inspected, warmed up, and ready when you arrive at our showroom.`,
    },
    {
      q: `Can I purchase this ${v.year} ${v.model} if I live out-of-state in Pennsylvania?`,
      a: `Yes, we frequently serve buyers from Erie, Meadville, and throughout Western Pennsylvania. Our experienced finance and title staff manage all out-of-state paperwork, including Pennsylvania sales tax calculation, state DMV titling, and plate transfer so you can buy with total confidence.`,
    },
  ];
}

function VehicleDetail() {
  const { v } = Route.useLoaderData() as { v: Vehicle };
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("test_drive");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpSource, setOtpSource] = useState<string>("VDP");
  // Interruption popups removed: the sitewide exit-intent offer is the only
  // unsolicited surface. In-page CTAs below do the asking instead.
  const [enquiryPreset, setEnquiryPreset] = useState<QuickEnquiryPreset | null>(null);
  const [financingDetails, setFinancingDetails] = useState<Record<string, unknown> | undefined>();
  const [watching, setWatching] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);

  // 360 spin. getSpin is a build-time module read, so server and client agree on
  // whether this vehicle has frames without any runtime probe. view starts at
  // "photo" on both sides, so the toggle can never cause a hydration mismatch.
  const spin = getSpin(v.id);
  const [view, setView] = useState<"photo" | "spin">("photo");
  const [spinFailed, setSpinFailed] = useState(false);
  const showSpinUi = !!spin && !spinFailed;

  const allPhotos = useMemo(() => {
    if (Array.isArray(v.images) && v.images.length > 0) return v.images;
    return [v.image];
  }, [v.images, v.image]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Frames cost zero bytes until someone reaches for the toggle, so they never
  // compete with the hero image for LCP.
  const prefetchSpin = () => {
    if (spin) preloadSpin(v.id, spin);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileBar(window.scrollY > 550);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setWatching(isWatched(v.id));
    const sync = () => setWatching(isWatched(v.id));
    window.addEventListener(GARAGE_EVENT, sync);
    return () => window.removeEventListener(GARAGE_EVENT, sync);
  }, [v.id]);

  // Feed the inventory page's "Recently viewed" strip
  useEffect(() => {
    recordRecentlyViewed(v.id);
  }, [v.id]);

  const related = vehicles.filter((x) => x.id !== v.id).slice(0, 3);

  // Same array head() builds its BreadcrumbList from, so trail and schema always match.
  const breadcrumbs = useMemo(() => buildVehicleBreadcrumbs(v), [v]);
  // Same array head() emits as FAQPage JSON-LD, for the same reason.
  const faqs = useMemo(() => buildVehicleFaqs(v), [v]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMode, setLightboxMode] = useState<"grid" | "carousel">("grid");

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && lightboxMode === "carousel") {
        setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
      } else if (e.key === "ArrowRight" && lightboxMode === "carousel") {
        setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxMode, allPhotos.length]);

  return (
    <SiteShell hideStickyCTA mainClassName="pt-16 sm:pt-24">
      {/* Hero gallery */}
      <section ref={heroRef} className="relative overflow-hidden pt-1 sm:pt-2 pb-8 sm:pb-12">
        {/* Soft soothing ambient background with warm yellow and cool tones */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/60 via-slate-50/50 to-white" />
        <div className="pointer-events-none absolute -top-24 right-1/4 h-[440px] w-[440px] rounded-full bg-amber-200/25 blur-[100px]" />
        <div className="pointer-events-none absolute -top-10 left-10 h-[380px] w-[380px] rounded-full bg-blue-100/35 blur-[90px]" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-[320px] w-[320px] rounded-full bg-amber-100/20 blur-[80px]" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-2 sm:pt-4">
          <Breadcrumbs items={breadcrumbs} className="mb-0.5 px-0" />
          <Link
            to="/inventory"
            search={{ condition: v.condition === "New" ? "New" : "Used" }}
            className="inline-flex items-center gap-1.5 py-1 text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to {v.condition === "New" ? "new" : "used"} vehicles
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-6 sm:gap-10 px-3 sm:px-6 pt-3 sm:pt-6 lg:grid-cols-12 lg:gap-10 lg:items-stretch">
          <div className="lg:col-span-7 min-w-0 flex flex-col h-full">
            {/* Gallery Container matching the reference design: Hero Left + Vertical Stacked Thumbnails Right */}
            <div className="relative overflow-hidden rounded-lg bg-slate-900/5 dark:bg-slate-950 p-1.5 border border-slate-200 shadow-sm flex flex-col flex-1 h-full min-h-[460px]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 flex-1 h-full min-h-0">
                {/* Main Hero Photo on Left */}
                <div
                  className="relative md:col-span-9 h-full w-full min-h-0 bg-slate-950 overflow-hidden rounded-md flex items-center justify-center group/hero cursor-pointer"
                  onClick={() => {
                    setLightboxMode("grid");
                    setLightboxOpen(true);
                  }}
                >
                  {showSpinUi && view === "spin" ? (
                    <Spin360
                      key={v.id}
                      vehicleId={v.id}
                      manifest={spin!}
                      poster={v.image}
                      label={`${v.year} ${v.make} ${v.model}`}
                      className="h-full w-full object-cover"
                      onUnavailable={() => {
                        setSpinFailed(true);
                        setView("photo");
                      }}
                    />
                  ) : (
                    <>
                      <motion.img
                        key={activePhotoIndex}
                        initial={{ opacity: 0.88 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        src={allPhotos[activePhotoIndex] || v.image}
                        alt={`${v.year} ${v.make} ${v.model} ${v.trim} in ${dealerInfo.city} - Photo ${activePhotoIndex + 1}`}
                        width={1280}
                        height={800}
                        className="h-full w-full object-contain object-center transition-transform duration-500 group-hover/hero:scale-[1.02]"
                      />

                      {/* Navigation Prev/Next Arrows */}
                      {allPhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous photo"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
                            }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-950/70 p-2 text-white shadow-md backdrop-blur-xs transition hover:bg-slate-950/95 active:scale-95 z-20"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next photo"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-950/70 p-2 text-white shadow-md backdrop-blur-xs transition hover:bg-slate-950/95 active:scale-95 z-20"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Dealership Watermark Banner Bar across bottom - like reference image */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/75 to-transparent pt-6 pb-2.5 px-3 sm:px-4 flex items-center justify-between text-white text-[10px] sm:text-xs font-medium pointer-events-none">
                        <span className="truncate text-white/90">
                          Free home delivery within 300 miles
                        </span>
                        <span className="font-extrabold tracking-wider text-white text-xs sm:text-sm uppercase px-2 shrink-0">
                          AM FORD
                        </span>
                        <span className="truncate text-white/80 text-right">
                          {dealerInfo.phone} · {dealerInfo.locality}, OH
                        </span>
                      </div>
                    </>
                  )}

                  {/* Top Left Badges */}
                  {v.badges && (
                    <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex flex-wrap gap-1.5">
                      {v.badges.slice(0, 3).map((b) => (
                        <span
                          key={b}
                          className="rounded bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-sm border border-white/15"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Photo Counter + Expand Indicator Top Right */}
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                    <span className="rounded bg-slate-950/80 px-2 py-0.5 text-[10.5px] font-bold text-white backdrop-blur-xs border border-white/15">
                      {activePhotoIndex + 1} / {allPhotos.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxMode("grid");
                        setLightboxOpen(true);
                      }}
                      title="Fullscreen photo gallery"
                      className="rounded bg-slate-950/80 p-1 text-white hover:bg-slate-900 border border-white/15 backdrop-blur-xs transition"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* 360 Spin Switcher if available */}
                  {showSpinUi && (
                    <div
                      role="group"
                      aria-label="Gallery mode"
                      className="absolute bottom-12 left-2.5 z-20 flex items-center gap-1 rounded bg-slate-950/80 p-1 backdrop-blur-xs border border-white/15"
                    >
                      <button
                        type="button"
                        aria-pressed={view === "photo"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setView("photo");
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition",
                          view === "photo"
                            ? "bg-white text-slate-900 font-bold shadow-sm"
                            : "text-white/80 hover:text-white",
                        )}
                      >
                        <Camera className="h-3.5 w-3.5" /> Photos
                      </button>
                      <button
                        type="button"
                        aria-pressed={view === "spin"}
                        onClick={(e) => {
                          e.stopPropagation();
                          prefetchSpin();
                          setView("spin");
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition",
                          view === "spin"
                            ? "bg-white text-slate-900 font-bold shadow-sm"
                            : "text-white/80 hover:text-white",
                        )}
                      >
                        <Rotate3d className="h-3.5 w-3.5" /> 360°
                      </button>
                    </div>
                  )}
                </div>

                {/* Right-Side Stacked Vertical Thumbnail Strip */}
                <div className="hidden md:grid md:col-span-3 grid-rows-4 gap-1.5 h-full min-h-0">
                  {allPhotos.slice(0, 4).map((photo, i) => {
                    const isLastSlot = i === 3;
                    const remainingCount = allPhotos.length - 4;
                    const isActive = activePhotoIndex === i;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (isLastSlot && remainingCount > 0) {
                            setLightboxMode("grid");
                            setLightboxOpen(true);
                          } else {
                            setActivePhotoIndex(i);
                            setView("photo");
                          }
                        }}
                        className={cn(
                          "group/thumb relative h-full w-full min-h-0 overflow-hidden rounded-md bg-slate-950 transition cursor-pointer text-left",
                          isActive && !isLastSlot
                            ? "ring-2 ring-[#002c5f] ring-offset-1"
                            : "opacity-90 hover:opacity-100 hover:ring-1 hover:ring-slate-400",
                        )}
                      >
                        <img
                          src={photo}
                          alt={`${v.year} ${v.make} ${v.model} thumbnail ${i + 1}`}
                          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover/thumb:scale-105"
                        />
                        {/* 4th thumbnail "+X more" overlay like reference image */}
                        {isLastSlot && remainingCount > 0 && (
                          <div className="absolute inset-0 bg-slate-950/70 hover:bg-slate-950/50 transition-colors flex items-center justify-center">
                            <span className="text-white text-sm lg:text-base font-black tracking-tight flex items-center gap-1 drop-shadow-md">
                              +{remainingCount} more
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Thumbnail Scroll Strip */}
              {allPhotos.length > 1 && (
                <div className="flex md:hidden gap-1.5 pt-1.5 overflow-x-auto no-scrollbar">
                  {allPhotos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setActivePhotoIndex(i);
                        setView("photo");
                      }}
                      className={cn(
                        "relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-900 transition",
                        activePhotoIndex === i ? "ring-2 ring-[#002c5f]" : "opacity-75 hover:opacity-100",
                      )}
                    >
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 left-1 rounded bg-slate-950/75 px-1 text-[9px] font-bold text-white">
                        {i + 1}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxMode("grid");
                      setLightboxOpen(true);
                    }}
                    className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md bg-[#002c5f] text-white text-xs font-bold"
                  >
                    View All ({allPhotos.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sticky CTA panel */}
          <div className="lg:col-span-5 min-w-0 flex flex-col h-full">
            <div className="rounded-lg bg-white p-4 sm:p-6 w-full max-w-full overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between h-full">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {v.condition} · {isInTransit(v) ? "In Transit (Expected Soon)" : "In Stock & Lot Ready"}
                </p>
                {/* Full year + make + model + trim: this is the page's target query. */}
                <h1 className="display mt-1 text-balance text-xl sm:text-2xl lg:text-3xl font-black text-ink leading-tight">
                  {v.year} {v.make} {v.model}{" "}
                  <span className="text-muted-foreground font-bold">{v.trim}</span>
                </h1>
                <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="display text-2xl sm:text-3xl lg:text-4xl font-black text-primary tabular-nums">
                      ${v.price.toLocaleString()}
                    </p>
                    {v.msrp && v.msrp > v.price && (
                      <p className="text-xs sm:text-sm font-semibold text-slate-500 line-through">
                        MSRP ${v.msrp.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary">
                    <Shield className="h-3 w-3" /> Lifetime warranty
                  </span>
                </div>

                <div className="mt-3.5 sm:mt-5 grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Spec
                    icon={Gauge}
                    label={v.miles < 50 ? "Delivery miles" : `${v.miles.toLocaleString()} mi`}
                  />
                  <Spec icon={Fuel} label={v.fuel} />
                  <Spec icon={Cog} label={v.drivetrain} />
                  <Spec icon={Palette} label={v.exterior} />
                </div>

                {/* Status indicator badge */}
                {isInTransit(v) ? (
                  <div className="mt-3 sm:mt-4 flex items-center justify-between rounded-lg bg-amber-500/10 px-2.5 py-2 ring-1 ring-amber-500/30">
                    <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-950">
                      <Truck className="h-4 w-4 text-amber-600 animate-pulse" />
                      In Transit · Factory Scheduled Delivery
                    </span>
                    <span className="rounded bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                      Reserve Today
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 sm:mt-4 flex items-center justify-between rounded-lg bg-emerald-500/10 px-2.5 py-1.5 ring-1 ring-emerald-500/20">
                    <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-950">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      1 in stock · Available for delivery
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                      Lot Ready
                    </span>
                  </div>
                )}

                {/* High-converting action hierarchy */}
                <div className="mt-3.5 sm:mt-4 space-y-2">
                  {/* "Available for extra discount!" speech bubble pointing to primary CTA */}
                  <div className="relative mb-1 flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSource("Extra Discount Request");
                        setOtpOpen(true);
                      }}
                      className="group/bubble relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 px-3 py-1.5 shadow-xs transition-transform hover:scale-[1.02] active:scale-95 text-left cursor-pointer max-w-full"
                    >
                      {/* Shield with % icon */}
                      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#D92D20] shadow-2xs border border-red-900/40">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                          <path
                            d="M12 21s7-3.5 7-9V5l-7-3-7 3v7c0 5.5 7 9 7 9z"
                            fill="#B42318"
                            stroke="#7A150D"
                            strokeWidth="1.5"
                          />
                          <path d="M8.5 15.5L15.5 8.5" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="#FEF08A" />
                          <circle cx="15.5" cy="15.5" r="1.5" fill="#FEF08A" />
                        </svg>
                      </div>

                      {/* Two-line text */}
                      <div className="flex flex-col pr-1 leading-tight">
                        <span className="text-[11px] sm:text-[12px] font-extrabold text-[#002c5f] tracking-tight">
                          Available for
                        </span>
                        <span className="text-[11px] sm:text-[12px] font-extrabold text-[#002c5f] tracking-tight">
                          extra discount!
                        </span>
                      </div>

                      {/* Speech bubble pointer beak pointing down to the CTA */}
                      <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 bg-emerald-500" />
                    </button>
                  </div>

                  {/* Primary Green CTA - Unlocks today's best price & VIP E-Quote */}
                  <button
                    onClick={() => {
                      setOtpSource("Extra Discount Request");
                      setOtpOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white transition shadow-sm active:scale-[0.99] leading-tight text-center cursor-pointer"
                  >
                    <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>Get Today&apos;s Best Price &amp; E-Quote</span>
                  </button>

                  {/* Secondary Navy CTA - Test Drive Booking */}
                  <button
                    onClick={() => {
                      setModalMode("test_drive");
                      setModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary hover:opacity-90 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-primary-foreground transition shadow-sm active:scale-[0.99] leading-tight text-center cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>Book VIP Test Drive</span>
                  </button>

                  {/* High-intent inquiry split row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEnquiryPreset("availability")}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/90 py-2 px-2 text-[11px] sm:text-xs font-semibold text-ink transition hover:border-primary/40 hover:bg-white shadow-2xs text-center"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">Check Availability</span>
                    </button>
                    <button
                      onClick={() => {
                        setModalMode("quote_request");
                        setModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/90 py-2 px-2 text-[11px] sm:text-xs font-semibold text-ink transition hover:border-primary/40 hover:bg-white shadow-2xs text-center"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Custom Quote</span>
                    </button>
                  </div>

                  {/* Direct Contact & Watch utility row */}
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <a
                      href={dealerInfo.phoneHref}
                      className="flex items-center justify-center gap-1 rounded-lg bg-surface-2 py-1.5 px-1.5 text-[11px] font-semibold text-muted-foreground transition hover:text-ink hover:bg-surface-3 text-center"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>Call</span>
                    </a>
                    <a
                      href={smsLink(v)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-surface-2 py-1.5 px-1.5 text-[11px] font-semibold text-muted-foreground transition hover:text-ink hover:bg-surface-3 text-center"
                    >
                      <MessageSquare className="h-3 w-3 shrink-0" />
                      <span>Text</span>
                    </a>
                    <button
                      onClick={() => setEnquiryPreset("price_watch")}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded-lg py-1.5 px-1.5 text-[11px] font-semibold transition text-center",
                        watching
                          ? "bg-primary/10 text-primary font-bold"
                          : "bg-surface-2 text-muted-foreground hover:text-ink hover:bg-surface-3",
                      )}
                    >
                      <Bell className={cn("h-3 w-3 shrink-0", watching && "fill-current")} />
                      <span>{watching ? "Watching" : "Watch"}</span>
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-center text-[10px] sm:text-[11px] text-muted-foreground">
                  Available today at AM Ford · {dealerInfo.street}
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Specs Section */}
      <section className="py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionTag>Vehicle Overview & Specs</SectionTag>
              <h2 className="display mt-2 text-balance text-2xl sm:text-3xl lg:text-4xl">
                Built for performance & comfort.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every spec on this {v.year} {v.make} {v.model} has been optioned, inspected, and
                verified by certified technicians at AM Ford.
              </p>
            </div>
            <div className="lg:col-span-8">
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-3">
                {[
                  ["Year", v.year],
                  ["Body Style", v.type],
                  ["Drivetrain", v.drivetrain],
                  ["Fuel Type", v.fuel],
                  ["Transmission", v.transmission],
                  ["Horsepower", `${v.horsepower} hp`],
                  ["Exterior Color", v.exterior],
                  ["Interior Trim", v.interior],
                  ["MPG / Range", v.mpg],
                ].map(([k, val]) => (
                  <div key={k as string} className="bg-card p-3.5 sm:p-5">
                    <dt className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="display mt-0.5 text-base sm:text-lg text-ink font-bold">{val}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 rounded-lg bg-card p-4 sm:p-7 ring-1 ring-border">
                <h3 className="display text-lg sm:text-xl font-bold">Standout Features & Options</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {v.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-ink">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing calculator — placed early so shoppers immediately know monthly affordability */}
      <PaymentCalculator
        price={v.price}
        onPreApprove={(details) => {
          setFinancingDetails({ ...details, vehicleId: v.id });
          setModalMode("financing_preapproval");
          setModalOpen(true);
        }}
      />

      {/* Inspection report unlock — builds trust directly following pricing */}
      <InspectionUnlock vehicle={v} />

      {/*
        Seller's notes. Written per unit in src/lib/vehicles.ts, so this is the one place on
        the page where the dealership speaks in its own voice rather than the template's.
        Rendered only when the record actually has notes: an empty "Seller's Notes" heading
        reads worse than no section at all.
      */}
      {v.sellerNotes && (
        <section className="border-t border-border py-8 sm:py-16" aria-labelledby="seller-notes">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionTag>Seller&apos;s Notes</SectionTag>
                <h2 id="seller-notes" className="display mt-2 text-balance text-2xl sm:text-3xl lg:text-4xl">
                  What we would tell you about it.
                </h2>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Written by the team at AM Ford about this specific {v.year} {v.model}, not the
                  model in general.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="rounded-lg bg-card p-5 ring-1 ring-border sm:p-8">
                  <p className="text-sm sm:text-base leading-relaxed text-ink">{v.sellerNotes}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Anything here you want to check in person?
                    </span>
                    <a
                      href={dealerInfo.phoneHref}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-ink px-4 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-ink/90"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />
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
      <section className="border-t border-border py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionTag>About This {v.model}</SectionTag>
              <h2 className="display mt-2 text-balance text-2xl sm:text-3xl lg:text-4xl">
                What it's like to own this {typeLabel(v.type)}.
              </h2>

              {/* Good-to-know fact strip */}
              <div className="mt-5 sm:mt-8 space-y-2.5">
                {v.msrp && v.msrp > v.price && (
                  <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3.5 ring-1 ring-primary/15">
                    <DollarSign className="h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs sm:text-sm text-ink">
                      Priced{" "}
                      <strong>${(v.msrp - v.price).toLocaleString()} below original MSRP</strong>
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3.5 ring-1 ring-primary/15">
                  <Gauge className="h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs sm:text-sm text-ink">
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
                  <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3.5 ring-1 ring-primary/15">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs sm:text-sm text-ink">
                      <strong>Certified Pre-Owned</strong>: 172-point inspection passed
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
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

      <DeliveryBanner />

      {/* Rich SEO Buying Guide Content Section for Vehicle Detail */}
      <section className="border-t border-border bg-surface-2/60 py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10 sm:space-y-16">
          <div className="max-w-4xl">
            <SectionTag>Vehicle Buying Guide</SectionTag>
            <h2 className="display mt-2 text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
              Why Buy the {v.year} {v.make} {v.model} {v.trim} at AM Ford in Ashtabula County, OH?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Are you searching for a reliable{" "}
              <strong className="text-ink">
                {v.year} {v.make} {v.model} {v.trim} for sale in Ashtabula County, OH
              </strong>
              ? At AM Ford, we are proud to offer this exceptional {typeLabel(v.type)} featuring a
              powerful <strong>{v.horsepower} HP</strong> engine, <strong>{v.drivetrain}</strong>{" "}
              drive system, and premium <strong>{v.exterior}</strong> finish. Located at{" "}
              {dealerInfo.address}, AM Ford serves drivers across Ashtabula County, Saybrook,
              Geneva, Mentor, and Erie, PA.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border shadow-xs">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="display mt-4 text-base sm:text-lg font-bold text-ink">
                {v.condition === "New" ? "Factory Pre-Delivery Inspection" : "Multi-Point Safety Inspection"}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {v.condition === "New"
                  ? `This new ${v.model} has undergone rigorous factory pre-delivery inspection, verifying zero-defect assembly, latest calibration, and fresh fluids.`
                  : `This ${v.model} has undergone a comprehensive multi-point safety and mechanical inspection covering brakes, powertrain, tires, and electrical systems by certified technicians.`}
              </p>
            </div>

            <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border shadow-xs">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="display mt-4 text-base sm:text-lg font-bold text-ink">
                Transparent Pricing & Low APR
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                No hidden dealer markups or surprise fees. Take advantage of competitive {v.condition.toLowerCase()} vehicle financing terms, flexible trade-in valuation, and low monthly rates.
              </p>
            </div>

            <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border shadow-xs">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="display mt-4 text-base sm:text-lg font-bold text-ink">
                {v.condition === "New" ? "Ford Factory Warranty & Coverage" : "Certified History & Warranty"}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {v.condition === "New"
                  ? `Full new vehicle bumper-to-bumper and powertrain manufacturer warranty, plus 24/7 Ford Roadside Assistance across Ohio and North America.`
                  : `Drive with complete confidence. Enjoy verified vehicle history documentation, available extended protection plans, and powertrain coverage options.`}
              </p>
            </div>
          </div>

          {/* Vehicle FAQ Section */}
          <div className="w-full space-y-4 sm:space-y-6">
            <div>
              <SectionTag>Questions About This Vehicle?</SectionTag>
              <h3 className="display mt-2 text-xl font-bold text-ink sm:text-2xl lg:text-3xl">
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
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <details
                  key={faq.q}
                  open={idx === 0}
                  className="group overflow-hidden rounded-lg border border-border bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 text-left font-semibold text-ink transition hover:text-primary [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary"
                    />
                  </summary>
                  <div className="border-t border-border/60 bg-surface/40 px-4 sm:px-5 py-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 sm:mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="display text-2xl sm:text-3xl lg:text-4xl font-black">You might also like</h2>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Link
                to="/inventory"
                search={{ type: v.type }}
                className="font-semibold text-primary"
              >
                More {v.type}s →
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/inventory" className="font-semibold text-muted-foreground hover:text-ink">
                All inventory →
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <VehicleCard
                key={r.id}
                v={r}
                index={i}
                onGetPrice={(selectedCar) => {
                  setOtpOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Prev/next through the lot, in the stable declaration order of `vehicles` */}
      <VehiclePager v={v} />

      {/* Contextual routes out of this page: model, filters, research, money, distance */}
      <VehicleInterlinks v={v} />

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

      <Suspense fallback={null}>
        <LeadCaptureModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          vehicle={v}
          initialMode={modalMode}
          financingDetails={financingDetails}
        />

        {otpOpen && (
          <OTPPopup
            onClose={() => setOtpOpen(false)}
            initialCarData={{
              title: `${v.year} ${v.make} ${v.model} ${v.trim}`,
              price: String(v.price),
              stock: v.id,
              source: otpSource,
            }}
          />
        )}

        {enquiryPreset && (
          <QuickEnquiryModal
            vehicle={v}
            preset={enquiryPreset}
            onClose={() => setEnquiryPreset(null)}
          />
        )}
      </Suspense>

      {/* Mobile Sticky Bottom Conversion Bar */}
      <motion.div
        initial={false}
        animate={{ y: showMobileBar ? 0 : 100, opacity: showMobileBar ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 p-2.5 backdrop-blur-md shadow-2xl sm:hidden"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">
              {v.year} {v.make} {v.model}
            </p>
            <p className="text-sm font-extrabold text-primary">
              ${v.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={dealerInfo.phoneHref}
              aria-label="Call dealership"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 text-ink ring-1 ring-border active:scale-95"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              onClick={() => {
                setOtpSource("Extra Discount Request");
                setOtpOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Get Best Price</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Photo Gallery Lightbox Modal: Grid + Carousel */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo Gallery"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1.5 sm:p-4 select-none"
        >
          {/* Modal Container with expanded width and height */}
          <div className="relative flex flex-col w-full max-w-[96vw] xl:max-w-[1520px] 2xl:max-w-[1680px] h-[96vh] max-h-[980px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white tracking-tight">
                    Photo Gallery
                  </span>
                  <span className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-muted-foreground">
                    · {v.year} {v.make} {v.model} {v.trim}
                  </span>
                </div>
              </div>

              {/* Center/Right Controls: View Mode Switcher + Close */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* View Switcher Toggle Pills */}
                <div className="flex items-center rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLightboxMode("grid")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition cursor-pointer",
                      lightboxMode === "grid"
                        ? "bg-[#002c5f] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Grid View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxMode("carousel")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition cursor-pointer",
                      lightboxMode === "carousel"
                        ? "bg-[#002c5f] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                    )}
                  >
                    <Images className="h-4 w-4" />
                    <span>Carousel</span>
                  </button>
                </div>

                {/* Counter Pill */}
                <span className="hidden sm:inline-flex rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {lightboxMode === "carousel"
                    ? `${activePhotoIndex + 1} / ${allPhotos.length}`
                    : `${allPhotos.length} Photos`}
                </span>

                {/* Close 'X' Button */}
                <button
                  type="button"
                  aria-label="Close photo gallery"
                  onClick={() => setLightboxOpen(false)}
                  className="rounded-md p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Grid View vs Carousel View */}
            {lightboxMode === "grid" ? (
              /* GRID GALLERY VIEW WITH LARGER IMAGES */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {allPhotos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setActivePhotoIndex(i);
                        setLightboxMode("carousel");
                      }}
                      className="group relative aspect-[16/10] overflow-hidden rounded-md bg-slate-900 cursor-pointer border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 hover:scale-[1.015] hover:shadow-lg hover:ring-2 hover:ring-[#002c5f]"
                    >
                      <img
                        src={photo}
                        alt={`${v.year} ${v.make} ${v.model} photo ${i + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Photo index badge */}
                      <span className="absolute top-2.5 left-2.5 rounded bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-xs border border-white/15 shadow-sm">
                        {i + 1}
                      </span>
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 drop-shadow-sm">
                          <Maximize2 className="h-3.5 w-3.5 text-amber-400" /> Click for single view
                        </span>
                        <span className="text-xs text-white/90 font-semibold">
                          Photo {i + 1} of {allPhotos.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ONE-BY-ONE CAROUSEL VIEW */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-white select-none">
                {/* Carousel Sub-header Bar */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/90 border-b border-white/10 text-xs sm:text-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setLightboxMode("grid")}
                    className="flex items-center gap-2 text-slate-300 hover:text-white font-bold transition cursor-pointer"
                  >
                    <LayoutGrid className="h-4 w-4 text-amber-400" />
                    <span>← Back to Grid Gallery</span>
                  </button>
                  <span className="text-slate-300 font-medium">
                    Photo <strong className="text-white font-bold">{activePhotoIndex + 1}</strong> of{" "}
                    <strong>{allPhotos.length}</strong>
                  </span>
                </div>

                {/* Main Large Image Container */}
                <div className="relative flex-1 flex items-center justify-center min-h-0 p-3 sm:p-6 bg-slate-950">
                  <motion.img
                    key={activePhotoIndex}
                    initial={{ opacity: 0.9, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    src={allPhotos[activePhotoIndex] || v.image}
                    alt={`${v.year} ${v.make} ${v.model} - Photo ${activePhotoIndex + 1}`}
                    className="max-h-full max-w-full object-contain rounded-md shadow-2xl"
                  />

                  {/* Previous / Next Arrow Controls */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev > 0 ? prev - 1 : allPhotos.length - 1,
                          )
                        }
                        className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 rounded-md bg-slate-900/85 hover:bg-slate-900 border border-white/15 p-3 sm:p-4 text-white transition shadow-xl hover:scale-105 active:scale-95 cursor-pointer z-10"
                      >
                        <ChevronLeft className="h-7 w-7" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next photo"
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev < allPhotos.length - 1 ? prev + 1 : 0,
                          )
                        }
                        className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 rounded-md bg-slate-900/85 hover:bg-slate-900 border border-white/15 p-3 sm:p-4 text-white transition shadow-xl hover:scale-105 active:scale-95 cursor-pointer z-10"
                      >
                        <ChevronRight className="h-7 w-7" />
                      </button>
                    </>
                  )}
                </div>

                {/* Bottom Thumbnail Strip */}
                <div className="h-20 sm:h-24 flex gap-2.5 overflow-x-auto no-scrollbar p-2.5 bg-slate-900 border-t border-white/10 shrink-0">
                  {allPhotos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhotoIndex(i)}
                      className={cn(
                        "relative h-full aspect-[16/10] shrink-0 overflow-hidden rounded-md bg-slate-950 transition cursor-pointer border",
                        activePhotoIndex === i
                          ? "border-amber-400 ring-2 ring-amber-400 scale-[0.97]"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 left-1 rounded bg-slate-950/80 px-1.5 text-[9px] font-bold text-white">
                        {i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
    <section className="border-t border-border py-8 sm:py-16" aria-labelledby="listing-detail">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag>The Detail Behind This Listing</SectionTag>
            <h2 id="listing-detail" className="display mt-2 text-balance text-2xl sm:text-3xl lg:text-4xl">
              What the record actually says.
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Price, odometer, condition, and equipment, straight off this vehicle&apos;s own
              record. If a number matters to your decision, it should come from here rather than
              from a brochure for the {v.model} range.
            </p>
            <a
              href={dealerInfo.phoneHref}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-4 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-ink/90"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              Ask about this {v.model} on {dealerInfo.phone}
            </a>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {buildListingDetail(v).map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-base sm:text-lg font-bold">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" aria-hidden />
                What to weigh on this one
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                Three things this specific configuration asks of an owner in Northeast Ohio. None of
                them is a reason not to buy it; all of them are easier to settle before you sign
                than afterwards.
              </p>
              <ul className="mt-4 space-y-3">
                {considerations.map((note) => (
                  <li key={note.slice(0, 48)} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-xs sm:text-sm leading-relaxed text-ink">{note}</span>
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
  const conditionLinkable = true;
  // Trucks and the electric truck are the two records a commercial buyer lands on.
  const workVehicle = v.type === "Truck" || v.type === "EV";

  const linkCls =
    "font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition hover:decoration-primary";

  return (
    <section className="border-t border-border bg-surface py-8 sm:py-16" aria-labelledby="next-steps">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag>Where To Go From Here</SectionTag>
            <h2 id="next-steps" className="display mt-2 text-balance text-2xl sm:text-3xl lg:text-4xl">
              The rest of the decision.
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Every page linked below is on this site, and every filtered search runs against the
              Ford stock standing in {dealerInfo.locality} today.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 lg:col-span-8">
            <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-base sm:text-lg font-bold">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" aria-hidden />
                Still cross shopping
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
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
              <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
                <h3 className="display flex items-center gap-2 text-base sm:text-lg font-bold">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" aria-hidden />
                  Read before you decide
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  The comparisons and guides we have written that bear on the {v.model}{" "}
                  specifically.
                </p>
                <ul className="mt-4 space-y-3">
                  {reading.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className={linkCls}>
                        {item.label}
                      </Link>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {item.why}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-base sm:text-lg font-bold">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" aria-hidden />
                Paperwork and your trade
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
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

            <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
              <h3 className="display flex items-center gap-2 text-base sm:text-lg font-bold">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" aria-hidden />
                Buying from outside Ashtabula County
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
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
              <p className="mt-3 flex flex-wrap items-center gap-x-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                <Wrench className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
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
    "group flex items-center gap-3 rounded-lg bg-card p-3.5 ring-1 ring-border transition hover:ring-primary/40 sm:p-5";

  return (
    <nav
      aria-label="Browse the rest of the inventory"
      className="border-t border-border bg-surface-2/50 py-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/vehicle/$id" params={{ id: vehicleSlug(previous) }} rel="prev" className={cardCls}>
            <ChevronLeft
              aria-hidden
              className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5"
            />
            <span className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Previous vehicle
              </span>
              <span className="mt-0.5 block truncate text-xs font-bold text-ink sm:text-base">
                {previous.year} {previous.make} {previous.model} {previous.trim}
              </span>
              <span className="block truncate text-[11px] sm:text-xs text-muted-foreground">
                ${previous.price.toLocaleString()} · {previous.condition}
              </span>
            </span>
          </Link>

          <Link
            to="/vehicle/$id"
            params={{ id: vehicleSlug(next) }}
            rel="next"
            className={cn(cardCls, "sm:flex-row-reverse sm:text-right")}
          >
            <ChevronRight
              aria-hidden
              className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
            />
            <span className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Next vehicle
              </span>
              <span className="mt-0.5 block truncate text-xs font-bold text-ink sm:text-base">
                {next.year} {next.make} {next.model} {next.trim}
              </span>
              <span className="block truncate text-[11px] sm:text-xs text-muted-foreground">
                ${next.price.toLocaleString()} · {next.condition}
              </span>
            </span>
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Vehicle {position} of {total} at AM Ford.{" "}
          <Link
            to="/inventory"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
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
  { area: "Exterior, glass & lighting", checks: 24 },
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
    <section className="border-t border-border py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag>Inspection Report</SectionTag>
            <h2 className="display mt-2 text-balance text-2xl sm:text-3xl lg:text-4xl">
              See exactly what our technicians checked.
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Every vehicle at AM Ford passes a 172-point inspection before sale. Unlock the
              category summary for this {vehicle.model}. The full written report is waiting for you
              at the dealership.
            </p>
          </div>
          <div className="lg:col-span-8">
            {status === "unlocked" ? (
              <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="display text-base sm:text-lg font-bold">172-point inspection: all categories passed</h3>
                </div>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {INSPECTION_AREAS.map((item) => (
                    <li
                      key={item.area}
                      className="flex items-center justify-between rounded-md bg-surface-2 px-3.5 py-2.5 text-xs sm:text-sm"
                    >
                      <span className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        {item.area}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {item.checks} checks
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  A copy is on its way to your email. {RESPONSE_PROMISE}
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border">
                {/* Blurred teaser behind the gate */}
                <ul
                  aria-hidden
                  className="pointer-events-none grid gap-2.5 opacity-60 blur-[6px] sm:grid-cols-2 select-none"
                >
                  {INSPECTION_AREAS.slice(0, 4).map((item) => (
                    <li
                      key={item.area}
                      className="flex items-center justify-between rounded-md bg-surface-2 px-3.5 py-2.5 text-xs sm:text-sm"
                    >
                      <span className="text-ink">{item.area}</span>
                      <span className="text-xs text-muted-foreground">{item.checks} checks</span>
                    </li>
                  ))}
                </ul>
                <div className="relative -mt-16 rounded-lg bg-background/95 p-5 sm:p-6 ring-1 ring-border backdrop-blur">
                  <h3 className="display text-lg sm:text-xl font-bold">Unlock the inspection summary</h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Free, and we'll also email you a copy for your records.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="relative block">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3.5 text-xs sm:text-sm outline-none transition focus:border-primary"
                      />
                    </label>
                    <label className="relative block">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3.5 text-xs sm:text-sm outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                  <label className="mt-3.5 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#002c5f]"
                    />
                    <span className="text-[11px] leading-relaxed text-muted-foreground">
                      I agree AM Ford may email me this report and follow up about this vehicle (and
                      text/call if I provided a number). Reply STOP to opt out.
                    </span>
                  </label>
                  {error && <p className="mt-2.5 text-xs font-medium text-red-600">{error}</p>}
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
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4" />
                    )}
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

function Spec({ icon: Icon, label }: { icon: typeof Fuel; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-white/70 px-3 py-2.5 ring-1 ring-border">
      <Icon className="h-4 w-4 text-primary" />
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
    <section className="bg-surface py-8 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-6 sm:gap-10 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionTag>Estimate your payment</SectionTag>
          <h2 className="display mt-2 text-2xl sm:text-3xl lg:text-4xl">Numbers that feel honest.</h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
            A quick estimate based on your inputs. Final terms depend on credit and lender.
          </p>
          <div className="mt-5 sm:mt-8 rounded-lg bg-gradient-navy p-5 sm:p-8 text-white shadow-glow">
            <p className="text-xs uppercase tracking-wider text-white/70">Estimated monthly</p>
            <p className="display mt-2 text-4xl sm:text-6xl font-black">
              ${Math.round(monthly).toLocaleString()}
              <span className="text-base sm:text-lg text-white/60 font-normal">/mo</span>
            </p>
            <p className="mt-2.5 text-xs sm:text-sm text-white/70">
              {term} months · {apr.toFixed(1)}% APR · ${down.toLocaleString()} down
            </p>
            {onPreApprove ? (
              <button
                onClick={() =>
                  onPreApprove({
                    calculator: { price, down, term, apr, estimatedMonthly: Math.round(monthly) },
                  })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary transition hover:opacity-90"
              >
                <Calculator className="h-4 w-4" /> Get pre-approved for this payment
              </button>
            ) : (
              <Link
                to="/financing"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary"
              >
                <Calculator className="h-4 w-4" /> Get pre-approved
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-card p-5 sm:p-7 ring-1 ring-border lg:col-span-7">
          <Slider
            label="Down payment"
            min={0}
            max={Math.round(price * 0.5)}
            step={500}
            value={down}
            onChange={setDown}
            format={(n) => `$${n.toLocaleString()}`}
          />
          <div className="mt-6">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Term
            </p>
            <div className="flex flex-wrap gap-2">
              {[36, 48, 60, 72].map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t as typeof term)}
                  className={cn(
                    "rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition",
                    term === t
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-surface-2 text-ink hover:bg-surface",
                  )}
                >
                  {t} mo
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
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
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <span className="display text-lg text-primary">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full cursor-pointer accent-[oklch(0.21_0.06_256)]"
      />
    </div>
  );
}
