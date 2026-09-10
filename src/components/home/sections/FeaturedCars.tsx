import { useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Fuel, Gauge } from "lucide-react";
import { vehicles, type Vehicle } from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";
import { CountUp } from "../fx/ui";

/** Pill face shared by the condition marker and the marketing badge on a card image. */
const imagePill =
  "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur shadow-sm";

/** A single vehicle card: cursor tilt, lift, image zoom, sheen sweep, sliding CTA. */
function CarCard({ v }: { v: Vehicle }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const tiltX = useSpring(rx, { stiffness: 160, damping: 18, mass: 0.6 });
  const tiltY = useSpring(ry, { stiffness: 160, damping: 18, mass: 0.6 });

  /**
   * The condition is the authoritative fact and always renders, so the marketing badge
   * only gets to show a value that says something the condition does not. Without this,
   * the CPO Escape (badges: ["Certified Pre-Owned", "Hybrid"]) renders the same words twice.
   */
  const badge = v.badges?.find((b) => b !== v.condition);

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        rx.set(0);
        ry.set(0);
      }}
      style={reduced ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
      animate={reduced ? undefined : { y: hovered ? -10 : 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`hm-glass group relative h-full overflow-hidden rounded-lg transition-shadow duration-500 ${
        hovered ? "shadow-[0_44px_110px_-30px_rgba(0,0,0,0.9)]" : ""
      }`}
    >
      {/* Image with slow zoom + sheen sweep */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={v.image}
          alt={`${v.year} ${v.make} ${v.model} ${v.trim}`}
          loading="lazy"
          className="h-full w-full scale-[1.01] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(200deg, transparent 40%, rgba(8,9,11,0.75))" }}
        />
        {/* Reflection sweep */}
        {hovered && !reduced && (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
            style={{
              background:
                "linear-gradient(105deg, transparent, rgba(255,255,255,0.14) 48%, transparent)",
              animation: "hm-sheen 1.1s ease-out forwards",
            }}
            aria-hidden
          />
        )}
        {/* Wraps rather than overlapping: "Certified Pre-Owned" plus a badge does not fit
            side by side on a 320px card. */}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-2">
          <span className={cn(imagePill, "bg-[#002c5f] text-white")}>{v.condition}</span>
          {badge ? (
            <span
              className={cn(imagePill, "border border-[#002c5f]/20 bg-white/90 text-[#002c5f]")}
            >
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">
              {v.year} {v.make} {v.model}
            </h3>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">{v.trim}</p>
          </div>
          <div className="text-right">
            <CountUp
              to={v.price}
              prefix="$"
              className="text-lg font-bold tabular-nums text-[#002c5f]"
            />
            {v.msrp ? (
              <p className="text-[12px] font-semibold text-slate-600 line-through">
                ${v.msrp.toLocaleString("en-US")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 text-[12px] font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[#002c5f]" aria-hidden />
            {v.miles < 100 ? "Delivery miles" : `${v.miles.toLocaleString("en-US")} mi`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-[#002c5f]" aria-hidden />
            {v.fuel}
          </span>
          <span>{v.drivetrain}</span>
        </div>

        {/* View details slides upward into view on hover (always visible on touch) */}
        <div className="mt-5 h-11 overflow-hidden">
          <div
            className={`transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
              reduced ? "" : "translate-y-0 md:translate-y-12 md:group-hover:translate-y-0"
            }`}
          >
            {/* Visible text stays short so it cannot wrap out of the fixed h-11 slot at
                320px; the accessible name carries the vehicle, so six "View details"
                links on one page are still distinguishable to a screen reader. */}
            <Link
              to="/vehicle/$id"
              params={{ id: v.id }}
              aria-label={`View details for the ${v.year} ${v.make} ${v.model} ${v.trim}`}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#002c5f] text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-[#001f44]"
            >
              View details
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function FeaturedCars() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36"
      aria-label="Featured vehicles"
    >
      <SectionHeading
        eyebrow="Curated stock"
        title={
          <>
            Featured vehicles,
            <span className="text-slate-500 font-normal"> ready today</span>
          </>
        }
        copy="Every car on this lot passed a 172-point inspection before it earned a spot here."
      />
      <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.09}>
        {vehicles.slice(0, 6).map((v) => (
          <StaggerItem key={v.id}>
            <CarCard v={v} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
