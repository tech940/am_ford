import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, ListChecks, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { faqSchema } from "@/lib/articleSchema";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const PATH = "/compare";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;

const TITLE = "Compare Ford Models Side by Side | AM Ford";
const DESCRIPTION =
  `Compare Ford models side by side at AM Ford in Ashtabula County (${dealerInfo.city}). Explorer vs Escape, F-150 vs Lightning, Bronco vs Explorer, with local buying advice.`;

const BREADCRUMBS = crumbs({ label: "Compare" });

/**
 * Only pairs where BOTH models have a real /ford/{slug} page and a vehicle record in
 * @/lib/vehicles belong here. A comparison we cannot link to and cannot spec from real
 * inventory is a comparison we should not publish.
 */
const COMPARISONS = [
  {
    to: "/compare/explorer-vs-escape",
    tag: "Three rows or two",
    heading: "Ford Explorer vs Ford Escape",
    blurb:
      "A mid-size three-row SUV against a compact hybrid crossover. The decision is how often you carry more than four people, and what you want the vehicle to cost you every week.",
    anchor: "Compare the Ford Explorer and Ford Escape",
  },
  {
    to: "/compare/f-150-vs-f-150-lightning",
    tag: "Gas or electric",
    heading: "Ford F-150 vs Ford F-150 Lightning",
    blurb:
      "The same full-size pickup with two completely different ways of filling it up. Home charging, winter range, and towing decide this one, not the spec sheet.",
    anchor: "Compare the gas F-150 and the F-150 Lightning",
  },
  {
    to: "/compare/bronco-vs-explorer",
    tag: "Trail or third row",
    heading: "Ford Bronco vs Ford Explorer",
    blurb:
      "Two vehicles that share a badge and almost nothing underneath, at two different prices. Removable roof and doors and four-wheel drive against a third row and highway comfort.",
    anchor: "Compare the Ford Bronco and Ford Explorer",
  },
] as const;

const comparisonListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Ford model comparisons from ${dealerInfo.name} in ${dealerInfo.city}`,
  numberOfItems: COMPARISONS.length,
  itemListElement: COMPARISONS.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.heading,
    url: `${SITE_ORIGIN}${c.to}`,
  })),
};

const FAQS = [
  {
    q: "Why are there only three comparisons on this page?",
    a: "Because we only publish a comparison when both vehicles have a full model page here and a real record in our inventory data. That keeps every specification on these pages traceable to a vehicle we can actually show you, rather than to a figure copied off a spec sheet for a model we do not sell. As the lineup on the lot changes, this list changes with it.",
  },
  {
    q: "Do the spec tables use real inventory?",
    a: "Yes. Each table is built from the listing for a specific vehicle on our lot, which is why you see a trim, an odometer reading, and a listed price rather than a model-wide summary. Trim changes what a vehicle is, so comparing two real units is more useful than comparing two model ranges. Inventory moves, so confirm availability before you plan a visit.",
  },
  {
    q: "Can you compare a Ford against another brand for me?",
    a: "Our sales team will happily talk through how a Ford stacks up against something else you are considering, and we will be straight with you about where it does not come out ahead. We keep these written pages to models we sell, because those are the vehicles we can put you in on the same afternoon and speak about with real knowledge.",
  },
];

export const Route = createFileRoute("/compare/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "compare Ford models Ashtabula County",
          "Ford model comparison",
          "Ford Explorer vs Escape",
          "Ford F-150 vs Lightning",
          "Ford Bronco vs Explorer",
          "Ford dealer Ashtabula County",
          "Ford dealer Jefferson Ohio",
        ].join(", "),
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      // This page is a listing hub, not an article: no Article JSON-LD and no
      // og:type=article. The leaf /compare/* pages are the articles.
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(comparisonListSchema) },
      { type: "application/ld+json", children: JSON.stringify(faqSchema(FAQS)) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
    ],
  }),
  component: CompareHub,
});

const HOW_TO_USE = [
  {
    title: "Start with seats, not with the badge",
    body: "Count how many people you carry and how often. Passenger capacity rules out more vehicles faster than any other question, and it is the one people postpone because it feels boring.",
  },
  {
    title: "Then look at where you refuel or charge",
    body: "For anything electric, where you park overnight decides whether the vehicle fits your life. It is a question about your driveway and your electrical panel long before it is a question about the truck.",
  },
  {
    title: "Treat trim as part of the vehicle",
    body: "A performance trim and a practical trim of the same model behave differently and cost different amounts to run. Our tables show the specific unit in stock for exactly that reason.",
  },
  {
    title: "Drive them back to back",
    body: "Half an hour on the same route settles what a spreadsheet cannot, particularly size. Vehicles read very differently in person than they do on a screen.",
  },
];

function CompareHub() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Head to Head</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            Compare Ford Models
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Most people arrive at a dealership deciding between two vehicles rather than shopping a
            whole lineup. These pages take the pairs we get asked about most in {dealerInfo.city},
            put the two vehicles side by side using the real listings from our lot, and then say
            plainly who each one suits. No winner is declared, because the right answer depends on
            how many people you carry, where you park overnight, and how much of your driving
            happens on pavement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
            >
              Browse every vehicle in stock <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-2xl sm:text-3xl">Comparisons</h2>
          <ol className="mt-8 grid gap-6 lg:grid-cols-3">
            {COMPARISONS.map((c) => (
              <li key={c.to} className="flex">
                <Link
                  to={c.to}
                  className="group flex flex-col rounded-3xl bg-card p-7 ring-1 ring-border transition hover:ring-[#002c5f]/40"
                >
                  <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    {c.tag}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{c.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#002c5f] group-hover:underline">
                    {c.anchor}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ListChecks className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="display mt-5 text-2xl sm:text-3xl">How to use these comparisons</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The order you ask questions in matters more than the questions themselves. These are the
            four our sales team works through, roughly in this sequence, and they narrow a shortlist
            faster than reading another spec sheet does.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {HOW_TO_USE.map((h) => (
              <div key={h.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-base font-bold text-ink">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Common Questions</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">About these comparison pages</h2>
          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <dt className="flex items-start gap-3 text-base font-bold text-ink">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {f.q}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border">
            <h2 className="display text-xl sm:text-2xl">Still deciding between two vehicles</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tell us the two you are weighing up and how you will use the vehicle, and we will give
              you a straight answer rather than a sales pitch. AM Ford sells and services everything
              from {dealerInfo.address}. {DELIVERY_CLAIM}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/guides"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Read the Ford buying and ownership guides
              </Link>
              <Link
                to="/ford-models"
                className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001f44]"
              >
                See every Ford model we sell <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Browse current inventory
              </Link>
              <Link
                to="/financing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Apply for vehicle financing
              </Link>
              <Link
                to="/nationwide-vehicle-delivery"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                See how home delivery and shipping work
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Contact the AM Ford sales team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
