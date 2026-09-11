import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Clock3, ShieldCheck } from "lucide-react";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";
import { MagneticButton, ctaGhost } from "../fx/ui";

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

/** Split layout: an official Ford render on one side, finance value cards sliding in on the other. */
export function Financing() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-10 sm:py-20" aria-label="Financing">
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2">
        <Reveal className="relative order-2 hidden lg:order-1 lg:block">
          <div className="relative mx-auto flex w-full max-w-[32rem] items-center justify-center py-4">
            {/* Soft vehicle shadow under tires */}
            <div className="pointer-events-none absolute bottom-4 h-8 w-4/5 rounded-full bg-slate-900/15 blur-lg" />
            <picture>
              <source srcSet="/images/model-explorer-cutout.webp" type="image/webp" />
              <img
                src="/images/model-explorer-cutout.png"
                alt="Ford Explorer Financing"
                width={640}
                height={480}
                className="relative z-10 h-auto w-full object-contain drop-shadow-xl"
              />
            </picture>
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
          <Stagger className="mt-8 sm:mt-10 space-y-3 sm:space-y-4" gap={0.12}>
            {POINTS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="hm-glass flex items-start gap-4 rounded-lg p-4 sm:p-5 transition-colors duration-500 hover:border-[#002c5f]/20">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-md bg-[#002c5f] text-white shadow-sm">
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
