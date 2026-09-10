import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { dealerInfo } from "@/lib/vehicles";
import { SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";

/**
 * Reasons why drivers choose AM Ford.
 * Each reason is fronted by authentic, high-resolution dealership photography
 * rendered at retina-sharp responsive sizes.
 */
const REASONS: { title: string; copy: string; image: string; alt: string }[] = [
  {
    title: "Effortless handover",
    copy: "Paperwork prepared before you arrive, so your visit stays short.",
    image: "am-ford-hero",
    alt: `The AM Ford showroom and front line in ${dealerInfo.locality}, Ohio`,
  },
  {
    title: "Driven by specialists",
    copy: "Our advisors are car people first. No scripts, no pressure, straight answers.",
    image: "am-ford-new-bronco",
    alt: "A new Ford Bronco on the AM Ford lot",
  },
  {
    title: "Certified protection",
    copy: "Every vehicle passes a 172-point inspection and carries real warranty coverage.",
    image: "am-ford-lot-banner",
    alt: "Audited vehicles lined up on the AM Ford lot",
  },
  {
    title: "Transparent history",
    copy: "Full service records and vehicle history reports, shown before you ask.",
    image: "interior",
    alt: "Digital cockpit and verified multi-point inspection systems inside a Ford vehicle",
  },
  {
    title: "Factory-level service",
    copy: "An on-site workshop with factory-trained technicians keeps your car at its best.",
    image: "ford-service-bay",
    alt: "Ford certified technicians working in the AM Ford service facility",
  },
];

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
          <StaggerItem key={r.title}>
            <article className="group hm-glass relative h-full overflow-hidden rounded-lg border border-slate-200/80 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-[#002c5f]/30 hover:shadow-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <ResponsiveImage
                  name={r.image}
                  alt={r.alt}
                  sizes="(min-width: 1024px) 700px, (min-width: 640px) 600px, 100vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-7 pb-7 pt-5">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#002c5f] transition-colors">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.copy}</p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
