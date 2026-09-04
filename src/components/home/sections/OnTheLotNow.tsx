import { Link } from "@tanstack/react-router";
import { VehicleCard } from "@/components/site/VehicleCard";
import { PRICING_STANCE } from "@/lib/dealerContent";
import { homepageSelection } from "@/lib/vehicles";
import { IconArrowRight, SectionHeading } from "@/components/ledger";

/**
 * S2 — On the lot now. The page's ONLY inventory render.
 *
 * It replaces four consecutive sections (`MostSearchedCars`, `FeaturedSpotlight`,
 * `ExtraordinaryCarousel`, `FeaturedCars`) that each showed the same six records in a
 * different layout — a coverflow, a spotlight, a tab-filtered grid and a tilt grid.
 *
 * `homepageSelection()` returns one vehicle per body style present, so this section is the
 * same height at six records and at four hundred. Saving lines are suppressed: nothing in
 * dealerContent.ts backs a per-vehicle saving and the placeholder msrp values are not real.
 * Cards use the secondary enquire variant so the page keeps exactly one filled button.
 */
export function OnTheLotNow() {
  const selection = homepageSelection();
  if (selection.length === 0) return null;

  const [lead, ...rest] = selection;

  return (
    <section aria-labelledby="lot-title" className="border-b border-rule">
      <div className="reveal mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:px-16 lg:py-20">
        <SectionHeading
          id="lot-title"
          title="On the lot now"
          lead="Priced and specified. Call to confirm availability before you travel."
        />

        {/* The dealership's own pricing stance, rendered once on the page and never restated
            in stronger words. It is their published claim, not ours. */}
        <p className="mt-6 font-sans text-h3 font-bold text-ink">{PRICING_STANCE}</p>

        <div className="mt-10 flex flex-col gap-6">
          <VehicleCard v={lead} layout="row" showSaving={false} enquireVariant="secondary" />

          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((v) => (
                <VehicleCard key={v.id} v={v} showSaving={false} enquireVariant="secondary" />
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 border-t border-rule pt-6">
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
