import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { vehicles } from "@/lib/vehicles";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";

const EXTRAORDINARY_COLLECTION = [
  {
    tag: "ELECTRIC SUV",
    title: "2025 Ford Mustang Mach-E Rally",
    imageName: "car-lightning" as const,
    vehicle: vehicles[2],
  },
  {
    tag: "FLAGSHIP SUV",
    title: "2025 Ford Expedition Max Platinum",
    imageName: "car-explorer" as const,
    vehicle: vehicles[1],
  },
  {
    tag: "HIGH-PERFORMANCE",
    title: "2025 Ford Mustang Dark Horse V8",
    imageName: "car-mustang" as const,
    vehicle: vehicles[0],
  },
  {
    tag: "RUGGED 4X4",
    title: "2025 Ford Bronco Raptor 3.0L",
    imageName: "car-bronco" as const,
    vehicle: vehicles[3],
  },
  {
    tag: "COMPACT CROSSOVER",
    title: "2025 Ford Escape ST-Line Hybrid",
    imageName: "car-escape" as const,
    vehicle: vehicles[4] || vehicles[0],
  },
];

export function ExtraordinaryCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Automatic 1.5s Carousel Timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % EXTRAORDINARY_COLLECTION.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % EXTRAORDINARY_COLLECTION.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + EXTRAORDINARY_COLLECTION.length) % EXTRAORDINARY_COLLECTION.length,
    );
  };

  // Calculate offset relative to activeIndex in circular fashion
  const getOffset = (idx: number) => {
    const total = EXTRAORDINARY_COLLECTION.length;
    let diff = idx - activeIndex;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

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
          From high-performance coupes to flagship 4x4 SUVs — discover Northeast Ohio's finest Ford
          vehicle collection at AM Ford.
        </p>

        {/* 3D Coverflow Stage (Butter-Smooth 60FPS Hardware Accelerated) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="mt-12 relative flex items-center justify-center min-h-[460px] overflow-hidden"
        >
          <div className="relative w-full max-w-5xl h-[440px] flex items-center justify-center">
            {EXTRAORDINARY_COLLECTION.map((item, idx) => {
              const offset = getOffset(idx);
              const isActive = offset === 0;
              const isNear = Math.abs(offset) === 1;

              // Smooth responsive x translation values
              const xTranslate = offset * 250;

              return (
                <motion.div
                  key={item.title}
                  onClick={() => setActiveIndex(idx)}
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
                  className={`absolute cursor-pointer overflow-hidden rounded-[2.25rem] bg-white transition-all ${
                    isActive
                      ? "w-[280px] sm:w-[330px] shadow-2xl ring-4 ring-[#002c5f]/30 border-2 border-[#002c5f]"
                      : isNear
                        ? "w-[220px] sm:w-[260px] shadow-lg border border-slate-200"
                        : "hidden md:block w-[180px] sm:w-[220px] shadow-sm border border-slate-200"
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                    <ResponsiveImage
                      name={item.imageName}
                      alt={item.title}
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Top Tag */}
                    <div className="absolute left-4 top-4 z-10">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-900 shadow-md backdrop-blur-sm">
                        {item.tag}
                      </span>
                    </div>

                    {/* Bottom Content for Active Center Card */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-start text-left">
                      <h3 className="text-base sm:text-lg font-black leading-snug text-white drop-shadow-md">
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
                              params: { id: item.vehicle.id },
                            });
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[#002c5f] shadow-lg hover:bg-slate-100 transition active:scale-95"
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
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-md transition hover:border-[#002c5f] hover:text-[#002c5f] active:scale-90"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Indicator Dots with 44px x 44px min touch target size */}
            <div className="flex items-center gap-0.5 px-1">
              {EXTRAORDINARY_COLLECTION.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveIndex(dotIdx)}
                  className="flex h-11 w-11 items-center justify-center rounded-full p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002c5f]/30"
                  aria-label={`Go to slide ${dotIdx + 1}`}
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all ${
                      activeIndex === dotIdx
                        ? "w-8 bg-[#002c5f]"
                        : "w-2.5 bg-slate-400 hover:bg-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#002c5f] text-white shadow-md transition hover:bg-[#001f44] active:scale-90"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Browse Link */}
          <Link
            to="/inventory"
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#002c5f] hover:underline pt-2"
          >
            <span>BROWSE ALL VEHICLES</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
