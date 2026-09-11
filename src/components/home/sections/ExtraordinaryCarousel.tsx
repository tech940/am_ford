import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { vehicles, type Vehicle, vehicleSlug } from "@/lib/vehicles";

function getTagForVehicle(v: Vehicle): string {
  if (v.fuel === "Electric") return "ALL-ELECTRIC";
  if (v.fuel === "Hybrid") return "HYBRID EFFICIENCY";
  if (v.model.includes("F-250") || v.model.includes("Super Duty")) return "HEAVY DUTY 4X4";
  if (v.model.includes("F-150")) return "FULL-SIZE PICKUP";
  if (v.model.includes("Bronco")) return "RUGGED 4X4";
  if (v.model.includes("Explorer")) return "PREMIUM 3-ROW SUV";
  if (v.model.includes("Expedition")) return "FLAGSHIP FULL-SIZE SUV";
  if (v.model.includes("Mustang")) return "HIGH-PERFORMANCE";
  if (v.model.includes("Maverick")) return "COMPACT PICKUP";
  if (v.type === "Truck") return "FORD TOUGH TRUCK";
  return `${v.condition.toUpperCase()} ARRIVAL`;
}

function getExtraordinaryCollection(allVehicles: Vehicle[]) {
  const preferredModels = ["F-150", "Explorer", "Bronco", "F-250", "Expedition", "Maverick", "Escape"];
  const list: { tag: string; title: string; vehicle: Vehicle }[] = [];

  for (const m of preferredModels) {
    const v = allVehicles.find(
      (item) =>
        item.model.includes(m) &&
        Array.isArray(item.images) &&
        item.images.length > 2 &&
        !list.some((c) => c.vehicle.id === item.id)
    );
    if (v) {
      list.push({
        tag: getTagForVehicle(v),
        title: `${v.year} ${v.make} ${v.model} ${v.trim}`.trim(),
        vehicle: v,
      });
    }
    if (list.length >= 6) break;
  }

  // Fallback if less than 5 found
  if (list.length < 5) {
    for (const v of allVehicles) {
      if (list.length >= 5) break;
      if (!list.some((c) => c.vehicle.id === v.id)) {
        list.push({
          tag: getTagForVehicle(v),
          title: `${v.year} ${v.make} ${v.model} ${v.trim}`.trim(),
          vehicle: v,
        });
      }
    }
  }

  return list;
}

export function ExtraordinaryCarousel() {
  const collection = useMemo(() => getExtraordinaryCollection(vehicles), []);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Automatic 4.5s Carousel Timer
  useEffect(() => {
    if (isPaused || collection.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % collection.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, collection.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % collection.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + collection.length) % collection.length);
  };

  // Calculate offset relative to activeIndex in circular fashion
  const getOffset = (idx: number) => {
    const total = collection.length;
    let diff = idx - activeIndex;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

  if (collection.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-[#f4f7fb] border-b border-slate-200/80 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#002c5f]/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-[#002c5f]">
          EXPLORE THE COLLECTION
        </div>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#002c5f] sm:text-5xl lg:text-6xl">
          Drive Something <br className="hidden sm:inline" />
          Extraordinary
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
          From high-performance trucks to trail-ready 4x4 SUVs — discover Ashtabula County's finest Ford
          vehicle collection standing live on the lot today at AM Ford.
        </p>

        {/* 3D Coverflow Stage */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="mt-12 relative flex items-center justify-center min-h-[460px] overflow-hidden"
        >
          <div className="relative w-full max-w-5xl h-[440px] flex items-center justify-center">
            {collection.map((item, idx) => {
              const offset = getOffset(idx);
              const isActive = offset === 0;
              const isNear = Math.abs(offset) === 1;

              // Smooth responsive x translation values
              const xTranslate = offset * 250;

              return (
                <motion.div
                  key={item.vehicle.id}
                  onClick={() => {
                    if (isActive) {
                      navigate({
                        to: "/vehicle/$id",
                        params: { id: vehicleSlug(item.vehicle) },
                      });
                    } else {
                      setActiveIndex(idx);
                    }
                  }}
                  animate={{
                    x: xTranslate,
                    scale: isActive ? 1.08 : isNear ? 0.9 : 0.78,
                    opacity: isActive ? 1 : isNear ? 0.75 : 0.35,
                    rotateY: offset * -14,
                    zIndex: 30 - Math.abs(offset) * 10,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                    mass: 0.8,
                  }}
                  style={{
                    willChange: "transform, opacity",
                    transformStyle: "preserve-3d",
                  }}
                  className={`absolute cursor-pointer overflow-hidden rounded-lg bg-slate-900 transition-all ${
                    isActive
                      ? "w-[280px] sm:w-[330px] shadow-2xl ring-1 ring-white/20"
                      : isNear
                        ? "w-[220px] sm:w-[260px] shadow-lg"
                        : "hidden md:block w-[180px] sm:w-[220px] shadow-sm"
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900 group">
                    <img
                      src={item.vehicle.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />

                    {/* Top Tag */}
                    <div className="absolute left-3.5 top-3.5 z-10">
                      <span className="inline-flex rounded-md bg-[#002c5f] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                        {item.tag}
                      </span>
                    </div>

                    {/* Top Right Price */}
                    <div className="absolute right-3.5 top-3.5 z-10">
                      <span className="inline-flex rounded-md bg-white/95 px-2.5 py-0.5 text-[10px] font-black text-slate-900 shadow-md">
                        ${item.vehicle.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Bottom Content for Active Center Card */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-start text-left">
                      <div className="text-[11px] font-semibold text-amber-300">
                        {item.vehicle.year} · {item.vehicle.miles.toLocaleString()} Mi · {item.vehicle.condition}
                      </div>
                      <h3 className="text-base sm:text-lg font-black leading-snug text-white drop-shadow-md line-clamp-2 mt-0.5">
                        {item.title}
                      </h3>

                      {isActive && (
                        <motion.button
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({
                              to: "/vehicle/$id",
                              params: { id: vehicleSlug(item.vehicle) },
                            });
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[#002c5f] shadow-lg hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                        >
                          <span>VIEW DETAILS</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation & Dots */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 px-4 w-full">
          <div className="flex items-center justify-center gap-2 sm:gap-3.5 max-w-full">
            <button
              onClick={handlePrev}
              className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-md transition hover:border-[#002c5f] hover:text-[#002c5f] active:scale-90 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Compact Indicator Dots */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-1 overflow-x-hidden">
              {collection.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveIndex(dotIdx)}
                  className="flex h-7 w-5 sm:h-8 sm:w-6 items-center justify-center rounded-full p-0.5 cursor-pointer focus:outline-none"
                  aria-label={`Go to slide ${dotIdx + 1}`}
                >
                  <span
                    className={`block h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === dotIdx
                        ? "w-5 sm:w-7 bg-[#002c5f]"
                        : "w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full bg-[#002c5f] text-white shadow-md transition hover:bg-[#001f44] active:scale-90 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Bottom Browse Link */}
          <Link
            to="/inventory"
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#002c5f] hover:underline pt-2"
          >
            <span>BROWSE ALL {vehicles.length} VEHICLES</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
