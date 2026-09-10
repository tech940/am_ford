import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Fuel, Gauge, Cog, ArrowUpRight, Tag, Check, Scale, Heart } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";
import { estMonthlyPayment } from "@/lib/leads";
import { ResponsiveImage, imageNameFromSrc } from "@/components/site/ResponsiveImage";
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
  const imageName = imageNameFromSrc(v.image);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(isSaved(v.id));
    sync();
    window.addEventListener(GARAGE_EVENT, sync);
    return () => window.removeEventListener(GARAGE_EVENT, sync);
  }, [v.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-[#002c5f]/12 bg-white/90 shadow-md backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[#002c5f]/25 hover:shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {imageName ? (
            <ResponsiveImage
              name={imageName}
              alt={`${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} for sale at AM Ford in Jefferson, OH`}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              aspect={{ width: 4, height: 3 }}
              priority={index < 3}
              className="relative h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
          ) : (
            <img
              src={v.image}
              alt={`${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} for sale at AM Ford in Jefferson, OH`}
              width={1280}
              height={800}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index < 3 ? "high" : "auto"}
              className="relative h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
          )}
          {/* Clean condition & type badge at top left */}
          <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 z-10">
            <span className="rounded-full bg-[#002c5f] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              {v.condition}
            </span>
            <span className="rounded-full border border-white/60 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-md">
              {v.type}
            </span>
          </div>

          {/* Quick interactive actions on image: Heart & Compare */}
          <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 z-10">
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
                    ? "inline-flex h-8 items-center gap-1 rounded-full bg-[#002c5f] px-2.5 text-[11px] font-bold text-white shadow-md transition active:scale-95"
                    : "inline-flex h-8 items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-2.5 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#002c5f] active:scale-95"
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
                  ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#002c5f] text-white shadow-md transition active:scale-95"
                  : "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-rose-600 active:scale-95"
              }
            >
              <Heart className={saved ? "h-3.5 w-3.5 fill-current text-white" : "h-3.5 w-3.5"} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 pb-3">
          {/* Subtle badges row if present */}
          {v.badges && v.badges.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {v.badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
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
              <h3 className="mt-0.5 truncate text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {v.model} <span className="font-medium text-slate-500">{v.trim}</span>
              </h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-[#002c5f] tabular-nums tracking-tight">
                ${v.price.toLocaleString()}
              </p>
              {v.msrp && v.msrp > v.price && (
                <p className="text-[11px] font-medium text-slate-400 line-through">
                  MSRP ${v.msrp.toLocaleString()}
                </p>
              )}
              <p className="mt-0.5 text-[11px] font-bold text-emerald-700">
                ~${estMonthlyPayment(v.price)}/mo est.
              </p>
            </div>
          </div>

          {/* Clean key specs row */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
            <Stat icon={Gauge} label={`${v.miles.toLocaleString()} mi`} />
            <Stat icon={Fuel} label={v.fuel} />
            <Stat icon={Cog} label={v.drivetrain} />
          </div>

          {/* Key Features & Value Highlights to enrich card content */}
          {v.features && v.features.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {v.features.slice(0, 3).map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200/60"
                  >
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[120px]">{feat}</span>
                  </span>
                ))}
                {v.mpg && (
                  <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200/60">
                    {v.mpg} MPG
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0">
        {/* Speech bubble: "Available for extra discount!" pointing to Get Price */}
        <div className="relative mb-2 flex justify-start">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (onExtraDiscount ?? onGetPrice)?.(v);
            }}
            className="group/bubble relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 px-3.5 py-1.5 shadow-sm transition-transform hover:scale-[1.02] active:scale-95 text-left cursor-pointer"
          >
            {/* Shield with % icon */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D92D20] shadow-sm border border-red-900/40">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
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
            <div className="flex flex-col pr-1 leading-tight">
              <span className="text-[12px] font-extrabold text-[#002c5f] tracking-tight">
                Available for
              </span>
              <span className="text-[12px] font-extrabold text-[#002c5f] tracking-tight">
                extra discount!
              </span>
            </div>

            {/* Speech bubble pointer beak pointing down */}
            <div className="absolute -bottom-1 left-7 h-2.5 w-2.5 rotate-45 bg-emerald-500" />
          </button>
        </div>

        <div className="flex gap-2">
          {onGetPrice && (
            <button
              onClick={() => (onExtraDiscount ?? onGetPrice)(v)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/80 px-3 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100 hover:border-emerald-500/60 shadow-xs active:scale-95"
            >
              <Tag className="h-3.5 w-3.5 text-emerald-700" />
              <span>Get Price</span>
            </button>
          )}
          <Link
            to="/vehicle/$id"
            params={{ id: v.id }}
            className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#002c5f] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#001f44] shadow-sm active:scale-95"
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
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-slate-600">
      <Icon className="h-3.5 w-3.5 text-[#002c5f]" />
      <span className="truncate font-semibold text-slate-800">{label}</span>
    </div>
  );
}
