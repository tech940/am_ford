import { lazy } from "react";
import { KeyRound, Disc3, ShieldCheck, ScrollText, Cog } from "lucide-react";
import { SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";
import { Scene3D } from "../fx/Scene3D";
import type { WhyObjectKind } from "../three/WhyObject";

const WhyObject = lazy(() => import("../three/WhyObject"));

/**
 * Shown wherever WebGL is skipped (phones, low-end hardware, reduced motion).
 * It has to carry the meaning on its own, not leave a blank box.
 */
const FALLBACK_ICON: Record<WhyObjectKind, typeof KeyRound> = {
  key: KeyRound,
  wheel: Disc3,
  shield: ShieldCheck,
  certificate: ScrollText,
  engine: Cog,
};

function ObjectFallback({ kind }: { kind: WhyObjectKind }) {
  const Icon = FALLBACK_ICON[kind];
  return (
    <div className="flex h-40 w-full items-center justify-center" aria-hidden>
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#002c5f]/8 ring-1 ring-[#002c5f]/15">
        <Icon className="h-9 w-9 text-[#002c5f]" strokeWidth={1.5} />
      </span>
    </div>
  );
}

const REASONS: { kind: WhyObjectKind; title: string; copy: string }[] = [
  {
    kind: "key",
    title: "Effortless handover",
    copy: "Paperwork prepared before you arrive, so your visit stays short.",
  },
  {
    kind: "wheel",
    title: "Driven by specialists",
    copy: "Our advisors are car people first. No scripts, no pressure, straight answers.",
  },
  {
    kind: "shield",
    title: "Certified protection",
    copy: "Every vehicle passes a 172-point inspection and carries real warranty coverage.",
  },
  {
    kind: "certificate",
    title: "Transparent history",
    copy: "Full service records and vehicle history reports, shown before you ask.",
  },
  {
    kind: "engine",
    title: "Factory-level service",
    copy: "An on-site workshop with factory-trained technicians keeps your car at its best.",
  },
];

/** Five reasons, each fronted by a slowly rotating 3D object instead of a flat icon. */
export function WhyChooseUs() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36"
      aria-label="Why choose us"
    >
      <SectionHeading
        eyebrow="The difference"
        title={
          <>
            Why drivers
            <span className="text-slate-500 font-normal"> choose us</span>
          </>
        }
        copy="A dealership built around the ownership experience, not the transaction."
      />
      <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
        {REASONS.map((r) => (
          <StaggerItem key={r.kind}>
            <article className="hm-glass group relative h-full overflow-hidden rounded-[1.75rem] p-7 transition-colors duration-500 hover:border-[#002c5f]/30">
              <Scene3D className="relative h-40 w-full" fallback={<ObjectFallback kind={r.kind} />}>
                {(active, quality) => <WhyObject kind={r.kind} active={active} quality={quality} />}
              </Scene3D>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.copy}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
