import { lazy } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Clock3, ShieldCheck } from "lucide-react";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";
import { Scene3D } from "../fx/Scene3D";
import { MagneticButton, ctaGhost } from "../fx/ui";

const RimScene = lazy(() => import("../three/RimScene"));

const POINTS = [
  {
    icon: BadgePercent,
    title: "Rates from 4.9% APR",
    copy: "We shop multiple lenders so the right rate finds you, not the other way around.",
  },
  {
    icon: Clock3,
    title: "Decisions in minutes",
    copy: "Soft-pull pre-approval online. Know your buying power before you visit.",
  },
  {
    icon: ShieldCheck,
    title: "Every credit story",
    copy: "First-time buyers to credit rebuilds, our finance team structures deals that fit.",
  },
];

/**
 * Static stand-in for RimScene, drawn to the same palette.
 *
 * This column is decorative, but it is half the section on desktop, so "no WebGL" must not
 * mean "empty square". That is what it used to render, which left a blank panel for anyone
 * on reduced-motion, Save-Data, or hardware the gate turns 3D off for.
 */
function StaticRim() {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" role="img" aria-hidden>
      <defs>
        <linearGradient id="rimFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef1f4" />
          <stop offset="100%" stopColor="#b9c0c8" />
        </linearGradient>
        <linearGradient id="rimTire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e2734" />
          <stop offset="100%" stopColor="#0d131c" />
        </linearGradient>
      </defs>
      {/* Tire, then the polished barrel, then the spoke face */}
      <circle cx="100" cy="100" r="88" fill="url(#rimTire)" />
      <circle cx="100" cy="100" r="70" fill="#84898f" />
      <circle cx="100" cy="100" r="64" fill="url(#rimFace)" />
      {/* Five spokes, cut as tapered wedges from the hub outward */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d="M100 44 L112 96 L100 108 L88 96 Z"
          fill="#dfe3e8"
          stroke="#9aa1a9"
          strokeWidth="1"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="26" fill="#43474e" />
      <circle cx="100" cy="100" r="18" fill="#002c5f" />
      <circle cx="100" cy="100" r="9" fill="#001e42" />
      {/* Lug nuts */}
      {[36, 108, 180, 252, 324].map((deg) => (
        <circle
          key={deg}
          cx="100"
          cy="78"
          r="3.4"
          fill="#6f757c"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
}

/** Split layout: floating alloy rim on one side, finance value cards sliding in on the other. */
export function Financing() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36" aria-label="Financing">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        {/* Purely decorative, and WebGL is desktop-only. Rather than leave an empty
            square on phones, the visual column is dropped there entirely. */}
        <Reveal className="relative order-2 hidden lg:order-1 lg:block">
          <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
            {/* Halo behind the rim */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 55%, rgba(0, 44, 95, 0.12), transparent 65%)",
                filter: "blur(30px)",
              }}
              aria-hidden
            />
            <Scene3D className="absolute inset-0" fallback={<StaticRim />}>
              {(active, quality) => <RimScene active={active} quality={quality} />}
            </Scene3D>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Financing"
            title={
              <>
                Premium terms,
                <span className="text-slate-500 font-normal"> zero friction</span>
              </>
            }
            copy="Financing should feel as considered as the car. Transparent numbers, fast answers, and a payment built around your life."
          />
          <Stagger className="mt-10 space-y-4" gap={0.12}>
            {POINTS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="hm-glass flex items-start gap-4 rounded-3xl p-5 transition-colors duration-500 hover:border-[#002c5f]/20">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#002c5f] text-white shadow-sm">
                    <p.icon className="h-5 w-5 text-white" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.copy}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
            <StaggerItem>
              <div className="pt-4">
                <MagneticButton>
                  <Link to="/financing" className={ctaGhost}>
                    Get pre-approved
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </MagneticButton>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
}
