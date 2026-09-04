import { Link } from "@tanstack/react-router";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { dealerInfo, MAPS_DIRECTIONS_HREF } from "@/lib/vehicles";
import { IconArrowRight } from "@/components/ledger";

const SERVED_CITIES = [
  { name: "Ashtabula, OH", slug: "ashtabula-oh" },
  { name: "Austinburg, OH", slug: "austinburg-oh" },
  { name: "Conneaut, OH", slug: "conneaut-oh" },
  { name: "Geneva, OH", slug: "geneva-oh" },
  { name: "Chardon, OH", slug: "chardon-oh" },
  { name: "Madison, OH", slug: "madison-oh" },
  { name: "Cleveland, OH", slug: "cleveland-oh" },
  { name: "Erie, PA", slug: "erie-pa" },
];

export function WelcomeToAmFord() {
  return (
    <section aria-labelledby="welcome-title" className="border-b border-rule bg-surface">
      <div className="reveal mx-auto max-w-[1280px] px-5 py-14 sm:px-10 md:py-20 lg:px-16 lg:py-24">
        {/* Header Strip */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
            <span>DEALERSHIP RECORD</span>
            <span className="text-rule">&bull;</span>
            <span>EST. 1964 IN ASHTABULA COUNTY</span>
          </div>
          <h2
            id="welcome-title"
            className="mt-3 font-sans text-[clamp(2rem,3.8vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-ink"
          >
            Welcome to AM Ford
          </h2>
          <p className="mt-3 font-sans text-body text-ink-2">
            A family-owned Ford dealership in {dealerInfo.city}, serving northeastern Ohio and
            northwestern Pennsylvania for over six decades.
          </p>
        </div>

        {/* 2-Column Split: Story & Services Left, Facility & Fact Sheet Right */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column — Editorial Story & Core Pillars */}
          <div className="space-y-8 lg:col-span-7">
            <p className="font-sans text-body leading-relaxed text-ink-2">
              Whether you are shopping for a new{" "}
              <Link
                to="/inventory"
                search={{ type: "Truck" }}
                className="font-semibold text-brand underline underline-offset-4 hover:text-brand-deep"
              >
                Ford truck
              </Link>
              , a versatile{" "}
              <Link
                to="/inventory"
                search={{ type: "SUV" }}
                className="font-semibold text-brand underline underline-offset-4 hover:text-brand-deep"
              >
                Ford SUV
              </Link>
              , or a certified pre-owned vehicle, our team delivers a no-pressure, straightforward
              experience from first click to final signature. Drivers from Ashtabula, Cleveland,
              Erie, and beyond all find AM Ford worth the trip.
            </p>

            {/* 3 Structured Pillars */}
            <div className="space-y-6 border-t border-rule pt-6">
              {/* Pillar 1 */}
              <div className="border-l-2 border-brand pl-4">
                <h3 className="font-sans text-ui font-bold text-ink">
                  New & Commercial Ford Lineup
                </h3>
                <p className="mt-1.5 font-sans text-meta leading-relaxed text-ink-2">
                  Work-truck buyers will find{" "}
                  <Link
                    to="/ford/$model"
                    params={{ model: "f-150" }}
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    F-150
                  </Link>{" "}
                  and Super Duty configurations ready for any job site. Adventure seekers can
                  explore the{" "}
                  <Link
                    to="/ford/$model"
                    params={{ model: "bronco" }}
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    Bronco
                  </Link>{" "}
                  and Bronco Sport, while family haulers will appreciate the{" "}
                  <Link
                    to="/ford/$model"
                    params={{ model: "explorer" }}
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    Explorer
                  </Link>{" "}
                  and Expedition. Performance drivers can get behind the wheel of the{" "}
                  <Link
                    to="/ford/$model"
                    params={{ model: "mustang" }}
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    Mustang
                  </Link>
                  , or the all-electric{" "}
                  <Link
                    to="/ford/$model"
                    params={{ model: "f-150-lightning" }}
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    F-150 Lightning
                  </Link>
                  .
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="border-l-2 border-sage pl-4">
                <h3 className="font-sans text-ui font-bold text-ink">
                  Certified Pre-Owned Standards
                </h3>
                <p className="mt-1.5 font-sans text-meta leading-relaxed text-ink-2">
                  A Ford Certified Pre-Owned vehicle passes a factory multi-point inspection and
                  carries manufacturer-backed limited warranty coverage, 24/7 roadside assistance,
                  and a CARFAX history report. View our{" "}
                  <Link
                    to="/inventory"
                    search={{ condition: "Certified Pre-Owned" }}
                    className="font-semibold text-brand underline underline-offset-2"
                  >
                    certified pre-owned inventory
                  </Link>
                  .
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="border-l-2 border-sage pl-4">
                <h3 className="font-sans text-ui font-bold text-ink">
                  Financing & Concierge Service
                </h3>
                <p className="mt-1.5 font-sans text-meta leading-relaxed text-ink-2">
                  Our{" "}
                  <Link
                    to="/financing"
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    finance centre
                  </Link>{" "}
                  works with regional Ohio credit unions and national lenders. For maintenance, our
                  Ford Pickup and Delivery team collects your vehicle for scheduled service and
                  returns it to your driveway.{" "}
                  <Link
                    to="/service"
                    className="font-medium text-brand underline underline-offset-2"
                  >
                    Schedule service online
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Regional Markets Directory */}
            <div className="border-t border-rule pt-6">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-3">
                Regional Communities We Serve Daily
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {SERVED_CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    to="/ford-dealer/$city"
                    params={{ city: city.slug }}
                    className="border border-rule bg-white px-3 py-1.5 font-sans text-meta font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                  >
                    {city.name} &rarr;
                  </Link>
                ))}
                <Link
                  to="/areas-we-serve"
                  className="border border-rule bg-surface/50 px-3 py-1.5 font-sans text-meta font-medium text-brand underline-offset-4 hover:underline"
                >
                  View All Served Counties &rarr;
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-1.5 font-sans text-ui font-semibold text-brand underline-offset-4 hover:underline"
              >
                Speak with our team in Jefferson
                <IconArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column — Architectural Photo & Facility Dossier */}
          <div className="space-y-6 lg:col-span-5">
            {/* Aerial Photography Stage */}
            <div className="border border-rule bg-white p-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                <ResponsiveImage
                  name="am-ford-aerial"
                  alt={`The ${dealerInfo.name} building and lot in ${dealerInfo.locality}, photographed from the air`}
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-ink/85 px-2.5 py-1 font-mono text-[10px] text-white">
                  Aerial View &middot; 1999 E Prospect Rd, Jefferson, OH
                </div>
              </div>

              {/* Dealership Spec Rail Sheet */}
              <div className="mt-4 divide-y divide-rule border-t border-rule font-sans text-meta">
                <div className="flex justify-between py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                    Facility Type
                  </span>
                  <span className="font-bold text-ink">Authorized Ford Dealership</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                    Ownership
                  </span>
                  <span className="font-bold text-ink">Family-Owned Since 1964</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                    Service Bays
                  </span>
                  <span className="font-bold text-ink">Certified Ford Diagnostic Bays</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                    Delivery Area
                  </span>
                  <span className="font-bold text-ink">Northeast Ohio & Nationwide</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                    County / Region
                  </span>
                  <span className="font-bold text-ink">Ashtabula County &middot; OH</span>
                </div>
              </div>

              {/* Directions Button */}
              <div className="mt-4 pt-3 border-t border-rule">
                <a
                  href={MAPS_DIRECTIONS_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-brand bg-brand/5 py-2.5 font-sans text-meta font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  Get Directions to Showroom &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
