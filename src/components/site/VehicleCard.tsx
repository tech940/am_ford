import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Fuel,
  Gauge,
  Cog,
  ArrowUpRight,
  Tag,
  Check,
  Scale,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { type Vehicle, vehicleSlug, isInTransit } from "@/lib/vehicles";
import { estMonthlyPayment } from "@/lib/leads";
import { GARAGE_EVENT, isSaved, toggleSaved } from "@/lib/garage";

export function VehicleCard({
  v,
  index = 0,
  onGetPrice,
  onExtraDiscount,
  compared,
  onToggleCompare,
}: {
  v: Vehicle;
  index?: number;
  onGetPrice?: (v: Vehicle) => void;
  onExtraDiscount?: (v: Vehicle) => void;
  /** When provided, the card shows a compare toggle chip on the image. */
  compared?: boolean;
  onToggleCompare?: (v: Vehicle) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Collect all available vehicle images (from images array, or single image fallback)
  const imageList =
    v.images && Array.isArray(v.images) && v.images.length > 0
      ? v.images.filter(Boolean)
      : [v.image].filter(Boolean);

  const hasMultipleImages = imageList.length > 1;

  useEffect(() => {
    const sync = () => setSaved(isSaved(v.id));
    sync();
    window.addEventListener(GARAGE_EVENT, sync);
    return () => window.removeEventListener(GARAGE_EVENT, sync);
  }, [v.id]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#002c5f]/30 flex flex-col justify-between"
    >
      <div>
        {/* Photo Area with In-Card Image Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 group/image">
          <Link
            to="/vehicle/$id"
            params={{ id: vehicleSlug(v) }}
            className="block h-full w-full"
          >
            <img
              src={imageList[currentImgIndex] || v.image}
              alt={`${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} - Photo ${currentImgIndex + 1}`}
              width={1280}
              height={800}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index < 3 ? "high" : "auto"}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Condition, In Transit & Type Badge (6px radius) */}
          <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            {isInTransit(v) && (
              <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                In Transit
              </span>
            )}
            <span className="rounded-md bg-[#002c5f] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-xs">
              {v.condition}
            </span>
            <span className="rounded-md border border-slate-200/80 bg-white/95 px-2 py-0.5 text-[10.5px] font-semibold text-slate-800 shadow-xs backdrop-blur-xs">
              {v.type}
            </span>
          </div>

          {/* Compare & Save to Garage (6px radius) */}
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 z-10">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(v)}
                aria-pressed={compared}
                aria-label={
                  compared
                    ? `Remove ${v.year} ${v.model} from comparison`
                    : `Add ${v.year} ${v.model} to comparison`
                }
                className={
                  compared
                    ? "inline-flex h-7 items-center gap-1 rounded-md bg-[#002c5f] px-2 text-[10.5px] font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                    : "inline-flex h-7 items-center gap-1 rounded-md border border-slate-200/90 bg-white/90 px-2 text-[10.5px] font-medium text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-[#002c5f] active:scale-95 cursor-pointer"
                }
              >
                {compared ? <Check className="h-3 w-3" /> : <Scale className="h-3 w-3" />}
                <span>{compared ? "Compared" : "Compare"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleSaved(v.id)}
              aria-pressed={saved}
              aria-label={
                saved
                  ? `Remove ${v.year} ${v.model} from saved cars`
                  : `Save ${v.year} ${v.model} to your garage`
              }
              className={
                saved
                  ? "inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#002c5f] text-white shadow-xs transition active:scale-95 cursor-pointer"
                  : "inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200/90 bg-white/90 text-slate-600 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-rose-600 active:scale-95 cursor-pointer"
              }
            >
              <Heart className={saved ? "h-3.5 w-3.5 fill-current text-white" : "h-3.5 w-3.5"} />
            </button>
          </div>

          {/* Image Carousel Navigation Arrows (Visible on hover or when multiple images exist) */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/80 active:scale-90 cursor-pointer shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/80 active:scale-90 cursor-pointer shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Carousel Pagination Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-xs pointer-events-none">
                {imageList.slice(0, 6).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentImgIndex
                        ? "w-3 bg-white"
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
                {imageList.length > 6 && (
                  <span className="text-[9px] text-white/80 font-mono pl-0.5 leading-none">
                    +{imageList.length - 6}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Card Content Area */}
        <div className="p-4 pb-2.5">
          {/* Badges row */}
          {v.badges && v.badges.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {v.badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#002c5f]">
                {v.year} · {v.make}
              </p>
              <h3 className="mt-0.5 truncate text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {v.model} <span className="font-medium text-slate-500">{v.trim}</span>
              </h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl sm:text-2xl font-black text-[#002c5f] tabular-nums tracking-tight">
                ${v.price.toLocaleString()}
              </p>
              {v.msrp && v.msrp > v.price && (
                <p className="text-[10.5px] font-medium text-slate-400 line-through">
                  MSRP ${v.msrp.toLocaleString()}
                </p>
              )}
              <p className="mt-0.5 text-[10.5px] font-bold text-emerald-700">
                ~${estMonthlyPayment(v.price)}/mo est.
              </p>
            </div>
          </div>

          {/* Clean key specs row (6px radius) */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
            <Stat icon={Gauge} label={`${v.miles.toLocaleString()} mi`} />
            <Stat icon={Fuel} label={v.fuel} />
            <Stat icon={Cog} label={v.drivetrain} />
          </div>

          {/* Key Features & Value Highlights */}
          {v.features && v.features.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {v.features.slice(0, 3).map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200/60"
                  >
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[110px]">{feat}</span>
                  </span>
                ))}
                {v.mpg && (
                  <span className="inline-flex items-center rounded bg-sky-50 px-2 py-0.5 text-[10.5px] font-semibold text-sky-800 ring-1 ring-sky-200/60">
                    {v.mpg} MPG
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        {/* Speech bubble: "Available for extra discount!" pointing to Get Price */}
        <div className="relative mb-2 flex justify-start">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (onExtraDiscount ?? onGetPrice)?.(v);
            }}
            className="group/bubble relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 px-3 py-1.5 shadow-sm transition-transform hover:scale-[1.02] active:scale-95 text-left cursor-pointer"
          >
            {/* Shield with % icon */}
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#D92D20] shadow-2xs border border-red-900/40">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M12 21s7-3.5 7-9V5l-7-3-7 3v7c0 5.5 7 9 7 9z"
                  fill="#B42318"
                  stroke="#7A150D"
                  strokeWidth="1.5"
                />
                <path d="M8.5 15.5L15.5 8.5" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#FEF08A" />
                <circle cx="15.5" cy="15.5" r="1.5" fill="#FEF08A" />
              </svg>
            </div>

            {/* Two-line text */}
            <div className="flex flex-col pr-0.5 leading-tight">
              <span className="text-[11px] font-extrabold text-[#002c5f] tracking-tight">
                Available for
              </span>
              <span className="text-[11px] font-extrabold text-[#002c5f] tracking-tight">
                extra discount!
              </span>
            </div>

            {/* Speech bubble pointer beak pointing down */}
            <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 bg-emerald-500" />
          </button>
        </div>

        <div className="flex gap-2">
          {onGetPrice && (
            <button
              onClick={() => (onExtraDiscount ?? onGetPrice)(v)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-50/80 px-3 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100 hover:border-emerald-500/60 shadow-2xs active:scale-95 cursor-pointer"
            >
              <Tag className="h-3.5 w-3.5 text-emerald-700" />
              <span>Get Price</span>
            </button>
          )}
          <Link
            to="/vehicle/$id"
            params={{ id: vehicleSlug(v) }}
            className="flex-1 flex items-center justify-center gap-1 rounded-md bg-[#002c5f] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#001f44] shadow-xs active:scale-95"
          >
            <span>View Details</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label }: { icon: typeof Fuel; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50/80 px-2 sm:px-2.5 py-1.5 text-slate-600 min-w-0 overflow-hidden">
      <Icon className="h-3.5 w-3.5 text-[#002c5f] shrink-0" />
      <span className="truncate font-semibold text-slate-800 text-[11px] sm:text-xs">{label}</span>
    </div>
  );
}

