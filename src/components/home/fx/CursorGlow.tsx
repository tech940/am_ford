import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * A soft silver light that trails the cursor with spring inertia, plus a tighter
 * core glow — gives every surface a subtle "light follows you" reflection.
 * Desktop pointer only; hidden for touch devices and reduced-motion users.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const reduced = useReducedMotion();

  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const haloX = useSpring(x, { stiffness: 55, damping: 16, mass: 0.6 });
  const haloY = useSpring(y, { stiffness: 55, damping: 16, mass: 0.6 });
  const coreX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.4 });
  const coreY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled || reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute h-[520px] w-[520px] rounded-full"
        style={{
          x: haloX,
          y: haloY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(0,44,95,0.06) 0%, rgba(0,44,95,0.02) 40%, transparent 68%)",
        }}
      />
      <motion.div
        className="absolute h-40 w-40 rounded-full"
        style={{
          x: coreX,
          y: coreY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(0,44,95,0.08) 0%, rgba(0,44,95,0.02) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}
