import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useMounted } from "../hooks";

/**
 * Scroll-reveal primitives shared by every homepage section.
 * One vocabulary of motion, fade plus rise plus blur removal on soft springs,
 * so the whole page feels like a single cinematic system.
 *
 * SSR CONTRACT: these components render plain, fully visible markup on the server
 * and only take over once mounted on the client. Emitting `opacity: 0` into the
 * server HTML hides the content from crawlers and delays LCP until hydration,
 * which is a severe SEO cost for a purely decorative effect.
 */

const EASE_SPRING = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 } as const;

/**
 * TRANSFORM ONLY, deliberately. An opacity-based reveal strands content permanently
 * invisible whenever the viewport observer never fires for an element (scrolled past
 * during hydration, observer missed, JS partially failed). Animating transform alone
 * means the worst case is a small offset, never hidden text. Travel is kept short so
 * even a stranded element looks intentional.
 *
 * `visible` is a dynamic variant: `custom` (a delay in seconds) is only honored when
 * provided, so plain <StaggerItem> children still inherit the parent's stagger timing.
 */
export const riseVariants: Variants = {
  hidden: { y: 18 },
  visible: (delay?: number) => ({
    y: 0,
    transition: typeof delay === "number" && delay > 0 ? { ...EASE_SPRING, delay } : EASE_SPRING,
  }),
};

export const scaleVariants: Variants = {
  hidden: { scale: 0.97 },
  visible: (delay?: number) => ({
    scale: 1,
    transition: typeof delay === "number" && delay > 0 ? { ...EASE_SPRING, delay } : EASE_SPRING,
  }),
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Seconds to delay the reveal once in view. */
  delay?: number;
  variants?: Variants;
  /** Portion of the element that must be visible before revealing. */
  amount?: number;
};

/** Fade + rise + unblur when the element enters the viewport. */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  variants = riseVariants,
  amount = 0.25,
}: RevealProps) {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  // Server and first paint: plain visible markup, so crawlers read the content.
  if (reduced || !mounted) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's reveal. */
  gap?: number;
  delay?: number;
  amount?: number;
};

/** Parent whose direct <StaggerItem> children reveal one after another. */
export function Stagger({ children, className, gap = 0.1, delay = 0, amount = 0.2 }: StaggerProps) {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  if (reduced || !mounted) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = riseVariants,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const mounted = useMounted();
  if (!mounted) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Eyebrow + headline + copy block every section opens with. */
export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <Stagger className={`max-w-2xl ${align === "center" ? "mx-auto" : ""}`} gap={0.12}>
      <StaggerItem>
        <p
          className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-[#002c5f] ${alignCls}`}
        >
          {eyebrow}
        </p>
      </StaggerItem>
      <StaggerItem>
        <h2
          className={`mt-2.5 sm:mt-4 text-2xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] ${alignCls}`}
        >
          {title}
        </h2>
      </StaggerItem>
      {copy ? (
        <StaggerItem>
          <p className={`mt-2 sm:mt-4 text-[13px] sm:text-base leading-relaxed text-slate-600 ${alignCls}`}>{copy}</p>
        </StaggerItem>
      ) : null}
    </Stagger>
  );
}
