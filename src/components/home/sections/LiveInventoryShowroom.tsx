import { Link } from "@tanstack/react-router";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { vehicles, type Vehicle, vehicleSlug } from "@/lib/vehicles";

function fmt(price: number) {
  return "$" + price.toLocaleString("en-US");
}

// Map vehicle id to ResponsiveImage name
function imageKey(
  id: string,
): "hero-truck" | "car-mustang" | "car-explorer" | "car-lightning" | "car-bronco" | "car-escape" {
  if (id === "f150-platinum-2025") return "hero-truck";
  if (id === "mustang-gt-2025") return "car-mustang";
  if (id === "explorer-st-2025") return "car-explorer";
  if (id === "f150-lightning-2025") return "car-lightning";
  if (id === "bronco-outer-banks-2025") return "car-bronco";
  return "car-escape";
}

function VehicleLabel({ v }: { v: Vehicle }) {
  return (
    <p className="hm-eyebrow text-slate-400 mb-1">
      {v.year}&nbsp;{v.make}&nbsp;{v.model}&nbsp;{v.trim}
    </p>
  );
}

/**
 * Inventory Reveal — asymmetric editorial layout.
 * Lead vehicle left (large), two stacked right.
 * No feature lists, no badges, no borders/card boxes.
 */
export function LiveInventoryShowroom() {
  const lead = vehicles[0]; // F-150 Platinum — the anchor
  const secondary = vehicles.slice(1, 3); // Mustang + Explorer
  const total = vehicles.length;

  return (
    <section
      className="hm-observe hm-section py-24 sm:py-36"
      style={
        {
          "--bg-start": "#f2f2f0",
          "--bg-target": "#ffffff",
        } as React.CSSProperties
      }
      aria-labelledby="inventory-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        {/* Section header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-14 sm:mb-20">
          <div>
            <p className="hm-eyebrow text-slate-400 mb-2">Current inventory</p>
            <h2
              id="inventory-heading"
              className="hm-display text-[#002c5f]"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
            >
              In stock now.
            </h2>
          </div>
          <Link
            to="/inventory"
            className="hm-arrow-link text-sm font-semibold text-[#002c5f] border-b border-[#002c5f]/30 pb-0.5 hover:border-[#002c5f] transition-colors shrink-0"
          >
            All {total} vehicles&nbsp;&nbsp;&#8594;
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Lead vehicle — left, large */}
          <div className="lg:col-span-7 group">
            <Link
              to="/vehicle/$id"
              params={{ id: vehicleSlug(lead) }}
              className="block"
            >
              <div className="overflow-hidden bg-slate-100 aspect-[4/3] lg:aspect-auto lg:h-[440px]">
                <ResponsiveImage
                  name={imageKey(lead.id)}
                  alt={`${lead.year} ${lead.make} ${lead.model} ${lead.trim}`}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-6">
                <VehicleLabel v={lead} />
                <div className="flex items-baseline justify-between gap-4">
                  <p
                    className="hm-display text-slate-900"
                    style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                  >
                    {fmt(lead.price)}
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    {lead.drivetrain}&nbsp;·&nbsp;{lead.fuel}
                  </p>
                </div>
                <p className="mt-2 text-[13px] font-semibold text-[#002c5f] hm-arrow-link">
                  View details&nbsp;&nbsp;&#8594;
                </p>
              </div>
            </Link>
          </div>

          {/* Right column — two stacked */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {secondary.map((v) => (
              <div key={v.id} className="group">
                <Link to="/vehicle/$id" params={{ id: vehicleSlug(v) }} className="block">
                  <div className="overflow-hidden bg-slate-100 aspect-[16/9]">
                    <ResponsiveImage
                      name={imageKey(v.id)}
                      alt={`${v.year} ${v.make} ${v.model} ${v.trim}`}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="mt-3">
                    <VehicleLabel v={v} />
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-xl font-bold text-slate-900">{fmt(v.price)}</p>
                      <p className="text-[12px] font-medium text-slate-500">
                        {v.drivetrain}&nbsp;·&nbsp;{v.fuel}
                      </p>
                    </div>
                    <p className="mt-1 text-[13px] font-semibold text-[#002c5f] hm-arrow-link">
                      View details&nbsp;&nbsp;&#8594;
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Browse all — right-aligned */}
        <div className="mt-14 flex justify-end">
          <Link
            to="/inventory"
            className="hm-arrow-link text-sm font-semibold text-slate-500 border-b border-slate-300 pb-0.5 hover:text-[#002c5f] hover:border-[#002c5f] transition-colors"
          >
            See all {total} vehicles in stock&nbsp;&nbsp;&#8594;
          </Link>
        </div>
      </div>
    </section>
  );
}
