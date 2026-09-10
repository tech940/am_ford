import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { dealerInfo } from "@/lib/vehicles";
import { SectionHeading, Stagger, StaggerItem } from "../fx/Reveal";

/**
 * Each reason is fronted by a photograph of the actual store. These were five live WebGL
 * scenes (a key, a wheel, a shield, a certificate, an engine), which pulled ~930 KB of
 * three.js (254 KB gzipped) onto the homepage purely for decoration.
 *
 * The am-ford-* photos are of AM Ford itself: storefront, lot, and aerial. The service bay
 * photo is Ford imagery, so its alt text says Ford technicians rather than claiming ours.
 */
const REASONS: { title: string; copy: string; image: string; alt: string }[] = [
  {
    title: "Effortless handover",
    copy: "Paperwork prepared before you arrive, so your visit stays short.",
    image: "am-ford-front",
    alt: `The AM Ford storefront in ${dealerInfo.locality}, Ohio`,
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
    image: "am-ford-front-lot",
    alt: "Vehicles lined up on the AM Ford lot",
  },
  {
    title: "Transparent history",
    copy: "Full service records and vehicle history reports, shown before you ask.",
    image: "am-ford-aerial",
    alt: "Aerial view of the AM Ford dealership and lot",
  },
  {
    title: "Factory-level service",
    copy: "An on-site workshop with factory-trained technicians keeps your car at its best.",
    image: "ford-service-bay",
    alt: "Ford technicians working on a vehicle in a service bay",
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
            <article className="hm-glass relative h-full overflow-hidden rounded-[1.75rem] transition-colors duration-500 hover:border-[#002c5f]/30">
              {/* h-44 keeps each card the height the 3D object slot made it, so the
                  section does not grow. The photos are all wider than this box, and
                  every subject sits near centre, so a centred cover crop keeps it. */}
              <ResponsiveImage
                name={r.image}
                alt={r.alt}
                sizes="(min-width: 1024px) 352px, (min-width: 640px) 45vw, 100vw"
                className="h-44 w-full object-cover"
              />
              <div className="px-7 pb-7 pt-5">
                <h3 className="text-lg font-bold text-slate-900">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.copy}</p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
