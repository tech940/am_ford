import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  CalendarCheck,
  CarFront,
  CircleDot,
  Disc3,
  Droplets,
  MapPin,
  PackageCheck,
  Ruler,
  ScanSearch,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Reveal, SectionHeading, Stagger, StaggerItem, scaleVariants } from "../fx/Reveal";
import { MagneticButton, ctaGhost, ctaPrimary } from "../fx/ui";
import { dealerInfo } from "@/lib/vehicles";

type Item = { icon: LucideIcon; title: string; copy: string };

/** What our service department handles day to day. No pricing: quotes come from the advisor. */
const SERVICES: Item[] = [
  {
    icon: Droplets,
    title: "Oil changes and The Works",
    copy: "Oil and filter change with the multi-point inspection included in The Works maintenance package.",
  },
  {
    icon: Disc3,
    title: "Brake service",
    copy: "Pads, rotors, and brake fluid, plus diagnosis of noise, pulsation, or a soft pedal.",
  },
  {
    icon: CircleDot,
    title: "Tires and rotations",
    copy: "Tire sales, mounting, balancing, and rotations for cars, SUVs, and trucks.",
  },
  {
    icon: Ruler,
    title: "Wheel alignment",
    copy: "Alignment checks and adjustments that correct pulling and uneven tire wear.",
  },
  {
    icon: BatteryCharging,
    title: "Battery testing and replacement",
    copy: "Battery and charging system testing, with replacement while you wait when we have your size in stock.",
  },
  {
    icon: ScanSearch,
    title: "Check engine light diagnosis",
    copy: "Ford diagnostic tools read the stored codes, then your advisor explains what the repair involves.",
  },
  {
    icon: CalendarCheck,
    title: "Factory-scheduled maintenance",
    copy: "The mileage intervals Ford lays out for your model, kept on schedule and on record.",
  },
  {
    icon: ShieldCheck,
    title: "Recall and warranty work",
    copy: "Open recall notices and warranty repairs handled in house by our Ford service team.",
  },
  {
    icon: Truck,
    title: "Commercial vehicle service",
    copy: "Work trucks, vans, and upfitted vehicles serviced with downtime kept short.",
  },
];

/** The three things that make the service drive different, shown beside the heading. */
const PROMISES: Item[] = [
  {
    icon: Wrench,
    title: "Ford-trained technicians",
    copy: "Factory training and Ford diagnostic equipment, covering gas, hybrid, and electric models.",
  },
  {
    icon: PackageCheck,
    title: "Genuine Ford and Motorcraft parts",
    copy: "Parts matched to your vehicle, and a parts counter that can order what is not on the shelf.",
  },
  {
    icon: CarFront,
    title: "Ford Pickup and Delivery",
    copy: "Available for eligible service customers and appointments: we collect your Ford, service it, and bring it back. This is separate from vehicle purchase delivery.",
  },
];

/**
 * Service and parts split: promises and CTAs on the left, the full service menu on the right.
 * Deliberately price-free; the SEO brief treats any figure as an unapproved claim.
 */
export function ServiceAndParts() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36"
      aria-label="Service and parts"
    >
      <div className="grid items-start gap-14 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24">
          <SectionHeading
            align="left"
            eyebrow="Service and parts"
            title={
              <>
                Ford service and parts,
                <span className="text-slate-500 font-normal"> wherever you bought it</span>
              </>
            }
            copy="You do not have to buy from us to service with us. Our Ford-trained technicians work on new Fords, older vehicles, and work trucks, using genuine Ford and Motorcraft parts made for your vehicle."
          />

          <Stagger className="mt-10 space-y-4" gap={0.12}>
            {PROMISES.map((p) => (
              <StaggerItem key={p.title}>
                <div className="hm-glass flex items-start gap-4 rounded-3xl p-5 transition-colors duration-500 hover:border-[#002c5f]/20">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#002c5f] text-white shadow-sm">
                    <p.icon className="h-5 w-5 text-white" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-900">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.copy}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2} className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <MagneticButton>
                <Link to="/service" className={ctaPrimary}>
                  Schedule Ford Service
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact" className={ctaGhost}>
                  Order Genuine Ford Parts
                </Link>
              </MagneticButton>
            </div>
            <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#002c5f]" aria-hidden />
              <span className="min-w-0">
                Our service drive is at {dealerInfo.address}, serving Ashtabula County, Northeast
                Ohio, and Northwestern Pennsylvania.
              </span>
            </p>
          </Reveal>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2" gap={0.07}>
          {SERVICES.map((s) => (
            <StaggerItem key={s.title} variants={scaleVariants}>
              <article className="hm-glass h-full rounded-3xl p-5 transition-colors duration-500 hover:border-[#002c5f]/25">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#002c5f]/10 text-[#002c5f]">
                  <s.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.copy}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
