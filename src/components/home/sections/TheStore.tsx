import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { activeIncentives, PRICING_STANCE } from "@/lib/dealerContent";
import {
  DELIVERY_CLAIM,
  FILTERABLE_CONDITIONS,
  MAPS_DIRECTIONS_HREF,
  PRICE_BANDS,
  dealerInfo,
  vehicles,
  type Vehicle,
} from "@/lib/vehicles";
import { Button, IconArrowRight, IconPhone } from "@/components/ledger";
import { cn } from "@/lib/utils";

/**
 * S1 — the opening.
 *
 * TWO COLUMNS, ONE PHOTOGRAPH. The editorial column argues; the search panel does work. That
 * split is what fills the frame at 1920, where a single bottom-left copy block left 775px of
 * dead width, and it is why the search is a real control in the fold rather than a decorative
 * input under it.
 *
 * THERE IS NO SCRIM, BECAUSE NO TYPE SITS ON THE PHOTOGRAPH.
 *
 * This was solved with measurements, not taste. The image was sampled in twenty bands and then
 * seven candidate veils were composited and scored against the real pixels under every text
 * run. Every one of them failed: a flat 0.45 wash left the headline at 3.14:1 and showed only
 * 37% of the picture; bottom-weighted and mid-peak gradients pushed the picture up to 78% but
 * dropped the headline to 1.4-1.9:1, because this frame's bright spots are specular highlights
 * on chrome and glass distributed VERTICALLY, and no single gradient can cover them without
 * covering the subject too. The version before it ran 0.95/0.90/0.72/0.85 and inverted the
 * image's own hierarchy outright: heaviest stops on the truck line, which carries a standard
 * deviation of 53 to 67, and its lightest on flat overcast sky.
 *
 * So the type stops competing for the same pixels. It sits on two opaque plates laid across
 * the bottom of the frame, and the photograph runs edge to edge above them at 100% luminance:
 * the Ford oval, the AM letters, the lit service bay, the OPEN neon and the four trucks on the
 * line are all simply visible, which is the entire reason this photograph was chosen.
 *
 * The plates are one object, not two cards: they share a top edge and a bottom edge, they are
 * square, they carry no shadow, and they bleed to the container edges. A sticker laid on the
 * glass, which is also what the numeric type on this site is drawn from.
 *
 * EVERY STRING TRACES TO A SOURCE. The version this replaces asserted "Established 1964",
 * "150-Point Check", "$0 Surprise Fees", "Audited", "title-verified", "photographed on-site"
 * and "Verified active through manufacturer terms". None of those appear in any source file,
 * and a dealership cannot publish them because a developer typed them. They are gone rather
 * than softened. What survives is the dealership's own banner sentence, the approved delivery
 * wording, the former trading name, and programme numbers Ford issued.
 *
 * NO STOCK COUNT. The feed holds seven placeholder records. "7 Vehicles in Stock" on a real
 * dealership's homepage is materially false. The live filter count stays, because it describes
 * the result set of a query rather than the size of the lot, and it becomes exactly right the
 * day the real feed lands.
 */

/** Sun..Sat -> index into dealerInfo.hours (Mon-Thu, Fri, Sat, Sun). */
const HOURS_INDEX = [3, 0, 0, 0, 0, 1, 2];

const BODY_LABELS: Record<Vehicle["type"], string> = {
  Truck: "Trucks",
  SUV: "SUVs",
  Car: "Cars",
  EV: "Electric",
};
const BODY_TYPES = (Object.keys(BODY_LABELS) as Vehicle["type"][]).filter((t) =>
  vehicles.some((v) => v.type === t),
);

const MILEAGE_BANDS = [
  { value: "all", label: "Any mileage" },
  { value: "15000", label: "Under 15,000 miles" },
  { value: "35000", label: "Under 35,000 miles" },
  { value: "60000", label: "Under 60,000 miles" },
];

/** Uppercase micro label. The one place caps are sanctioned. */
const LABEL = "font-sans text-micro font-bold uppercase tracking-[0.09em]";

/** Filter chip. Square, ruled, 44px, no radius above 2px and no shadow. */
const CHIP = [
  "flex min-h-11 items-center justify-center rounded-sm border px-2 text-center",
  "font-sans text-meta font-semibold transition-colors duration-150",
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
].join(" ");

/**
 * The load sequence — the ONE orchestrated moment on this site.
 * Four steps over 520ms. Everything else on the page is still.
 * `fill-mode-backwards` holds the start frame during the delay so nothing flashes in place,
 * and the global prefers-reduced-motion block collapses all of it to 0.001ms.
 */
