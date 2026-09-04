import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  MapPin,
  FileText,
  CreditCard,
  Car,
  ShieldCheck,
  Phone,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo, DELIVERY_CLAIM, DELIVERY_SHORT, DELIVERY_SHIPPING } from "@/lib/vehicles";

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "Vehicle Delivery" });

const FAQS = [
  {
    q: "How does free home delivery within 300 miles work?",
    a: `Once your purchase is finalized, we schedule a delivery window with you and bring the vehicle to your home on a dealership transport. There is no delivery charge for addresses within 300 miles of our ${dealerInfo.locality}, Ohio dealership. You complete any remaining paperwork at the handover.`,
  },
  {
    q: "How does nationwide vehicle shipping work?",
    a: "For customers beyond the complimentary 300-mile area, we arrange transport through established carriers to any of the 50 states. We collect your delivery address, quote the shipping cost before you commit, and keep you updated while the vehicle is in transit.",
  },
  {
    q: "Is shipping open or enclosed?",
    a: "Most vehicles ship on open carriers, which is the standard method for cars and trucks. Enclosed transport can be arranged on request and costs more. Tell us which you prefer when we quote your shipment.",
  },
  {
    q: "How are shipping charges calculated?",
    a: "Shipping is quoted per vehicle based on distance, vehicle size, carrier availability, and whether you choose open or enclosed transport. We give you the figure in writing before you commit to the purchase.",
  },
  {
    q: "What documents do I need to buy remotely?",
    a: "Typically a valid driver license, proof of insurance, and financing or payment documentation. Requirements vary by state, so we confirm the exact list for your situation before we start the paperwork.",
  },
  {
    q: "Can I trade in my current vehicle if I buy remotely?",
    a: "Yes. Send us photos, the mileage, and the vehicle details and we will appraise it remotely. If you accept the figure, the trade is applied to your purchase and we collect your vehicle when we deliver the new one.",
  },
  {
    q: "How long does delivery take?",
    a: "Local deliveries within the 300-mile area are usually scheduled within a few days of finalizing the purchase. Longer shipments depend on carrier routing and scheduling. We give you an expected window once transport is booked.",
  },
  {
    q: "What happens when the vehicle arrives?",
    a: "Inspect the vehicle before you sign the delivery receipt. Check that it matches the listing, review the paperwork, and raise anything that looks wrong on the spot. Our team stays reachable by phone throughout the handover.",
  },
];

export const Route = createFileRoute("/nationwide-vehicle-delivery")({
  head: () => ({
    meta: [
      { title: "Nationwide Vehicle Delivery and Online Car Buying | AM Ford" },
      {
        name: "description",
        // DELIVERY_CLAIM is 84 chars and must be used verbatim, so it lives in og:description
        // and the body copy instead. The meta description carries the same offer in a form that
        // fits inside the 155 characters Google actually renders.
        content:
          "Buy a Ford online from AM Ford in Jefferson, Ohio. Free home delivery within 300 miles, shipping to all 50 states, plus remote financing and trade-in.",
      },
      {
        name: "keywords",
        content:
          "Ford dealer with home delivery, free vehicle delivery Ohio, buy a Ford online, nationwide vehicle shipping dealership, Ford dealer that ships nationwide, used cars delivered to your home, car shipping from Ohio, out-of-state vehicle purchase",
      },
      {
        property: "og:title",
        content: "Nationwide Vehicle Delivery and Online Car Buying | AM Ford",
      },
      { property: "og:description", content: DELIVERY_CLAIM },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://amford.com/nationwide-vehicle-delivery" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/nationwide-vehicle-delivery" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
    ],
  }),
  component: DeliveryPage,
});

const STEPS = [
  {
    icon: Car,
    title: "Choose your vehicle",
    body: "Browse our new Ford and used inventory online. Ask for extra photos, a walkaround video, or answers about condition and history before you decide.",
  },
  {
    icon: CreditCard,
    title: "Arrange financing remotely",
    body: "Apply online and our finance team works with multiple lenders to structure terms. We handle applicants across a range of credit situations, including buyers rebuilding credit.",
  },
  {
    icon: Truck,
    title: "Value your trade from home",
    body: "Send photos, mileage, and details of your current vehicle. We appraise it remotely and apply the value to your purchase, then collect it at delivery.",
  },
  {
    icon: FileText,
    title: "Complete the paperwork",
    body: "We prepare the documents, tell you exactly what your state requires, and coordinate signing so you are not driving back and forth to a dealership.",
  },
  {
    icon: MapPin,
    title: "Delivery or shipping",
    body: `${DELIVERY_SHORT} of our ${dealerInfo.locality}, Ohio store. Beyond that, we arrange transport and quote the cost up front.`,
  },
  {
    icon: ShieldCheck,
    title: "Inspect on arrival",
    body: "Look the vehicle over before signing the delivery receipt. Our team is on the phone with you through the handover if anything needs sorting.",
  },
];

function DeliveryPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Delivery and Online Buying</SectionTag>
          <h1 className="display mt-3 max-w-3xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            Shop AM Ford from wherever you live.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {DELIVERY_CLAIM} Pick your vehicle online, handle financing and your trade remotely, and
            we bring it to you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-deep"
            >
              Browse Inventory <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" /> Contact Our Delivery Team
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">How remote purchasing works</h2>
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
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Delivery Questions</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            Delivery and shipping, answered plainly
          </h2>
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
            <h3 className="display text-xl">Ready to start?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us which vehicle you are looking at and where you live, and we will confirm your
              delivery or shipping options.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                View Used Vehicles
              </Link>
              <Link
                to="/financing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                Apply for Vehicle Financing
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                Contact Our Delivery Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
