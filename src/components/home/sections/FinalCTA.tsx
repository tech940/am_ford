import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMounted } from "../hooks";
import { Reveal, Stagger, StaggerItem } from "../fx/Reveal";
import { MagneticButton, ctaGhost, ctaPrimary } from "../fx/ui";

/** Dramatic closer: blurred gradient core, drifting lights, gently pulsing CTAs. */
export function FinalCTA() {
  const mounted = useMounted();
  const reduced = useReducedMotion();

  const lights = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 14 }, () => ({
      left: 8 + Math.random() * 84,
      top: 12 + Math.random() * 76,
      size: 2 + Math.random() * 3.5,
      dur: 7 + Math.random() * 9,
      delay: Math.random() * 6,
    }));
  }, [mounted]);

  return (
    <section
      className="relative z-10 overflow-hidden px-6 py-32 sm:py-44"
      aria-label="Call to action"
    >
      {/* Large blurred gradient heart */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 h-[42rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0, 44, 95, 0.16), rgba(0, 44, 95, 0.04) 45%, transparent 70%)",
            filter: "blur(60px)",
            animation: reduced ? undefined : "hm-breathe 11s ease-in-out infinite",
          }}
        />
        {/* Floating lights */}
        {!reduced &&
          lights.map((l, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-[#002c5f]/30"
              style={{ left: `${l.left}%`, top: `${l.top}%`, width: l.size, height: l.size }}
              animate={{ y: [0, -26, 0], opacity: [0.12, 0.55, 0.12] }}
              transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <Stagger gap={0.14}>
          <StaggerItem>
            <p className="text-[11px] font-bold uppercase tracking-[0.38em] text-[#002c5f]">
              The road is waiting
            </p>
          </StaggerItem>
          <StaggerItem>
            <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
              Find your perfect
              <span className="bg-gradient-to-r from-[#002c5f] via-[#004085] to-[#0056b3] bg-clip-text text-transparent">
                {" "}
                car today
              </span>
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600">
              Walk the lot, take the keys, feel the difference. Or start online and let us bring the
              showroom to you.
            </p>
          </StaggerItem>
        </Stagger>

        <Reveal
          delay={0.35}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <MagneticButton>
            <Link to="/inventory" className={`${ctaPrimary} ${reduced ? "" : "hm-pulse"}`}>
              Explore inventory
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link to="/contact" className={ctaGhost}>
              Talk to a specialist
            </Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