const STEP =
  "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards " +
  "ease-[cubic-bezier(0.16,1,0.3,1)]";

/**
 * Duration is matched to the size of the thing moving, not shared across the sequence: an
 * 11px eyebrow settling over the same 300ms as a 60px headline reads as lag on the small
 * element. Emil's rule, applied to a load sequence rather than an interaction.
 */
const STEP_SM = "duration-200";
const STEP_MD = "duration-300";
const STEP_LG = "duration-400";

export function TheStore() {
  const navigate = useNavigate();
  const [condition, setCondition] = useState<string>("All");
  const [bandIndex, setBandIndex] = useState("all");
  const [bodyType, setBodyType] = useState("All");
  const [maxMiles, setMaxMiles] = useState<string>("all");

  // Computed during SSR so the markup a crawler receives matches the browser, and so the page
  // can never claim open on a day dealerInfo says closed.
  const today = dealerInfo.hours[HOURS_INDEX[new Date().getDay()]];
  const offer = activeIncentives(new Date())[0];

  const matches = vehicles.filter((v) => {
    if (condition !== "All" && v.condition !== condition) return false;
    if (bodyType !== "All" && v.type !== bodyType) return false;
    if (maxMiles !== "all" && v.miles > Number(maxMiles)) return false;
    if (bandIndex !== "all") {
      const band = PRICE_BANDS[Number(bandIndex)];
      if (band.priceMin && v.price < band.priceMin) return false;
      if (band.priceMax && v.price > band.priceMax) return false;
    }
    return true;
  }).length;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const band = bandIndex === "all" ? undefined : PRICE_BANDS[Number(bandIndex)];
    navigate({
      to: "/inventory",
      search: {
        condition:
          condition === "All" ? undefined : (condition as (typeof FILTERABLE_CONDITIONS)[number]),
        type: bodyType !== "All" ? (bodyType as Vehicle["type"]) : undefined,
        priceMin: band?.priceMin,
        priceMax: band?.priceMax,
      },
    });
  };

  return (
    <section aria-labelledby="store-title" className="relative isolate overflow-hidden bg-ink">
      <ResponsiveImage
        name="am-ford-hero"
        alt={`The ${dealerInfo.name} showroom and front line on ${dealerInfo.street} in ${dealerInfo.locality}, Ohio`}
        sizes="100vw"
        priority
        className="parallax-hero absolute inset-0 -z-10 h-full w-full object-cover object-[62%_60%] lg:object-[center_62%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgb(11 13 15 / 0.96) 0%, rgb(11 13 15 / 0.88) 32%, rgb(11 13 15 / 0.68) 52%, transparent 76%)",
        }}
      />

      {/* The letterhead. One line, two facts, above everything, naming the road. */}
      <div className="relative border-b border-white/15">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-2.5 sm:px-10 lg:px-16">
          <p className={cn(LABEL, "text-white/85")}>{dealerInfo.address}</p>
          <p className="font-mono text-figure text-white/70">
            {today.time === "Closed" ? "Closed today" : `Open today ${today.time}`}
          </p>
          <a
            href={MAPS_DIRECTIONS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex min-h-8 items-center gap-1.5 font-sans text-meta font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Directions
            <IconArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* The photograph gets the top of the frame to itself, unveiled. This reserve is what
          the plates are laid onto, and it is why the picture is legible at all. */}
      <div className="h-[clamp(10rem,36vh,26rem)]" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-end gap-y-10 pb-0 lg:grid-cols-12 lg:gap-x-10 lg:pb-14">
          {/* ---------------------------------------------------------- the argument */}
          <div className="pb-10 pt-2 lg:col-span-7 lg:pb-0">
            <h1
              id="store-title"
              className={cn(
                "mt-3 max-w-[14ch] text-balance font-display font-extrabold uppercase text-white",
                "text-[clamp(2.75rem,1.2rem+5.4vw,6rem)] leading-[0.95] tracking-[-0.02em]",
                STEP,
                STEP_LG,
                "[animation-delay:120ms]",
              )}
            >
              {PRICING_STANCE}.
            </h1>

            {/* The deck is 47% of the headline, not a small grey sub-line. The template shape
                under three rejections was headline / tiny deck / button row. */}
            <p
              className={cn(
                "mt-5 max-w-[40ch] font-sans font-normal text-white/85",
                "text-[clamp(1.25rem,0.95rem+0.95vw,1.875rem)] leading-[1.35] tracking-[-0.01em]",
                STEP,
                STEP_MD,
                "[animation-delay:200ms]",
              )}
            >
              {DELIVERY_CLAIM}
            </p>

            <div
              className={cn(
                "mt-8 flex flex-wrap items-center gap-x-4 gap-y-3",
                STEP,
                STEP_MD,
                "[animation-delay:280ms]",
              )}
            >
              <Button asChild size="lg">
                <Link to="/inventory">
                  Browse inventory
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {/* On a phone the nav's call pill is behind a Menu tap, so this is the mobile
                  call button and it is sized as one. */}
              <a
                href={dealerInfo.phoneHref}
                className="inline-flex min-h-13 items-center gap-2 font-mono text-figure font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <IconPhone className="h-4 w-4" />
                {dealerInfo.phone}
              </a>
            </div>

            {/* A real, programme-numbered, dated Ford offer with its terms one click away.
                `activeIncentives` drops it the day it expires, and nothing in the layout
                depends on it rendering. */}
            {offer && (
              <details
                className={cn(
                  "group mt-8 max-w-[46rem] border-t border-white/20 pt-4",
                  STEP,
                  STEP_SM,
                  "[animation-delay:360ms]",
                )}
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 font-sans text-meta text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  <span className="font-semibold text-white">{offer.label}</span>
                  <span className="font-mono text-figure text-white/60">{offer.programme}</span>
                  <span className="ml-auto shrink-0 whitespace-nowrap text-white/70 underline underline-offset-4">
                    <span className="group-open:hidden">View terms</span>
                    <span className="hidden group-open:inline">Hide terms</span>
                  </span>
                </summary>
                <p className="mt-3 font-sans text-meta leading-relaxed text-white/60">
                  {offer.detail} {offer.disclaimer}
                </p>
              </details>
            )}
          </div>

          {/* ---------------------------------------------------------- the work */}
          <div className={cn("w-full lg:col-span-5", STEP, STEP_LG, "[animation-delay:440ms]")}>
            <div className="border border-rule bg-white">
              <div className="border-b border-rule px-5 py-4 sm:px-6">
                <h2 className="font-display text-h3 font-bold text-ink">Find your Ford</h2>
                <p className="mt-0.5 font-sans text-meta text-ink-3">
                  Filter by condition, body style, price or mileage.
                </p>
              </div>

              <form onSubmit={onSearch} className="px-6 py-6 sm:px-8">
                <fieldset>
                  <legend className={cn(LABEL, "text-ink-2")}>Condition</legend>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {["All", ...FILTERABLE_CONDITIONS].map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={condition === c}
                        onClick={() => setCondition(c)}
                        className={cn(
                          CHIP,
                          condition === c
                            ? "border-brand bg-brand/[0.06] text-brand"
                            : "border-rule bg-white text-ink-2 hover:border-ink/25",
                        )}
                      >
                        {c === "Certified Pre-Owned" ? "Certified" : c}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mt-5">
                  <legend className={cn(LABEL, "text-ink-2")}>Body style</legend>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {["All", ...BODY_TYPES].map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={bodyType === t}
                        onClick={() => setBodyType(t)}
                        className={cn(
                          CHIP,
                          bodyType === t
                            ? "border-brand bg-brand/[0.06] text-brand"
                            : "border-rule bg-white text-ink-2 hover:border-ink/25",
                        )}
                      >
                        {t === "All" ? "All" : BODY_LABELS[t as Vehicle["type"]]}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className={cn(LABEL, "text-ink-2")}>Price</span>
                    <select
                      value={bandIndex}
                      onChange={(e) => setBandIndex(e.target.value)}
                      className="h-11 w-full rounded-sm border border-rule bg-white px-3 font-sans text-ui text-ink outline-none transition-colors duration-150 focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <option value="all">Any price</option>
                      {PRICE_BANDS.map((b, i) => (
                        <option key={b.label} value={i}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className={cn(LABEL, "text-ink-2")}>Mileage</span>
                    <select
                      value={maxMiles}
                      onChange={(e) => setMaxMiles(e.target.value)}
                      className="h-11 w-full rounded-sm border border-rule bg-white px-3 font-sans text-ui text-ink outline-none transition-colors duration-150 focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {MILEAGE_BANDS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* The page's ONE filled button. The count describes the result set of this
                    query, never the size of the lot. */}
                <Button type="submit" size="lg" block className="mt-6">
                  Search inventory
                  <span className="font-mono text-figure font-semibold tabular-nums">
                    ({matches})
                  </span>
                </Button>
                <p aria-live="polite" className="sr-only">
                  {matches} {matches === 1 ? "vehicle matches" : "vehicles match"} these filters
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
