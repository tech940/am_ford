import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { Button, IconArrowRight } from "@/components/ledger";
import { FOUNDED_YEAR, LINEUP, PRICING_STANCE, yearsServing } from "@/lib/dealerContent";
import { DELIVERY_CLAIM, dealerInfo } from "@/lib/vehicles";

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "About" });

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About AM Ford | Family-Owned Ford Dealer in ${dealerInfo.city}` },
      {
        name: "description",
        content: `AM Ford is a family-owned Ford dealer in ${dealerInfo.city}, serving Ashtabula County since ${FOUNDED_YEAR} with honest pricing, Ford service, and no-pressure buying.`,
      },
      { property: "og:title", content: `About AM Ford | Ford Dealer in ${dealerInfo.city}` },
      {
        property: "og:description",
        content: `Family-owned Ford dealer in ${dealerInfo.city}, serving Ashtabula County and Northeast Ohio since ${FOUNDED_YEAR}.`,
      },
      { property: "og:url", content: "https://amford.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
    ],
  }),
  component: AboutPage,
});

/**
 * The brand story, rebuilt on facts that exist.
 *
 * WHAT THE OLD PAGE CLAIMED, AND WHY IT COULD NOT STAY. "Since 1962" (the client's own brief
 * says 1964). "Three generations. One family." "Built on a handshake." "20k+ vehicles
 * delivered." "4.9 average review score." "30+ team members." "Ford President's Award."
 * "Sponsoring local schools and youth sports for decades." "One of the top-rated Ford dealers
 * in Northeast Ohio." Not one of those appears in any source, and an invented manufacturer
 * award on a real dealership's site is the most serious kind of fabrication this project has
 * removed. All of it is gone, not softened.
 *
 * WHAT IS LEFT IS WHAT IS TRUE, and it is enough to be a story: a store that has sold Fords
 * on the same road since 1964, under two names, and now delivers across the country. Every
 * figure on this page is either client-provided (1964), read from dealerInfo, or derived.
 *
 * STILL MISSING, FLAGGED FOR THE CLIENT: the brief asks for people — the sales team, the
 * service techs, cars being delivered — and for historic imagery. No such photography exists
 * in the repo. The layout leaves room for it; it cannot be faked in the meantime.
 */
function AboutPage() {
  const years = yearsServing(new Date());
  const modelCount = LINEUP.reduce((n, g) => n + g.models.length, 0);

  const FIGURES: { value: string; label: string }[] = [
    { value: String(years), label: "years on State Route 46" },
    { value: "2", label: "names, one store" },
    { value: "300", label: "miles of free home delivery" },
    { value: "50", label: "states we ship to" },
    { value: String(modelCount), label: "Ford models we sell" },
  ];

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      {/* The opening: asphalt, one enormous sourced fact. */}
      <section aria-labelledby="about-title" className="bg-asphalt">
        <div className="reveal mx-auto max-w-[1280px] px-5 pb-14 pt-16 sm:px-10 lg:px-16 lg:pb-20 lg:pt-24">
          <p className="font-mono text-figure tabular-nums text-brand-bright">
            Est. {FOUNDED_YEAR}
          </p>
          <h1
            id="about-title"
            className="mt-3 max-w-[13ch] text-balance font-display text-[clamp(2.5rem,1.2rem+4.6vw,5.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-white"
          >
            Family-owned since {FOUNDED_YEAR}.
          </h1>
          <p className="mt-6 max-w-[52ch] font-sans text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] leading-relaxed text-white/80">
            One store, on one road, selling one brand for {years} years. The dealership Jefferson
            knew as {dealerInfo.formerName} trades today as AM Ford, and the promise on the building
            has not moved: {PRICING_STANCE.toLowerCase()}.
          </p>
        </div>

        {/* The store, full bleed, at full luminance. The photograph is the credential. */}
        <div className="overflow-hidden">
          <ResponsiveImage
            name="am-ford-front-lot"
            alt={`The AM Ford front lot on ${dealerInfo.street} in ${dealerInfo.locality}, Ohio`}
            sizes="100vw"
            aspect={{ width: 3, height: 1 }}
            className="img-reveal h-[clamp(16rem,42vh,30rem)] w-full object-cover"
          />
        </div>
      </section>

      {/* The record: every figure sourced or derived, set like the sticker sets them. */}
      <section aria-label="AM Ford in numbers" className="border-b border-white/10 bg-asphalt">
        <div className="reveal mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-10 px-5 py-14 sm:px-10 md:grid-cols-5 lg:px-16 lg:py-16">
          {FIGURES.map((f) => (
            <div key={f.label}>
              <p className="font-mono text-[clamp(2.5rem,2rem+2vw,4rem)] font-semibold leading-none tabular-nums text-white">
                {f.value}
              </p>
              <p className="mt-2 max-w-[16ch] font-sans text-meta leading-snug text-white/60">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The timeline: three moments this store can actually evidence. */}
      <section aria-labelledby="timeline-title" className="bg-background">
        <div className="reveal mx-auto max-w-[1280px] px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
          <h2 id="timeline-title" className="font-display text-h2 font-bold text-ink lg:text-h1">
            The short version of a long run
          </h2>

          <div className="mt-10 border-t border-rule">
            <div className="grid gap-x-10 gap-y-2 border-b border-rule py-8 lg:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="font-mono text-[2.5rem] font-semibold leading-none tabular-nums text-brand">
                {FOUNDED_YEAR}
              </p>
              <p className="max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
                The store opens on State Route 46 in {dealerInfo.locality}, Ohio. It has sold Fords
                from the same stretch of road ever since.
              </p>
            </div>

            <div className="grid gap-x-10 gap-y-2 border-b border-rule py-8 lg:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="font-display text-h3 font-extrabold uppercase leading-tight text-ink">
                The Nassief years
              </p>
              <p className="max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
                Before the AM name went up, this store traded as {dealerInfo.formerName}. Same lot,
                same franchise, same work: sell the truck, fix the truck, answer the phone.
              </p>
            </div>

            <div className="grid gap-x-10 gap-y-2 border-b border-rule py-8 lg:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="font-display text-h3 font-extrabold uppercase leading-tight text-ink">
                AM Ford today
              </p>
              <p className="max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
                The same family-owned store, with a reach the founders could not have priced:{" "}
                {DELIVERY_CLAIM.charAt(0).toLowerCase() + DELIVERY_CLAIM.slice(1)} A buyer in
                Jefferson and a buyer 300 miles away get the same number and the same handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The place, from the air. A real aerial of the real site beats any map or stock. */}
      <section aria-label="The AM Ford site from the air" className="bg-surface">
        <div className="reveal mx-auto max-w-[1280px] px-5 py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="overflow-hidden">
            <ResponsiveImage
              name="am-ford-aerial"
              alt={`The AM Ford building and lot in ${dealerInfo.locality}, photographed from the air`}
              sizes="(min-width: 1280px) 1152px, 100vw"
              aspect={{ width: 1920, height: 480 }}
              className="img-reveal block w-full object-cover"
            />
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[52ch] font-sans text-body leading-relaxed text-ink-2">
              {dealerInfo.address}. One location, and the whole operation is on it: showroom,
              service bays, and the front line.
            </p>
            <Button asChild size="lg" className="shrink-0">
              <Link to="/inventory">
                See what is on the lot
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
