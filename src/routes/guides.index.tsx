import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Phone, ShieldCheck, Wrench } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { guideCtaPrimary, guideCtaSecondary } from "@/components/site/GuideLayout";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { GUIDES, guidePath } from "@/lib/contentPages";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const BREADCRUMBS = crumbs({ label: "Guides" });

/**
 * Card presentation for each guide. The list of guides itself lives in
 * @/lib/contentPages, which the sitemap and the link checker also read, so a guide can
 * never appear here without appearing there. This map only adds what the hub needs:
 * a subject pill and descriptive anchor text.
 */
const CARD_COPY: Record<string, { topic: string; anchor: string }> = {
  "is-a-used-ford-f-150-reliable": {
    topic: "Trucks",
    anchor: "Read the used F-150 reliability guide",
  },
  "is-ford-ecoboost-reliable": {
    topic: "Engines",
    anchor: "Read the Ford EcoBoost reliability guide",
  },
  "what-to-check-before-buying-a-used-ford": {
    topic: "Buying",
    anchor: "Read the used Ford inspection checklist",
  },
  "best-ford-suv-for-families": {
    topic: "SUVs",
    anchor: "Read the family Ford SUV comparison",
  },
};

const CANONICAL = `${SITE_ORIGIN}/guides`;
const TITLE = "Ford Buying and Ownership Guides | AM Ford";
const DESCRIPTION =
  "Ford buying guides from AM Ford in Jefferson, Ohio: used F-150 reliability, EcoBoost engines, used-car inspection checks, and family SUV picks.";

const guideListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Ford buying and ownership guides from AM Ford",
  description: DESCRIPTION,
  numberOfItems: GUIDES.length,
  itemListElement: GUIDES.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: g.title,
    description: g.blurb,
    url: `${SITE_ORIGIN}${guidePath(g)}`,
  })),
};

/** How the guides are written. This is the part of the hub the articles do not repeat. */
const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "What we will not tell you",
    body: "We do not publish reliability scores we cannot source, award claims, or figures pulled from somewhere else on the internet. Where a number depends on the individual vehicle, such as towing capacity or fuel economy, we say so and point you at the vehicle's own documentation.",
  },
  {
    icon: Wrench,
    title: "Written around inspection, not opinion",
    body: "Most of what decides whether a used vehicle is a good buy is visible to someone who knows where to look. The guides are built around what to check and why it matters, so you can walk a vehicle with a list rather than a feeling.",
  },
  {
    icon: BookOpen,
    title: "Local conditions included",
    body: "Northeast Ohio salts its roads for months at a time and Ashtabula County keeps a lot of gravel and township mileage in the mix. Where that changes what you should look at, the guides say so instead of writing for a mild climate.",
  },
];

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "Ford buying guides",
          "used Ford buying advice",
          "is a used Ford F-150 reliable",
          "Ford EcoBoost reliability",
          "what to check before buying a used Ford",
          "best Ford SUV for families",
          "Ford dealer Jefferson Ohio",
        ].join(", "),
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(guideListSchema) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
    ],
  }),
  component: GuidesHub,
});

function GuidesHub() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Guides</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            Ford Buying and Ownership Guides
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            These are the answers our sales and service teams give in person, written down. Each
            guide takes one question buyers ask us at {dealerInfo.address} and works through it the
            way we would at the desk: what the question really turns on, what to check, and what we
            cannot tell you without looking at the specific vehicle in front of us.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/inventory" className={guideCtaPrimary}>
              Browse every Ford in stock <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href={dealerInfo.phoneHref} className={guideCtaSecondary}>
              <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-2xl sm:text-3xl">Start with a question</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each guide is written to be read start to finish before you shop rather than skimmed in
            a parking lot. If the question you have is not covered here, call us and we will answer
            it, then add it.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {GUIDES.map((g) => {
              const copy = CARD_COPY[g.slug];
              return (
                <Link
                  key={g.slug}
                  to={guidePath(g)}
                  className="group flex flex-col rounded-3xl bg-card p-7 ring-1 ring-border transition hover:ring-brand/40"
                >
                  <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    {copy?.topic ?? "Guide"}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {g.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand group-hover:underline">
                    {copy?.anchor ?? `Read the guide: ${g.title}`}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>How These Are Written</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">
            What you can expect from a guide on this site
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-9">
            <h2 className="display text-xl text-ink sm:text-2xl">
              Reading is the start; the vehicle decides it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Once a guide has narrowed things down, the next step is a specific vehicle. Our model
              pages cover what each one is built for, our side-by-side comparisons put two real
              listings against each other, our inventory shows what is on the lot right now, and our
              finance team can start the conversation before you make the drive to{" "}
              {dealerInfo.locality}. {DELIVERY_CLAIM}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/ford-models" className={guideCtaPrimary}>
                Compare every Ford model we sell <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/compare" className={guideCtaSecondary}>
                See Ford models compared side by side
              </Link>
              <Link to="/inventory" className={guideCtaSecondary}>
                See current Ford inventory
              </Link>
              <Link to="/financing" className={guideCtaSecondary}>
                Start a financing application
              </Link>
              <Link to="/contact" className={guideCtaSecondary}>
                Ask the AM Ford team a question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
