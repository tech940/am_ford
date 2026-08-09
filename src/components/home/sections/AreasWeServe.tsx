import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, MapPin, Navigation } from "lucide-react";
import { DELIVERY_CLAIM, SERVED_MARKETS, dealerInfo } from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";
import { MagneticButton, ctaGhost, ctaPrimary } from "../fx/ui";

type Band = {
  key: keyof typeof SERVED_MARKETS;
  label: string;
  note: string;
  icon: typeof MapPin;
};

/**
 * The brief's geographic tiers, in order: immediate market, expanded Northeast Ohio,
 * then the wider region. Markets render as plain text pills, not links, because the
 * city landing pages do not exist yet.
 */
const BANDS: Band[] = [
  {
    key: "tier1",
    label: "Ashtabula County and nearby",
    note: "Our home county, a short run up or down State Route 46.",
    icon: MapPin,
  },
  {
    key: "tier2",
    label: "Northeast Ohio",
    note: "From Lake and Geauga counties through Trumbull and the Mahoning Valley.",
    icon: Navigation,
  },
  {
    key: "tier3",
    label: "Regional and beyond",
    note: "Metro Ohio, Erie and Northwestern Pennsylvania, plus shoppers nationwide.",
    icon: Globe2,
  },
];

/** Where AM Ford's customers come from, grouped by how far they travel to Jefferson. */
export function AreasWeServe() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36"
      aria-label="Areas we serve"
    >
      <SectionHeading
        eyebrow="Areas we serve"
        title={
          <>
            Rooted in Jefferson,
            <span className="text-slate-500 font-normal"> driving the whole region</span>
          </>
        }
        copy="People make the trip to Jefferson from all over Ashtabula County, Northeast Ohio, and Northwestern Pennsylvania for the inventory, straightforward pricing, and a process that stays simple from first question to keys in hand. If you live farther out, distance does not have to be the deciding factor; our delivery program closes the gap."
      />

      <Reveal className="mx-auto mt-6 max-w-2xl" delay={0.1}>
        <p className="text-center text-base leading-relaxed text-slate-600">
          We drive the same roads you do. Lake-effect snow coming off Lake Erie, gravel township
          roads in March, a trailer behind the truck most weekends; that is the driving our team
          keeps in mind when we talk through four-wheel drive, tires, and tow ratings.
        </p>
      </Reveal>

      <Stagger className="mt-14 grid gap-6 lg:grid-cols-3" gap={0.12}>
        {BANDS.map((band) => (
          <StaggerItem key={band.key}>
            <article className="hm-glass h-full rounded-[1.75rem] p-6 transition-colors duration-500 hover:border-[#002c5f]/30 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#002c5f] text-white shadow-sm">
                  <band.icon className="h-5 w-5 text-white" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-900">{band.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{band.note}</p>
                </div>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {SERVED_MARKETS[band.key].map((market) => (
                  <li key={market}>
                    <span className="inline-flex min-h-[40px] items-center rounded-full bg-slate-100 px-3.5 text-[13px] font-medium leading-tight text-[#002c5f]">
                      {market}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12" delay={0.15}>
        <div className="hm-glass-strong flex flex-col gap-6 rounded-[1.75rem] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#002c5f]">
              One store, one address
            </p>
            <p className="mt-3 text-lg font-bold leading-snug text-slate-900">
              {dealerInfo.name}, {dealerInfo.address}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{DELIVERY_CLAIM}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <MagneticButton className="w-full sm:w-auto">
              <Link to="/contact" className={cn(ctaPrimary, "w-full text-center sm:w-auto")}>
                Get Directions to AM Ford
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto">
              <Link
                to="/nationwide-vehicle-delivery"
                className={cn(ctaGhost, "w-full text-center sm:w-auto")}
              >
                See Vehicle Delivery Details
              </Link>
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
