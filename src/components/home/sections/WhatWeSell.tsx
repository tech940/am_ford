import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LINEUP, type LineupGroup } from "@/lib/dealerContent";
import { vehicles } from "@/lib/vehicles";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { Button, Chip, IconArrowRight, SectionHeading } from "@/components/ledger";
import { ModelEnquiryDialog } from "@/components/lead/ModelEnquiryDialog";
import { cn } from "@/lib/utils";

/**
 * S3 — What we sell. The Ford lineup, with the official model renders.
 *
 * An earlier draft of this section was a four-column text index, on the reasoning that
 * "twenty cards would be twelve empty cards". That was only true because the renders had been
 * left behind when the live site's content was transcribed — the dealership publishes an
 * official image for every model it sells, so no card here is empty.
 *
 * Grouped and tabbed the way the dealership groups them. LINEUP is hand-maintained and must
 * NEVER be derived from the feed: driving it from inventory would delete the Bronco from the
 * homepage during a month the lot happened to sell out of Broncos.
 */

/** Counts key on SLUG, never on name, or the three Escape rows disagree on day one. */
const slugifyModel = (m: string) => m.toLowerCase().replace(/\s+/g, "-");
const matchesFor = (slug: string) => vehicles.filter((v) => slugifyModel(v.model) === slug);

export function WhatWeSell() {
  const [active, setActive] = useState<LineupGroup>(LINEUP[0].group);
  const group = LINEUP.find((g) => g.group === active) ?? LINEUP[0];

  return (
    <section aria-labelledby="lineup-title" className="border-b border-rule">
      <div className="reveal mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:px-16 lg:py-20">
        <SectionHeading
          id="lineup-title"
          title="What we sell"
          lead="Every model Ford builds, grouped the way we group them. Counts show what is on the lot today."
        />

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
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                  <ResponsiveImage
                    name={m.image}
                    alt={`Ford ${m.name}`}
                    sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 45vw"
                    aspect={{ width: 4, height: 3 }}
                    className="h-full w-full object-contain"
                  />
                  {inStock && (
                    <span className="absolute left-2 top-2">
                      <Chip tone="available" size="sm" dot>
                        {count} in stock
                      </Chip>
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
                      <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <ModelEnquiryDialog model={m.name}>
                      <Button variant="quiet" size="sm" className="-ml-2.5">
                        Ask about it
                        <span className="sr-only"> ({m.name})</span>
                      </Button>
                    </ModelEnquiryDialog>
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
            <IconArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/inventory"
            className="group inline-flex items-center gap-1.5 font-sans text-ui font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            See all inventory
            <IconArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
