import { Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, MapPin, MousePointerClick, Truck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "../fx/Reveal";
import { MagneticButton, ctaGhost, ctaPrimary } from "../fx/ui";
import { cn } from "@/lib/utils";
import { DELIVERY_SHIPPING, DELIVERY_SHORT, dealerInfo } from "@/lib/vehicles";

const POINTS = [
  {
    icon: MousePointerClick,
    title: "Choose online",
    copy: "Browse the inventory, compare trims, and ask questions by phone, text, or email.",
  },
  {
    icon: CreditCard,
    title: "Finance and trade remotely",
    copy: "Send your credit application and trade details from home. We prepare the paperwork.",
  },
  {
    icon: Truck,
    title: "Delivered or shipped to you",
    copy: "Free delivery inside the 300-mile area; shipping arranged for addresses beyond it.",
  },
];

/**
 * The page-wide CTA styles are tuned for the light sections, so on the navy band we keep their
 * geometry (pill, padding, focus ring) with `cn` and only swap the colors for readable contrast.
 */
const ctaOnNavy = cn(
  ctaPrimary,
  "w-full bg-white text-[#002c5f] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)]",
  "hover:bg-slate-100 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.55)]",
  "focus-visible:outline-white sm:w-auto",
);

const ctaGhostOnNavy = cn(
  ctaGhost,
  "w-full border-white/35 bg-white/10 text-white",
  "hover:border-white/60 hover:bg-white/20 focus-visible:outline-white sm:w-auto",
);

/**
 * High-contrast navy band that breaks up the light homepage and gives the dealership's
 * strongest differentiator, free home delivery, the prominence the SEO brief asks for.
 */
export function DeliveryHighlight() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28"
      aria-labelledby="delivery-highlight-title"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#002c5f] to-[#001f44] px-6 py-12 shadow-[0_30px_80px_-30px_rgba(0,44,95,0.55)] sm:px-10 sm:py-16 lg:px-14">
        {/* Soft light in the corner so the flat navy reads as a lit surface. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            {/* SectionHeading is hard-coded to the light palette, so the same type scale is
                rebuilt here in white, the way FinalCTA handles its own heading. */}
            <Stagger className="max-w-xl" gap={0.12}>
              <StaggerItem>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
                  Shop from wherever you live
                </p>
              </StaggerItem>
              <StaggerItem>
                <h2
                  id="delivery-highlight-title"
                  className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
                >
                  {DELIVERY_SHORT}
                  <span className="mt-2 block font-normal text-white/60">{DELIVERY_SHIPPING}</span>
                </h2>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-5 text-base leading-relaxed text-white/75">
                  Choose your vehicle online, handle financing and your trade remotely, and we bring
                  it to your driveway free within 300 miles of the {dealerInfo.locality} store.
                  Farther away, we arrange shipping to you.
                </p>
              </StaggerItem>
            </Stagger>

            <Reveal
              delay={0.2}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link to="/nationwide-vehicle-delivery" className={ctaOnNavy}>
                  Learn About Free Home Delivery
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto">
                <Link to="/inventory" className={ctaGhostOnNavy}>
                  Browse Inventory
                </Link>
              </MagneticButton>
            </Reveal>
          </div>

          <Stagger className="space-y-4" gap={0.12}>
            {POINTS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="hm-glass flex items-start gap-4 rounded-3xl p-5">
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
        </div>

        <Reveal delay={0.15} className="relative mt-10 border-t border-white/15 pt-6">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-white/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
            <span>Every delivery leaves from our one location at {dealerInfo.address}.</span>
          </p>
          <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-white/60">
            Shipping charges may apply outside the complimentary 300-mile delivery area. Timing
            depends on your location, vehicle availability, documentation, and financing approval.
            Please confirm delivery terms with us before purchase.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
