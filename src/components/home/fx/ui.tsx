import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { ReactNode } from "react";

/** Formats 2500 -> "2,500" for the animated counters. */
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Counts smoothly from zero when it enters the viewport.
 * `prefix`/`suffix` wrap the number ("$", "+", "%").
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  // Render the REAL value on the server and at first paint. Starting at "0" put
  // "$0" prices into the crawlable HTML for every vehicle; the count-up is a
  // decorative flourish and must never be the source of truth for the number.
  const [text, setText] = useState(() => fmt(to));

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setText(fmt(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

/**
 * Button with magnetic hover: it leans toward the cursor with spring inertia
 * and settles back when the pointer leaves.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.25,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 16, mass: 0.5 });
  const y = useSpring(my, { stiffness: 180, damping: 16, mass: 0.5 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduced ? undefined : { x, y, display: "inline-block" }}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - (r.left + r.width / 2)) * strength);
        my.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export const ctaPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#002c5f] " +
  "px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(0,44,95,0.45)] " +
  "transition-all duration-300 hover:bg-[#001f44] hover:shadow-[0_16px_40px_-8px_rgba(0,44,95,0.6)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002c5f]";

export const ctaGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#002c5f]/25 bg-white/80 " +
  "px-7 py-3.5 text-sm font-semibold text-[#002c5f] backdrop-blur transition-all duration-300 " +
  "hover:border-[#002c5f]/50 hover:bg-[#002c5f]/10 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002c5f]";
