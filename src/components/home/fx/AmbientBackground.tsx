import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMounted } from "../hooks";

type Dust = {
  left: number;
  top: number;
  size: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
  opacity: number;
};

/**
 * The page-wide living background: drifting gradient blobs, slow light beams,
 * rising dust motes and breathing radial gradients, all on a #0B0B0B base with
 * a whisper of scroll parallax. Everything moves slowly — the page never sits still.
 */
export function AmbientBackground() {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const blobShift = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const beamShift = useTransform(scrollYProgress, [0, 1], [0, 140]);

  const dust = useMemo<Dust[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: 34 }, () => ({
      left: Math.random() * 100,
      top: 18 + Math.random() * 82,
      size: 1 + Math.random() * 2.2,
      dx: -40 + Math.random() * 80,
      dy: -90 - Math.random() * 160,
      duration: 11 + Math.random() * 14,
      delay: Math.random() * 12,
      opacity: 0.18 + Math.random() * 0.4,
    }));
  }, [mounted]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Base breathing radial gradients */}
      <div
        className="hm-breathe absolute inset-0"
        style={{
          animation: reduced ? undefined : "hm-breathe 14s ease-in-out infinite",
          background:
            "radial-gradient(1100px 640px at 50% -8%, rgba(0, 44, 95, 0.07), transparent 65%)," +
            "radial-gradient(900px 560px at 88% 110%, rgba(0, 44, 95, 0.05), transparent 60%)",
        }}
      />

      {/* Drifting gradient blobs, parallaxed against scroll */}
      <motion.div style={{ y: reduced ? 0 : blobShift }} className="absolute inset-0">
        <div
          className="hm-blob absolute -left-[12%] top-[6%] h-[46rem] w-[46rem] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(0, 44, 95, 0.08), rgba(0, 44, 95, 0.02) 55%, transparent 72%)",
            filter: "blur(70px)",
            animation: reduced ? undefined : "hm-blob-a 34s ease-in-out infinite",
          }}
        />
        <div
          className="hm-blob absolute -right-[14%] top-[42%] h-[40rem] w-[40rem] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(0, 44, 95, 0.07), rgba(0, 44, 95, 0.02) 52%, transparent 70%)",
            filter: "blur(80px)",
            animation: reduced ? undefined : "hm-blob-b 42s ease-in-out infinite",
          }}
        />
        <div
          className="hm-blob absolute left-[24%] bottom-[-16%] h-[36rem] w-[36rem] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0, 44, 95, 0.06), transparent 68%)",
            filter: "blur(90px)",
            animation: reduced ? undefined : "hm-blob-a 48s ease-in-out infinite reverse",
          }}
        />
      </motion.div>

      {/* Soft diagonal light beams */}
      <motion.div style={{ y: reduced ? 0 : beamShift }} className="absolute inset-0 opacity-70">
        <div
          className="hm-beam absolute -top-[10%] left-[16%] h-[130%] w-40"
          style={
            {
              "--beam-angle": "22deg",
              background:
                "linear-gradient(180deg, transparent, rgba(0,44,95,0.03) 30%, rgba(0,44,95,0.05) 50%, rgba(0,44,95,0.03) 70%, transparent)",
              filter: "blur(26px)",
              animation: reduced ? undefined : "hm-beam 26s ease-in-out infinite",
            } as React.CSSProperties
          }
        />
        <div
          className="hm-beam absolute -top-[8%] right-[22%] h-[125%] w-24"
          style={
            {
              "--beam-angle": "-18deg",
              background:
                "linear-gradient(180deg, transparent, rgba(0,44,95,0.025) 35%, rgba(0,44,95,0.04) 52%, transparent 75%)",
              filter: "blur(30px)",
              animation: reduced ? undefined : "hm-beam 34s ease-in-out infinite 4s",
            } as React.CSSProperties
          }
        />
      </motion.div>

      {/* Rising dust motes (client-only to keep SSR markup deterministic) */}
      {!reduced &&
        dust.map((d, i) => (
          <span
            key={i}
            className="hm-dust absolute rounded-full bg-[#002c5f]/30"
            style={
              {
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: d.size,
                height: d.size,
                "--dust-dx": `${d.dx}px`,
                "--dust-dy": `${d.dy}px`,
                "--dust-opacity": d.opacity,
                animation: `hm-dust ${d.duration}s linear ${d.delay}s infinite`,
                opacity: 0,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Vignette for light stage */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 60%, rgba(241,245,249,0.7) 100%)",
        }}
      />
    </div>
  );
}
