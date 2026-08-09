import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SectionHeading } from "../fx/Reveal";

const REVIEWS = [
  {
    name: "Marcus T.",
    vehicle: "F-150 Platinum",
    quote:
      "Felt more like a private showroom than a dealership. They had the truck detailed and the paperwork ready — I was on the road in forty minutes.",
  },
  {
    name: "Elena R.",
    vehicle: "Escape Titanium Hybrid",
    quote:
      "No pressure, no games. They walked me through the inspection report line by line before I even asked. That's what earned my trust.",
  },
  {
    name: "David K.",
    vehicle: "Mustang GT Premium",
    quote:
      "I've bought a lot of cars. This is the first time the experience felt as premium as the vehicle itself.",
  },
  {
    name: "Sarah W.",
    vehicle: "Bronco Outer Banks",
    quote:
      "They found the exact spec I wanted in three days. Communication was constant without being pushy — genuinely impressive.",
  },
];

const AUTO_MS = 5200;

/** Floating card carousel: auto-advances, springs between slides, pauses on hover. */
export function Reviews() {
  const [[index, dir], setIndex] = useState<[number, 1 | -1]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (d: 1 | -1) => setIndex(([i]) => [(i + d + REVIEWS.length) % REVIEWS.length, d]);

  useEffect(() => {
    if (paused || reduced) return;
    timer.current = setInterval(() => {
      setIndex(([i]) => [(i + 1) % REVIEWS.length, 1]);
    }, AUTO_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduced, index]);

  const r = REVIEWS[index];

  return (
    <section
      className="relative z-10 mx-auto max-w-4xl px-6 py-28 sm:py-36"
      aria-label="Customer reviews"
    >
      <SectionHeading
        eyebrow="Owner stories"
        title={
          <>
            Trusted by the
            <span className="text-slate-500 font-normal"> drivers who matter</span>
          </>
        }
      />

      <div
        className="relative mt-14"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative min-h-[22rem] sm:min-h-[16rem]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.figure
                key={index}
                custom={dir}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 90, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -90, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 190, damping: 24 }}
                whileHover={reduced ? undefined : { scale: 1.02 }}
                className="hm-glass-strong absolute inset-0 flex flex-col justify-between rounded-[2rem] p-8 sm:p-10"
              >
                <div>
                  <div className="flex gap-1" role="img" aria-label="Rated 5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#002c5f] text-[#002c5f]" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-pretty text-lg font-medium leading-relaxed text-slate-800">
                    “{r.quote}”
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.name}</p>
                    <p className="text-[12px] font-medium text-slate-500">
                      Purchased · {r.vehicle}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002c5f] text-sm font-bold text-white shadow-sm">
                    {r.name.charAt(0)}
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous review"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#002c5f]/20 bg-white/80 text-[#002c5f] transition-all hover:bg-[#002c5f] hover:text-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Review slides">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Review ${i + 1}`}
                onClick={() => setIndex(([cur]) => [i, i > cur ? 1 : -1])}
                className={`relative h-1.5 rounded-full transition-all duration-500 after:absolute after:-inset-3 after:content-[''] ${
                  i === index ? "w-7 bg-[#002c5f]" : "w-3 bg-[#002c5f]/25 hover:bg-[#002c5f]/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next review"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#002c5f]/20 bg-white/80 text-[#002c5f] transition-all hover:bg-[#002c5f] hover:text-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
