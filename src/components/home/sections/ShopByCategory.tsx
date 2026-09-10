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
  "hm-glass group flex h-full min-w-0 flex-col rounded-[1.75rem] p-5 sm:p-6",
  "transition-all duration-500 hover:-translate-y-1.5 hover:border-[#002c5f]/30",
  "hover:shadow-[0_30px_70px_-26px_rgba(0,44,95,0.30)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-[#002c5f]",
);

/** Shared card face so each destination only differs by its typed <Link> props. */
function CardFace({ icon: Icon, title, copy, anchor }: Category) {
  return (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#002c5f]",
          "text-white shadow-sm transition-transform duration-500 group-hover:scale-105",
        )}
      >
        <Icon className="h-5 w-5 text-white" aria-hidden />
      </span>
      <h3 className="mt-4 text-[14px] font-bold leading-snug text-slate-900 sm:text-[15px]">
        {title}
      </h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600 sm:text-[13px]">{copy}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-semibold text-[#002c5f] sm:text-[13px]">
        {anchor}
        <ArrowUpRight
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </span>
    </>
  );
}

const NEW_FORD: Category = {
  icon: Truck,
  title: "New Ford Trucks and SUVs",
  copy: "F-150, Super Duty, Bronco, and Explorer. Compare trims and drivetrains before you visit.",
  anchor: "Browse New Ford Trucks",
};

const USED_CARS: Category = {
  icon: Car,
  title: "Used Cars",
  copy: "Sedans, coupes, and hatchbacks from Ford and other brands. Filter by price, year, and miles.",
  anchor: "Browse Used Cars",
};

const USED_SUVS: Category = {
  icon: CarFront,
  title: "Used SUVs",
  copy: "Two rows or three, front-wheel drive or all-wheel drive. Room for car seats, gear, and Ohio winters.",
  anchor: "Browse Used SUVs",
};

const TRADE: Category = {
  icon: BadgeDollarSign,
  title: "Value Your Trade",
  copy: "Find out what your current vehicle is worth and put it straight toward the next one.",
  anchor: "Value Your Trade",
};

export function ShopByCategory() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-16 sm:pb-36 sm:pt-20"
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

      <Stagger className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" gap={0.08}>
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
        <div className="hm-glass-strong rounded-[1.75rem] p-5 sm:p-6">
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
