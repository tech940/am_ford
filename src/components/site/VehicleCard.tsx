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
  compared,
  onToggleCompare,
}: {
  v: Vehicle;
  index?: number;
  onGetPrice?: (v: Vehicle) => void;
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
              alt={`${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} for sale at AM Ford`}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              aspect={{ width: 4, height: 3 }}
              className="relative h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
          ) : (
            <img
              src={v.image}
              alt={`${v.condition} ${v.year} ${v.make} ${v.model} ${v.trim} for sale at AM Ford`}
              width={1280}
              height={800}
              loading="lazy"
              className="relative h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
          )}
          {v.badges && v.badges.length > 0 && (
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {v.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-[#002c5f] px-3 py-1 text-xs font-bold text-white shadow-sm"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-[#002c5f]/20 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-[#002c5f] shadow-sm">
              {v.type}
            </span>
            {/* Condition comes from the data, never inferred from mileage */}
            <span className="rounded-full bg-[#002c5f] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {v.condition}
            </span>
          </div>
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
                ? "absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#002c5f] text-white shadow-md transition active:scale-95"
                : "absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#002c5f]/20 bg-white/90 text-[#002c5f] shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
            }
          >
            <Heart className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          </button>
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
                  ? "absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-[#002c5f] px-3.5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
                  : "absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full border border-[#002c5f]/20 bg-white/90 px-3.5 py-2 text-xs font-bold text-[#002c5f] shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
              }
            >
              {compared ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
              Compare
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#002c5f]">
                {v.year} · {v.make}
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900 leading-tight">
                {v.model} <span className="font-normal text-slate-500">{v.trim}</span>
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-[#002c5f] tabular-nums">
                ${v.price.toLocaleString()}
              </p>
              {v.msrp && v.msrp > v.price && (
                <p className="text-xs font-semibold text-slate-600 line-through">
                  ${v.msrp.toLocaleString()}
                </p>
              )}
              <p className="mt-0.5 text-[11px] font-bold text-emerald-700">
                ~${estMonthlyPayment(v.price)}/mo est.
              </p>
            </div>
          </div>

          {/* Always show the real odometer: the ItemList schema publishes
              mileageFromOdometer, and the brief requires the two to agree. */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
            <Stat icon={Gauge} label={`${v.miles.toLocaleString()} mi`} />
            <Stat icon={Fuel} label={v.fuel} />
            <Stat icon={Cog} label={v.drivetrain} />
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex gap-2.5">
        {onGetPrice && (
          <button
            onClick={() => onGetPrice(v)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-amber-500 px-3 py-3 text-xs font-extrabold text-slate-950 transition hover:bg-amber-400 shadow-sm active:scale-95"
          >
            <Tag className="h-3.5 w-3.5" /> Get Price
          </button>
        )}
        <Link
          to="/vehicle/$id"
          params={{ id: v.id }}
          className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-[#002c5f] px-3 py-3 text-xs font-bold text-white transition hover:bg-[#001f44] shadow-sm active:scale-95"
        >
          View details{" "}
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
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
