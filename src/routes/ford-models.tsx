import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, MapPin, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { FORD_MODELS } from "@/lib/fordModels";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const SITE_ORIGIN = "https://amford.com";
const CANONICAL = `${SITE_ORIGIN}/ford-models`;

const TITLE = `Ford Models for Sale in ${dealerInfo.city} | AM Ford`;

/**
 * Meta description is held under the ~155 char SERP cap, so DELIVERY_CLAIM (84 chars) stays
 * out of it and lives in og:description and the body copy instead, where there is no cap.
 */
const DESCRIPTION = `Ford models at AM Ford in ${dealerInfo.city}: F-150, Mustang, Explorer, F-150 Lightning, Bronco, and Escape. Serving Ashtabula County and Northeast Ohio.`;
const OG_DESCRIPTION = `Compare the Ford models AM Ford sells in ${dealerInfo.city}: F-150, Mustang, Explorer, F-150 Lightning, Bronco, and Escape. Serving Ashtabula County and Northeast Ohio. ${DELIVERY_CLAIM}`;

const BREADCRUMBS = crumbs({ label: "Ford Models" });

const modelListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Ford models sold at AM Ford in ${dealerInfo.city}`,
  numberOfItems: FORD_MODELS.length,
  itemListElement: FORD_MODELS.map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: m.name,
    url: `${SITE_ORIGIN}/ford/${m.slug}`,
  })),
};

/** Body-style guidance is the part of this page that does not exist on the model pages. */
const BODY_STYLE_GUIDE: { label: string; body: string }[] = [
  {
    label: "Start with a truck",
    body: "If a hitch, a bed, or four-wheel drive on unpaved roads is part of your week rather than an occasional need, start with the F-150 and work down through configurations. A truck bought for the two weekends a year you move furniture is usually the wrong tool.",
  },
  {
    label: "Start with an SUV",
    body: "Most households here land here. The question is size: a compact Escape for two to four people and easy parking, a mid-size Explorer when the third row gets real use, or a Bronco when trails and open-air driving matter more than a quiet highway ride.",
  },
  {
    label: "Start with a car",
    body: "A Mustang is a deliberate choice rather than a default one. It rewards drivers who want steering feel and rear-wheel drive, and it works best as a second vehicle in a climate that salts the roads for four months a year.",
  },
  {
    label: "Start with electric",
    body: "The F-150 Lightning suits households that can charge where they park and whose daily mileage is predictable. If you cannot charge at home, or you tow long distances, the gas F-150 stays the more practical answer, and we will tell you so.",
  },
];

export const Route = createFileRoute("/ford-models")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "Ford models Jefferson Ohio",
          "Ford models Ashtabula County",
          "new Ford models Northeast Ohio",
          "Ford F-150 Jefferson OH",
          "Ford Explorer Jefferson OH",
          "Ford Bronco Ashtabula County",
          "Ford dealer Jefferson Ohio",
        ].join(", "),
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: OG_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
      { type: "application/ld+json", children: JSON.stringify(modelListSchema) },
    ],
  }),
  component: FordModelsHub,
});

function FordModelsHub() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Model Lineup</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            Ford Models for Sale in {dealerInfo.locality}, Ohio
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each model below has its own page with what the vehicle is built for, who tends to buy
            it, how it holds up on Ashtabula County roads, and the questions our sales team gets
            asked most about it. Everything is sold and serviced from our single location at{" "}
            {dealerInfo.address}, and delivery is available if you would rather not make the drive.
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
          <h2 className="display text-2xl sm:text-3xl">The models we sell</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FORD_MODELS.map((m) => (
              <Link
                key={m.slug}
                to="/ford/$model"
                params={{ model: m.slug }}
                className="group flex flex-col rounded-3xl bg-card p-7 ring-1 ring-border transition hover:ring-[#002c5f]/40"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {m.bodyStyle === "EV" ? "Electric" : m.bodyStyle}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{m.name}</h3>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{m.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#002c5f] group-hover:underline">
                  Read the {m.name} buying guide
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>Narrowing It Down</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Where to start if you are undecided</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Most people arrive with a body style in mind before a model. These are the four openings
            our sales team uses, and the reasoning behind each one.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {BODY_STYLE_GUIDE.map((g) => (
              <div key={g.label} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Compass className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{g.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="display mt-5 text-xl sm:text-2xl">
              One location in {dealerInfo.locality}, and delivery if you need it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              AM Ford operates from {dealerInfo.address}, and that is the only place we sell and
              service vehicles. {DELIVERY_CLAIM} Buyers from Geneva, Conneaut, Mentor, Warren, and
              across the state line in Erie regularly handle the paperwork remotely and take
              delivery at home.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/nationwide-vehicle-delivery"
                className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001f44]"
              >
                See how home delivery and shipping work
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/financing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Apply for vehicle financing
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
