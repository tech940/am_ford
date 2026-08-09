import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  DollarSign,
  MapPin,
  Truck,
  Wrench,
} from "lucide-react";
import { DELIVERY_CLAIM, SERVED_MARKETS, dealerInfo, type Vehicle } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/**
 * Internal-linking hub for the inventory listing (SEO brief §11).
 * Every link uses descriptive anchor text and points only at routes that exist:
 * /inventory (with typed search params), /financing, /trade-in, /service, /contact,
 * /nationwide-vehicle-delivery. City pages do not exist yet, so served towns
 * appear as plain text rather than links.
 */

/** Subset of the inventory route's search schema used by these links. */
type InventoryLinkSearch = {
  type?: Vehicle["type"];
  fuel?: Vehicle["fuel"];
  drive?: Vehicle["drivetrain"];
  year?: number;
  priceMax?: number;
  /** Comma-separated badge slugs, matching the route's URL contract. */
  badges?: string;
  sort?: "price_asc" | "price_desc" | "year_desc" | "miles_asc";
};

type BodyStyle = {
  label: string;
  /** Undefined means "no type filter", i.e. the full listing. */
  type?: Vehicle["type"];
  search: InventoryLinkSearch;
};

const BODY_STYLES: BodyStyle[] = [
  { label: "All Inventory", search: {} },
  { label: "Trucks", type: "Truck", search: { type: "Truck" } },
  { label: "SUVs", type: "SUV", search: { type: "SUV" } },
  { label: "Cars", type: "Car", search: { type: "Car" } },
  { label: "Electric", type: "EV", search: { type: "EV" } },
];

type PopularSearch = {
  label: string;
  search: InventoryLinkSearch;
  /** Set only for single-filter entries so the current landing page is not linked to itself. */
  fuel?: Vehicle["fuel"];
};

/** Every combination below returns vehicles against the live inventory. */
const POPULAR_SEARCHES: PopularSearch[] = [
  { label: "Four-Wheel-Drive Trucks", search: { type: "Truck", drive: "4WD" } },
  { label: "All-Wheel-Drive SUVs", search: { type: "SUV", drive: "AWD" } },
  { label: "Off-Road Ready SUVs", search: { type: "SUV", badges: "off-road" } },
  { label: "Hybrid Vehicles", search: { fuel: "Hybrid" }, fuel: "Hybrid" },
  { label: "Gas-Powered Vehicles", search: { fuel: "Gas" }, fuel: "Gas" },
  { label: "Certified Pre-Owned Vehicles", search: { badges: "certified-pre-owned" } },
  { label: "Vehicles Under $50,000", search: { priceMax: 50000 } },
  { label: "Lowest Mileage First", search: { sort: "miles_asc" } },
  { label: "Newest Model Year First", search: { sort: "year_desc" } },
];

type NextStep = {
  label: string;
  to: "/financing" | "/trade-in" | "/service" | "/nationwide-vehicle-delivery";
  copy: string;
  Icon: typeof CreditCard;
};

const NEXT_STEPS: NextStep[] = [
  {
    label: "Apply for Vehicle Financing",
    to: "/financing",
    copy: "Send a secure credit application and let our finance team structure your options before you visit.",
    Icon: CreditCard,
  },
  {
    label: "Value Your Trade",
    to: "/trade-in",
    copy: "Find out what your current vehicle is worth and apply that value to the one you are shopping for.",
    Icon: DollarSign,
  },
  {
    label: "Schedule Ford Service",
    to: "/service",
    copy: `Book maintenance, diagnostics, and repairs with Ford-trained technicians at our ${dealerInfo.locality} shop.`,
    Icon: Wrench,
  },
  {
    label: "Learn About Free Home Delivery",
    to: "/nationwide-vehicle-delivery",
    copy: DELIVERY_CLAIM,
    Icon: Truck,
  },
];

/** A short, readable list of nearby towns we serve, drawn from the served-markets list. */
const NEARBY_TOWNS = [...SERVED_MARKETS.tier1.slice(1, 5), ...SERVED_MARKETS.tier2.slice(0, 4)];
const NEARBY_TOWNS_TEXT = `${NEARBY_TOWNS.slice(0, -1).join(", ")}, and ${
  NEARBY_TOWNS[NEARBY_TOWNS.length - 1]
}`;

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm";
const PILL_LINK =
  "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#002c5f]/30 hover:text-[#002c5f]";
const PILL_ACTIVE = "bg-[#002c5f] text-white shadow-sm";

function BlockHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
      {children}
    </h3>
  );
}

export function InventoryInterlinks({
  activeType,
  activeFuel,
}: {
  activeType?: string;
  activeFuel?: string;
}) {
  const allInventoryActive = activeType === undefined && activeFuel === undefined;

  return (
    <section className="border-t border-slate-200 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
          Keep Shopping
        </p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Where would you like to go next?
        </h2>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* 1. Body style */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <BlockHeading>Browse by body style</BlockHeading>
            <div className="mt-4 flex flex-wrap gap-2">
              {BODY_STYLES.map((style) => {
                const isActive =
                  style.type === undefined ? allInventoryActive : style.type === activeType;
                if (isActive) {
                  return (
                    <span
                      key={style.label}
                      aria-current="page"
                      className={cn(PILL_BASE, PILL_ACTIVE)}
                    >
                      {style.label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={style.label}
                    to="/inventory"
                    search={style.search}
                    className={cn(PILL_BASE, PILL_LINK)}
                  >
                    {style.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. Popular searches */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <BlockHeading>Popular searches</BlockHeading>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Shortcuts that most shoppers reach for, already filtered and ready to browse.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((item) => {
                const isActive = item.fuel !== undefined && item.fuel === activeFuel;
                if (isActive) {
                  return (
                    <span
                      key={item.label}
                      aria-current="page"
                      className={cn(PILL_BASE, PILL_ACTIVE)}
                    >
                      {item.label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to="/inventory"
                    search={item.search}
                    className={cn(PILL_BASE, PILL_LINK)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Next step */}
        <div className="mt-10">
          <BlockHeading>Your next step</BlockHeading>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEXT_STEPS.map(({ label, to, copy, Icon }) => (
              <Link
                key={label}
                to={to}
                className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#002c5f]/30 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#002c5f]/10 text-[#002c5f]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-4 flex items-center gap-1.5 text-sm font-extrabold text-[#002c5f]">
                  {label}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-slate-600">{copy}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Outside the immediate market */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#002c5f]/10 text-[#002c5f]">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <BlockHeading>Shopping from outside Ashtabula County?</BlockHeading>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Buyers drive to our {dealerInfo.locality} store from {NEARBY_TOWNS_TEXT}, along with
                the rest of Northeast Ohio and Northwestern Pennsylvania. If the distance is the
                only thing standing between you and the right vehicle, it does not have to be.{" "}
                {DELIVERY_CLAIM}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/nationwide-vehicle-delivery"
                  className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#001f44]"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Learn About Free Home Delivery
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/20 bg-white px-5 py-3 text-sm font-bold text-[#002c5f] shadow-sm transition hover:bg-slate-50"
                >
                  Contact Our Sales Team
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
