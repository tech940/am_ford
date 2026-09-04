import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LINEUP, type LineupGroup } from "@/lib/dealerContent";
import { vehicles } from "@/lib/vehicles";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { cn } from "@/lib/utils";

/**
 * What we sell — the Ford lineup with the official model renders.
 *
 * PORTED from the v2 redesign branch (v2_ford) at the client's request, adapted to live
 * natively in this codebase rather than dragging the v2 component system across:
 *  - the v2 ledger `SectionHeading` is replaced with this page's own `.display` heading;
 *  - the v2 `Chip` and `IconArrowRight` are inlined below (they were the only two pieces of
 *    that library this section used);
 *  - "Ask about it" opened the v2 lead dialog, whose whole capture stack does not exist
 *    here — it links to /contact instead, which is this site's equivalent surface;
 *  - colour and size tokens were added to styles.css in this site's own palette (its navy,
 *    its slate greys), so nothing here introduces a second design language.
 * The data layer (LINEUP in dealerContent.ts, the 17 official renders in assets/generated)
 * came across verbatim.
 *
 * LINEUP is hand-maintained and must NEVER be derived from the feed: driving it from
 * inventory would delete the Bronco from the homepage during a month the lot happened to
 * sell out of Broncos. Counts, by contrast, ARE derived, so "in stock" can never lie.
 */

/** Counts key on SLUG, never on name, or duplicate-name rows disagree on day one. */
const slugifyModel = (m: string) => m.toLowerCase().replace(/\s+/g, "-");
const matchesFor = (slug: string) => vehicles.filter((v) => slugifyModel(v.model) === slug);

/** Inlined from the v2 icon set: 1.5px stroke, butt caps, matching that section's art. */
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function WhatWeSell() {
  const [active, setActive] = useState<LineupGroup>(LINEUP[0].group);
  const group = LINEUP.find((g) => g.group === active) ?? LINEUP[0];

  return (
    <section aria-labelledby="lineup-title" className="border-y border-rule bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <h2 id="lineup-title" className="display text-3xl text-ink sm:text-4xl">
          What we sell
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every model Ford builds, grouped the way we group them. Counts show what is on the lot
          today.
        </p>

        {/* Filters one grid in place rather than swapping panels, so these are toggle buttons
            and not a half-implemented tabs pattern. */}
        <div
          role="group"
          aria-label="Filter the lineup by group"
          className="mt-8 flex flex-wrap items-center gap-1 border-b border-rule"
        >
          {LINEUP.map((g) => {
            const on = g.group === active;
            return (
              <button
                key={g.group}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(g.group)}
                className={cn(
                  "relative -mb-px min-h-11 border-b-2 px-4 font-sans text-ui font-semibold transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  on ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink",
                )}
              >
                {g.group}
                <span className="ml-1.5 font-normal tabular-nums text-ink-3">
                  {g.models.length}
                </span>
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {group.models.map((m) => {
            const count = matchesFor(m.slug).length;
            const inStock = count > 0;

            return (
              <li key={`${group.group}-${m.name}`} className="group relative flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                  <ResponsiveImage
                    name={m.image}
                    alt={`Ford ${m.name}`}
                    sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 45vw"
                    aspect={{ width: 4, height: 3 }}
                    className="h-full w-full object-contain"
                  />
                  {inStock && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-available/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-available">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                        aria-hidden
                      />
                      {count} in stock
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-sans text-h3 font-bold leading-tight text-ink">
                  {m.hasPage ? (
                    <Link
                      to="/ford/$model"
                      params={{ model: m.slug }}
                      className="after:absolute after:inset-0 hover:underline focus-visible:outline-none"
                    >
                      {m.name}
                    </Link>
                  ) : inStock ? (
                    // q derives from a record that already matched, so this can never land on
                    // an empty indexable results page.
                    <Link
                      to="/inventory"
                      search={{ q: matchesFor(m.slug)[0].model }}
                      className="after:absolute after:inset-0 hover:underline focus-visible:outline-none"
                    >
                      {m.name}
                    </Link>
                  ) : (
                    m.name
                  )}
                </h3>

                <div className="relative z-10 mt-2">
                  {m.hasPage || inStock ? (
                    <span className="inline-flex items-center gap-1 font-sans text-meta font-semibold text-brand">
                      {inStock ? "View inventory" : "Explore the model"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <Link
                      to="/contact"
                      className="inline-flex min-h-9 items-center gap-1 font-sans text-meta font-semibold text-ink-3 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Ask about it
                      <span className="sr-only"> ({m.name})</span>
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-rule pt-6">
          <Link
            to="/ford-models"
            className="group inline-flex items-center gap-1.5 font-sans text-ui font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            All model pages
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/inventory"
            className="group inline-flex items-center gap-1.5 font-sans text-ui font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            See all inventory
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
