import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** True only after the component has mounted on the client — gates all WebGL/window usage for SSR. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export type QualityTier = "high" | "low";

/** Rough device capability check so weak hardware gets fewer particles and capped DPR. */
export function useQualityTier(): QualityTier {
  const [tier, setTier] = useState<QualityTier>("high");
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (cores <= 4 || memory <= 4 || (coarse && cores <= 6)) setTier("low");
  }, []);
  return tier;
}

/**
 * Whether this device should download and run WebGL at all.
 *
 * The three.js bundle is roughly 930 KB for purely decorative geometry. Phones and
 * tablets get the static fallback instead: most local shoppers arrive on mobile data,
 * where that payload costs real money, battery, and main-thread time for no
 * informational gain. Desktops keep the full 3D treatment.
 */
export function useAllowWebGL(): { allow: boolean; reason: string } {
  const [state, setState] = useState({ allow: false, reason: "pending" });
  const reduced = useReducedMotion();
  useEffect(() => {
    // The reason is reported, not just the verdict. Losing every 3D element on a capable
    // desktop with no way to tell which condition rejected it is what made the previous
    // version of this gate so hard to diagnose.
    if (reduced) {
      setState({ allow: false, reason: "prefers-reduced-motion" });
      return;
    }
    // Deliberately NOT gated on pointer type. The previous version required
    // `(pointer: fine)`, which describes only the PRIMARY input: every touchscreen laptop
    // and 2-in-1 reports `coarse` and silently lost all 3D on a full-size desktop window.
    // `deviceMemory` is gone for the same reason, it is Chromium-only and undefined
    // everywhere else. Width already excludes the phones this gate exists to protect, so
    // the remaining checks are the ones that are both meaningful and reliable.
    const wideEnough = window.matchMedia("(min-width: 1024px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

    if (!wideEnough) setState({ allow: false, reason: `viewport-under-1024 (${innerWidth}px)` });
    else if (cores < 4) setState({ allow: false, reason: `cpu-cores-${cores}` });
    else if (saveData) setState({ allow: false, reason: "save-data-enabled" });
    else setState({ allow: true, reason: "ok" });
  }, [reduced]);
  return state;
}

/**
 * Tracks whether an element is on screen so 3D canvases can stop their frame loop entirely
 * when scrolled away. Returns [ref, active]. Honors prefers-reduced-motion by staying inactive.
 */
export function useSectionActive<T extends HTMLElement>(margin = "120px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: margin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  const active = inView && !reduced;
  return [ref, inView, active] as const;
}
