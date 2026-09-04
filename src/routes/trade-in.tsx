import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Camera,
  Car,
  ClipboardList,
  FileText,
  Handshake,
  HelpCircle,
  Phone,
  Search,
  Wallet,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { TradeValuatorModal } from "@/components/convert/TradeValuatorModal";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const PATH = "/trade-in";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "Trade-In" });

/**
 * Service (not AutoDealer) on purpose: the appraisal is an offering of the single
 * dealership defined in __root.tsx, so this node references that business by @id
 * rather than describing a second one.
 *
 * No price, priceRange, or offer amounts appear here. Trade figures are not approved
 * marketing claims and would be wrong the moment the market moved.
 */
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${CANONICAL}#trade-appraisal`,
  name: "Vehicle Trade-In Appraisal",
  serviceType: "Vehicle trade-in appraisal and valuation",
  description:
    "Trade-in appraisal at AM Ford in Jefferson, Ohio. We inspect and value your current vehicle, any make or model, put the figure in writing, and apply it to your next Ford purchase. Remote appraisal by photo is available for customers buying at a distance.",
  url: CANONICAL,
  provider: { "@id": "https://amford.com/#dealer" },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Ashtabula County" },
    { "@type": "AdministrativeArea", name: "Northeast Ohio" },
    { "@type": "AdministrativeArea", name: "Northwestern Pennsylvania" },
  ],
};

