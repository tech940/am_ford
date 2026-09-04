import { Link } from "@tanstack/react-router";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { HOME_BLOCKS } from "@/lib/dealerContent";
import { dealerInfo } from "@/lib/vehicles";
import { Button, IconArrowRight, IconPhone } from "@/components/ledger";

/**
 * Service, as a full-bleed band. Ported from the live homepage.
 *
 * This replaces `ServiceAndParts`, which listed nine services and three promises and asserted
 * "Ford-trained technicians", "Ford diagnostic equipment" and "Genuine Ford and Motorcraft
 * parts" — none of which appear in any source file. The dealership's own homepage says one
 * sentence about service, and that sentence is here verbatim. The service menu belongs on
 * /service, where it can carry whatever the dealership signs off on.
 *
 * The photograph is Ford's own corporate service image, the same asset the live site uses.
 * Its alt text stays generic on purpose: these are Ford technicians in a Ford bay, not a
 * photograph of this dealership's staff, and the copy must not imply otherwise.
 *
 * One filled control on this section, and it is `inverse` rather than `primary` — the page's
 * single navy-filled button is the search submit in the opening section.
 */
export function ServiceRow() {
  return (
    <section aria-labelledby="service-title" className="relative isolate overflow-hidden bg-ink">
      <ResponsiveImage
        name="ford-service-bay"
        alt="Technicians working on Ford vehicles in a service bay"
        sizes="100vw"
        aspect={{ width: 1920, height: 751 }}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Text sits on a photograph, so the veil has to hold white type at 4.5:1 wherever the
          image is lightest — and the bay is lit, so this is stronger than it looks it needs. */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "linear-gradient(to right, rgba(12,18,24,0.94) 0%, rgba(12,18,24,0.86) 38%, rgba(12,18,24,0.55) 68%, rgba(12,18,24,0.35) 100%)",
        }}
      />

      <div className="reveal mx-auto max-w-[1200px] px-5 py-16 md:px-10 lg:px-16 lg:py-24">
        <div className="max-w-[34rem]">
          <h2
            id="service-title"
            className="text-balance font-sans text-h2 font-bold leading-tight text-white"
          >
            {HOME_BLOCKS.service.title}
          </h2>
          <p className="mt-4 font-sans text-body leading-relaxed text-white/75">
            {HOME_BLOCKS.service.body}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild variant="inverse" size="lg">
              <Link to={HOME_BLOCKS.service.primary.href}>
                {HOME_BLOCKS.service.primary.label}
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <a
              href={dealerInfo.phoneHref}
              className="inline-flex min-h-11 items-center gap-2 font-sans text-ui font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <IconPhone className="h-4 w-4" />
              {dealerInfo.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
