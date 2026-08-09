import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { dealerInfo, vehicles } from "@/lib/vehicles";
import { MagneticButton, ctaGhost, ctaPrimary } from "../fx/ui";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const CAROUSEL_MS = 3800;

/**
 * 2-Card Widescreen Glassmorphism Auto Carousel
 * Features 2 fixed glassmorphism card containers positioned on the right with smooth image cross-fading.
 */
function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = vehicles.length;

  useEffect(() => {
    if (paused || reduced) return;
    timer.current = setInterval(() => {
      setIndex((prev) => (prev + 2) % total);
    }, CAROUSEL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduced, total]);

  const v1 = vehicles[index % total];
  const v2 = vehicles[(index + 1) % total];

  return (
    <div
      className="relative flex w-full max-w-lg flex-col items-center gap-4 lg:max-w-2xl xl:max-w-3xl ml-auto"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* 2 Widescreen Fixed Glassmorphism Cards Grid */}
      <div className="grid w-full grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/30 bg-white/40 p-1.5 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:border-white/60 hover:bg-white/60 hover:shadow-2xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={v1.id}
              src={v1.image}
              alt={`${v1.year} ${v1.make} ${v1.model}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full rounded-[1.25rem] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          </AnimatePresence>
        </div>

        {/* Card 2 */}
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/30 bg-white/40 p-1.5 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:border-white/60 hover:bg-white/60 hover:shadow-2xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={v2.id}
              src={v2.image}
              alt={`${v2.year} ${v2.make} ${v2.model}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full rounded-[1.25rem] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex items-center gap-2 pt-1">
        {Array.from({ length: Math.ceil(total / 2) }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i * 2)}
            aria-label={`Go to slide ${i + 1}`}
            className={`relative h-2 rounded-full transition-all duration-500 after:absolute after:-inset-3 after:content-[''] ${
              Math.floor(index / 2) === i
                ? "w-8 bg-[#002c5f]"
                : "w-2.5 bg-[#002c5f]/25 hover:bg-[#002c5f]/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Hero section: Left-aligned text overlay + far-right 2-card widescreen carousel.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const stageY = useTransform(scrollYProgress, [0, 0.18], [0, 60]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0.35]);

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-label="Hero">
      {/* Background HD Ford Vehicle Stage */}
      <motion.div
        style={reduced ? undefined : { y: stageY, opacity: stageOpacity }}
        className="absolute inset-0 z-0"
      >
        {/* Scale-only intro: never animate opacity on the LCP element, or the
            largest paint is deferred until hydration finishes. */}
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <ResponsiveImage
            name="hero-truck"
            alt={`New Ford F-150 at AM Ford in ${dealerInfo.locality}, Ohio`}
            sizes="100vw"
            priority
            className="h-full w-full object-cover object-center"
          />
          {/* Light overlay gradients for text contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(248,250,252,0.75) 0%, rgba(248,250,252,0.45) 40%, rgba(248,250,252,0.92) 88%, #F8FAFC 100%)",
            }}
          />
          {/* Radial Ford Blue backlight glow */}
          <div
            className="pointer-events-none absolute left-1/3 top-1/2 h-[30rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,44,95,0.25), transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Main hero grid: Left text overlay + Far Right bottom 2-card glassmorphism carousel */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 sm:px-8 lg:px-12 pb-20 pt-32 sm:pb-24">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          {/* LEFT SIDE: Text Overlay (Left aligned) */}
          <div className="flex min-w-0 flex-col items-start text-left lg:col-span-6 xl:col-span-6">
            {/* Above the fold: transform-only intros. Opacity stays at 1 so the
                text is in the server HTML and paints on the first frame. */}
            <motion.p
              initial={{ y: 24 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.4 }}
              className="text-[11px] font-bold uppercase tracking-[0.38em] text-[#002c5f]"
            >
              Family-owned since the Nassief Ford days · {dealerInfo.locality}, Ohio
            </motion.p>

            <motion.h1
              initial={{ y: 48 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.05, ease: EASE_OUT, delay: 0.55 }}
              className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.04] tracking-tight text-slate-900 max-[360px]:text-4xl sm:text-6xl lg:text-6xl xl:text-7xl"
            >
              Your Ford dealership in
              <span className="bg-gradient-to-r from-[#002c5f] via-[#004085] to-[#0056b3] bg-clip-text text-transparent">
                {" "}
                {dealerInfo.locality}, Ohio
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 28 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.75 }}
              className="mt-5 max-w-lg text-base font-medium leading-relaxed text-slate-700 sm:text-lg"
            >
              A family-owned Ford dealership serving Ashtabula County, Northeast Ohio, and
              Northwestern Pennsylvania. New Ford trucks and SUVs, quality used vehicles, and
              straightforward help with financing, trade-ins, and service.
            </motion.p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.95 }}
              >
                <MagneticButton>
                  <Link to="/inventory" className={ctaPrimary}>
                    Browse inventory
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </MagneticButton>
              </motion.div>
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 1.1 }}
              >
                <MagneticButton>
                  <Link to="/contact" className={ctaGhost}>
                    Book a test drive
                  </Link>
                </MagneticButton>
              </motion.div>
            </div>
          </div>

          {/* RIGHT SIDE (Far Right): Widescreen 2-card Carousel */}
          <motion.div
            initial={{ y: 36, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.85 }}
            className="flex min-w-0 justify-end lg:col-span-6 xl:col-span-6 ml-auto w-full translate-x-2 sm:translate-x-4 lg:translate-x-6"
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 hidden sm:block"
        aria-hidden
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-0.5 text-[#002c5f]/70"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
