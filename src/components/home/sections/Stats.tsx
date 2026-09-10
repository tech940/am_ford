import { Stagger, StaggerItem, scaleVariants } from "../fx/Reveal";
import { CountUp } from "../fx/ui";

const STATS = [
  { value: 2500, suffix: "+", label: "Vehicles Delivered" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 60, suffix: "+", label: "Years in Business" },
  { value: 1200, suffix: "+", label: "5-Star Reviews" },
] as const;

/** Counters rise from zero the moment the band scrolls into view. */
export function Stats() {
  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-10 sm:py-16"
      aria-label="Dealership statistics"
    >
      <Stagger
        className="hm-glass grid grid-cols-2 gap-y-8 sm:gap-y-10 rounded-lg px-5 py-10 sm:px-12 sm:py-12 lg:grid-cols-4"
        gap={0.12}
      >
        {STATS.map((s) => (
          <StaggerItem key={s.label} variants={scaleVariants} className="text-center">
            <CountUp
              to={s.value}
              suffix={s.suffix}
              duration={2}
              className="bg-gradient-to-b from-[#002c5f] to-[#004085] bg-clip-text text-4xl font-extrabold tabular-nums tracking-tight text-transparent sm:text-5xl"
            />
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#002c5f]/80">
              {s.label}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