export const Route = createFileRoute("/trade-in")({
  head: () => ({
    meta: [
      { title: "Value Your Trade-In | AM Ford Jefferson, Ohio" },
      {
        name: "description",
        content:
          "How trade-in appraisal works at AM Ford in Jefferson, Ohio: what to bring, how trade equity applies to your purchase, and remote photo appraisal.",
      },
      {
        name: "keywords",
        content:
          "trade in my car Jefferson Ohio, value my trade Ashtabula County, Ford trade-in appraisal, sell my car to a dealer Ohio, trade-in value Northeast Ohio, remote trade appraisal, trade in toward a new Ford",
      },
      { property: "og:title", content: "Value Your Trade-In at AM Ford in Jefferson, Ohio" },
      {
        property: "og:description",
        content:
          "Appraisal in person or remotely by photo, put in writing, and applied straight to your next Ford.",
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
  component: TradeInPage,
});

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us about the vehicle",
    body: "Year, make, model, trim, mileage, drivetrain, and an honest read on condition. The online estimator uses the age, mileage, and condition you enter to put a rough starting range in front of you in a couple of minutes, and the rest is what we work from once we see the vehicle.",
  },
  {
    icon: Search,
    title: "We look the vehicle over",
    body: "A road test, a look underneath on the lift, then paint and panels, glass, tires, brakes, interior wear, and any warning lights. In a salt-belt county the underbody tells us as much as the odometer does.",
  },
  {
    icon: FileText,
    title: "We check what it is worth now",
    body: "Trade values move with the market, so the figure is worked out against what the vehicle is worth now rather than what it was worth last season. Our used vehicle manager sets the number, and we will talk you through how we got there before you decide anything.",
  },
  {
    icon: Handshake,
    title: "You get the number in writing",
    body: "The appraisal is written down, with the period it holds good for, and there is no obligation attached to it. You are free to take it home and think about it.",
  },
  {
    icon: Wallet,
    title: "The value goes to work on your purchase",
    body: "Accept the appraisal and it comes off what you are financing on your next vehicle. If you are not buying and you own the vehicle outright, we can simply buy it from you.",
  },
];

const BRING = [
  "The vehicle itself, and every key and remote that came with it",
  "The title, or your lender details and account number if there is still a loan on it",
  "Current registration and a valid driver license for whoever is on the title",
  "Service records, if you have kept them, including recent tires, brakes, or timing work",
  "Owner manual, second key, cargo cover, charging cables, and any factory accessories",
  "Original wheels or parts if the vehicle has been modified and you still have them",
];

const PHOTOS = [
  "Front three-quarter and rear three-quarter, from a few steps back",
  "Both sides square on, in daylight, with the whole vehicle in frame",
  "Front seats, rear seats, and the cargo area",
  "The dash with the engine running, so the odometer and any warning lights show",
  "All four tires, close enough to read the tread",
  "Close-ups of any dents, scratches, rust, cracked glass, or interior damage",
];

const FAQS = [
  {
    q: "Do I have to buy a vehicle to get an appraisal?",
    a: "No. The appraisal is free and carries no obligation. Plenty of people come in to find out where they stand before they decide whether this is the year to change vehicles, and that is a perfectly reasonable way to use us.",
  },
  {
    q: "What happens if I still owe money on my vehicle?",
    a: "That is normal and it does not stop a trade. Bring your lender name, account number, and a current payoff figure. If the appraisal comes in above the payoff, the difference goes toward your purchase. If it comes in below, the shortfall has to be covered, either out of pocket or, depending on the lender and the deal, folded into the new financing.",
  },
  {
    q: "Does getting my vehicle appraised affect my credit?",
    a: "No. An appraisal is an inspection of a vehicle, not a credit application, and nothing is submitted to a lender. Financing is a separate step that you start only when you decide to.",
  },
  {
    q: "Do you appraise vehicles that are not Fords?",
    a: "Yes. We appraise any make and model, including trucks, SUVs, cars, and vans from other manufacturers, and including vehicles we would send to auction rather than retail ourselves.",
  },
  {
    q: "Is the online estimate the final number?",
    a: "No. It is a rough starting range built from the age, mileage, and condition you enter, and it does not account for your specific make and model. The real figure comes after we have seen the vehicle in person, or reviewed your photos and the vehicle history if you are buying at a distance.",
  },
  {
    q: "How does a trade affect the tax I pay?",
    a: "In many states the taxable amount on a purchase is calculated after the trade allowance is applied, which can change what you owe. The rules differ by state, so ask us how it works where the vehicle will be titled and registered and we will walk through it with you.",
  },
];

function TradeInPage() {
  const [valuatorOpen, setValuatorOpen] = useState(false);

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Trade-In</SectionTag>
          <h1 className="display mt-3 max-w-3xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            Value Your Trade at AM Ford in Jefferson, Ohio
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Your current vehicle is part of your next one. We appraise trades in person at our{" "}
            {dealerInfo.locality} store and remotely by photo for customers buying at a distance,
            then apply the value straight to your purchase. Any make, any model, no obligation to
            buy anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setValuatorOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-deep"
            >
              Start My Trade-In Estimate <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Car className="h-4 w-4" /> Browse Ford Inventory
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" /> Call {dealerInfo.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">How a trade appraisal works here</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Five steps, none of them a surprise. Most appraisals are finished while you wait, and
            you can stop at any point in the process.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <SectionTag>Before You Come In</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">What to bring with the vehicle</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Bringing the paperwork with you is the difference between finishing the same day and
              coming back later in the week. None of it is unusual, and if something is missing we
              will tell you how to replace it.
            </p>
            <ul className="mt-6 space-y-3">
              {BRING.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-card p-5 text-sm leading-relaxed text-muted-foreground ring-1 ring-border">
              If the vehicle is financed or leased, ask your lender for a payoff good for ten days
              and bring it with you. When the trade goes through, we pay the lender directly and
              handle the title release, so you are not chasing paperwork afterwards.
            </p>
          </div>

          <div>
            <SectionTag>Buying From a Distance</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Remote appraisal by photo</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You do not have to drive to Jefferson to trade a vehicle. Send us photos, the VIN, the
              mileage, and anything you know about the history, and we will appraise it from that.
              We confirm the figure when we collect the vehicle at delivery, so the only thing that
              changes it is something the photos did not show.
            </p>
            <div className="mt-6 rounded-3xl bg-card p-7 ring-1 ring-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink">Photos that give us a real answer</h3>
              <ul className="mt-4 space-y-2.5">
                {PHOTOS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Show us the damage rather than hiding it. An appraisal built on accurate photos
                holds at delivery, and one built on flattering angles does not.
              </p>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {DELIVERY_CLAIM} When we bring your Ford to you, your trade goes back on the truck.
            </p>
            <Link
              to="/nationwide-vehicle-delivery"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              How AM Ford delivery and shipping works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Trade Equity</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            How your trade applies to the purchase
          </h2>
          <div className="mt-8 space-y-5">
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">
                When the vehicle is worth more than you owe
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The difference is your equity, and it behaves exactly like money down. It lowers the
                amount you finance, which lowers what you pay in interest over the life of the loan
                and often improves the terms a lender is willing to offer. If you own the vehicle
                outright, the whole appraisal is equity.
              </p>
            </div>
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">
                When you owe more than it appraises for
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This is common on newer loans and it is not a dead end. The shortfall has to be
                settled, either from your own funds or by adding it to the new financing, and
                whether a lender will allow that depends on your credit, the term, and the vehicle
                you are buying. Our finance team can tell you where you stand before you commit to
                anything.
              </p>
            </div>
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">What we cannot tell you in advance</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Rates and terms depend on your credit, the length of the loan, and which lender
                approves the deal, so nobody can give you a real figure before an application has
                been through. Anyone quoting you a rate on a web page is guessing. Apply and we will
                come back with something actual.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/financing"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Apply for Ford Financing
            </Link>
            <Link
              to="/finance/bad-credit"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
            >
              Financing With Limited or Rebuilding Credit
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>What You Can Trade Toward</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            Pick the Ford first, then the number
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The trade conversation is easier once you know what you are moving into, because the
            vehicle you choose affects the financing structure as much as the appraisal does. These
            are the models people around Ashtabula County trade into most often.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">Trading into a truck</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Full-size pickups stay in demand in a county where a lot of people need a bed and a
                hitch every week, which usually helps both sides of the deal.
              </p>
              <Link
                to="/ford/$model"
                params={{ model: "f-150" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Ford F-150 buying guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">Trading into a family SUV</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Households outgrowing a compact crossover generally land on a three-row SUV, and a
                trade is the usual way that move gets paid for.
              </p>
              <Link
                to="/ford/$model"
                params={{ model: "explorer" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Ford Explorer buying guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">Trading down to something smaller</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Drivers stepping out of a large vehicle for lower running costs often trade into a
                compact crossover, sometimes with equity left over.
              </p>
              <Link
                to="/ford/$model"
                params={{ model: "escape" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Ford Escape buying guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Trade-In Questions</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">The things people ask us first</h2>
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

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border">
            <h3 className="display text-xl">Find out what your vehicle is worth</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start with the online estimator for a range, then book a few minutes with us to turn
              it into a written figure. Either way, you are under no obligation.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setValuatorOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Start My Trade-In Estimate <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                Book an Appraisal Appointment
              </Link>
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                See What You Could Trade Into
              </Link>
            </div>
          </div>
        </div>
      </section>

      {valuatorOpen && <TradeValuatorModal onClose={() => setValuatorOpen(false)} />}
    </SiteShell>
  );
}
