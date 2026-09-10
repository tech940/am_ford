import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeDollarSign, Car, CarFront, Truck, type LucideIcon } from "lucide-react";
import { DELIVERY_CLAIM, dealerInfo } from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";

type Category = {
  icon: LucideIcon;
  title: string;
  copy: string;
  anchor: string;
};

const cardCls = cn(
  "hm-glass group flex h-full min-w-0 flex-col rounded-lg p-3.5 sm:p-5",
  "transition-all duration-300 hover:-translate-y-1 hover:border-[#002c5f]/30",
  "hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-[#002c5f]",
);

/** Shared card face so each destination only differs by its typed <Link> props. */
function CardFace({
  icon: Icon,
  title,
  shortCopy,
  copy,
  anchor,
}: Category & { shortCopy?: string }) {
  return (
    <>
      <span
        className={cn(
          "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-md bg-[#002c5f]",
          "text-white shadow-xs transition-transform duration-300 group-hover:scale-105",
        )}
      >
        <Icon className="h-4 w-4 text-white" aria-hidden />
      </span>
      <h3 className="mt-2.5 sm:mt-3 text-[12.5px] sm:text-[14px] font-bold leading-snug text-slate-900">
        {title}
      </h3>
      <p className="mt-1 text-[11px] sm:text-[12px] leading-relaxed text-slate-600 line-clamp-2 sm:line-clamp-none">
        <span className="sm:hidden">{shortCopy || copy}</span>
        <span className="hidden sm:inline">{copy}</span>
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-2.5 sm:pt-3 text-[11px] sm:text-[12px] font-bold text-[#002c5f]">
        <span className="truncate">{anchor}</span>
        <ArrowUpRight
          className="h-3 w-3 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </span>
    </>
  );
}

const NEW_FORD = {
  icon: Truck,
  title: "New Ford Inventory",
  shortCopy: "F-150, Super Duty, Bronco & Explorer.",
  copy: "F-150, Super Duty, Bronco, and Explorer. Compare trims and drivetrains before you visit.",
  anchor: "New Fords",
};

const USED_CARS = {
  icon: Car,
  title: "Used Cars",
  shortCopy: "Sedans, coupes, and muscle cars.",
  copy: "Sedans, coupes, and hatchbacks from Ford and other brands. Filter by price, year, and miles.",
  anchor: "Used Cars",
};

const USED_SUVS = {
  icon: CarFront,
  title: "Used SUVs",
  shortCopy: "2-row & 3-row AWD SUVs.",
  copy: "Two rows or three, front-wheel drive or all-wheel drive. Room for car seats and Ohio winters.",
  anchor: "Used SUVs",
};

const TRADE = {
  icon: BadgeDollarSign,
  title: "Value Your Trade",
  shortCopy: "Instant trade-in appraisal.",
  copy: "Find out what your current vehicle is worth and put it straight toward the next one.",
  anchor: "Trade-In",
};

export function ShopByCategory() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-10 pt-6 sm:pb-24 sm:pt-16"
      aria-label="Shop by category"
    >
      <SectionHeading
        eyebrow="Shop by need"
        title={
          <>
            New Fords and
            <span className="text-slate-500 font-normal"> certified pre-owned</span>
          </>
        }
        copy="Most people arrive knowing the job the vehicle has to do. Pick the closest fit and we will take it from there."
      />

      <Stagger className="mt-5 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4" gap={0.08}>
        <StaggerItem>
          <Link to="/inventory" search={{ type: "Truck" }} className={cardCls}>
            <CardFace {...NEW_FORD} />
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Link to="/inventory" search={{ type: "Car" }} className={cardCls}>
            <CardFace {...USED_CARS} />
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Link to="/inventory" search={{ type: "SUV" }} className={cardCls}>
            <CardFace {...USED_SUVS} />
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Link to="/trade-in" className={cardCls}>
            <CardFace {...TRADE} />
          </Link>
        </StaggerItem>
      </Stagger>

      <Reveal delay={0.1} className="mt-8">
        <div className="hm-glass-strong rounded-lg p-5 sm:p-6">
          <p className="text-[13px] leading-relaxed text-slate-600">
            We are at {dealerInfo.street} in {dealerInfo.locality}, {dealerInfo.region}, serving
            Ashtabula County, Northeast Ohio, Northwestern Pennsylvania, and buyers nationwide.{" "}
            {DELIVERY_CLAIM}
          </p>
          <Link
            to="/nationwide-vehicle-delivery"
            className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-[13px] font-semibold text-[#002c5f] transition-colors duration-300 hover:text-[#001f44]"
          >
            See How Vehicle Delivery Works
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
