import { Link } from "@tanstack/react-router";
import { vehicles } from "@/lib/vehicles";

const TYPES = [
  { label: "Trucks", type: "Truck" as const, sub: "Built for the job site and the open road." },
  { label: "SUVs", type: "SUV" as const, sub: "Three rows, all-wheel drive, all-road ready." },
  { label: "Cars", type: "Car" as const, sub: "Performance and precision, undiluted." },
  { label: "Electric", type: "EV" as const, sub: "The future of the F-150, plugged in." },
] as const;

/**
 * Browse by Type — horizontal editorial strip.
 * Type counts + labels + links to /inventory?type=...
 * Zero icons.
 */
export function BrowseByType() {
  return (
    <section
      className="hm-observe hm-section py-24 sm:py-32"
      style={
        {
          "--bg-start": "#ebebea",
          "--bg-target": "#f5f5f3",
        } as React.CSSProperties
      }
      aria-labelledby="browse-type-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        <p className="hm-eyebrow text-slate-400 mb-8 sm:mb-10">Shop by type</p>

        {/* Typographic category list */}
        <ul className="divide-y divide-slate-200" id="browse-type-heading">
          {TYPES.map((t) => {
            const count = vehicles.filter((v) =>
              t.type === "EV" ? v.fuel === "Electric" || v.type === "EV" : v.type === t.type,
            ).length;

            return (
              <li key={t.type}>
                <Link
                  to="/inventory"
                  search={{ type: t.type === "EV" ? "EV" : t.type }}
                  className="group flex items-center justify-between py-6 sm:py-8 transition-all duration-200"
                >
                  <div className="flex items-baseline gap-5 sm:gap-8">
                    {/* Count */}
                    <span
                      className="hm-display text-slate-200 group-hover:text-[#002c5f]/20 transition-colors"
                      style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", minWidth: "2.5rem" }}
                      aria-hidden
                    >
                      {count}
                    </span>
                    {/* Label */}
                    <span
                      className="hm-display text-slate-900 group-hover:text-[#002c5f] transition-colors"
                      style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.5rem)" }}
                    >
                      {t.label}
                    </span>
                    {/* Sub-label — desktop only */}
                    <span className="hidden md:inline text-sm font-light text-slate-400 ml-2 group-hover:text-slate-600 transition-colors">
                      {t.sub}
                    </span>
                  </div>

                  {/* Arrow */}
                  <span
                    className="text-slate-300 group-hover:text-[#002c5f] transition-all duration-200 group-hover:translate-x-2"
                    style={{ fontSize: "1.4rem" }}
                    aria-hidden
                  >
                    &#8594;
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
